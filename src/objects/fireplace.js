import * as THREE from "three";

export function createFireplace() {
  const fireplace = new THREE.Group();

  // =====================
  // Materials
  // =====================

  const marble = new THREE.MeshStandardMaterial({
    color: 0xd8cfc2,

    roughness: 0.55,
  });

  const marbleDark = new THREE.MeshStandardMaterial({
    color: 0x9f8b75,

    roughness: 0.8,
  });

  const wood = new THREE.MeshStandardMaterial({
    color: 0x3a1d0b,

    roughness: 0.7,
  });

  const black = new THREE.MeshStandardMaterial({
    color: 0x050505,

    roughness: 1,
  });

  const gold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,

    metalness: 0.8,

    roughness: 0.25,
  });

  // =====================
  // Main Marble Structure
  // =====================

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(
      5.5,

      4,

      0.7,
    ),

    marble,
  );

  main.position.y = 2;

  main.castShadow = true;

  fireplace.add(main);

  // =====================
  // Black Fire Opening
  // =====================

  const opening = new THREE.Mesh(
    new THREE.BoxGeometry(
      3.3,

      2.2,

      0.75,
    ),

    black,
  );

  opening.position.set(
    0,

    1.7,

    0.4,
  );

  fireplace.add(opening);

  // =====================
  // Inner golden border
  // =====================

  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.08, 0.08),

    gold,
  );

  borderTop.position.set(0, 2.85, 0.8);

  fireplace.add(borderTop);

  const borderBottom = borderTop.clone();

  borderBottom.position.y = 0.55;

  fireplace.add(borderBottom);

  // =====================
  // Wooden Mantle
  // =====================

  const mantle = new THREE.Mesh(
    new THREE.BoxGeometry(
      6,

      0.25,

      1,
    ),

    wood,
  );

  mantle.position.set(
    0,

    4.15,

    0,
  );

  mantle.castShadow = true;

  fireplace.add(mantle);

  // =====================
  // Side Columns
  // =====================

  [-2.35, 2.35].forEach((x) => {
    const column = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,

        3.8,

        0.75,
      ),

      marbleDark,
    );

    column.position.set(
      x,

      2,

      0,
    );

    fireplace.add(column);
  });

  // =====================
  // Hearth Base
  // =====================

  const hearth = new THREE.Mesh(
    new THREE.BoxGeometry(
      6.2,

      0.3,

      1.5,
    ),

    marbleDark,
  );

  hearth.position.set(
    0,

    0.15,

    0.3,
  );

  fireplace.add(hearth);

  // =====================
  // Logs
  // =====================

  const logMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b2610,
  });

  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.13,

        0.13,

        1.5,

        16,
      ),

      logMaterial,
    );

    log.rotation.z = Math.PI / 2;

    log.position.set(
      (i - 1) * 0.35,

      0.65,

      0.65,
    );

    fireplace.add(log);
  }

  // =====================
  // Flames
  // =====================

  const flameGroup = new THREE.Group();

  const flame1 = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.45,

      1.2,

      32,
    ),

    new THREE.MeshBasicMaterial({
      color: 0xff6600,
    }),
  );

  flame1.position.y = 1.1;

  flameGroup.add(flame1);

  const flame2 = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.22,

      0.8,

      32,
    ),

    new THREE.MeshBasicMaterial({
      color: 0xffff66,
    }),
  );

  flame2.position.y = 1.15;

  flameGroup.add(flame2);

  fireplace.add(flameGroup);

  // =====================
  // Fire Light
  // =====================

  const fireLight = new THREE.PointLight(
    0xff7a30,

    4,

    12,
  );

  fireLight.position.set(
    0,

    1.2,

    1,
  );

  fireplace.add(fireLight);

  // =====================
  // Animation
  // =====================

  fireplace.userData.animate = function (time) {
    flameGroup.scale.y = 1 + Math.sin(time * 0.01) * 0.12;

    fireLight.intensity = 3.5 + Math.sin(time * 0.02) * 0.7;
  };

  return fireplace;
}
