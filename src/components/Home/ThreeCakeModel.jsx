import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// REALISTIC PROCEDURAL BAKERY TEXTURES
// -----------------------------------------------------------------------------

function createButtercreamTexture(baseColor = '#FFFDF7', swirlColor = '#F5ECE1') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Soft horizontal spatula swirl ridges
  for (let y = 0; y < 512; y += 4) {
    const alpha = (Math.sin(y / 14) + 1) * 0.045;
    ctx.fillStyle = swirlColor;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, y, 512, 6);
  }

  // Micro fine porous cream texture
  ctx.globalAlpha = 0.035;
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#E2D3C4' : '#FFFFFF';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

function createChocolateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Rich Belgian dark chocolate base
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#2D160D');
  grad.addColorStop(0.5, '#220E06');
  grad.addColorStop(1, '#2D160D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Glossy chocolate ribbons
  for (let y = 0; y < 512; y += 10) {
    ctx.fillStyle = '#3E2215';
    ctx.globalAlpha = 0.14;
    ctx.fillRect(0, y + Math.sin(y / 18) * 8, 512, 6);
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

function createMachinedMetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#E8E3DD';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric machining rings
  for (let r = 8; r < 252; r += 3) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.strokeStyle = Math.sin(r * 0.4) > 0 ? '#CEC6BD' : '#FAF6F1';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.28;
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export default function ThreeCakeModel({ type = 'birthday', isHovered = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 250;
    const height = container.clientHeight || 250;

    // 1. Scene & Perspective Camera for appetizing culinary depth
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.0);
    camera.lookAt(0, 0.7, 0);

    // 2. High-Fidelity WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Studio Bakery Lighting (Warm key, fill, and appetizing rim specular)
    const ambientLight = new THREE.AmbientLight(0xfff8f2, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4.5, 8, 5.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffe6d6, 1.6);
    fillLight.position.set(-5, 4.5, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    rimLight.position.set(0, 7, -6);
    scene.add(rimLight);

    // Warm table reflection bounce
    const tableBounce = new THREE.DirectionalLight(0xf2c8a8, 0.8);
    tableBounce.position.set(0, -3, 2);
    scene.add(tableBounce);

    // 4. Main Turntable Group (revolves 360 degrees)
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);

    // -------------------------------------------------------------------------
    // REALISTIC BAKERY TURNTABLE PEDESTAL
    // -------------------------------------------------------------------------
    const metalDiscTex = createMachinedMetalTexture();
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdfd9d2,
      metalness: 0.92,
      roughness: 0.18,
      map: metalDiscTex
    });

    const chromeBodyMat = new THREE.MeshStandardMaterial({
      color: 0xd6cfc6,
      metalness: 0.9,
      roughness: 0.18
    });

    // Stainless steel revolving disc
    const discMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.12, 64), chromeMat);
    discMesh.position.y = -0.06;
    turntableGroup.add(discMesh);

    // Beveled reflective rim that catches specular light
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.045, 16, 64), chromeBodyMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = -0.01;
    turntableGroup.add(rimMesh);

    // Turntable center spindle
    const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.45, 32), chromeBodyMat);
    stemMesh.position.y = -0.34;
    turntableGroup.add(stemMesh);

    // Heavy flared pedestal base
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.65, 0.16, 32), chromeBodyMat);
    baseMesh.position.y = -0.64;
    turntableGroup.add(baseMesh);

    // Soft Radial Ambient Occlusion Shadow beneath pedestal
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
    sGrad.addColorStop(0, 'rgba(45, 12, 18, 0.52)');
    sGrad.addColorStop(0.5, 'rgba(45, 12, 18, 0.16)');
    sGrad.addColorStop(1, 'rgba(45, 12, 18, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.73;
    scene.add(shadowPlane);

    // -------------------------------------------------------------------------
    // 3D CAKE ASSETS ON TURNTABLE
    // -------------------------------------------------------------------------
    const cakeContainer = new THREE.Group();
    turntableGroup.add(cakeContainer);

    // Reusable Materials
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5cf38,
      metalness: 0.92,
      roughness: 0.14
    });

    const strawberryGlossMat = new THREE.MeshStandardMaterial({
      color: 0xcc162b,
      roughness: 0.12,
      metalness: 0.1
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x3d7b32,
      roughness: 0.4
    });

    const creamPuffMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf5,
      roughness: 0.28
    });

    if (type === 'chocolate') {
      // 1. Belgian Chocolate Fudge Drip Cake
      const chocTex = createChocolateTexture();
      const fudgeMat = new THREE.MeshStandardMaterial({
        color: 0x24120a,
        map: chocTex,
        roughness: 0.32,
        metalness: 0.05
      });

      // Liquid Mirror Chocolate Ganache Glaze
      const ganacheMat = new THREE.MeshStandardMaterial({
        color: 0x150804,
        roughness: 0.08,
        metalness: 0.2
      });

      // Main Fudge Tier
      const tier = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 1.48, 64), fudgeMat);
      tier.position.y = 0.74;
      cakeContainer.add(tier);

      // Top Ganache Mirror Glaze
      const glaze = new THREE.Mesh(new THREE.CylinderGeometry(1.71, 1.71, 0.12, 64), ganacheMat);
      glaze.position.y = 1.48;
      cakeContainer.add(glaze);

      // Dripping Ganache Droplets
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const dropHeight = 0.2 + (Math.sin(i * 2.3) + 1) * 0.25;
        const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.02, dropHeight, 12), ganacheMat);
        drop.position.set(Math.cos(a) * 1.69, 1.48 - dropHeight / 2, Math.sin(a) * 1.69);
        cakeContainer.add(drop);

        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), ganacheMat);
        bead.position.set(Math.cos(a) * 1.69, 1.48 - dropHeight, Math.sin(a) * 1.69);
        cakeContainer.add(bead);
      }

      // French Chocolate Macarons on top
      const macShellMat = new THREE.MeshStandardMaterial({ color: 0x4a291b, roughness: 0.35 });
      const macFillMat = new THREE.MeshStandardMaterial({ color: 0x1e0b06, roughness: 0.1 });
      
      const createMacaron = (x, y, z, rotX, rotZ) => {
        const macGroup = new THREE.Group();
        const topShell = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), macShellMat);
        topShell.scale.set(1, 0.45, 1);
        topShell.position.y = 0.04;
        macGroup.add(topShell);

        const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 20), macFillMat);
        macGroup.add(fill);

        const botShell = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), macShellMat);
        botShell.rotation.x = Math.PI;
        botShell.scale.set(1, 0.45, 1);
        botShell.position.y = -0.04;
        macGroup.add(botShell);

        macGroup.position.set(x, y, z);
        macGroup.rotation.x = rotX;
        macGroup.rotation.z = rotZ;
        return macGroup;
      };

      cakeContainer.add(createMacaron(0.55, 1.65, 0.3, 0.3, -0.2));
      cakeContainer.add(createMacaron(-0.45, 1.62, 0.45, -0.2, 0.4));

      // Dark Chocolate Shards / Bark
      const shardMat = new THREE.MeshStandardMaterial({ color: 0x1f0d07, roughness: 0.15, metalness: 0.15 });
      for (let i = 0; i < 4; i++) {
        const shard = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.05), shardMat);
        shard.position.set((i - 1.5) * 0.34, 1.95, -0.15 + (Math.random() - 0.5) * 0.2);
        shard.rotation.z = (Math.random() - 0.5) * 0.6;
        shard.rotation.y = (Math.random() - 0.5) * 0.8;
        cakeContainer.add(shard);
      }

      // Chocolate-dipped strawberry
      const strawMesh = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.48, 20), strawberryGlossMat);
      strawMesh.position.set(-0.2, 1.74, -0.4);
      strawMesh.rotation.x = Math.PI * 0.85;
      strawMesh.rotation.z = 0.3;
      cakeContainer.add(strawMesh);

      // Gold leaf dragees
      for (let i = 0; i < 9; i++) {
        const goldSphere = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), goldMat);
        const a = (i / 9) * Math.PI * 2;
        goldSphere.position.set(Math.cos(a) * 0.9, 1.55, Math.sin(a) * 0.9);
        cakeContainer.add(goldSphere);
      }

    } else if (type === 'birthday') {
      // 2. The Minimalist Birthday Bento Cake
      const buttercreamTex = createButtercreamTexture('#FFFDF5', '#F5ECE1');
      const bentoMat = new THREE.MeshStandardMaterial({
        color: 0xfffcf5,
        map: buttercreamTex,
        roughness: 0.35,
        metalness: 0.02
      });

      // Bento Tier
      const tier = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 1.4, 64), bentoMat);
      tier.position.y = 0.7;
      cakeContainer.add(tier);

      // Top Pastel Strawberry Cream Glaze
      const strawberryCream = new THREE.MeshStandardMaterial({
        color: 0xf7b7c5,
        roughness: 0.22,
        metalness: 0.05
      });
      const topCream = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.12, 64), strawberryCream);
      topCream.position.y = 1.42;
      cakeContainer.add(topCream);

      // 14 Fluffy Whipped Cream Rosettes around perimeter
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const ros = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), creamPuffMat);
        ros.scale.set(1, 1.35, 1);
        ros.position.set(Math.cos(a) * 1.38, 1.54, Math.sin(a) * 1.38);
        cakeContainer.add(ros);
      }

      // Fresh Juicy Strawberries
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const strawGroup = new THREE.Group();
        const berry = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.44, 20), strawberryGlossMat);
        berry.rotation.x = Math.PI;
        strawGroup.add(berry);

        // Green leaves calyx
        for (let l = 0; l < 4; l++) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), leafMat);
          const la = (l / 4) * Math.PI * 2;
          leaf.position.set(Math.cos(la) * 0.12, 0.22, Math.sin(la) * 0.12);
          leaf.rotation.z = Math.PI / 3;
          leaf.rotation.y = la;
          strawGroup.add(leaf);
        }

        strawGroup.position.set(Math.cos(a) * 0.65, 1.64, Math.sin(a) * 0.65);
        cakeContainer.add(strawGroup);
      }

      // Celebration Golden Birthday Candle
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 16), goldMat);
      candle.position.set(0, 1.95, 0);
      cakeContainer.add(candle);

      // Animated Candle Flame
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xffaa15 })
      );
      flame.scale.set(0.75, 1.7, 0.75);
      flame.position.set(0, 2.45, 0);
      cakeContainer.add(flame);

    } else if (type === 'wedding') {
      // 3. Royal Botanical Wedding Tier (Ivory Fondant + English Garden Roses)
      const ivoryTex = createButtercreamTexture('#FDFBF7', '#F3ECE2');
      const ivoryMat = new THREE.MeshStandardMaterial({
        color: 0xfdfaf4,
        map: ivoryTex,
        roughness: 0.36
      });

      // Tier 1 (Base tier)
      const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.9, 64), ivoryMat);
      t1.position.y = 0.45;
      cakeContainer.add(t1);

      // 24k Gold Beaded Garlands
      const g1 = new THREE.Mesh(new THREE.TorusGeometry(1.86, 0.04, 16, 64), goldMat);
      g1.rotation.x = Math.PI / 2;
      g1.position.y = 0.02;
      cakeContainer.add(g1);

      // Tier 2 (Middle tier)
      const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.8, 64), ivoryMat);
      t2.position.y = 1.3;
      cakeContainer.add(t2);

      const g2 = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.035, 16, 64), goldMat);
      g2.rotation.x = Math.PI / 2;
      g2.position.y = 0.9;
      cakeContainer.add(g2);

      // Tier 3 (Top tier)
      const t3 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 64), ivoryMat);
      t3.position.y = 2.05;
      cakeContainer.add(t3);

      const g3 = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.03, 16, 64), goldMat);
      g3.rotation.x = Math.PI / 2;
      g3.position.y = 1.7;
      cakeContainer.add(g3);

      // Handcrafted English Garden Peach & Blush Roses
      const roseColors = [0xf7afa0, 0xf5c7b8, 0xfce4db];
      for (let i = 0; i < 7; i++) {
        const roseMat = new THREE.MeshStandardMaterial({
          color: roseColors[i % roseColors.length],
          roughness: 0.38
        });
        const rose = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), roseMat);
        rose.position.set((Math.random() - 0.5) * 0.45, 2.52, (Math.random() - 0.5) * 0.45);
        rose.rotation.set(Math.random(), Math.random(), Math.random());
        cakeContainer.add(rose);
      }

      // Cascading side blossoms
      for (let i = 0; i < 3; i++) {
        const sideRose = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.18, 1),
          new THREE.MeshStandardMaterial({ color: 0xf7afa0, roughness: 0.38 })
        );
        sideRose.position.set(0.9 + i * 0.18, 1.4 - i * 0.3, 0.9 - i * 0.1);
        cakeContainer.add(sideRose);
      }

    } else if (type === 'graduation') {
      // 4. Graduation Academic Cap Celebration Tier
      const navyMat = new THREE.MeshStandardMaterial({
        color: 0x16243d,
        roughness: 0.3
      });
      const ivoryMat = new THREE.MeshStandardMaterial({
        color: 0xfdfaf4,
        roughness: 0.32
      });

      // Base navy tier
      const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.95, 64), navyMat);
      t1.position.y = 0.475;
      cakeContainer.add(t1);

      // Golden pearls along base
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), goldMat);
        bead.position.set(Math.cos(a) * 1.7, 0.05, Math.sin(a) * 1.7);
        cakeContainer.add(bead);
      }

      // Upper ivory tier
      const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, 0.82, 64), ivoryMat);
      t2.position.y = 1.36;
      cakeContainer.add(t2);

      // 3D Academic Mortarboard Cap
      const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.52, 0.26, 32), navyMat);
      skull.position.y = 1.9;
      cakeContainer.add(skull);

      const capSquare = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.075, 1.4), navyMat);
      capSquare.position.y = 2.04;
      capSquare.rotation.y = Math.PI / 4;
      cakeContainer.add(capSquare);

      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), goldMat);
      button.position.y = 2.09;
      cakeContainer.add(button);

      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.08, 0.48, 10), goldMat);
      tassel.position.set(0.5, 1.88, 0.5);
      cakeContainer.add(tassel);

      // Rolled Graduation Diploma with Red Ribbon
      const diploma = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xfffcf0, roughness: 0.4 })
      );
      diploma.rotation.z = Math.PI / 2;
      diploma.rotation.y = 0.4;
      diploma.position.set(-0.25, 1.84, 0.55);
      cakeContainer.add(diploma);

      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: 0xb51a2b, roughness: 0.3 })
      );
      ribbon.rotation.z = Math.PI / 2;
      ribbon.rotation.y = 0.4;
      ribbon.position.set(-0.25, 1.84, 0.55);
      cakeContainer.add(ribbon);

    } else {
      // 5. Pastel Baby Shower Joy
      const babyBlueMat = new THREE.MeshStandardMaterial({
        color: 0xc8ddf0,
        roughness: 0.32
      });
      const creamMat = new THREE.MeshStandardMaterial({
        color: 0xfdfaf2,
        roughness: 0.3
      });

      // Base baby blue tier
      const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.15, 64), babyBlueMat);
      t1.position.y = 0.575;
      cakeContainer.add(t1);

      // Upper cream tier
      const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, 0.92, 64), creamMat);
      t2.position.y = 1.61;
      cakeContainer.add(t2);

      // Gleaming golden celebration spheres of varying sizes
      for (let i = 0; i < 9; i++) {
        const r = 0.12 + (i % 3) * 0.045;
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), goldMat);
        const a = (i / 9) * Math.PI * 2;
        sphere.position.set(Math.cos(a) * 0.78, 2.18, Math.sin(a) * 0.78);
        cakeContainer.add(sphere);
      }

      // Whipped cream clouds
      for (let i = 0; i < 6; i++) {
        const cloud = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), creamPuffMat);
        const a = (i / 6) * Math.PI * 2 + 0.3;
        cloud.position.set(Math.cos(a) * 1.05, 2.12, Math.sin(a) * 1.05);
        cakeContainer.add(cloud);
      }
    }

    // -------------------------------------------------------------------------
    // INTERACTIVE TOUCH & DRAG TO SPIN TURNTABLE 360°
    // -------------------------------------------------------------------------
    let isDragging = false;
    let prevPointerX = 0;
    let dragVelocity = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      dragVelocity = 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = currentX - prevPointerX;
      prevPointerX = currentX;
      turntableGroup.rotation.y += deltaX * 0.015;
      dragVelocity = deltaX * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.style.cursor = 'grab';
    domEl.addEventListener('mousedown', onPointerDown);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // -------------------------------------------------------------------------
    // CONTINUOUS 360 ROUND MOTION ANIMATION LOOP
    // -------------------------------------------------------------------------
    let animId;
    let isDisposed = false;

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (isDragging) {
        domEl.style.cursor = 'grabbing';
      } else {
        domEl.style.cursor = 'grab';
        if (Math.abs(dragVelocity) > 0.001) {
          turntableGroup.rotation.y += dragVelocity;
          dragVelocity *= 0.94;
        } else {
          // Smooth continuous round motion on turntable
          const speed = isHovered ? 0.016 : 0.010;
          turntableGroup.rotation.y += speed;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [type, isHovered]);

  return <div ref={mountRef} className="three-cake-canvas-wrap" />;
}
