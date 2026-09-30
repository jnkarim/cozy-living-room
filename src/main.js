import * as THREE from "three";

import { createRoom } from "./objects/room.js";
import { createCouch, createArmchair } from "./objects/couch.js";
import { createLamp } from "./objects/lamp.js";
import { createSideTable } from "./objects/side_table.js";
import { createPlant } from "./objects/plant.js";
import { createCoffeeTable } from "./objects/coffee_table.js";
import { createLibrary } from "./objects/library.js";
import { createFireplace } from "./objects/fireplace.js";
import { createEntrance } from "./objects/entrance.js";
import { createCredenza } from "./objects/credenza.js";
import { createNightWindow } from "./objects/window.js";

// z position of the room's front edge. Set this to where your room's
// front opening ends, so the entrance wall closes the room completely.
const FRONT_Z = 12.5;

// Scene


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120a05);

// Camera

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);

// Orbit state (used once we are inside the room)
let angle = 0;
let height = 6;
let radius = 8;

// Intro state:  outside -> opening -> entering -> inside
let mode = "outside";

const introPos = new THREE.Vector3(0, 4.2, FRONT_Z + 15);
const introLook = new THREE.Vector3(0, 4.6, FRONT_Z);

function updateCamera() {
  camera.position.x = radius * Math.sin(angle);
  camera.position.y = height;
  camera.position.z = radius * Math.cos(angle);

  // Back wall protection
  if (camera.position.z < -8) {
    camera.position.z = -8;
  }

  camera.lookAt(0, 1.5, 0);
}

// start outside the door
camera.position.copy(introPos);
camera.lookAt(introLook);

// Renderer

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const roomLight = new THREE.DirectionalLight(0xffd27a, 0.35);
roomLight.position.set(0, 8, 5);
scene.add(roomLight);

const lampLight = new THREE.PointLight(0xffaa44, 0, 25);
lampLight.castShadow = true;
scene.add(lampLight);

// Objects

const room = createRoom();
scene.add(room);

const couch = createCouch();
scene.add(couch);

// two armchairs angled towards the coffee table (delete if you don't want them)
const chairLeft = createArmchair();
chairLeft.position.set(-4.9, 0, 2.2);
chairLeft.rotation.y = 1.0;
scene.add(chairLeft);

const chairRight = createArmchair();
chairRight.position.set(4.9, 0, 2.2);
chairRight.rotation.y = -1.0;
scene.add(chairRight);

const library = createLibrary();
library.position.set(-7, 0, -12);
scene.add(library);


const credenza = createCredenza();
credenza.position.set(7, 0, -11.9);
scene.add(credenza);

const nightWindow = createNightWindow();
nightWindow.position.set(12.9, 4.6, -3);   
nightWindow.rotation.y = -Math.PI / 2;    
scene.add(nightWindow);

const fireplace = createFireplace();
fireplace.position.set(0, 0, -12.7);
scene.add(fireplace);

const lamp = createLamp(lampLight);
lamp.position.set(3, 0, -1);
scene.add(lamp);

const table = createSideTable();
table.position.set(-3, 0, 0);
scene.add(table);

const coffeeTable = createCoffeeTable();
coffeeTable.position.set(0, 0, 2);
scene.add(coffeeTable);

const plant = createPlant();
plant.position.set(5, 0, -3);
scene.add(plant);

// Entrance wall + door (closes the room from the outside)
const entrance = createEntrance({ frontZ: FRONT_Z });
scene.add(entrance);

const doorLeaves = entrance.userData.leaves;

// Hint text

const hint = document.createElement("div");
hint.textContent = "Click the door to enter";
Object.assign(hint.style, {
  position: "fixed",
  bottom: "48px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "12px 26px",
  font: "500 18px Georgia, serif",
  color: "#f3d9a0",
  background: "rgba(26, 16, 10, 0.72)",
  border: "1px solid rgba(243, 217, 160, 0.35)",
  borderRadius: "999px",
  pointerEvents: "none",
  transition: "opacity 0.8s ease",
  opacity: "1",
  zIndex: "10",
});
document.body.appendChild(hint);

