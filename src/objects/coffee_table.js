import * as THREE from "three";

export function createCoffeeTable() {
  const table = new THREE.Group();

  // =====================
  // Materials
  // =====================

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a3015,
    roughness: 0.8,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x99ddff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xd6a84f,
    metalness: 0.7,
    roughness: 0.3,
  });

  // =====================
  // Glass Top
  // =====================

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.12, 1.5),
    glassMaterial,
  );

  top.position.y = 1.1;
  top.castShadow = true;
  top.receiveShadow = true;

  table.add(top);

  // =====================
  // Wooden Base
  // =====================

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.18, 1.2),
    woodMaterial,
  );

  base.position.y = 0.55;
  base.castShadow = true;
  base.receiveShadow = true;

  table.add(base);

  // =====================
  // Legs
  // =====================

  const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1, 20);

  const positions = [
    [-1, 0.5, -0.5],
    [1, 0.5, -0.5],
    [-1, 0.5, 0.5],
    [1, 0.5, 0.5],
  ];

  positions.forEach(function (p) {
    const leg = new THREE.Mesh(legGeometry, metalMaterial);

    leg.position.set(p[0], p[1], p[2]);
    leg.castShadow = true;
    leg.receiveShadow = true;

    table.add(leg);
  });

  return table;
}
