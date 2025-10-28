const particles = {
  /**@type {HTMLCanvasElement?} */
  cnv: null,
  /**@type {CanvasRenderingContext2D} */
  ctx: null,
  /**@type {{x:number, y:number, speed:number, decel: number, direction: number, lifetime: number, maxLife: number, fill: number[][], radius: number}[]} */
  active: [],
  tick() {
    this.add(
      Math.random() * this.cnv.width,
      this.cnv.height,
      -Math.PI / 2 + (Math.random() - 0.5) / 2,
      Math.random() * 2,
      -0.03,
      120,
      [
        [255, 255, 255],
        [255, 255, 0],
        [255, 0, 0],
        [40, 40, 40, 128],
        [128, 128, 128, 0],
      ],
      30
    );

    this.active.forEach((particle) => {
      particle.x += particle.speed * Math.cos(particle.direction);
      particle.y += particle.speed * Math.sin(particle.direction);
      particle.lifetime--;
      if (particle.speed > particle.decel) particle.speed -= particle.decel;
      else particle.speed = 0;
    });

    for (let i = 0; i < this.active.length; i++) {
      if (this.active[i].lifetime <= 0) this.active.splice(i, 1);
    }
  },
  draw() {
    this.cnv.width = window.visualViewport.width;
    this.cnv.height = window.visualViewport.height;

    this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

    this.active.forEach((x) => {
      let lifeLeft = x.lifetime / x.maxLife;
      let arr = interp(x.fill, 1 - lifeLeft, true);
      let hex = "#" + arr.map((x) => x.toString(16).padStart(2, "0")).join("");

      this.ctx.fillStyle = hex;
      this.ctx.beginPath();
      this.ctx.arc(x.x, x.y, x.radius * lifeLeft, 0, Math.PI * 2);
      this.ctx.fill();
    });
  },
  add(
    x,
    y,
    dir = 0,
    speed = 6,
    decel = 0,
    lifetime = 30,
    fill = [[255, 0, 0]],
    radius = lifetime
  ) {
    this.active.push({
      x: x,
      y: y,
      direction: dir,
      speed: speed,
      decel: decel,
      lifetime: lifetime,
      maxLife: lifetime,
      fill: fill,
      radius: radius,
    });
  },
  init() {
    this.cnv = document.createElement("canvas");
    this.cnv.classList.add("particle-render");
    document.body.appendChild(this.cnv);
    this.ctx = this.cnv.getContext("2d");
    let f = () => {
      this.tick();
      this.draw();
      requestAnimationFrame(f);
    };
    f();
  },
};
addEventListener("DOMContentLoaded", () => particles.init());

/**
 * Colour Interpolation function. Finds a colour along a virtual gradient, with arbitrary stops.\
 * *god this took forever i hate everything*
 * @param {int[][]} cols Array of colours. Must all be the same length, or NaNs pop up. Gradient goes from start to end of array.
 * @param {float} factor Number 0-1. How far along the gradient the point is, from the start.
 * @param {boolean} [forceint=false] If true, will round the outputs to force them to be integer. Probably required for most uses.
 * @returns {int[]} An array representing the colour at the specified point along the gradient. The final colour in the array, if `factor` is too large.
 */
function interp(cols, factor, forceint = false) {
  let l = cols.length;
  let n = l - 1;
  if (l < 2)
    throw new RangeError("Cannot interpolate between fewer than 2 colours!");
  //Look at each gap between numbers
  for (let choice = 1; choice < l; choice++) {
    if (factor < choice / n) {
      //Set some temporary variables
      let c1 = cols[choice - 1],
        c2 = cols[choice],
        fact = (factor - (choice - 1) / n) * n;
      //Interpolate between the 2 chosen colours
      let o = Math.max(c1.length, c2.length); //Allows colour arrays of any length
      let out = [];
      for (let i = 0; i < o; i++)
        out.push((c1[i] ?? 255) * (1 - fact) + (c2[i] ?? 255) * fact);
      return forceint ? out.map((x) => Math.round(x)) : out;
    }
  }
  return cols.at(-1);
}