// Door interaction

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function setMouse(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

function hitsDoor() {
  return raycaster.intersectObjects(doorLeaves, true).length > 0;
}

window.addEventListener("mousemove", function (e) {
  if (mode !== "outside") {
    renderer.domElement.style.cursor = "";
    return;
  }
  setMouse(e);
  renderer.domElement.style.cursor = hitsDoor() ? "pointer" : "";
});

// door + camera animation
const DOOR_TIME = 1.6; // seconds
const ENTER_TIME = 3.6; // seconds

// camera path: hall -> through the doorway -> default orbit position
const camPath = new THREE.CatmullRomCurve3([
  introPos.clone(),
  new THREE.Vector3(0, 3.8, FRONT_Z - 2.5),
  new THREE.Vector3(0, height, radius), // angle 0 orbit position
]);

const lookPath = new THREE.CatmullRomCurve3([
  introLook.clone(),
  new THREE.Vector3(0, 3.4, FRONT_Z - 6),
  new THREE.Vector3(0, 1.5, 0),
]);

const lookTarget = new THREE.Vector3();
let doorT = 0;
let enterT = 0;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function openDoor() {
  mode = "opening";
  hint.style.opacity = "0";
  renderer.domElement.style.cursor = "";
}

// Mouse Camera Control (only inside the room)

let mouseDown = false;
let oldX = 0;
let oldY = 0;

window.addEventListener("mousedown", function (e) {
  mouseDown = true;
  oldX = e.clientX;
  oldY = e.clientY;
});

window.addEventListener("mouseup", function () {
  mouseDown = false;
});

window.addEventListener("mousemove", function (e) {
  if (mode !== "inside" || !mouseDown) return;

  const dx = e.clientX - oldX;
  const dy = e.clientY - oldY;

  // left/right rotation
  angle -= dx * 0.005;

  // up/down view
  height += dy * 0.03;

  // height limit
  if (height < 2) height = 2;
  if (height > 8) height = 8;

  updateCamera();

  oldX = e.clientX;
  oldY = e.clientY;
});

// Zoom (only inside the room)

window.addEventListener("wheel", function (e) {
  if (mode !== "inside") return;

  radius += e.deltaY * 0.01;

  if (radius < 5) radius = 5;
  if (radius > 11) radius = 11;

  updateCamera();
});

// Lamp Control

let lampOn = false;
let glowTime = 0;

function toggleLamp() {
  lampOn = !lampOn;

  if (lampOn) {
    lampLight.intensity = 12;
    lampLight.shadow.mapSize.width = 1024;
    lampLight.shadow.mapSize.height = 1024;

    lamp.userData.bulb.material.uniforms.glowIntensity.value = 3;
  } else {
    lampLight.intensity = 0;

    lamp.userData.bulb.material.uniforms.glowIntensity.value = 0;
  }
}

// Keyboard
window.addEventListener("keydown", function (e) {
  if (mode !== "inside") return;

  if (e.key === "l" || e.key === "L") {
    toggleLamp();
  }
});

// Mouse Click: door (outside) / lamp (inside)

window.addEventListener("click", function (e) {
  setMouse(e);

  if (mode === "outside") {
    if (hitsDoor()) openDoor();
    return;
  }

  if (mode === "inside") {
    const hit = raycaster.intersectObjects(lamp.children, true);

    if (hit.length > 0) {
      toggleLamp();
    }
  }
});

// Animation

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const now = clock.elapsedTime;

  // glass in the doors breathes gently to hint at the lit room inside
  if (mode === "outside") {
    entrance.userData.pulse(now);
  }

  // door swings open
  if (mode === "opening" || mode === "entering") {
    doorT = Math.min(doorT + dt / DOOR_TIME, 1);
    entrance.userData.setOpen(ease(doorT));

    if (mode === "opening" && doorT > 0.6) {
      mode = "entering";
    }
  }

  // camera walks through the doorway into the room
  if (mode === "entering") {
    enterT = Math.min(enterT + dt / ENTER_TIME, 1);
    const k = ease(enterT);

    camPath.getPoint(k, camera.position);
    lookPath.getPoint(k, lookTarget);
    camera.lookAt(lookTarget);

    if (enterT >= 1) {
      mode = "inside";
      angle = 0;
      height = 6;
      radius = 8;
      updateCamera();
      hint.remove();
    }
  }

  // Shader glow animation
  if (lampOn) {
    glowTime += 0.05;

    lamp.userData.bulb.material.uniforms.glowIntensity.value =
      3 + Math.sin(glowTime) * 0.5;
  }

  nightWindow.userData.update(now);
  renderer.render(scene, camera);
}

animate();

// Resize

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});