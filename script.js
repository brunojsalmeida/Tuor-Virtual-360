// Cena
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1100
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 1;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("viewer").appendChild(renderer.domElement);

// Esfera panoramica
const geometry = new THREE.SphereGeometry(500, 60, 40);

// Inverte a esfera para visualizar por dentro
geometry.scale(-1, 1, 1);

// Textura 360
const texture = new THREE.TextureLoader().load(
  "./imagem-exemplo.png"
);
texture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshBasicMaterial({
  map: texture
});

const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);

// Controle de rotacao
let isUserInteracting = false;
let lon = 0;
let lat = 0;
let phi = 0;
let theta = 0;

let onPointerDownPointerX = 0;
let onPointerDownPointerY = 0;

let onPointerDownLon = 0;
let onPointerDownLat = 0;
const controls = document.querySelector(".controls");
const fovIndicator = document.getElementById("fovIndicator");

function setZoom(value) {
  camera.fov = THREE.MathUtils.clamp(value, 30, 100);
  camera.updateProjectionMatrix();
  fovIndicator.textContent = `${Math.round(camera.fov)}°`;
}

function rotateHorizontal(direction) {
  lon += direction * 12;
}

function addHoldRotate(button, direction) {
  let intervalId;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    rotateHorizontal(direction);
    intervalId = window.setInterval(() => rotateHorizontal(direction), 90);
  });

  button.addEventListener("pointerup", () => {
    window.clearInterval(intervalId);
  });

  button.addEventListener("pointerleave", () => {
    window.clearInterval(intervalId);
  });
}

controls.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

addHoldRotate(document.getElementById("lookLeft"), -1);
addHoldRotate(document.getElementById("lookRight"), 1);

document.getElementById("zoomIn").addEventListener("click", () => {
  setZoom(camera.fov - 8);
});

document.getElementById("zoomOut").addEventListener("click", () => {
  setZoom(camera.fov + 8);
});

document.getElementById("fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Mouse Down
document.addEventListener("pointerdown", (event) => {
  isUserInteracting = true;

  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;
});

// Mouse Move
document.addEventListener("pointermove", (event) => {
  if (isUserInteracting) {
    lon =
      (onPointerDownPointerX - event.clientX) * 0.1 +
      onPointerDownLon;

    lat =
      (event.clientY - onPointerDownPointerY) * 0.1 +
      onPointerDownLat;
  }
});

// Mouse Up
document.addEventListener("pointerup", () => {
  isUserInteracting = false;
});

// Zoom
document.addEventListener("wheel", (event) => {
  setZoom(camera.fov + event.deltaY * 0.05);
});

// Resize responsivo
function resizeViewer() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;

  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
}

window.addEventListener("resize", resizeViewer);
window.addEventListener("orientationchange", resizeViewer);

// Animacao
function animate() {
  requestAnimationFrame(animate);

  lat = Math.max(-85, Math.min(85, lat));

  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);

  camera.target = new THREE.Vector3();

  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
  camera.target.y = 500 * Math.cos(phi);
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(camera.target);

  renderer.render(scene, camera);
}

animate();
