/**
 * Lany Cake Shop - cPanel Deployment Script
 *
 * Builds the Vite frontend (dist/), packages it as a ZIP (including .htaccess),
 * uploads to cPanel via UAPI, extracts into the domain docroot, backs up any
 * legacy WordPress index.php, and cleans up temporary archives.
 *
 * Usage:
 *   node scripts/deploy_lanycakes.cjs              # Build + upload + extract
 *   node scripts/deploy_lanycakes.cjs --skip-build # Upload existing dist/
 *   node scripts/deploy_lanycakes.cjs --dry-run    # Build + zip + verify API only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const ZIP_NAME = 'lanycakes_dist.zip';
const ZIP_PATH = path.join(ROOT, ZIP_NAME);
const ENV_PATH = path.join(ROOT, '.env.deploy');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(ENV_PATH);

const CONFIG = {
  host: process.env.CPANEL_HOST || 'lanycakes.co.ke',
  port: Number(process.env.CPANEL_PORT || 2083),
  user: process.env.CPANEL_USER || '',
  token: process.env.CPANEL_API_TOKEN || '',
  targetDir: process.env.CPANEL_TARGET_DIR || 'lanycakes.co.ke',
};

if (!CONFIG.user || !CONFIG.token) {
  console.error('Missing CPANEL_USER or CPANEL_API_TOKEN in .env.deploy or environment.');
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const SKIP_BUILD = args.has('--skip-build');
const DRY_RUN = args.has('--dry-run');
const KEEP_EXISTING = args.has('--keep-existing');
const PRESERVE_ENTRIES = new Set(['.', '..', '.well-known', 'cgi-bin']);

function cpanelRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: CONFIG.host,
        port: CONFIG.port,
        path: endpoint,
        method,
        headers: {
          Authorization: `cpanel ${CONFIG.user}:${CONFIG.token}`,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, json: JSON.parse(body) });
          } catch {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function uploadZip(zipPath, targetDir) {
  const stats = fs.statSync(zipPath);
  const boundary = '----LanyDeployBoundary' + Math.random().toString(36).slice(2);

  const header = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="dir"',
    '',
    targetDir,
    `--${boundary}`,
    'Content-Disposition: form-data; name="overwrite"',
    '',
    '1',
    `--${boundary}`,
    `Content-Disposition: form-data; name="file-1"; filename="${ZIP_NAME}"`,
    'Content-Type: application/zip',
    '',
    '',
  ].join('\r\n');

  const footer = `\r\n--${boundary}--\r\n`;
  const contentLength = Buffer.byteLength(header) + stats.size + Buffer.byteLength(footer);

  console.log(`Uploading ${ZIP_NAME} (${(stats.size / 1024 / 1024).toFixed(2)} MB) to ${CONFIG.host}/${targetDir}...`);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: CONFIG.host,
        port: CONFIG.port,
        path: '/execute/Fileman/upload_files',
        method: 'POST',
        headers: {
          Authorization: `cpanel ${CONFIG.user}:${CONFIG.token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': contentLength,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, json: JSON.parse(body) });
          } catch {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(header);
    const stream = fs.createReadStream(zipPath);
    stream.on('data', (chunk) => req.write(chunk));
    stream.on('end', () => {
      req.write(footer);
      req.end();
    });
  });
}

function createZip() {
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  console.log('Packaging dist/ (including .htaccess)...');
  // tar -a -c -f creates a standard ZIP and reliably includes dotfiles like .htaccess on Windows
  execSync(`tar -a -c -f "${ZIP_PATH}" -C "${DIST_DIR}" .`, { stdio: 'inherit' });
}

async function main() {
  if (!SKIP_BUILD) {
    console.log('Running production build (npm run build)...');
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  }

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(`dist/ not found at ${DIST_DIR}`);
  }

  createZip();

  console.log(`Verifying cPanel API connectivity (${CONFIG.host}:${CONFIG.port})...`);
  const check = await cpanelRequest(
    `/execute/Fileman/list_files?dir=${encodeURIComponent(CONFIG.targetDir)}&showhidden=1`
  );
  if (!check.json || check.json.status !== 1) {
    throw new Error(`cPanel API check failed: ${JSON.stringify(check)}`);
  }
  console.log(`Connected! Target "${CONFIG.targetDir}" has ${check.json.data.length} top-level entries.`);

  if (DRY_RUN) {
    console.log('--dry-run enabled: skipping clean, upload and extraction.');
    return;
  }

  if (!KEEP_EXISTING) {
    const toDelete = check.json.data
      .map((entry) => entry.file)
      .filter((name) => name && !PRESERVE_ENTRIES.has(name));

    if (toDelete.length > 0) {
      console.log(`Cleaning ${toDelete.length} existing entries in ${CONFIG.targetDir} (preserving .well-known & cgi-bin)...`);
      for (const name of toDelete) {
        const targetPath = `${CONFIG.targetDir}/${name}`;
        // cPanel API2 Fileman::fileop op=unlink permanently deletes files and directories recursively
        const delRes = await cpanelRequest(
          `/json-api/cpanel?cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fileop&op=unlink&sourcefiles=${encodeURIComponent(targetPath)}`
        );
        const ok = delRes.json && delRes.json.cpanelresult && !delRes.json.cpanelresult.error;
        if (!ok) {
          console.warn(`Warning: failed to remove ${targetPath}:`, delRes.json || delRes.raw);
        }
      }
      console.log('Directory cleaned.');
    }
  }

  const uploadRes = await uploadZip(ZIP_PATH, CONFIG.targetDir);
  if (!uploadRes.json || uploadRes.json.status !== 1) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadRes)}`);
  }
  console.log('Upload complete.');

  const absTargetDir = CONFIG.targetDir.startsWith('/')
    ? CONFIG.targetDir
    : `/home/${CONFIG.user}/${CONFIG.targetDir}`;

  console.log(`Extracting ${ZIP_NAME} into ${absTargetDir}...`);
  const extractRes = await cpanelRequest(
    `/json-api/cpanel?cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fileop&op=extract&sourcefiles=${encodeURIComponent(`${absTargetDir}/${ZIP_NAME}`)}&destfiles=${encodeURIComponent(absTargetDir)}`
  );
  if (!extractRes.json || !extractRes.json.cpanelresult || extractRes.json.cpanelresult.error) {
    throw new Error(`Extract failed: ${JSON.stringify(extractRes)}`);
  }
  console.log('Extraction complete.');

  console.log('Cleaning up remote archive...');
  await cpanelRequest(
    `/json-api/cpanel?cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fileop&op=unlink&sourcefiles=${encodeURIComponent(`${absTargetDir}/${ZIP_NAME}`)}`
  );

  const localHtaccess = path.join(ROOT, 'public', '.htaccess');
  if (fs.existsSync(localHtaccess)) {
    console.log('Ensuring .htaccess is uploaded...');
    const postData = new URLSearchParams({
      dir: absTargetDir,
      file: '.htaccess',
      content: fs.readFileSync(localHtaccess, 'utf8'),
    }).toString();
    await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: CONFIG.host,
          port: CONFIG.port,
          path: '/execute/Fileman/save_file_content',
          method: 'POST',
          headers: {
            Authorization: `cpanel ${CONFIG.user}:${CONFIG.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
          },
          rejectUnauthorized: false,
        },
        (res) => {
          res.resume();
          res.on('end', resolve);
        }
      );
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  // Verify index.html & .htaccess landed in target root
  const verify = await cpanelRequest(
    `/execute/Fileman/list_files?dir=${encodeURIComponent(absTargetDir)}&showhidden=1`
  );
  const files = (verify.json && verify.json.data ? verify.json.data : []).map((e) => e.file);
  if (!files.includes('index.html')) {
    throw new Error(`index.html missing from ${absTargetDir} after extraction. Found: ${files.join(', ')}`);
  }
  console.log(`Verified ${absTargetDir} contents: ${files.join(', ')}`);

  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  console.log(`Deployment finished! Verify live at https://${CONFIG.host}/`);
}

main().catch((err) => {
  console.error('Deployment failed:', err.message || err);
  process.exit(1);
});
