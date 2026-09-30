import * as THREE from "three";

export function createNightWindow() {
  const g = new THREE.Group();
  const W = 4.4,
    H = 5.2;

  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 600;
  const ctx = c.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, c.height);
  sky.addColorStop(0, "#040814");
  sky.addColorStop(0.6, "#0e1a3d");
  sky.addColorStop(1, "#24336b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 140; i++) {
    const r = Math.random() * 1.6 + 0.3;
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      Math.random() * c.width,
      Math.random() * c.height * 0.85,
      r,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const mx = 360,
    my = 150;
  const glow = ctx.createRadialGradient(mx, my, 10, mx, my, 120);
  glow.addColorStop(0, "rgba(255,245,210,0.55)");
  glow.addColorStop(1, "rgba(255,245,210,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(mx - 130, my - 130, 260, 260);

  ctx.fillStyle = "#fff6d8";
  ctx.beginPath();
  ctx.arc(mx, my, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,190,150,0.35)";
  ctx.beginPath();
  ctx.arc(mx - 10, my - 6, 7, 0, Math.PI * 2);
  ctx.arc(mx + 12, my + 10, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#070b1a";
  let x = 0;
  while (x < c.width) {
    const w = 40 + Math.random() * 50;
    const h = 60 + Math.random() * 110;
    ctx.fillRect(x, c.height - h, w, h);

    ctx.fillStyle = "#ffc766";
    if (Math.random() > 0.5) ctx.fillRect(x + 10, c.height - h + 14, 8, 10);
    ctx.fillStyle = "#070b1a";
    x += w + 4;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const skyMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  skyMesh.position.z = 0.02;
  g.add(skyMesh);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshStandardMaterial({
      color: 0x99bbff,
      transparent: true,
      opacity: 0.08,
      roughness: 0.1,
    }),
  );
  glass.position.z = 0.1;
  g.add(glass);

  const wood = new THREE.MeshStandardMaterial({
    color: 0x2b1408,
    roughness: 0.6,
  });
  const t = 0.22;
  const bar = (w, h, x, y, d = 0.25) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood);
    m.position.set(x, y, 0.12);
    m.castShadow = true;
    g.add(m);
  };
  bar(W + t * 2, t, 0, H / 2 + t / 2);
  bar(W + t * 2, t, 0, -H / 2 - t / 2);
  bar(t, H, -W / 2 - t / 2, 0);
  bar(t, H, W / 2 + t / 2, 0);
  bar(0.1, H, 0, 0, 0.15);
  bar(W, 0.1, 0, 0.4, 0.15);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(W + 0.9, 0.14, 0.6), wood);
  sill.position.set(0, -H / 2 - t - 0.05, 0.3);
  g.add(sill);

  const cloth = new THREE.MeshStandardMaterial({
    color: 0x1c2a44,
    roughness: 0.95,
  });
  [-1, 1].forEach((s) => {
    const curtain = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, H + 0.8, 0.22),
      cloth,
    );
    curtain.position.set(s * (W / 2 + 0.15), 0, 0.45);
    g.add(curtain);
  });
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, W + 2.2, 12),
    new THREE.MeshStandardMaterial({
      color: 0xc9a04a,
      metalness: 0.8,
      roughness: 0.35,
    }),
  );
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, H / 2 + 0.6, 0.45);
  g.add(rod);

  const moonLight = new THREE.PointLight(0x6f8cff, 2.2, 14);
  moonLight.position.set(0, 0.5, 1.5);
  g.add(moonLight);

  g.userData.update = (time) => {
    moonLight.intensity = 2.0 + Math.sin(time * 0.8) * 0.25;
  };

  return g;
}
