import * as THREE from "three";
const loader = new THREE.TextureLoader();

const woodTexture = loader.load(import.meta.env.BASE_URL + "textures/wood.png");

export function createSideTable() {
  const table = new THREE.Group();

  // =====================
  // Materials
  // =====================

  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,

    roughness: 0.7,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc857,

    metalness: 0.8,

    roughness: 0.3,
  });

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a2a00,

    roughness: 0.8,
  });

  // =====================
  // Round Table Top
  // =====================

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.75,

      0.75,

      0.12,

      48,
    ),

    woodMaterial,
  );

  top.position.y = 1.25;

  top.castShadow = true;

  table.add(top);

  // =====================
  // Legs
  // =====================

  const legGeometry = new THREE.CylinderGeometry(
    0.05,

    0.05,

    1.2,

    16,
  );

  const legPositions = [
    [-0.45, 0.6, -0.35],

    [0.45, 0.6, -0.35],

    [-0.45, 0.6, 0.35],

    [0.45, 0.6, 0.35],
  ];

  for (let i = 0; i < legPositions.length; i++) {
    const leg = new THREE.Mesh(
      legGeometry,

      goldMaterial,
    );

    leg.position.set(
      legPositions[i][0],

      legPositions[i][1],

      legPositions[i][2],
    );

    leg.castShadow = true;

    table.add(leg);
  }

  // =====================
  // Lower Shelf
  // =====================

  const shelf = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.55,

      0.55,

      0.08,

      48,
    ),

    shelfMaterial,
  );

  shelf.position.y = 0.35;

  table.add(shelf);

  // =====================
  // Decoration Vase
  // =====================

  const vase = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.12,

      0.18,

      0.35,

      24,
    ),

    new THREE.MeshStandardMaterial({
      color: 0xffd166,

      roughness: 0.5,
    }),
  );

  vase.position.y = 1.5;

  table.add(vase);

  return table;
}
