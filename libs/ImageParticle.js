/*
interface options: getImageParticleOpts {
		color: { red: Math.random() * 255, green: 255, blue: 255 },
		vel: { x: Math.random() * 10 - 5, y: Math.random() - 10 },
		gravity: 0.2,
  	drag: 1, // 0.96,
	img: undefined,
	maxSize: -1,
	spin: 0,
	useShimmer: false,
		pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
		size: Math.random() * 3 + 1,
		sizeMult: 1 + Math.random() * 0.01 + 0.015,
		fade: Math.random() * 0.01 + 0.01,
};
 */
var TO_RADIANS = Math.PI / 180;
function getImageParticle(options) {
  let {
    img,
    maxSize,
    useShimmer,
    spin,
    hue = -1,
    alpha,
    fade,
    gravity,
    drag,
    pos,
    size,
    sizeMult,
    vel,
    useFloor = false,
  } = options;
  let { x, y } = pos;

  // if maxSize is a positive value, limit the size of
  // the particle (this is for growing particles).
  let rotation = 0;

  // the blendmode of the image render. 'source-over' is the default
  // 'lighter' is for additive blending.
  let compositeOperation = "source-over";

  function update() {
    vel.x *= drag;
    vel.y *= drag;
    vel.y += gravity;
    x += vel.x;
    y += vel.y;

    size *= sizeMult;
    // if maxSize is set and we're bigger, resize!
    if (maxSize > 0 && size > maxSize) {
      size = maxSize;
    }

    alpha -= fade;
    if (alpha < 0) {
      alpha = 0;
    }

    rotation += spin;
  }

  function render(c) {
    if (alpha === 0) {
      return;
    }

    c.save();
    c.translate(x, y);
    // scale it dependent on the size of the particle
    var s = useShimmer ? size * Math.random() : size; //useShimmer ? size * 0 : size;
    c.scale(s, s);
    c.rotate(rotation * TO_RADIANS);
    c.translate(img.width * -0.5, img.width * -0.5);
    c.globalAlpha = alpha;
    c.globalCompositeOperation = compositeOperation;
    if (hue !== -1) {
      c.filter = `hue-rotate(${hue}deg)`;
    }
    c.drawImage(img, 0, 0);
    c.restore();
  }
  return { update, render };
}

export default getImageParticle;
