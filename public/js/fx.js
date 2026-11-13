// Fireworks and sparkles on one full-screen canvas.
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, dpr = 1;
const rockets = [];
const sparks = [];
let running = false;

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function loop() {
  ctx.clearRect(0, 0, W, H);
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.x += r.vx; r.y += r.vy; r.vy += 0.12;
    ctx.fillStyle = r.color;
    ctx.beginPath(); ctx.arc(r.x, r.y, 3, 0, 7); ctx.fill();
    sparks.push({ x: r.x, y: r.y, vx: rand(-0.4, 0.4), vy: rand(0, 1), life: 18, max: 18, color: r.color, size: 2 });
    if (r.vy >= -1 || r.y <= r.ty) { burst(r.x, r.y, r.colors, r.big); rockets.splice(i, 1); }
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vx *= 0.97; s.vy = s.vy * 0.97 + (s.g ?? 0.06); s.life--;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    const a = s.life / s.max;
    ctx.globalAlpha = Math.min(1, a * 1.6);
    ctx.fillStyle = s.color;
    if (s.star) drawStar(s.x, s.y, s.size * (0.6 + a * 0.6));
    else { ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.4 + a * 0.6), 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  if (rockets.length || sparks.length || trails.size) requestAnimationFrame(loop);
  else { running = false; ctx.clearRect(0, 0, W, H); }
}
function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

function drawStar(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

function burst(x, y, colors, big) {
  const n = big ? 90 : 60;
  const speed = big ? 6.5 : 5;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + rand(-0.05, 0.05);
    const v = rand(speed * 0.45, speed);
    const life = rand(45, 75);
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life,
      color: pick(colors), size: rand(2.5, 4.5), star: Math.random() < 0.18 });
  }
}

// Launch rockets that burst in the given colors.
export function fireworks(colors, { bursts = 4, big = false } = {}) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) bursts = Math.min(bursts, 2);
  for (let i = 0; i < bursts; i++) {
    setTimeout(() => {
      const x = rand(W * 0.15, W * 0.85);
      const ty = rand(H * 0.12, H * 0.45);
      const vy = -Math.sqrt(2 * 0.12 * (H - ty)) * rand(0.95, 1.05);
      const c = big ? colors : [pick(colors), pick(colors)];
      rockets.push({ x, y: H, vx: rand(-1.2, 1.2), vy, ty, color: pick(colors), colors: c, big });
      start();
    }, i * rand(160, 320));
  }
}

// Stars and sparkles that stream behind a moving thing (the unicorn's shooting star).
const trails = new Set();
export function sparkleTrail(getPos, colors) {
  const t = setInterval(() => {
    const { x, y } = getPos();
    for (let i = 0; i < 4; i++) {
      const life = rand(30, 55);
      sparks.push({ x: x + rand(-14, 14), y: y + rand(-14, 14), vx: rand(-2.2, -0.4), vy: rand(-0.6, 1.2), g: 0.03,
        life, max: life, color: pick(colors), size: rand(3, 6), star: Math.random() < 0.5 });
    }
  }, 30);
  trails.add(t);
  start();
  return () => { clearInterval(t); trails.delete(t); };
}
