import * as THREE from "three";

const loader = new THREE.TextureLoader();

const carpetTexture = loader.load(import.meta.env.BASE_URL + "textures/carpet.png");

export function createRoom() {
  const room = new THREE.Group();

  // =====================
  // Materials
  // =====================

  const backWallMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8a58a,

    roughness: 0.85,
  });

  const sideWallMaterial = new THREE.MeshStandardMaterial({
    color: 0xa88f72,

    roughness: 0.85,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b2415,

    roughness: 0.8,
  });

  const carpetMaterial = new THREE.MeshStandardMaterial({
    map: carpetTexture,

    roughness: 1,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc857,

    metalness: 0.5,

    roughness: 0.3,
  });

  // =====================
  // Floor
  // =====================

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(
      32,

      0.2,

      26,
    ),

    floorMaterial,
  );

  floor.position.y = -0.1;

  floor.receiveShadow = true;

  room.add(floor);

  // =====================
  // Carpet
  // =====================

  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(
      10,

      0.04,

      7,
    ),

    carpetMaterial,
  );

  carpet.position.set(
    0,

    0.03,

    1,
  );

  carpet.receiveShadow = true;

  room.add(carpet);

  // =====================
  // Back Wall
  // =====================

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      32,

      10,

      0.2,
    ),

    backWallMaterial,
  );

  backWall.position.set(
    0,

    5,

    -13,
  );

  backWall.receiveShadow = true;

  room.add(backWall);

  // =====================
  // Left Wall
  // =====================

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.2,

      10,

      26,
    ),

    sideWallMaterial,
  );

  leftWall.position.set(
    -16,

    5,

    0,
  );

  leftWall.receiveShadow = true;

  room.add(leftWall);

  // =====================
  // Right Wall
  // =====================

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.2,

      10,

      26,
    ),

    sideWallMaterial,
  );

  rightWall.position.set(
    16,

    5,

    0,
  );

  rightWall.receiveShadow = true;

  room.add(rightWall);

  // =====================
  // Golden Decoration Line
  // =====================

  const line = new THREE.Mesh(
    new THREE.BoxGeometry(
      30,

      0.08,

      0.08,
    ),

    goldMaterial,
  );

  line.position.set(
    0,

    7,

    -12.85,
  );

  room.add(line);

  // =====================
  // Wall Frames
  // =====================

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd166,
  });

  const frame1 = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.5,

      2,

      0.05,
    ),

    frameMaterial,
  );

  frame1.position.set(
    -6,

    4,

    -12.85,
  );

  room.add(frame1);

  const frame2 = frame1.clone();

  frame2.position.x = 6;

  room.add(frame2);

  return room;
}
