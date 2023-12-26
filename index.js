import getVisionStuff from "./getVisionStuff.js";
import getEmitter from "./libs/getEmitter.js";

const { video, handLandmarker } = await getVisionStuff();
const canvasElement = document.getElementById("output_canvas");
const ctx = canvasElement.getContext("2d");
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerWidth * 0.75;

let mousePos = { x: window.innerWidth, y: window.innerHeight };
const emitter = getEmitter();

function drawPoint(pos, hue) {
  ctx.fillStyle = `hsla(${hue}, 100%, 50%, 1.0)`;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}

function animationLoop() {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height); // x, y, w, h
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    const handResults = handLandmarker.detectForVideo(video, Date.now());
    if (handResults.landmarks) {
      for (const landmarks of handResults.landmarks) {
        landmarks.forEach((l, i) => {
          let pos = {
            x: l.x * canvasElement.width,
            y: l.y * canvasElement.height,
          };
          const hue = (i * 360) / 21;
          // drawPoint(pos, hue);
          if (i === 8) {
            mousePos = { x: l.x * canvasElement.width, y: l.y * canvasElement.height };
          }
        });
      }
    }
  }
  emitter.update(ctx, mousePos);
  requestAnimationFrame(animationLoop);
}
animationLoop();
