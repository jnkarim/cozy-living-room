import * as THREE from "three";

export function createCredenza() {
  const g = new THREE.Group();

  const wood = new THREE.MeshStandardMaterial({
    color: 0x3a1a0c,
    roughness: 0.6,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x24110a,
    roughness: 0.7,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xc9a04a,
    metalness: 0.8,
    roughness: 0.35,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: 0x1c2a44,
    roughness: 0.5,
  });

  // cabinet body
  const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 1.6), wood);
  body.position.y = 1.5;
  body.castShadow = body.receiveShadow = true;
  g.add(body);

  // top slab
  const top = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.15, 1.8), dark);
  top.position.y = 2.68;
  g.add(top);

  // legs
  [-2.7, 2.7].forEach((x) => {
    [-0.6, 0.6].forEach((z) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.06, 0.4, 12),
        gold,
      );
      leg.position.set(x, 0.2, z);
      g.add(leg);
    });
  });

  // door panels + handles (front face is +z)
  [-1.5, 1.5].forEach((x) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.7, 0.05), dark);
    panel.position.set(x, 1.5, 0.83);
    g.add(panel);

    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), gold);
    handle.position.set(x > 0 ? x - 1.0 : x + 1.0, 1.5, 0.9);
    g.add(handle);
  });

  // vase on top
  const vase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 0.9, 20),
    blue,
  );
  vase.position.set(-1.8, 3.2, 0);
  g.add(vase);

  // painting on the wall above
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 0.12), gold);
  frame.position.set(0, 5.6, -0.6);
  g.add(frame);

  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x2c4a6b, roughness: 0.9 }),
  );
  canvas.position.set(0, 5.6, -0.53);
  g.add(canvas);

  return g;
}
