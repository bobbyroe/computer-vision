import * as THREE from "three";
// Mediapipe
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const { HandLandmarker, FilesetResolver } = vision;

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(60, w / h, 1, 100);
camera.position.z = 5;
const scene = new THREE.Scene();
scene.scale.x = -1;

// Video Texture
const video = document.createElement("video");
const texture = new THREE.VideoTexture(video);
texture.colorSpace = THREE.SRGBColorSpace;
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshBasicMaterial({
  map: texture,
  depthWrite: false,
});
const videomesh = new THREE.Mesh(geometry, material);
scene.add(videomesh);

// MediaPipe
const filesetResolver = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  numHands: 2,
});
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "user" } })
    .then(function (stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function (error) {
      console.error("Unable to access the camera/webcam.", error);
    });
}

// finger markers
function getBall({ hasParticles = false, hue, index }) {
  const opacity = 1; // index === 8 ? 1 : 0.1;
  const geo = new THREE.IcosahedronGeometry(0.1, 1);
  const color = new THREE.Color().setHSL(hue, 1, 0.5);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.update = (landmark) => {
    const { x, y, z } = landmark;
    mesh.position.set(
      x * videomesh.scale.x - videomesh.scale.x * 0.5,
      -y * videomesh.scale.y + videomesh.scale.y * 0.5,
      z
    );
    mesh.scale.setScalar(z * 10);
  };
  if (hasParticles) {
    // no op.
  }
  return mesh;
}
const stuffGroup = new THREE.Group();
scene.add(stuffGroup);
const numBalls = 21;
for (let i = 0; i < numBalls; i++) {
  const mesh = getBall({ hue: i / numBalls, index: i, hasParticles: i === 8 });
  stuffGroup.add(mesh);
}

function animation(t = 0) {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    const handResults = handLandmarker.detectForVideo(video, Date.now());
    if (handResults.landmarks.length > 0) {
      for (const landmarks of handResults.landmarks) {
        landmarks.forEach((landmark, i) => {
          const mesh = stuffGroup.children[i];
          mesh.update(landmark);
        });
      }
    } else {
      for (let i = 0; i < numBalls; i++) {
        const mesh = stuffGroup.children[i];
        mesh.position.set(0, 0, 10);
      }
    }
  }

  videomesh.scale.x = video.videoWidth / 100;
  videomesh.scale.y = video.videoHeight / 100;

  renderer.render(scene, camera);
  requestAnimationFrame(animation);
}
animation();
