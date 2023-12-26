import getImageParticle from "./ImageParticle.js";

let mouseVel = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 };
const frictionMult = 0.25;

function getBlueImage() {
  const img = new Image();
  img.src = "./libs/ParticleBlue.png";
  return img;
}

function getParticleOptions(pos) {
  let angle = Math.random() * Math.PI * 2;
  let speed = Math.random() * 0.2 + 0.2;
  const options = {
    vel: {
      x: mouseVel.x + Math.cos(angle) * speed,
      y: mouseVel.y + Math.sin(angle) * speed,
    },
    gravity: 0.15,
    drag: 0.96,
    pos,
    size: Math.floor(Math.random() * 2.5) + 2.5,
    // hue: Math.floor(Math.random() * 360),
    alpha: 1,
    sizeMult: 0.97 + Math.random() * 0.02,
    fade: 0,
    img: getBlueImage(),
    maxSize: 2,
    spin: Math.random() * 5 - 2.5,
    useShimmer: false,
  };

  return options;
}

function getEmitter() {
  const particles = [];
  const numPerParticlesFrame = 1;

  function update(ctx, mousePos) {
    mouseVel = {
      x: (mousePos.x - lastMousePos.x) * frictionMult,
      y: (mousePos.y - lastMousePos.y) * frictionMult,
    };
    lastMousePos = {
      x: mousePos.x,
      y: mousePos.y,
    };
    particles.forEach((p) => {
      p.update();
      p.render(ctx);
    });
    for (let i = 0; i < numPerParticlesFrame; i += 1) {
      let options = getParticleOptions(mousePos);
      let particle = getImageParticle(options);
      particles.push(particle);
    }
    while (particles.length > 500) {
      particles.shift(); // delete the 1st particle from the array
    }
  }
  return { update, particles };
}

export default getEmitter;
