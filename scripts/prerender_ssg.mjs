import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { CAKES_CATALOG } from '../src/data/cakesData.js';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SITE_ORIGIN = 'https://lanycakes.co.ke';

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const CORE_ROUTES = [
  '/',
  '/cakes',
  '/custom-order',
  '/blog',
  '/blog/how-to-choose-the-perfect-wedding-cake-in-nairobi',
  '/blog/top-5-cake-flavor-combinations-that-kenyan-guests-love',
  '/blog/how-to-store-and-transport-your-cake-in-nairobi',
  '/about',
  '/contact',
  '/buy-cake-online-in-nairobi',
  '/bento-cakes',
  '/birthday-cakes-nairobi',
  '/birthday-cake-for-boys',
  '/graduation-cakes-juja',
  '/cupcakes-delivery-ruiru',
  '/baby-shower-cakes-nairobi',
  '/wedding-cakes-nairobi',
  '/chocolate-brownie-cake',
  '/fondant-cakes',
  '/cake-shop-in-ruiru',
  '/cake-shop-around-green-spot-eastern-bypass',
  '/cake-shop-in-juja',
  '/cake-shop-in-kahawa',
  '/cake-shop-near-kasarani',
  '/cake-shop-near-roysambu',
  '/cake-shop-near-garden-city',
  '/cake-shop-near-ruai',
  '/cake-shop-near-tatu-city',
];

function findBrowser() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.openPromise = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || 'CDP error'));
        else resolve(msg.result);
      }
    });
  }

  async send(method, params = {}) {
    await this.openPromise;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    try { this.ws.close(); } catch {}
  }
}

async function waitForDebugPort(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error('Timed out waiting for Chrome DevTools port');
}

async function run() {
  const browserPath = findBrowser();
  if (!browserPath) {
    console.warn('[SSG] No headless Chrome/Edge found; skipping pre-rendering.');
    return;
  }

  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }

  const spaShellHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const productRoutes = CAKES_CATALOG.map(c => `/cake/${c.slug || c.id}`);
  const allRoutes = Array.from(new Set([...CORE_ROUTES, ...productRoutes]));

  const server = http.createServer((req, res) => {
    const reqPath = (req.url || '/').split('?')[0];
    if (reqPath.startsWith('/videos/') || reqPath.startsWith('/models/')) {
      res.writeHead(204);
      res.end();
      return;
    }
    const safeRel = reqPath.replace(/^\/+/, '');
    const filePath = path.join(DIST_DIR, safeRel);

    if (safeRel !== '' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(spaShellHtml);
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port: staticPort } = server.address();
  const baseUrl = `http://127.0.0.1:${staticPort}`;

  const debugPort = 9222 + Math.floor(Math.random() * 500);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lany-ssg-'));
  const chrome = spawn(
    browserPath,
    [
      '--headless=new',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      '--mute-audio',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;
  try {
    const wsUrl = await waitForDebugPort(debugPort);
    cdp = new CdpClient(wsUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log(`[SSG] Pre-rendering ${allRoutes.length} routes via CDP...`);
    let count = 0;

    for (const route of allRoutes) {
      const targetUrl = `${baseUrl}${route}`;
      await cdp.send('Page.navigate', { url: targetUrl });

      // Poll until React has mounted non-empty content inside #root and settled
      const start = Date.now();
      let html = '';
      while (Date.now() - start < 10000) {
        const evalRes = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const root = document.getElementById('root');
            const ready = root && root.children.length > 0 && document.querySelector('footer, main, section');
            return ready ? document.documentElement.outerHTML : '';
          })()`,
          returnByValue: true,
        });
        const candidate = evalRes?.result?.value || '';
        if (candidate && candidate.includes('</header>') && !candidate.includes('<div id="root"></div>')) {
          // Give useEffect hooks (usePageSeo / JSON-LD) 120ms to flush
          await new Promise(r => setTimeout(r, 120));
          const finalEval = await cdp.send('Runtime.evaluate', {
            expression: `'<!doctype html>\\n' + document.documentElement.outerHTML`,
            returnByValue: true,
          });
          html = finalEval?.result?.value || '';
          break;
        }
        await new Promise(r => setTimeout(r, 100));
      }

      if (!html || !html.includes('</header>')) {
        throw new Error(`Timed out waiting for React mount on ${route}`);
      }

      const normalized = html.replaceAll(baseUrl, SITE_ORIGIN);
      const outPath =
        route === '/'
          ? path.join(DIST_DIR, 'index.html')
          : path.join(DIST_DIR, route.replace(/^\/+/, ''), 'index.html');

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, normalized, 'utf8');
      count++;
    }

    console.log(`[SSG] Successfully pre-rendered ${count}/${allRoutes.length} routes.`);
  } finally {
    if (cdp) cdp.close();
    try { chrome.kill('SIGKILL'); } catch {}
    server.close();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

run().catch(err => {
  console.error('[SSG] Pre-render failed:', err);
  process.exit(1);
});
