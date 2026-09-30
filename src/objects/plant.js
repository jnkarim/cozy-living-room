import * as THREE from "three";

export function createPlant() {
  const plant = new THREE.Group();

  // =====================
  // Materials
  // =====================

  const potMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c3a5,

    roughness: 0.8,
  });

  const soilMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b2415,
  });

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f7d3a,

    roughness: 0.7,
  });

  // =====================
  // Pot
  // =====================

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.45,

      0.35,

      0.8,

      32,
    ),

    potMaterial,
  );

  pot.position.y = 0.4;

  pot.castShadow = true;

  plant.add(pot);

  // Soil

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.36,

      0.36,

      0.03,

      32,
    ),

    soilMaterial,
  );

  soil.position.y = 0.82;

  plant.add(soil);

  // =====================
  // Leaves
  // =====================

  const leafGeometry = new THREE.SphereGeometry(
    0.65,

    20,

    20,
  );

  const positions = [
    [-0.35, 1.5, 0],
    [0.35, 1.8, 0],
    [-0.5, 2.1, 0],
    [0.4, 2.4, 0],
    [0, 2.8, 0],
  ];

  for (let i = 0; i < positions.length; i++) {
    const leaf = new THREE.Mesh(
      leafGeometry,

      leafMaterial,
    );

    leaf.scale.set(0.35, 1, 0.12);

    leaf.position.set(positions[i][0], positions[i][1], positions[i][2]);

    leaf.rotation.z = i % 2 === 0 ? 0.5 : -0.5;

    plant.add(leaf);
  }

  return plant;
}
