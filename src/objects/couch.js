import * as THREE from "three";

// =====================
// Shared helpers
// =====================

const loader = new THREE.TextureLoader();

function loadFabric(repeat) {
  const t = loader.load(import.meta.env.BASE_URL + "textures/couch.png");
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Extruded shapes have world-unit UVs, cylinders/capsules have 0..1 UVs,
// so each gets its own texture repeat.
const fabricWorldTex = loadFabric(0.6);
const fabricUvTex = loadFabric(1.5);

/**
 * Velvet-like fabric: texture (or a solid colour) + soft sheen.
 * tint multiplies the texture, so darker tint = deeper shade.
 */
function velvet({ tint = 0xffffff, uv = false, useTexture = true, solid = 0x2d4a7a, sheen = 0x8fb2ff } = {}) {
  const color = new THREE.Color(useTexture ? tint : solid);
  if (!useTexture) color.multiply(new THREE.Color(tint));
  return new THREE.MeshPhysicalMaterial({
    color,
    map: useTexture ? (uv ? fabricUvTex : fabricWorldTex) : null,
    roughness: 0.85,
    sheen: 1,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color(sheen),
  });
}

// Box with softly rounded edges (no extra imports needed).
function softBox(w, h, d, r = 0.06, seg = 4) {
  const x = (w - 2 * r) / 2;
  const y = (h - 2 * r) / 2;
  const s = new THREE.Shape();
  s.moveTo(-x, -y);
  s.lineTo(x, -y);
  s.lineTo(x, y);
  s.lineTo(-x, y);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d - 2 * r,
    bevelEnabled: true,
    bevelThickness: r,
    bevelSize: r,
    bevelSegments: seg,
    curveSegments: 1,
  });
  g.translate(0, 0, -(d - 2 * r) / 2);
  return g;
}

const brassMat = () =>
  new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.85, roughness: 0.28 });

function addMesh(parent, geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function finish(group) {
  group.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return group;
}

// =====================
// Three-seater: channel-tufted velvet sofa, rolled arms, brass legs
// =====================

export function createCouch({ useTexture = true, color = 0x2d4a7a } = {}) {
  const couch = new THREE.Group();
  couch.name = "Couch";

  const opt = { useTexture, solid: color };
  const frameMat = velvet({ ...opt, tint: 0xaab4c8 });
  const channelMat = velvet({ ...opt, tint: 0xc4cde0, uv: true });
  const cushionMat = velvet({ ...opt, tint: 0xffffff });
  const armMat = velvet({ ...opt, tint: 0xb4bed4 });
  const rollMat = velvet({ ...opt, tint: 0xd0d8ea, uv: true });
  const brass = brassMat();

  const W = 4.7; // overall width
  const D = 1.95; // depth
  const armW = 0.54;
  const armX = W / 2 - armW / 2;
  const inner = W - 2 * armW;

  // base frame
  addMesh(couch, softBox(W, 0.5, D, 0.05), frameMat, 0, 0.65, 0);
  addMesh(couch, new THREE.BoxGeometry(W - 0.1, 0.035, 0.04), brass, 0, 0.42, D / 2 - 0.01);

  // nail-head trim along the front of the base
  const studGeo = new THREE.SphereGeometry(0.022, 10, 8);
  const studCount = 31;
  const studs = new THREE.InstancedMesh(studGeo, brass, studCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < studCount; i++) {
    const x = -2.1 + (i * 4.2) / (studCount - 1);
    dummy.position.set(x, 0.5, D / 2 + 0.005);
    dummy.updateMatrix();
    studs.setMatrixAt(i, dummy.matrix);
  }
  couch.add(studs);

  // rolled arms
  [-1, 1].forEach((s) => {
    const x = s * armX;
    addMesh(couch, softBox(armW, 1.05, D, 0.08), armMat, x, 0.925, 0);

    const roll = addMesh(couch, new THREE.CylinderGeometry(0.29, 0.29, D, 36), rollMat, x, 1.45, 0);
    roll.rotation.x = Math.PI / 2;

    // brass ring + button on the scroll end
    const ring = addMesh(couch, new THREE.TorusGeometry(0.2, 0.013, 8, 40), brass, x, 1.45, D / 2 + 0.005);
    ring.castShadow = false;
    addMesh(couch, new THREE.SphereGeometry(0.05, 14, 12), brass, x, 1.45, D / 2 + 0.02);
  });

  // channel-tufted back
  const channels = 8;
  const pitch = inner / channels;
  for (let i = 0; i < channels; i++) {
    const x = -inner / 2 + pitch * (i + 0.5);
    addMesh(
      couch,
      new THREE.CapsuleGeometry(pitch / 2 - 0.004, 1.02, 6, 16),
      channelMat,
      x,
      1.6,
      -0.72,
    );
  }

  // seat cushions
  const cw = (inner - 0.06) / 3;
  [-1, 0, 1].forEach((k) => {
    addMesh(couch, softBox(cw, 0.4, 1.5, 0.14), cushionMat, k * (cw + 0.03), 1.1, 0.245);
    // brass piping line on the cushion front
    addMesh(couch, new THREE.BoxGeometry(cw - 0.1, 0.012, 0.012), brass, k * (cw + 0.03), 1.18, 0.99);
  });

  // throw pillows
  const pillow1 = addMesh(
    couch,
    softBox(0.72, 0.72, 0.26, 0.11),
    new THREE.MeshPhysicalMaterial({ color: 0xe8e1d5, roughness: 1, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) }),
    -1.3,
    1.62,
    -0.28,
  );
  pillow1.rotation.set(-0.28, 0.28, 0.1);

  const pillow2 = addMesh(
    couch,
    softBox(0.68, 0.68, 0.26, 0.11),
    new THREE.MeshPhysicalMaterial({ color: 0xc99a3c, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0xffd98a) }),
    1.35,
    1.6,
    -0.25,
  );
  pillow2.rotation.set(-0.26, -0.32, -0.1);

  // throw blanket draped over the right arm
  const throwMat = new THREE.MeshStandardMaterial({ color: 0xd9cdb5, roughness: 1 });
  const throwTop = addMesh(couch, softBox(0.7, 0.07, 1.3, 0.03), throwMat, armX + 0.02, 1.77, 0.25);
  throwTop.rotation.z = -0.06;
  addMesh(couch, softBox(0.07, 0.75, 1.3, 0.03), throwMat, W / 2 + 0.03, 1.42, 0.25);

  // splayed brass legs with foot caps
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([sx, sz]) => {
    const leg = addMesh(
      couch,
      new THREE.CylinderGeometry(0.055, 0.032, 0.4, 18),
      brass,
      sx * 2.05,
      0.2,
      sz * 0.78,
    );
    leg.rotation.set(-sz * 0.12, 0, sx * 0.12);
    addMesh(couch, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), brass, sx * 2.05 + sx * 0.048, 0.015, sz * 0.78 + sz * 0.048);
  });

  return finish(couch);
}

