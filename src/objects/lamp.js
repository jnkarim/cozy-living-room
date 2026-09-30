import * as THREE from "three";
const loader = new THREE.TextureLoader();

const metalTexture = loader.load(import.meta.env.BASE_URL + "textures/metal.png");

export function createLamp(light) {
  const lamp = new THREE.Group();

  // =====================
  // Texture
  // =====================

  const loader = new THREE.TextureLoader();

  const metalTexture = loader.load(import.meta.env.BASE_URL + "textures/metal.png");

  // =====================
  // Materials
  // =====================

  const metalMaterial = new THREE.MeshStandardMaterial({
    map: metalTexture,

    metalness: 0.85,

    roughness: 0.25,
  });
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd166,

    roughness: 0.5,
  });

  // =====================
  // Shader Bulb
  // =====================

  const bulbMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowIntensity: {
        value: 0,
      },
    },

    vertexShader: `

        void main(){

            gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position,1.0);

        }

        `,

    fragmentShader: `

        uniform float glowIntensity;


        void main(){


            vec3 color =
            vec3(1.0,0.65,0.2);


            gl_FragColor =
            vec4(
                color * glowIntensity,
                1.0
            );


        }

        `,

    transparent: true,
  });

  // =====================
  // Base
  // =====================

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.45,

      0.55,

      0.15,

      32,
    ),

    metalMaterial,
  );

  base.position.y = 0.08;

  base.castShadow = true;

  lamp.add(base);

  // =====================
  // Stand
  // =====================

  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.08,

      0.08,

      3.4,

      32,
    ),

    metalMaterial,
  );

  stand.position.y = 1.7;

  stand.castShadow = true;

  lamp.add(stand);

  // =====================
  // Bulb
  // =====================

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.22,

      32,

      32,
    ),

    bulbMaterial,
  );

  bulb.position.y = 3.55;

  lamp.add(bulb);

  // =====================
  // Shade
  // =====================

  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.95,

      1.2,

      40,
    ),

    shadeMaterial,
  );

  shade.position.y = 3.85;

  shade.castShadow = true;

  lamp.add(shade);

  // =====================
  // Light Setup
  // =====================

  light.position.set(
    0,

    3.5,

    0,
  );

  light.color.set(0xffaa44);

  light.distance = 15;

  // Access from main.js

  lamp.userData.bulb = bulb;

  return lamp;
}