// =====================
// Barrel tub armchair: wrap-around back, round cushion, brass base
// =====================

export function createArmchair({ useTexture = true, color = 0x2d4a7a } = {}) {
  const chair = new THREE.Group();
  chair.name = "Armchair";

  const opt = { useTexture, solid: color };
  const shellMat = velvet({ ...opt, tint: 0xb4bed4 });
  const seatMat = velvet({ ...opt, tint: 0xffffff, uv: true });
  const baseMat = velvet({ ...opt, tint: 0xaab4c8, uv: true });
  const brass = brassMat();

  // base drum + brass band
  addMesh(chair, new THREE.CylinderGeometry(0.92, 0.88, 0.5, 56), baseMat, 0, 0.65, 0);
  const band = addMesh(chair, new THREE.TorusGeometry(0.905, 0.018, 8, 72), brass, 0, 0.5, 0);
  band.rotation.x = Math.PI / 2;

  // wrap-around back (sector of a ring, extruded upward)
  const Ro = 0.98;
  const Ri = 0.74;
  const a0 = Math.PI / 2 - 1.75;
  const a1 = Math.PI / 2 + 1.75;
  const s = new THREE.Shape();
  s.absarc(0, 0, Ro, a0, a1, false);
  s.absarc(0, 0, Ri, a1, a0, true);
  s.closePath();
  const shellGeo = new THREE.ExtrudeGeometry(s, {
    depth: 1.15,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 4,
    curveSegments: 48,
  });
  shellGeo.rotateX(-Math.PI / 2); // shape y -> -z (back), extrusion -> up
  addMesh(chair, shellGeo, shellMat, 0, 0.85, 0);

  // seat cushion
  addMesh(chair, new THREE.CylinderGeometry(0.72, 0.72, 0.34, 48), seatMat, 0, 1.07, 0.02);
  const pipe = addMesh(chair, new THREE.TorusGeometry(0.72, 0.012, 8, 64), brass, 0, 1.24, 0.02);
  pipe.rotation.x = Math.PI / 2;

  // lumbar pillow
  const pillow = addMesh(
    chair,
    softBox(0.6, 0.4, 0.2, 0.09),
    new THREE.MeshPhysicalMaterial({ color: 0xc99a3c, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0xffd98a) }),
    0,
    1.52,
    -0.42,
  );
  pillow.rotation.x = -0.3;

  // legs
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    addMesh(
      chair,
      new THREE.CylinderGeometry(0.05, 0.03, 0.4, 16),
      brass,
      Math.cos(a) * 0.6,
      0.2,
      Math.sin(a) * 0.6,
    );
  }

  return finish(chair);
}

// =====================
// Round tufted ottoman
// =====================

export function createOttoman({ useTexture = true, color = 0x2d4a7a } = {}) {
  const o = new THREE.Group();
  o.name = "Ottoman";

  const opt = { useTexture, solid: color };
  const body = velvet({ ...opt, tint: 0xb4bed4, uv: true });
  const top = velvet({ ...opt, tint: 0xffffff, uv: true });
  const brass = brassMat();

  addMesh(o, new THREE.CylinderGeometry(0.62, 0.6, 0.38, 48), body, 0, 0.4, 0);
  addMesh(o, new THREE.CylinderGeometry(0.58, 0.6, 0.12, 48), top, 0, 0.65, 0);
  const band = addMesh(o, new THREE.TorusGeometry(0.615, 0.018, 8, 64), brass, 0, 0.3, 0);
  band.rotation.x = Math.PI / 2;

  // tufting buttons
  addMesh(o, new THREE.SphereGeometry(0.035, 12, 10), brass, 0, 0.72, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    addMesh(o, new THREE.SphereGeometry(0.03, 12, 10), brass, Math.cos(a) * 0.3, 0.71, Math.sin(a) * 0.3);
  }

  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    addMesh(o, new THREE.CylinderGeometry(0.045, 0.028, 0.2, 14), brass, Math.cos(a) * 0.45, 0.1, Math.sin(a) * 0.45);
  }

  return finish(o);
}