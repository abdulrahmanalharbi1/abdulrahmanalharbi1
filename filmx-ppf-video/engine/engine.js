/* FILMX — "Genuine vs fake PPF" vintage-paper motion graphic engine.
 * Deterministic canvas renderer: window.renderFrame(t) draws the frame at time t (seconds).
 * Footage comes from Higgsfield (Seedance 2.0) clips pre-extracted to JPEG frames.
 */
'use strict';
(() => {
const W = 1080, H = 1920, FPS = 30, CLIP_FPS = 24, CLIP_FRAMES = 121;
const COL = {
  ink: '#1C1B18', gold: '#8A6E3F', goldL: '#C9A86A', hair: '#D8D3C7',
  cream: '#F2EFE7', ivory: '#FBFAF7', red: '#7A2E24', print: '#F3ECDD',
};

/* ------------------------------------------------------------------ math */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  inQ: x => x * x, outQ: x => 1 - (1 - x) * (1 - x),
  inC: x => x * x * x, outC: x => 1 - Math.pow(1 - x, 3),
  ioC: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: x => 1 - Math.pow(1 - x, 5),
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  outElastic: x => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
function hash(n) {
  n = (n | 0) ^ 0x9e3779b9;
  n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const h2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
function vnoise(x, seed) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h2(i, seed), h2(i + 1, seed), u);
}
let T = 0, BT = 0; // current time + 12fps "boil" tick
const jit = (seed, amp) => (h2(seed, BT) - 0.5) * 2 * amp;
const stepT = t => Math.floor(t * 12) / 12; // stop-motion quantised time

/* -------------------------------------------------------------- timeline */
const V = { v1: 0.25, v2: 4.95, v3: 8.75, v4: 14.50, v5: 20.95, v6: 27.50, v7: 32.75 };
const DURATION = 39.0;
const SCENES = [
  { start: 0.00, end: 4.80, clips: ['c0_hook'], draw: sceneHook },
  { start: 4.80, end: 8.55, clips: [], draw: sceneIntro },
  { start: 8.55, end: 14.30, clips: ['c1_clear', 'c2_hazy'], draw: sceneClarity },
  { start: 14.30, end: 20.75, clips: ['c3_stretch_ok', 'c4_stretch_bad'], draw: sceneStretch },
  { start: 20.75, end: 27.30, clips: ['c5_heat'], draw: sceneHeat },
  { start: 27.30, end: 32.55, clips: ['c6_serial'], draw: sceneWarranty },
  { start: 32.55, end: DURATION, clips: ['c7_cta'], draw: sceneCTA },
];
const TRANS = [
  { at: 4.80, d: 0.62, type: 'tear', seed: 3 },
  { at: 8.55, d: 0.50, type: 'slideUp' },
  { at: 14.30, d: 0.55, type: 'push' },
  { at: 20.75, d: 0.70, type: 'ink', seed: 5 },
  { at: 27.30, d: 0.50, type: 'slideUp' },
  { at: 32.55, d: 0.66, type: 'tearH', seed: 11 },
];
const CLIPS = {
  c0_hook: { start: 0.0, speed: 1.0, off: 0.0, gain: 0.35 },
  c1_clear: { start: 9.40, speed: 1.0, off: 0.0, gain: 0.25 },
  c2_hazy: { start: 11.95, speed: 1.0, off: 0.0, gain: 0.25 },
  c3_stretch_ok: { start: 14.95, speed: 0.85, off: 0.0, gain: 0.35 },
  c4_stretch_bad: { start: 17.30, speed: 1.1, off: 1.2, gain: 0.45 },
  c5_heat: { start: 21.00, speed: 0.8, off: 0.0, gain: 0.55 },
  c6_serial: { start: 27.45, speed: 1.0, off: 0.0, gain: 0.25 },
  c7_cta: { start: 32.70, speed: 0.8, off: 0.0, gain: 0.2 },
};
const SFX = [];   // {t, type, gain, n, dur}
const SHAKES = []; // {t, amp}
const cue = (t, type, gain = 1, extra = {}) => SFX.push({ t: +t.toFixed(3), type, gain, ...extra });
const shake = (t, amp) => SHAKES.push({ t, amp });

/* ---------------------------------------------------------------- assets */
const IMG = {};
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; });
const frameCache = new Map();
function clipIndex(name, t) {
  const c = CLIPS[name];
  const ct = c.off + Math.max(0, t - c.start) * c.speed;
  return Math.min(CLIP_FRAMES, Math.max(1, Math.floor(ct * CLIP_FPS) + 1));
}
const framePath = (name, i) => `../assets/frames/${name}/${String(i).padStart(4, '0')}.jpg`;
async function getFrameImg(name, i) {
  const key = name + ':' + i;
  if (frameCache.has(key)) return frameCache.get(key);
  const img = await loadImg(framePath(name, i));
  frameCache.set(key, img);
  if (frameCache.size > 48) frameCache.delete(frameCache.keys().next().value);
  return img;
}
const FR = name => frameCache.get(name + ':' + clipIndex(name, T)) || null;

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* --------------------------------------------------------------- drawing */
const fnt = (fam, size, w = 400) => `${w} ${size}px ${fam}`;
function setText(c, o) {
  c.font = fnt(o.fam || 'Plex', o.size || 40, o.w || 500);
  c.direction = o.dir || 'rtl';
  c.letterSpacing = o.ls || '0px';
}
function measure(s, o) { const c = SCR.ctx; c.save(); setText(c, o); const w = c.measureText(s).width; c.restore(); return w; }
function text(c, s, x, y, o = {}) {
  c.save(); setText(c, o);
  c.fillStyle = o.color || COL.ink;
  c.textAlign = o.align || 'center';
  c.textBaseline = o.base || 'alphabetic';
  c.globalAlpha *= (o.alpha ?? 1);
  if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = o.shadowBlur ?? 0; c.shadowOffsetY = o.shadowY ?? 2; }
  c.fillText(s, x, y); c.restore();
}
const SCR = { ctx: mk(8, 8).getContext('2d') };

// text rendered once to its own canvas (for wipes / writing reveals)
const tcache = new Map();
function textCanvas(s, o) {
  const key = s + '|' + JSON.stringify(o);
  if (tcache.has(key)) return tcache.get(key);
  const size = o.size || 40, pad = Math.ceil(size * 0.6);
  const w = Math.ceil(measure(s, o)) + pad * 2, h = Math.ceil(size * 1.9);
  const cv = mk(w, h), c = cv.getContext('2d');
  const base = Math.round(size * 1.25);
  text(c, s, w / 2, base, { ...o, align: 'center', alpha: 1 });
  const r = { cv, w, h, base, pad };
  tcache.set(key, r); return r;
}
// ink-writing reveal (right-to-left for Arabic) with ragged edge + nib glow
function writeText(c, s, x, y, p, o = {}) {
  if (p <= 0) return;
  const tc = textCanvas(s, o);
  const align = o.align || 'center';
  const cx = align === 'center' ? x : align === 'right' ? x - (tc.w - 2 * tc.pad) / 2 : x + (tc.w - 2 * tc.pad) / 2;
  const left = cx - tc.w / 2, top = y - tc.base;
  c.save(); c.globalAlpha *= (o.alpha ?? 1);
  if (p >= 1) { c.drawImage(tc.cv, left, top); c.restore(); return; }
  const ltr = o.dir === 'ltr';
  const inner = tc.w - 2 * tc.pad;
  const edge = ltr ? left + tc.pad + inner * p : left + tc.pad + inner * (1 - p);
  c.beginPath();
  const x0 = ltr ? left - 5 : left + tc.w + 5;
  c.moveTo(x0, top - 5);
  for (let yy = 0; yy <= tc.h + 10; yy += 7) c.lineTo(edge + (h2(yy, 41 + BT) - 0.5) * 16, top - 5 + yy);
  c.lineTo(x0, top + tc.h + 5); c.closePath(); c.clip();
  c.drawImage(tc.cv, left, top); c.restore();
}
// word-by-word kinetic pop (RTL layout, first word on the right)
function popWords(c, words, times, x, y, o = {}) {
  const sp = measure(' ', o) * (o.spaceMul ?? 1);
  const ws = words.map((w, i) => measure(w, { ...o, ...(o.per?.[i] || {}) }));
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cursor = o.align === 'right' ? x : o.align === 'left' ? x + total : x + total / 2;
  words.forEach((w, i) => {
    const cx = cursor - ws[i] / 2; cursor -= ws[i] + sp;
    const p = prog(T, times[i], times[i] + (o.dur || 0.32));
    if (p <= 0) return;
    const s = lerp(o.from ?? 0.35, 1, E.outBack(p, 2.4));
    const r = (1 - E.outC(p)) * (h2(i, 77) - 0.5) * 0.35;
    c.save();
    c.translate(cx, y - (1 - E.outC(p)) * (o.rise ?? 36));
    c.rotate(r + (o.boil ? jit(i * 7 + 3, 0.006) : 0)); c.scale(s, s);
    c.globalAlpha *= clamp(p * 3);
    text(c, w, 0, 0, { ...o, ...(o.per?.[i] || {}), align: 'center' });
    c.restore();
  });
}

// hand-drawn stroke along a polyline, drawn up to fraction p, with 12fps boil
function drawStroke(c, pts, p, o = {}) {
  if (p <= 0 || pts.length < 2) return;
  const n = pts.length, cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[n - 1] * clamp(p), amp = o.jit ?? 1.4, seed = o.seed || 1;
  c.save();
  c.strokeStyle = o.color || COL.ink; c.lineWidth = o.w || 6;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha *= (o.alpha ?? 1);
  if (o.comp) c.globalCompositeOperation = o.comp;
  c.beginPath();
  for (let i = 0; i < n; i++) {
    let px = pts[i][0], py = pts[i][1];
    if (i > 0 && cum[i] > L) {
      const k = (L - cum[i - 1]) / (cum[i] - cum[i - 1]);
      px = lerp(pts[i - 1][0], pts[i][0], k); py = lerp(pts[i - 1][1], pts[i][1], k);
      c.lineTo(px + jit(i * 3 + seed, amp), py + jit(i * 3 + 1 + seed, amp)); break;
    }
    const X = px + jit(i * 3 + seed, amp), Y = py + jit(i * 3 + 1 + seed, amp);
    i ? c.lineTo(X, Y) : c.moveTo(X, Y);
  }
  c.stroke(); c.restore();
}
function ellipsePts(cx, cy, rx, ry, turns = 1.15, seed = 1, start = -2.3) {
  const n = Math.ceil(110 * turns), pts = [];
  for (let i = 0; i <= n; i++) {
    const a = start - (i / n) * turns * 2 * Math.PI;
    const wob = 1 + (vnoise(i / 10, seed) - 0.5) * 0.14 + (i / n) * 0.06;
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]);
  }
  return pts;
}
function curvePts(x0, y0, x1, y1, bend = 0.25, n = 44) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0;
  const qx = mx - dy * bend, qy = my + dx * bend, pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, d = t * t;
    pts.push([a * x0 + b * qx + d * x1, a * y0 + b * qy + d * y1]);
  }
  return pts;
}
function drawArrow(c, x0, y0, x1, y1, p, o = {}) {
  const pts = curvePts(x0, y0, x1, y1, o.bend ?? 0.25);
  drawStroke(c, pts, clamp(p / 0.78), o);
  const hp = prog(p, 0.78, 1);
  if (hp > 0) {
    const [ax, ay] = pts[pts.length - 1], [bx, by] = pts[pts.length - 5];
    const ang = Math.atan2(ay - by, ax - bx), s = o.head || 30;
    drawStroke(c, [[ax, ay], [ax - Math.cos(ang - 0.5) * s, ay - Math.sin(ang - 0.5) * s]], hp, o);
    drawStroke(c, [[ax, ay], [ax - Math.cos(ang + 0.5) * s, ay - Math.sin(ang + 0.5) * s]], hp, { ...o, seed: (o.seed || 1) + 5 });
  }
}
const checkPts = (x, y, s) => [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.38], [x + s * 0.55, y - s * 0.5]];

// ---- photo prints (footage lives inside these)
function deckle(w, h, seed) {
  const pts = [], st = 12, j = 2.6;
  for (let x = 0; x <= w; x += st) pts.push([x, (h2(x, seed) - 0.5) * j]);
  for (let y = 0; y <= h; y += st) pts.push([w + (h2(y, seed + 1) - 0.5) * j, y]);
  for (let x = w; x >= 0; x -= st) pts.push([x, h + (h2(x, seed + 2) - 0.5) * j]);
  for (let y = h; y >= 0; y -= st) pts.push([(h2(y, seed + 3) - 0.5) * j, y]);
  return pts;
}
function polyPath(c, pts, ox = 0, oy = 0) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + ox, y + oy) : c.moveTo(x + ox, y + oy))); c.closePath(); }
function coverDraw(c, img, x, y, w, h, fx = 0.5, fy = 0.5, zoom = 1) {
  const ir = img.width / img.height, r = w / h;
  let dw, dh; if (ir > r) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
  dw *= zoom; dh *= zoom;
  c.drawImage(img, x - (dw - w) * fx, y - (dh - h) * fy, dw, dh);
}
const GRADE = 'sepia(0.26) saturate(0.8) contrast(1.07) brightness(1.03)';
function tape(c, x, y, w, h, rot, seed) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(-w / 2, -h / 2);
  for (let yy = 0; yy <= h; yy += 5) c.lineTo(-w / 2 + (h2(yy, seed) - 0.5) * 7, -h / 2 + yy);
  for (let yy = h; yy >= 0; yy -= 5) c.lineTo(w / 2 + (h2(yy, seed + 1) - 0.5) * 7, -h / 2 + yy);
  c.closePath();
  c.shadowColor = 'rgba(40,25,10,0.18)'; c.shadowBlur = 5; c.shadowOffsetY = 2;
  c.fillStyle = 'rgba(226,212,178,0.82)'; c.fill();
  c.shadowColor = 'transparent';
  c.fillStyle = 'rgba(255,250,235,0.18)'; c.fillRect(-w / 2, -h / 2 + 3, w, 3);
  c.restore();
}
function drawPrint(c, img, cx, cy, w, h, rot, o = {}) {
  const b = o.border ?? 18, W2 = w + 2 * b, H2 = h + 2 * b, seed = o.seed || 7;
  c.save(); c.translate(cx, cy); c.rotate(rot);
  if (o.scale) c.scale(o.scale, o.scale);
  const d = deckle(W2, H2, seed);
  if (!o.noShadow) {
    c.save(); c.shadowColor = 'rgba(45,28,10,0.40)'; c.shadowBlur = o.shadow ?? 30; c.shadowOffsetX = 7; c.shadowOffsetY = 16;
    polyPath(c, d, -W2 / 2, -H2 / 2); c.fillStyle = COL.print; c.fill(); c.restore();
  } else { polyPath(c, d, -W2 / 2, -H2 / 2); c.fillStyle = COL.print; c.fill(); }
  // aged border tone
  c.save(); polyPath(c, d, -W2 / 2, -H2 / 2); c.clip();
  const bg = c.createLinearGradient(-W2 / 2, -H2 / 2, W2 / 2, H2 / 2);
  bg.addColorStop(0, 'rgba(160,120,60,0.10)'); bg.addColorStop(1, 'rgba(120,80,30,0.16)');
  c.fillStyle = bg; c.fillRect(-W2 / 2, -H2 / 2, W2, H2); c.restore();
  if (img) {
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
    c.filter = o.filter || GRADE;
    coverDraw(c, img, -w / 2, -h / 2, w, h, o.fx ?? 0.5, o.fy ?? 0.5, o.zoom ?? 1);
    c.filter = 'none';
    const g = c.createRadialGradient(0, 0, Math.min(w, h) * 0.32, 0, 0, Math.hypot(w, h) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(58,36,12,0.46)');
    c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
    c.globalAlpha = 0.18; c.globalCompositeOperation = 'overlay';
    c.drawImage(GRAIN[(BT + seed) % GRAIN.length], -w / 2 - (h2(BT, seed) * 200), -h / 2 - (h2(BT, seed + 1) * 200), w + 400, h + 400);
    c.restore();
    c.strokeStyle = 'rgba(40,28,16,0.35)'; c.lineWidth = 1.2; c.strokeRect(-w / 2, -h / 2, w, h);
  } else if (o.placeholder) {
    c.fillStyle = 'rgba(40,30,20,0.06)'; c.fillRect(-w / 2, -h / 2, w, h);
  }
  (o.tapes || []).forEach(([tx, ty, tw, th, tr], i) => tape(c, tx * W2 / 2, ty * H2 / 2, tw, th, tr, seed * 10 + i));
  c.restore();
}
// placeholder: dashed hand-drawn frame + big question mark
function placeholder(c, cx, cy, w, h, rot, p, seed) {
  if (p <= 0) return;
  c.save(); c.translate(cx, cy); c.rotate(rot); c.globalAlpha *= clamp(p * 1.5) * 0.55;
  const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]];
  const dense = []; for (let i = 0; i < 4; i++) for (let k = 0; k <= 20; k++) dense.push([lerp(pts[i][0], pts[i + 1][0], k / 20), lerp(pts[i][1], pts[i + 1][1], k / 20)]);
  c.setLineDash([18, 14]);
  drawStroke(c, dense, E.outC(p), { w: 3, color: COL.ink, jit: 1.2, seed });
  c.setLineDash([]);
  text(c, '؟', 0, 90, { fam: 'Ruqaa', w: 700, size: 260, color: COL.ink, alpha: 0.5 * E.outC(p) });
  c.restore();
}
// print that drops onto the page (lands at t0 + 0.34)
function dropPrint(c, img, t0, x, y, w, h, rot, o = {}) {
  const p = prog(T, t0, t0 + 0.34);
  if (p <= 0) return false;
  const s = lerp(1.9, 1, E.inQ(p));
  const bounce = T > t0 + 0.34 ? 1 + 0.018 * Math.exp(-(T - t0 - 0.34) * 10) * Math.sin((T - t0 - 0.34) * 34) : 1;
  const r = rot + (1 - p) * (o.spin ?? 0.18);
  c.save(); c.globalAlpha *= clamp(p * 2.2);
  drawPrint(c, img, x + (1 - p) * (o.dx ?? 0), y + (1 - p) * (o.dy ?? -60), w, h, r, { ...o, scale: s * bounce, shadow: lerp(70, 30, p) });
  c.restore();
  return true;
}

// ---- stamps
function grunge(cv, seed, n = 380) {
  const g = cv.getContext('2d');
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < n; i++) {
    const x = h2(i, seed) * cv.width, y = h2(i, seed + 1) * cv.height, r = 0.6 + Math.pow(h2(i, seed + 2), 3) * 7;
    g.globalAlpha = 0.35 + h2(i, seed + 3) * 0.65;
    g.beginPath(); g.ellipse(x, y, r, r * (0.5 + h2(i, seed + 4)), h2(i, seed + 5) * 3, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 7; i++) {
    g.globalAlpha = 0.5; g.lineWidth = 1 + h2(i, seed + 9) * 2; g.strokeStyle = '#000';
    const y = h2(i, seed + 8) * cv.height; g.beginPath(); g.moveTo(0, y); g.lineTo(cv.width, y + (h2(i, seed + 7) - 0.5) * 60); g.stroke();
  }
  g.restore();
  return cv;
}
function roundStamp(label, color, ring, seed) {
  const S = 360, cv = mk(S, S), g = cv.getContext('2d'), R = S / 2, ink = '#F6EEDC';
  g.translate(R, R);
  g.strokeStyle = color; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 168, 0, Math.PI * 2); g.stroke();
  g.fillStyle = color; g.beginPath(); g.arc(0, 0, 154, 0, Math.PI * 2); g.fill();
  g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, 142, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(0, 0, 100, 0, Math.PI * 2); g.stroke();
  g.fillStyle = ink; g.font = fnt('Cormorant', 26, 700); g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr';
  const chars = [...ring]; const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => { g.save(); g.rotate(-Math.PI / 2 + i * step); g.translate(121, 0); g.rotate(Math.PI / 2); g.fillText(ch, 0, 0); g.restore(); });
  g.strokeStyle = ink; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-24, -52); g.lineTo(-6, -34); g.lineTo(28, -70); g.stroke();
  g.font = fnt('Ruqaa', label.length > 4 ? 64 : 80, 700); g.direction = 'rtl'; g.textBaseline = 'alphabetic';
  g.fillText(label, 0, 50);
  return grunge(cv, seed, 240);
}
function rectStamp(label, color, seed) {
  const w = 460, h = 200, cv = mk(w, h), g = cv.getContext('2d'), ink = '#F6EEDC';
  g.strokeStyle = color; g.lineWidth = 7; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = color; g.fillRect(16, 16, w - 32, h - 32);
  g.strokeStyle = ink; g.lineWidth = 2.5; g.strokeRect(28, 28, w - 56, h - 56);
  g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(62, 74); g.lineTo(114, 126); g.moveTo(114, 74); g.lineTo(62, 126); g.stroke();
  g.fillStyle = ink; g.font = fnt('Ruqaa', 90, 700); g.textAlign = 'center'; g.direction = 'rtl';
  g.fillText(label, w / 2 + 42, 134);
  return grunge(cv, seed, 300);
}
const STAMP = {};
function slam(c, cv, x, y, rot, t0, scale = 1) {
  const p = prog(T, t0 - 0.13, t0);
  if (p <= 0) return;
  const dt = T - t0;
  const s = p < 1 ? lerp(2.5, 1, E.inC(p)) : 1 + 0.05 * Math.exp(-dt * 12) * Math.cos(dt * 42);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * scale, s * scale);
  c.globalAlpha *= p < 1 ? clamp(p * 1.4) * 0.85 : 0.94;
  c.shadowColor = 'rgba(20,12,4,0.4)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
  c.drawImage(cv, -cv.width / 2, -cv.height / 2);
  c.restore();
  if (dt >= 0) { // ink splatter
    const q = E.outC(prog(T, t0, t0 + 0.1));
    c.save(); c.fillStyle = cv._color || COL.ink;
    for (let i = 0; i < 12; i++) {
      const a = h2(i, t0 * 100) * Math.PI * 2, dist = (cv.width * 0.45 + h2(i, 3) * 90) * scale;
      c.globalAlpha = 0.55;
      c.beginPath(); c.arc(x + Math.cos(a) * dist * q, y + Math.sin(a) * dist * q, (1.5 + h2(i, 9) * 6) * q, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
}

// ---- wax seal
function waxSeal(glyph, seed) {
  const S = 300, cv = mk(S, S), g = cv.getContext('2d'); g.translate(S / 2, S / 2);
  const blob = r => { g.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; const rr = r * (1 + (vnoise(i / 4, seed) - 0.5) * 0.16 + (h2(i, seed) - 0.5) * 0.03); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); };
  g.save(); g.shadowColor = 'rgba(40,20,5,0.45)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
  blob(132); const gr = g.createRadialGradient(-40, -50, 10, 0, 0, 150);
  gr.addColorStop(0, '#E2C88F'); gr.addColorStop(0.45, COL.goldL); gr.addColorStop(1, '#6E5328');
  g.fillStyle = gr; g.fill(); g.restore();
  g.lineWidth = 6; g.strokeStyle = 'rgba(80,55,20,0.55)'; g.beginPath(); g.arc(0, 0, 96, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,240,200,0.45)'; g.beginPath(); g.arc(-1.5, -1.5, 96, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.fillStyle = 'rgba(80,55,20,0.5)'; g.beginPath(); g.arc(Math.cos(a) * 112, Math.sin(a) * 112, 3, 0, Math.PI * 2); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const f = glyph === '✓' ? fnt('Cormorant', 120, 700) : fnt('Cormorant', 92, 700);
  g.font = f; g.direction = 'ltr';
  g.fillStyle = 'rgba(255,240,205,0.55)'; g.fillText(glyph, -2, 2);
  g.fillStyle = 'rgba(70,48,15,0.85)'; g.fillText(glyph, 2, 6);
  g.fillStyle = COL.gold; g.fillText(glyph, 0, 4);
  return cv;
}
function sealSlam(c, cv, x, y, t0, scale = 1, rot = 0) {
  const p = prog(T, t0 - 0.15, t0); if (p <= 0) return;
  const dt = T - t0;
  const s = p < 1 ? lerp(2.2, 1, E.inC(p)) : 1 + 0.07 * Math.exp(-dt * 10) * Math.cos(dt * 36);
  const sq = p < 1 ? 1 : 1 - 0.06 * Math.exp(-dt * 14);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * scale, s * scale * sq); c.globalAlpha *= clamp(p * 2);
  c.drawImage(cv, -cv.width / 2, -cv.height / 2); c.restore();
}

// ---- engraving reveals (ink blot growth, quantised to 12fps)
const blotCv = mk(1400, 1400), blotCtx = blotCv.getContext('2d');
function blotReveal(c, img, x, y, w, h, p, seed = 1, o = {}) {
  if (p <= 0) return;
  c.save(); c.globalAlpha *= (o.alpha ?? 1);
  if (o.comp) c.globalCompositeOperation = o.comp;
  if (p >= 1) { c.drawImage(o.tinted || img, x, y, w, h); c.restore(); return; }
  const g = blotCtx, bw = Math.ceil(w), bh = Math.ceil(h);
  g.clearRect(0, 0, bw + 2, bh + 2); g.globalCompositeOperation = 'source-over';
  const N = 60, M = Math.max(w, h);
  for (let i = 0; i < N; i++) {
    const st = h2(i, seed) * 0.62, r = Math.max(0, (p - st) / 0.38) * M * (0.22 + h2(i, seed + 2) * 0.2);
    if (r <= 0) continue;
    const bx = h2(i, seed + 5) * w, by = h2(i, seed + 6) * h;
    const gr = g.createRadialGradient(bx, by, r * 0.55, bx, by, r);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill();
  }
  g.globalCompositeOperation = 'source-in'; g.drawImage(o.tinted || img, 0, 0, w, h);
  c.drawImage(blotCv, 0, 0, bw, bh, x, y, bw, bh);
  c.restore();
}
function tint(img, color) { const cv = mk(img.width, img.height), g = cv.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, cv.width, cv.height); return cv; }

// ---- magnifier with live zoom lens
const MAG = { cx: 320, cy: 298.5, r: 251 };
function magnifier(c, x, y, scale, rot, zoom, content) {
  const r = MAG.r * scale;
  c.save(); c.beginPath(); c.arc(x, y, r * 0.97, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#e9dfc8'; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  c.translate(x, y); c.scale(zoom, zoom); c.translate(-x, -y); content(c);
  c.restore();
  c.save(); c.beginPath(); c.arc(x, y, r * 0.97, 0, Math.PI * 2); c.clip();
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, 'rgba(255,252,240,0.35)'); g.addColorStop(0.35, 'rgba(255,250,235,0.06)'); g.addColorStop(1, 'rgba(60,40,15,0.28)');
  c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  c.strokeStyle = 'rgba(255,255,250,0.55)'; c.lineWidth = 5 * scale / 0.55; c.lineCap = 'round';
  c.beginPath(); c.arc(x, y, r * 0.78, -2.5, -1.75); c.stroke();
  c.restore();
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(scale, scale);
  c.shadowColor = 'rgba(30,20,8,0.35)'; c.shadowBlur = 24; c.shadowOffsetX = 10; c.shadowOffsetY = 18;
  c.drawImage(IMG.magClean, -MAG.cx, -MAG.cy); c.restore();
}

// ---- page furniture
const SHEETS = {};
function buildSheet(kind) {
  const cv = mk(W, H), g = cv.getContext('2d');
  g.drawImage(kind === 'cta' ? IMG.paperCta : IMG.paper, 0, 0, W, H);
  const lineCol = kind === 'cta' ? COL.gold : 'rgba(28,27,24,0.82)';
  g.strokeStyle = lineCol; g.lineWidth = 3; g.strokeRect(30, 30, W - 60, H - 60);
  g.lineWidth = 1.2; g.strokeRect(42, 42, W - 84, H - 84);
  const corner = (x, y, sx, sy) => {
    g.save(); g.translate(x, y); g.scale(sx, sy); g.fillStyle = lineCol; g.strokeStyle = lineCol;
    g.beginPath(); g.moveTo(0, -11); g.lineTo(11, 0); g.lineTo(0, 11); g.lineTo(-11, 0); g.closePath(); g.fill();
    g.lineWidth = 1.5; g.beginPath(); g.arc(26, 0, 9, Math.PI, Math.PI * 2.6); g.stroke(); g.beginPath(); g.arc(0, 26, 9, -Math.PI / 2, Math.PI * 1.1); g.stroke();
    g.restore();
  };
  corner(36, 36, 1, 1); corner(W - 36, 36, -1, 1); corner(36, H - 36, 1, -1); corner(W - 36, H - 36, -1, -1);
  // masthead
  g.strokeStyle = COL.gold; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(96, 96); g.lineTo(400, 96); g.moveTo(680, 96); g.lineTo(984, 96); g.stroke();
  g.beginPath(); g.moveTo(96, 102); g.lineTo(400, 102); g.moveTo(680, 102); g.lineTo(984, 102); g.stroke();
  text(g, 'FILMX', 540, 112, { fam: 'PlexLatin', w: 500, size: 34, color: COL.gold, dir: 'ltr', ls: '10px' });
  text(g, 'دليل كشف الحماية الأصلية', 540, 150, { fam: 'Plex', w: 500, size: 23, color: COL.ink, alpha: 0.62 });
  text(g, 'FILMX  ·  العناية بالسيارات الفاخرة  ·  الرياض', 540, H - 60, { fam: 'Plex', w: 500, size: 20, color: COL.ink, alpha: 0.45 });
  return cv;
}
const sheet = (c, kind = 'aged') => c.drawImage(SHEETS[kind], 0, 0);

// narrator medallion — the same character as an engraving
function medallion(c, x, y, p, speaking) {
  if (p <= 0) return;
  const s = E.outBack(p, 1.8), rx = 66, ry = 84;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(jit(901, 0.01));
  c.save(); c.shadowColor = 'rgba(40,25,8,0.35)'; c.shadowBlur = 16; c.shadowOffsetY = 6;
  c.beginPath(); c.ellipse(0, 0, rx + 10, ry + 10, 0, 0, Math.PI * 2); c.fillStyle = '#EFE6D2'; c.fill(); c.restore();
  c.save(); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#F4EDDC'; c.fillRect(-rx, -ry, 2 * rx, 2 * ry);
  const bh = 250, bw = bh * IMG.bust.width / IMG.bust.height;
  c.drawImage(IMG.bust, -bw * 0.5, -ry - 6, bw, bh);
  c.restore();
  c.strokeStyle = COL.gold; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, rx + 6, ry + 6, 0, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, 0, rx + 12, ry + 12, 0, 0, Math.PI * 2); c.stroke();
  text(c, 'خبيرة فيلم إكس', 0, ry + 46, { fam: 'Plex', w: 600, size: 21, color: COL.gold });
  if (speaking) {
    for (let i = 0; i < 3; i++) {
      const a = 0.25 + 0.75 * vnoise(T * 7 + i * 3, 55);
      c.strokeStyle = COL.ink; c.globalAlpha = 0.65 * a; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.arc(rx + 4, -10, 18 + i * 13, -0.55, 0.55); c.stroke();
    }
  }
  c.restore();
}
const speaking = t => [[V.v3, V.v3 + 5.31], [V.v4, V.v4 + 5.98], [V.v5, V.v5 + 6.13], [V.v6, V.v6 + 4.70]].some(([a, b]) => t >= a && t <= b);

// numbered chapter header
const ORD = ['', 'الاختبار الأول', 'الاختبار الثاني', 'الاختبار الثالث', 'الاختبار الرابع'];
const NUM = ['', '١', '٢', '٣', '٤'];
function header(c, n, title, t0) {
  const p = prog(T, t0, t0 + 0.5);
  if (p > 0) {
    const s = E.outBack(p, 2), r = (1 - E.outC(p)) * -2.2;
    c.save(); c.translate(930, 300); c.rotate(r + jit(n * 13, 0.012)); c.scale(s, s);
    c.save(); c.shadowColor = 'rgba(40,25,8,0.3)'; c.shadowBlur = 12; c.shadowOffsetY = 5;
    c.beginPath(); c.arc(0, 0, 76, 0, Math.PI * 2); c.fillStyle = '#EDE3CC'; c.fill(); c.restore();
    c.strokeStyle = COL.ink; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 60, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; c.fillStyle = COL.gold; c.beginPath(); c.arc(Math.cos(a) * 65, Math.sin(a) * 65, 2.2, 0, Math.PI * 2); c.fill(); }
    text(c, NUM[n], 0, 36, { fam: 'Amiri', w: 700, size: 104, color: COL.gold });
    c.restore();
  }
  writeText(c, ORD[n], 830, 250, E.outC(prog(T, t0 + 0.05, t0 + 0.45)), { fam: 'Plex', w: 600, size: 34, color: COL.gold, align: 'right' });
  const tp = prog(T, t0 + 0.12, t0 + 0.5);
  if (tp > 0) {
    const tw = measure(title, { fam: 'Ruqaa', w: 700, size: 128 });
    c.save(); c.translate(830 - tw / 2, 372 - (1 - E.outC(tp)) * 40);
    const s = lerp(0.4, 1, E.outBack(tp, 2.6)); c.scale(s, s); c.rotate((1 - E.outC(tp)) * 0.1 + jit(n * 17, 0.004));
    c.globalAlpha *= clamp(tp * 3);
    text(c, title, 0, 0, { fam: 'Ruqaa', w: 700, size: 128, color: COL.ink });
    c.restore();
  }
  const hp = E.ioC(prog(T, t0 + 0.3, t0 + 0.95));
  if (hp > 0) {
    c.save(); c.strokeStyle = COL.gold; c.lineWidth = 2;
    c.beginPath(); c.moveTo(540 + 450 * hp, 448); c.lineTo(540 - 450 * hp, 448); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.moveTo(540 + 430 * hp, 456); c.lineTo(540 - 430 * hp, 456); c.stroke();
    c.translate(540, 452); c.rotate(Math.PI / 4); c.fillStyle = COL.gold; const d = 9 * hp; c.fillRect(-d, -d, 2 * d, 2 * d);
    c.restore();
  }
}
// small torn-paper label strip
function labelStrip(c, s, x, y, rot, color, p, seed) {
  if (p <= 0) return;
  const sc = E.outBack(p, 2.2);
  const w = measure(s, { fam: 'Ruqaa', w: 700, size: 50 }) + 60, h = 70;
  c.save(); c.translate(x, y); c.rotate(rot + jit(seed, 0.008)); c.scale(sc, sc);
  c.beginPath(); c.moveTo(-w / 2, -h / 2);
  for (let xx = 0; xx <= w; xx += 8) c.lineTo(-w / 2 + xx, -h / 2 + (h2(xx, seed) - 0.5) * 6);
  for (let xx = w; xx >= 0; xx -= 8) c.lineTo(-w / 2 + xx, h / 2 + (h2(xx, seed + 1) - 0.5) * 6);
  c.closePath(); c.shadowColor = 'rgba(40,25,8,0.35)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
  c.fillStyle = '#F1E8D4'; c.fill(); c.shadowColor = 'transparent';
  text(c, s, 0, 17, { fam: 'Ruqaa', w: 700, size: 50, color });
  c.restore();
}

/* ---------------------------------------------------------------- scenes */
// SCENE 1 — hook
cue(0.30, 'drop', 1.0); shake(0.36, 16);
cue(0.25, 'pop', 0.5); cue(0.80, 'pop', 0.5); cue(1.14, 'pop', 0.45); cue(1.30, 'pop', 0.45);
cue(0.80, 'swing', 0.5);
cue(1.60, 'whoosh', 0.6); cue(1.74, 'thud', 0.9); shake(1.76, 9);
cue(1.95, 'scribble', 0.55, { dur: 0.4 });
cue(2.85, 'slide', 0.7); cue(3.0, 'scribble', 0.6, { dur: 0.5 });
cue(3.88, 'stamp', 1.0); shake(3.90, 12);
function sceneHook(c) {
  sheet(c);
  const pd = prog(T, 0.0, 0.36);
  const img = FR('c0_hook');
  const y = lerp(420, 1110, E.outBack(pd, 1.05));
  const rot = lerp(-0.26, -0.035, E.outC(pd)) + jit(5, 0.002);
  const sc = lerp(1.45, 1, E.inQ(pd));
  drawPrint(c, img, 548, y, 760, 1080, rot, { seed: 3, fy: 0.42, scale: sc, shadow: lerp(80, 30, pd), tapes: [[-0.78, -0.96, 150, 46, -0.5], [0.8, -0.95, 140, 44, 0.45]] });
  // price tag swinging from the print corner
  const tp = prog(T, 0.78, 1.1);
  if (tp > 0) {
    const dt = T - 0.78, ang = 0.55 * Math.exp(-dt * 2.2) * Math.sin(dt * 7) + 0.12;
    const ax = 880, ay = 598 + (y - 1110);
    c.save(); c.translate(ax, ay); c.rotate(ang); c.globalAlpha *= clamp(tp * 3);
    c.strokeStyle = '#6b5a3c'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(8, 30, -6, 60, 0, 92); c.stroke();
    c.translate(0, 92);
    c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.lineTo(76, 44); c.lineTo(76, 250); c.lineTo(-76, 250); c.lineTo(-76, 44); c.closePath();
    c.shadowColor = 'rgba(40,25,8,0.35)'; c.shadowBlur = 12; c.shadowOffsetY = 6; c.fillStyle = '#EADFC6'; c.fill();
    c.shadowColor = 'transparent'; c.strokeStyle = COL.gold; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.arc(0, 22, 8, 0, Math.PI * 2); c.strokeStyle = '#6b5a3c'; c.stroke();
    text(c, 'آلاف', 0, 120, { fam: 'Ruqaa', w: 700, size: 58, color: COL.red });
    text(c, 'الريالات', 0, 176, { fam: 'Plex', w: 600, size: 32, color: COL.ink });
    c.fillStyle = COL.ink; c.globalAlpha *= 0.7; c.fillRect(-46, 200, 92, 2); c.fillRect(-36, 212, 72, 2);
    c.restore();
  }
  // headline
  popWords(c, ['دفعت', 'آلاف', 'على', 'حماية'], [0.25, 0.8, 1.14, 1.3], 540, 292, { fam: 'Plex', w: 700, size: 76, color: COL.ink, per: { 1: { color: COL.red } } });
  const pp = prog(T, 1.56, 1.76);
  if (pp > 0) {
    const s = pp < 1 ? lerp(2.4, 1, E.inC(pp)) : 1 + 0.04 * Math.exp(-(T - 1.76) * 10) * Math.cos((T - 1.76) * 40);
    c.save(); c.translate(540, 468); c.scale(s, s); c.globalAlpha *= clamp(pp * 2);
    text(c, 'PPF', 8, 0, { fam: 'Cormorant', w: 700, size: 190, color: COL.gold, dir: 'ltr', ls: '26px', shadow: 'rgba(60,40,10,0.25)', shadowBlur: 0, shadowY: 4 });
    c.restore();
  }
  drawStroke(c, curvePts(375, 500, 715, 492, 0.02), E.outC(prog(T, 1.95, 2.3)), { w: 7, color: COL.gold, seed: 12 });
  drawStroke(c, curvePts(395, 518, 690, 512, -0.02), E.outC(prog(T, 2.05, 2.38)), { w: 3.5, color: COL.gold, seed: 13 });
  // skeptic circle around the hood on the print
  drawStroke(c, ellipsePts(800, 1045, 165, 105, 1.18, 9), E.ioC(prog(T, 3.0, 3.5)), { w: 8, color: COL.red, seed: 31, comp: 'source-over' });
  // question strip
  const sp = prog(T, 2.85, 3.15);
  if (sp > 0) {
    const x = lerp(-420, 520, E.outBack(sp, 1.2));
    c.save(); c.translate(x, 1488); c.rotate(-0.06 + jit(88, 0.005));
    const w = 800, h = 230;
    c.beginPath(); c.moveTo(-w / 2, -h / 2);
    for (let xx = 0; xx <= w; xx += 10) c.lineTo(-w / 2 + xx, -h / 2 + (h2(xx, 21) - 0.5) * 12);
    for (let yy = 0; yy <= h; yy += 10) c.lineTo(w / 2 + (h2(yy, 22) - 0.5) * 16, -h / 2 + yy);
    for (let xx = w; xx >= 0; xx -= 10) c.lineTo(-w / 2 + xx, h / 2 + (h2(xx, 23) - 0.5) * 12);
    c.closePath(); c.shadowColor = 'rgba(30,18,5,0.45)'; c.shadowBlur = 26; c.shadowOffsetY = 12;
    c.fillStyle = '#F0E6CF'; c.fill(); c.shadowColor = 'transparent';
    c.globalAlpha = 0.25; c.drawImage(IMG.paper, 200, 600, 800, 230, -w / 2, -h / 2, w, h); c.globalAlpha = 1;
    text(c, 'بس متأكد إنها', 150, -30, { fam: 'Plex', w: 600, size: 50, color: COL.ink });
    c.restore();
    const qp = prog(T, 3.86, 4.06);
    if (qp > 0) {
      const s = qp < 1 ? lerp(2.2, 1, E.inC(qp)) : 1 + 0.05 * Math.exp(-(T - 4.06) * 10) * Math.cos((T - 4.06) * 38);
      c.save(); c.translate(x - 20, 1560); c.rotate(-0.07); c.scale(s, s); c.globalAlpha *= clamp(qp * 2);
      text(c, 'أصلية؟', 0, 0, { fam: 'Ruqaa', w: 700, size: 150, color: COL.red });
      c.restore();
      drawStroke(c, curvePts(x - 250, 1600, x + 190, 1582, 0.03), E.outC(prog(T, 4.06, 4.3)), { w: 6, color: COL.red, seed: 71 });
    }
  }
}

// SCENE 2 — intro / table of contents
cue(4.97, 'thud', 0.9); shake(5.0, 7);
cue(5.02, 'whoosh', 0.7);
[5.45, 5.73, 6.01, 6.29].forEach(t => cue(t, 'pop', 0.7));
cue(6.92, 'scribble', 0.6, { dur: 0.6 });
function sceneIntro(c) {
  sheet(c);
  // character engraving (left) pointing up at the title
  const wp = prog(T, 5.0, 5.55);
  if (wp > 0) {
    const h = 1090, w = h * IMG.standing.width / IMG.standing.height, top = 1745 - h;
    const x = lerp(-700, -70, E.outBack(wp, 1.3));
    c.save(); c.translate(x + w / 2, top + h); c.rotate((1 - E.outC(wp)) * -0.12 + jit(222, 0.006)); c.translate(-(x + w / 2), -(top + h));
    c.shadowColor = 'rgba(40,25,8,0.25)'; c.shadowBlur = 18; c.shadowOffsetX = 8; c.shadowOffsetY = 10;
    c.drawImage(IMG.standing, x, top, w, h);
    c.restore();
    // emphasis marks near the raised finger
    const ep = prog(T, 5.5, 5.8);
    if (ep > 0) {
      const fx = x + w * 0.22, fy = top + h * 0.035;
      for (let i = 0; i < 3; i++) {
        const a = -2.2 + i * 0.55;
        drawStroke(c, [[fx + Math.cos(a) * 34, fy + Math.sin(a) * 34], [fx + Math.cos(a) * 70, fy + Math.sin(a) * 70]], E.outC(ep), { w: 5, color: COL.gold, seed: 300 + i });
      }
    }
  }
  popWords(c, ['٤', 'اختبارات'], [4.95, 5.05], 560, 372, { fam: 'Ruqaa', w: 700, size: 150, color: COL.ink, per: { 0: { fam: 'Amiri', color: COL.gold, size: 170 } }, spaceMul: 1.1 });
  writeText(c, 'تكشف لك الحقيقة', 560, 470, E.ioC(prog(T, 6.9, 7.55)), { fam: 'Plex', w: 600, size: 50, color: COL.gold });
  // table of contents (right column)
  const rows = [['الشفافية', 'mag'], ['الشد', 'roll'], ['الحرارة', 'kettle'], ['الضمان', 'seal']];
  rows.forEach(([label, icon], i) => {
    const t0 = 5.4 + i * 0.28, p = prog(T, t0, t0 + 0.35);
    if (p <= 0) return;
    const y = 700 + i * 200;
    c.save(); c.translate((1 - E.outBack(p, 1.6)) * 380, 0); c.globalAlpha *= clamp(p * 2.5);
    // numeral roundel
    c.beginPath(); c.arc(960, y, 44, 0, Math.PI * 2); c.fillStyle = '#EDE3CC'; c.fill();
    c.strokeStyle = COL.ink; c.lineWidth = 3; c.stroke(); c.lineWidth = 1; c.beginPath(); c.arc(960, y, 37, 0, Math.PI * 2); c.stroke();
    text(c, NUM[i + 1], 960, y + 20, { fam: 'Amiri', w: 700, size: 58, color: COL.gold });
    text(c, label, 895, y + 24, { fam: 'Ruqaa', w: 700, size: 76, color: COL.ink, align: 'right' });
    // dotted leader
    const lw = measure(label, { fam: 'Ruqaa', w: 700, size: 76 });
    const x1 = 895 - lw - 22, x0 = 665;
    c.fillStyle = COL.ink; c.globalAlpha *= 0.55;
    for (let x = x1; x > x0; x -= 16) { c.beginPath(); c.arc(x, y + 14, 2.2, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha /= 0.55;
    // icon
    const ic = { mag: IMG.mag, roll: IMG.roll, kettle: IMG.kettle }[icon];
    if (ic) { const s = 104 / Math.max(ic.width, ic.height); c.drawImage(ic, 598 - ic.width * s / 2, y - ic.height * s / 2, ic.width * s, ic.height * s); }
    else { c.drawImage(SEAL.check, 598 - 48, y - 48, 96, 96); }
    c.restore();
    // underline under each label
    drawStroke(c, curvePts(895, y + 44, 895 - lw, y + 42, 0.01), E.outC(prog(T, t0 + 0.25, t0 + 0.55)), { w: 3, color: COL.gold, seed: 400 + i });
  });
}

// SCENE 3 — clarity
cue(8.62, 'pop', 0.6); cue(8.86, 'thud', 0.85); shake(8.88, 6);
cue(9.72, 'drop', 0.9); shake(9.75, 8);
cue(9.95, 'scribble', 0.3, { dur: 0.4 });
cue(10.02, 'whoosh', 0.6);
cue(10.5, 'scribble', 0.55, { dur: 0.8 });
cue(11.55, 'stamp', 1.0); shake(11.57, 12);
cue(12.28, 'drop', 0.9); shake(12.3, 8);
cue(12.45, 'whoosh', 0.45);
cue(12.95, 'scribble', 0.55, { dur: 0.7 });
cue(13.62, 'stamp', 1.0); shake(13.64, 13);
cue(13.95, 'whoosh', 0.5);
const PR = { R: { x: 790, y: 968, rot: 0.035 }, L: { x: 292, y: 992, rot: -0.045 }, w: 430, h: 764 };
function pairPrints(c, clipR, clipL, tR, tL, labR, labL, seed) {
  if (!dropPrint(c, FR(clipR), tR, PR.R.x, PR.R.y, PR.w, PR.h, PR.R.rot, { seed, tapes: [[0, -0.985, 120, 40, 0.03]], dx: 120 })) return;
  labelStrip(c, labR, PR.R.x + 8, PR.R.y - PR.h / 2 - 10, 0.02, COL.gold, prog(T, tR + 0.25, tR + 0.55), seed + 3);
  placeholder(c, PR.L.x, PR.L.y, PR.w + 36, PR.h + 36, PR.L.rot, prog(T, tR + 0.45, tR + 0.8) * (1 - prog(T, tL + 0.2, tL + 0.34)), seed + 4);
  if (dropPrint(c, FR(clipL), tL, PR.L.x, PR.L.y, PR.w, PR.h, PR.L.rot, { seed: seed + 1, tapes: [[0, -0.985, 120, 40, -0.04]], dx: -120 }))
    labelStrip(c, labL, PR.L.x - 6, PR.L.y - PR.h / 2 - 10, -0.03, COL.red, prog(T, tL + 0.25, tL + 0.55), seed + 5);
}
function sceneClarity(c) {
  sheet(c);
  medallion(c, 150, 300, prog(T, 8.7, 9.2), speaking(T));
  header(c, 1, 'الشفافية', 8.6);
  const prints = cc => pairPrints(cc, 'c1_clear', 'c2_hazy', 9.38, 11.94, 'الأصلي', 'المغشوش', 21);
  prints(c);
  writeText(c, 'صافي مثل الزجاج', PR.R.x, 1490, E.ioC(prog(T, 10.5, 11.3)), { fam: 'Plex', w: 600, size: 44 });
  writeText(c, 'غبشة وتموّج', PR.L.x, 1512, E.ioC(prog(T, 12.95, 13.6)), { fam: 'Plex', w: 600, size: 44 });
  slam(c, STAMP.genuine, 690, 1310, -0.2, 11.55, 0.7);
  slam(c, STAMP.fake, 300, 1345, 0.14, 13.62, 0.68);
  // magnifier sweeping from the genuine sample to the fake one
  const mi = prog(T, 10.0, 10.5), mm = prog(T, 12.45, 12.95), mo = prog(T, 13.95, 14.3);
  if (mi > 0 && mo < 1) {
    let x = lerp(1250, 720, E.outBack(mi, 1.1)), y = lerp(1800, 905, E.outBack(mi, 1.1));
    x = lerp(x, 330, E.ioC(mm)); y = lerp(y, 952, E.ioC(mm));
    x = lerp(x, -250, E.inC(mo)); y = lerp(y, 1900, E.inC(mo));
    x += Math.sin(T * 2.1) * 10; y += Math.cos(T * 1.7) * 8;
    magnifier(c, x, y, 0.5, -0.12 + Math.sin(T * 1.3) * 0.03, 1.85, prints);
  }
}

// SCENE 4 — stretch
cue(14.05, 'slide', 0.8);
cue(14.52, 'thud', 0.85); shake(14.55, 6);
cue(15.28, 'drop', 0.9); shake(15.3, 8);
cue(15.95, 'scribble', 0.55, { dur: 0.8 });
cue(16.0, 'boing', 0.5);
cue(17.05, 'stamp', 1.0); shake(17.07, 12);
cue(17.63, 'drop', 0.9); shake(17.65, 8);
cue(18.85, 'scribble', 0.55, { dur: 0.7 });
cue(19.70, 'snap', 0.9);
cue(19.74, 'stamp', 1.0); shake(19.76, 18);
function coilPts(x0, x1, y, loops, amp) {
  const pts = [], n = loops * 24;
  for (let i = 0; i <= n; i++) { const u = i / n, a = u * loops * Math.PI * 2; pts.push([lerp(x0, x1, u) + Math.cos(a) * amp * 0.45, y + Math.sin(a) * amp]); }
  return pts;
}
function sceneStretch(c) {
  sheet(c);
  medallion(c, 150, 300, prog(T, 14.45, 14.95), speaking(T));
  header(c, 2, 'الشد', 14.45);
  pairPrints(c, 'c3_stretch_ok', 'c4_stretch_bad', 14.94, 17.29, 'الأصلي', 'المغشوش', 51);
  writeText(c, 'مرن ويرجع لشكله', PR.R.x, 1490, E.ioC(prog(T, 15.95, 16.8)), { fam: 'Plex', w: 600, size: 44 });
  writeText(c, 'يبيّض وينقطع', PR.L.x, 1512, E.ioC(prog(T, 18.85, 19.55)), { fam: 'Plex', w: 600, size: 44 });
  // elastic coil diagram (genuine)
  const cp = prog(T, 15.95, 16.3);
  if (cp > 0) {
    const cyc = Math.max(0, T - 16.0), st = 1 + 0.5 * Math.abs(Math.sin(cyc * 2.6)) * Math.exp(-cyc * 0.15);
    const half = 105 * st;
    c.save(); c.globalAlpha *= clamp(cp * 3);
    drawStroke(c, coilPts(PR.R.x - half, PR.R.x + half, 1592, 7, 20), 1, { w: 4, color: COL.ink, seed: 61, jit: 0.8 });
    drawStroke(c, [[PR.R.x - half - 40, 1592], [PR.R.x - half, 1592]], 1, { w: 4, seed: 62 });
    drawStroke(c, [[PR.R.x + half, 1592], [PR.R.x + half + 40, 1592]], 1, { w: 4, seed: 63 });
    c.restore();
  }
  // brittle strip diagram (fake) — stretches, whitens, snaps
  const bp = prog(T, 18.85, 19.2);
  if (bp > 0) {
    const pull = E.inQ(prog(T, 18.9, 19.7)), snapped = T >= 19.7;
    const gap = snapped ? 30 + 90 * E.outC(prog(T, 19.7, 20.0)) : 0;
    const half = 110 + 40 * pull;
    c.save(); c.globalAlpha *= clamp(bp * 3);
    const y = 1600, x = PR.L.x;
    c.strokeStyle = COL.ink; c.lineWidth = 3.5; c.fillStyle = `rgba(255,255,255,${0.15 + 0.6 * pull})`;
    const piece = (xa, xb, jag) => {
      c.beginPath(); c.moveTo(xa, y - 16); c.lineTo(xb, y - 16 * (1 - 0.4 * pull));
      if (jag) { for (let k = 0; k <= 6; k++) c.lineTo(xb + (k % 2 ? 10 : -4) * Math.sign(xb - x || 1), y - 12 + k * 4); }
      c.lineTo(xb, y + 16 * (1 - 0.4 * pull)); c.lineTo(xa, y + 16); c.closePath(); c.fill(); c.stroke();
    };
    if (!snapped) piece(x - half, x + half, false);
    else { piece(x - half - gap / 2, x - gap / 2, true); piece(x + half + gap / 2, x + gap / 2, true); }
    c.restore();
  }
  slam(c, STAMP.flex, 690, 1310, -0.18, 17.05, 0.7);
  slam(c, STAMP.snap, 300, 1345, 0.12, 19.74, 0.68);
}

// SCENE 5 — heat / self-healing
cue(20.42, 'ink', 1.0);
cue(20.97, 'thud', 0.85); shake(21.0, 6);
cue(21.33, 'drop', 0.9); shake(21.35, 8);
cue(21.35, 'whoosh', 0.5);
cue(21.9, 'riser', 0.45, { dur: 1.0 });
cue(23.25, 'slide', 0.5); cue(23.35, 'scribble', 0.4, { dur: 0.35 });
cue(23.95, 'sparkle', 0.8);
cue(24.35, 'stamp', 1.0); shake(24.37, 11);
cue(25.62, 'slide', 0.5); cue(25.72, 'scribble', 0.4, { dur: 0.35 });
cue(26.72, 'stamp', 0.8); shake(26.74, 9);
function scratchCard(c, x, y, heading, color, t0, healT, heals, seed) {
  const p = prog(T, t0, t0 + 0.35); if (p <= 0) return;
  c.save(); c.translate(x + (1 - E.outBack(p, 1.4)) * -380, y); c.rotate((seed % 2 ? 1 : -1) * 0.03 + jit(seed, 0.006));
  const w = 300, h = 262;
  c.shadowColor = 'rgba(40,25,8,0.35)'; c.shadowBlur = 16; c.shadowOffsetY = 7;
  c.fillStyle = '#F1E8D4'; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
  c.strokeStyle = 'rgba(28,27,24,0.4)'; c.lineWidth = 1.5; c.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  text(c, heading, 0, -h / 2 + 62, { fam: 'Ruqaa', w: 700, size: 46, color });
  // car-panel surface (ink hatching)
  c.fillStyle = 'rgba(28,27,24,0.9)'; c.fillRect(-w / 2 + 22, -6, w - 44, 96);
  c.strokeStyle = 'rgba(242,239,231,0.18)'; c.lineWidth = 1;
  for (let k = 0; k < 16; k++) { c.beginPath(); c.moveTo(-w / 2 + 22 + k * 16, -6); c.lineTo(-w / 2 + 22 + k * 16 + 30, 90); c.stroke(); }
  // scratches
  const sp = prog(T, t0 + 0.15, t0 + 0.45), heal = heals ? E.ioC(prog(T, healT, healT + 0.6)) : 0;
  c.save(); c.beginPath(); c.rect(-w / 2 + 22, -6, w - 44, 96); c.clip();
  [[-100, 6, -40, 80], [-50, 2, 10, 84], [0, 8, 70, 76], [45, 14, 105, 80]].forEach(([a, b, cc, d], k) => {
    drawStroke(c, [[a, b], [cc, d]], sp, { w: 5, color: `rgba(250,246,236,${0.95 * (1 - heal)})`, seed: seed * 10 + k, jit: 0.6 });
  });
  c.restore();
  if (heals && heal > 0) { // sparkles
    for (let k = 0; k < 5; k++) {
      const q = prog(T, healT + k * 0.06, healT + 0.5 + k * 0.06), a = Math.sin(q * Math.PI);
      if (a <= 0) continue;
      const sx = -100 + k * 50, sy = 20 + (k % 2) * 30, r = 16 * a;
      c.fillStyle = COL.goldL; c.beginPath();
      c.moveTo(sx, sy - r); c.lineTo(sx + r * 0.25, sy - r * 0.25); c.lineTo(sx + r, sy); c.lineTo(sx + r * 0.25, sy + r * 0.25);
      c.lineTo(sx, sy + r); c.lineTo(sx - r * 0.25, sy + r * 0.25); c.lineTo(sx - r, sy); c.lineTo(sx - r * 0.25, sy - r * 0.25); c.closePath(); c.fill();
    }
  }
  c.restore();
}
function sceneHeat(c) {
  sheet(c);
  medallion(c, 150, 300, prog(T, 20.95, 21.45), speaking(T));
  header(c, 3, 'الحرارة', 20.95);
  dropPrint(c, FR('c5_heat'), 21.0, 700, 1010, 530, 942, 0.03, { seed: 81, tapes: [[-0.85, -0.98, 130, 42, -0.5], [0.86, -0.98, 130, 42, 0.5]], dx: 100 });
  // kettle engraving pouring towards the print (mirrored so the spout faces right)
  const kp = prog(T, 21.3, 21.75);
  if (kp > 0) {
    const kw = 300, kh = kw * IMG.kettle.height / IMG.kettle.width;
    const tilt = lerp(-0.1, 0.18, E.ioC(prog(T, 21.7, 22.2))) + Math.sin(T * 2) * 0.015;
    c.save(); c.translate(lerp(-300, 215, E.outBack(kp, 1.4)), 700); c.rotate(tilt); c.scale(-1, 1);
    c.drawImage(IMG.kettle, -kw / 2, -kh / 2, kw, kh); c.restore();
    // steam curls (12fps boil)
    for (let i = 0; i < 3; i++) {
      const st = stepT(T), pts = [];
      for (let k = 0; k <= 26; k++) { const u = k / 26; pts.push([130 + i * 38 + Math.sin(u * 7 + st * 3 + i) * 16, 580 - u * 130 - i * 10]); }
      drawStroke(c, pts, E.outC(prog(T, 21.9 + i * 0.12, 22.4 + i * 0.12)), { w: 3.2, color: COL.ink, alpha: 0.55, seed: 700 + i, jit: 1.8 });
    }
  }
  // thermometer rising
  const th = prog(T, 21.55, 21.8);
  if (th > 0) {
    const x = 995, y0 = 610, y1 = 1000, lvl = E.ioC(prog(T, 21.9, 22.9));
    c.save(); c.globalAlpha *= clamp(th * 3);
    c.fillStyle = '#EFE6D2'; c.strokeStyle = COL.ink; c.lineWidth = 3;
    c.beginPath(); c.roundRect(x - 14, y0, 28, y1 - y0, 14); c.fill(); c.stroke();
    c.beginPath(); c.arc(x, y1 + 18, 26, 0, Math.PI * 2); c.fill(); c.stroke();
    const fillTop = lerp(y1 - 20, y0 + 30, lvl);
    const g = c.createLinearGradient(0, y1, 0, y0); g.addColorStop(0, COL.red); g.addColorStop(1, '#B04A32');
    c.fillStyle = g; c.fillRect(x - 6, fillTop, 12, y1 - fillTop + 10);
    c.beginPath(); c.arc(x, y1 + 18, 18, 0, Math.PI * 2); c.fill();
    c.lineWidth = 2; for (let k = 0; k < 8; k++) { const yy = y0 + 40 + k * 42; c.beginPath(); c.moveTo(x - 30, yy); c.lineTo(x - 18, yy); c.stroke(); }
    c.restore();
  }
  scratchCard(c, 190, 1045, 'الأصلي', COL.gold, 23.2, 23.95, true, 5);
  scratchCard(c, 190, 1345, 'المغشوش', COL.red, 25.58, 0, false, 6);
  slam(c, STAMP.heal, 520, 1390, -0.16, 24.35, 0.7);
  slam(c, STAMP.stays, 190, 1400, 0.1, 26.72, 0.46);
  writeText(c, 'يلتئم الخدش قدامك', 700, 1580, E.ioC(prog(T, 23.9, 24.6)), { fam: 'Plex', w: 600, size: 44 });
}

// SCENE 6 — warranty
cue(27.05, 'slide', 0.8);
cue(27.52, 'thud', 0.85); shake(27.55, 6);
cue(27.78, 'drop', 0.9); shake(27.8, 8);
cue(28.12, 'paper', 0.8);
cue(28.9, 'type', 0.8, { n: 16, dur: 1.0 }); cue(29.95, 'ding', 0.7);
cue(29.98, 'scribble', 0.5, { dur: 0.45 });
cue(31.32, 'scribble', 0.5, { dur: 0.3 });
cue(31.95, 'seal', 1.0); shake(31.97, 12);
const SERIAL = 'SN 7X4-2026-0418';
function certificate() {
  const w = 470, h = 860, cv = mk(w, h), g = cv.getContext('2d');
  g.fillStyle = '#F4ECD8'; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.35; g.drawImage(IMG.paper, 100, 400, w, h, 0, 0, w, h); g.globalAlpha = 1;
  g.strokeStyle = COL.gold; g.lineWidth = 5; g.strokeRect(16, 16, w - 32, h - 32);
  g.lineWidth = 1.5; g.strokeRect(28, 28, w - 56, h - 56);
  for (const [x, y] of [[28, 28], [w - 28, 28], [28, h - 28], [w - 28, h - 28]]) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = COL.gold; g.fillRect(-8, -8, 16, 16); g.restore(); }
  text(g, 'شهادة ضمان', w / 2, 128, { fam: 'Ruqaa', w: 700, size: 66, color: COL.ink });
  g.strokeStyle = COL.gold; g.lineWidth = 1.5; g.beginPath(); g.moveTo(80, 160); g.lineTo(w - 80, 160); g.stroke();
  text(g, 'رسمية من الشركة المصنّعة', w / 2, 200, { fam: 'Plex', w: 500, size: 24, color: COL.ink, alpha: 0.7 });
  text(g, 'رقم الرول', w - 60, 290, { fam: 'Plex', w: 700, size: 32, color: COL.ink, align: 'right' });
  g.strokeStyle = 'rgba(28,27,24,0.5)'; g.lineWidth = 1.5; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(60, 372); g.lineTo(w - 60, 372); g.stroke(); g.setLineDash([]);
  text(g, 'التحقق من الموقع الرسمي', w - 60, 480, { fam: 'Plex', w: 700, size: 30, color: COL.ink, align: 'right' });
  g.strokeStyle = COL.ink; g.lineWidth = 3; g.strokeRect(62, 450, 40, 40);
  text(g, 'التوقيع', w - 60, 620, { fam: 'Plex', w: 500, size: 26, color: COL.ink, alpha: 0.7, align: 'right' });
  g.strokeStyle = 'rgba(28,27,24,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(60, 700); g.lineTo(w - 60, 700); g.stroke();
  return cv;
}
function sceneWarranty(c) {
  sheet(c);
  medallion(c, 150, 300, prog(T, 27.5, 28.0), speaking(T));
  header(c, 4, 'الضمان', 27.5);
  dropPrint(c, FR('c6_serial'), 27.44, 800, 985, 420, 746, 0.03, { seed: 91, tapes: [[0, -0.985, 120, 40, 0.02]], dx: 120 });
  // certificate unfolds
  const up = prog(T, 28.05, 28.6);
  const cx = 300, cy = 980, cw = CERT.width, ch = CERT.height;
  if (up > 0) {
    c.save(); c.translate(cx, cy); c.rotate(-0.025 + jit(123, 0.003));
    c.shadowColor = 'rgba(40,25,8,0.38)'; c.shadowBlur = 26; c.shadowOffsetX = 6; c.shadowOffsetY = 14;
    const f = E.outBack(up, 1.2);
    c.fillStyle = '#F4ECD8'; c.fillRect(-cw / 2, -ch / 2, cw, ch / 2); c.shadowColor = 'transparent';
    c.drawImage(CERT, 0, 0, cw, ch / 2, -cw / 2, -ch / 2, cw, ch / 2);
    c.save(); c.scale(1, f); c.drawImage(CERT, 0, ch / 2, cw, ch / 2, -cw / 2, 0, cw, ch / 2);
    c.fillStyle = `rgba(40,25,8,${0.35 * (1 - clamp(f))})`; c.fillRect(-cw / 2, 0, cw, ch / 2); c.restore();
    c.strokeStyle = 'rgba(80,60,30,0.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-cw / 2 + 20, 0); c.lineTo(cw / 2 - 20, 0); c.stroke();
    // typed serial
    const tpv = prog(T, 28.9, 29.9), nch = Math.floor(tpv * SERIAL.length + 1e-6);
    if (tpv > 0) {
      const s = SERIAL.slice(0, nch);
      text(c, s, -cw / 2 + 62, -ch / 2 + 360, { fam: 'Elite', size: 36, color: COL.ink, dir: 'ltr', align: 'left' });
      if (tpv < 1 && BT % 2 === 0) { const sw = measure(s, { fam: 'Elite', size: 36, dir: 'ltr' }); c.fillStyle = COL.ink; c.fillRect(-cw / 2 + 64 + sw, -ch / 2 + 330, 3, 36); }
    }
    drawStroke(c, checkPts(-cw / 2 + 82, -ch / 2 + 466, 48), E.outC(prog(T, 31.32, 31.6)), { w: 7, color: COL.gold, seed: 811 });
    // signature squiggle
    const sig = []; for (let k = 0; k <= 60; k++) { const u = k / 60; sig.push([cw / 2 - 90 - u * 250, -ch / 2 + 680 + Math.sin(u * 16) * 18 * (1 - u * 0.5) - u * 10]); }
    drawStroke(c, sig, E.ioC(prog(T, 30.6, 31.2)), { w: 3, color: COL.ink, seed: 812, jit: 0.8 });
    c.restore();
  }
  // arrow from the serial on the certificate to the roll label in the footage
  drawArrow(c, 470, 905, 725, 1165, E.ioC(prog(T, 29.98, 30.45)), { w: 5, color: COL.red, bend: 0.3, seed: 820, head: 34 });
  sealSlam(c, SEAL.check, 380, 1300, 31.95, 0.62, -0.2);
  writeText(c, 'تحقق منه من الموقع الرسمي', 540, 1528, E.ioC(prog(T, 29.7, 30.7)), { fam: 'Plex', w: 600, size: 44 });
}

// SCENE 7 — CTA
cue(32.25, 'tear', 1.0);
cue(32.75, 'whoosh', 0.7);
cue(33.3, 'pop', 0.8);
cue(34.2, 'shimmer', 0.7);
[34.3, 34.38, 34.46, 34.54, 34.62].forEach(t => cue(t, 'tick', 0.8));
cue(34.88, 'seal', 1.0); shake(34.9, 14);
cue(35.4, 'shimmer', 0.5);
cue(36.62, 'drop', 0.7); shake(36.66, 5);
function sceneCTA(c) {
  const push = 1 + 0.035 * E.ioC(prog(T, 33.0, DURATION));
  c.save(); c.translate(W / 2, H / 2); c.scale(push, push); c.translate(-W / 2, -H / 2);
  sheet(c, 'cta');
  // watermark car engraving (gold)
  blotReveal(c, IMG.car, 190, 1545, 700, 700 * IMG.car.height / IMG.car.width, prog(stepT(T), 33.4, 34.3), 17, { tinted: IMG.carGold, alpha: 0.5 });
  // cameo oval with the real footage
  const op = prog(T, 32.7, 33.25);
  if (op > 0) {
    const s = lerp(0.55, 1, E.outBack(op, 1.5)), rx = 250, ry = 330, cy = 610;
    c.save(); c.translate(540, cy); c.rotate((1 - E.outC(op)) * 0.25); c.scale(s, s); c.globalAlpha *= clamp(op * 2);
    c.save(); c.shadowColor = 'rgba(40,25,8,0.4)'; c.shadowBlur = 34; c.shadowOffsetY = 16;
    c.beginPath(); c.ellipse(0, 0, rx + 26, ry + 26, 0, 0, Math.PI * 2); c.fillStyle = '#EFE4CC'; c.fill(); c.restore();
    c.save(); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); c.clip();
    const img = FR('c7_cta'); if (img) { c.filter = GRADE; coverDraw(c, img, -rx, -ry, 2 * rx, 2 * ry, 0.62, 0.3, 1.25); c.filter = 'none'; }
    const g = c.createRadialGradient(0, 0, rx * 0.6, 0, 0, ry * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(58,36,12,0.5)');
    c.fillStyle = g; c.fillRect(-rx, -ry, 2 * rx, 2 * ry);
    c.globalAlpha = 0.16; c.globalCompositeOperation = 'overlay'; c.drawImage(GRAIN[BT % GRAIN.length], -rx - 100, -ry - 100, 2 * rx + 200, 2 * ry + 200);
    c.restore();
    c.strokeStyle = COL.gold; c.lineWidth = 9; c.beginPath(); c.ellipse(0, 0, rx + 8, ry + 8, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = COL.goldL; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, rx + 19, ry + 19, 0, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; c.fillStyle = COL.gold; c.beginPath(); c.arc(Math.cos(a) * (rx + 19), Math.sin(a) * (ry + 19), 3.2, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  sealSlam(c, SEAL.fx, 790, 880, 34.88, 0.72, 0.18);
  popWords(c, ['راحة', 'البال'], [33.3, 33.55], 540, 1062, { fam: 'Ruqaa', w: 700, size: 92, color: COL.ink });
  // FILMX wordmark — letters drop in
  const letters = [...'FILMX'], ls = 44, size = 132;
  const lw = letters.map(ch => measure(ch, { fam: 'PlexLatin', w: 500, size, dir: 'ltr' }));
  const total = lw.reduce((a, b) => a + b, 0) + ls * (letters.length - 1);
  let x = 540 - total / 2;
  letters.forEach((ch, i) => {
    const t0 = 34.3 + i * 0.08, p = prog(T, t0 - 0.12, t0);
    if (p > 0) {
      const s = p < 1 ? lerp(1.9, 1, E.inQ(p)) : 1 + 0.03 * Math.exp(-(T - t0) * 12) * Math.cos((T - t0) * 40);
      c.save(); c.translate(x + lw[i] / 2, 1238); c.scale(s, s); c.globalAlpha *= clamp(p * 2);
      text(c, ch, 0, 0, { fam: 'PlexLatin', w: 500, size, color: COL.ink, dir: 'ltr' });
      c.restore();
    }
    x += lw[i] + ls;
  });
  // gold hairline above the Arabic tagline (brand rule) + tagline
  const hp = E.ioC(prog(T, 35.2, 35.7));
  if (hp > 0) { c.fillStyle = COL.gold; c.fillRect(540 - 170 * hp, 1282, 340 * hp, 2.5); }
  writeText(c, 'العناية بالسيارات الفاخرة', 540, 1352, E.ioC(prog(T, 35.35, 36.3)), { fam: 'Plex', w: 500, size: 50, color: COL.gold });
  // light sweep across the wordmark
  const sw = prog(T, 36.0, 36.9);
  if (sw > 0 && sw < 1) {
    c.save(); c.globalCompositeOperation = 'soft-light';
    const gx = lerp(200, 900, sw); const g = c.createLinearGradient(gx - 90, 0, gx + 90, 0);
    g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, 'rgba(255,240,200,0.9)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = g; c.fillRect(150, 1120, 780, 260); c.restore();
  }
  // CTA ticket
  const tp = prog(T, 36.35, 36.66);
  if (tp > 0) {
    const y = lerp(1900, 1462, E.outBack(tp, 1.3));
    c.save(); c.translate(540, y); c.rotate(-0.015 + jit(944, 0.004));
    const w = 600, h = 118;
    c.beginPath(); c.moveTo(-w / 2 + 20, -h / 2); c.lineTo(w / 2 - 20, -h / 2); c.arc(w / 2, -h / 2, 20, Math.PI, Math.PI / 2, true);
    c.lineTo(w / 2, h / 2 - 20); c.arc(w / 2, h / 2, 20, -Math.PI / 2, Math.PI, true); c.lineTo(-w / 2 + 20, h / 2);
    c.arc(-w / 2, h / 2, 20, 0, -Math.PI / 2, true); c.lineTo(-w / 2, -h / 2 + 20); c.arc(-w / 2, -h / 2, 20, Math.PI / 2, 0, true); c.closePath();
    c.shadowColor = 'rgba(30,18,5,0.4)'; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = COL.ink; c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = COL.goldL; c.lineWidth = 2; c.setLineDash([6, 6]); c.strokeRect(-w / 2 + 34, -h / 2 + 14, w - 68, h - 28); c.setLineDash([]);
    text(c, 'احجز موعدك الآن', 0, 18, { fam: 'Plex', w: 700, size: 50, color: COL.goldL });
    c.restore();
    text(c, 'فيلم إكس  ·  الرياض', 540, 1566, { fam: 'Plex', w: 600, size: 30, color: COL.ink, alpha: clamp((T - 36.55) * 3) * 0.8 });
  }
  c.restore();
}

/* ----------------------------------------------------------- transitions */
function tearLine(seed, horiz) {
  const pts = [], n = 56;
  for (let i = 0; i <= n; i++) {
    const u = i / n, off = (vnoise(u * 7, seed) - 0.5) * 150 + (h2(i, seed + 9) - 0.5) * 28;
    pts.push(horiz ? [-60 + u * (W + 120), H * 0.5 + off] : [W * 0.5 + off, -60 + u * (H + 120)]);
  }
  return pts;
}
function tearT(c, A, B, p, seed, horiz) {
  const pts = tearLine(seed, horiz);
  const crack = clamp(p / 0.26), q = E.inC(clamp((p - 0.2) / 0.8));
  if (q > 0) { c.save(); const s = lerp(1.07, 1, E.outC(q)); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.drawImage(B, 0, 0); c.restore(); }
  const halves = horiz
    ? [[[-80, -80], [W + 80, -80]], [[-80, H + 80], [W + 80, H + 80]]]
    : [[[-80, -80], [-80, H + 80]], [[W + 80, -80], [W + 80, H + 80]]];
  halves.forEach((corners, side) => {
    const sg = side ? 1 : -1;
    const poly = horiz ? [corners[0], ...pts, corners[1]].reverse() : [corners[0], ...pts, corners[1]];
    const polyFull = horiz ? [corners[0], corners[1], ...pts.slice().reverse()] : [corners[0], ...pts, corners[1]];
    c.save();
    if (horiz) { c.translate(W / 2, side ? H : 0); c.rotate(sg * q * 0.12); c.translate(-W / 2, -(side ? H : 0)); c.translate(0, sg * q * H * 0.7); }
    else { c.translate(side ? W : 0, H); c.rotate(sg * q * 0.16); c.translate(-(side ? W : 0), -H); c.translate(sg * q * W * 0.75, 0); }
    if (q < 0.02) c.translate(sg * crack * 3, 0);
    c.save(); c.shadowColor = 'rgba(20,12,4,0.5)'; c.shadowBlur = 40; polyPath(c, polyFull); c.fillStyle = '#E8DCC0'; c.fill(); c.restore();
    polyPath(c, polyFull); c.clip();
    c.drawImage(A, 0, 0);
    // fibrous torn edge
    c.strokeStyle = '#F6EEDC'; c.lineWidth = 9; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.strokeStyle = 'rgba(120,90,50,0.35)'; c.lineWidth = 2; c.stroke();
    c.restore();
    void poly;
  });
  if (q <= 0) drawStroke(c, pts, crack, { w: 3, color: 'rgba(50,32,14,0.75)', seed: seed * 3, jit: 0.8 });
}
function slideUpT(c, A, B, p) {
  const q = E.outBack(p, 0.9);
  c.save(); const s = 1 - 0.05 * E.outC(p); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.drawImage(A, 0, 0);
  c.fillStyle = `rgba(30,18,6,${0.35 * p})`; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.translate(W / 2, H / 2 + (1 - q) * H * 1.05); c.rotate((1 - q) * 0.07);
  c.shadowColor = 'rgba(30,18,6,0.5)'; c.shadowBlur = 50; c.shadowOffsetY = -12; c.fillStyle = '#E8DCC0'; c.fillRect(-W / 2, -H / 2, W, H); c.shadowColor = 'transparent';
  c.drawImage(B, -W / 2, -H / 2); c.restore();
}
function pushT(c, A, B, p) {
  const q = E.ioC(p);
  c.save(); c.translate(q * W * 1.02, 0); c.rotate(q * 0.03); c.drawImage(A, 0, 0); c.restore();
  c.save(); c.translate(-(1 - q) * W * 1.02, 0); c.rotate(-(1 - q) * 0.03);
  c.shadowColor = 'rgba(30,18,6,0.45)'; c.shadowBlur = 40; c.shadowOffsetX = 12; c.fillStyle = '#E8DCC0'; c.fillRect(0, 0, W, H); c.shadowColor = 'transparent';
  c.drawImage(B, 0, 0); c.restore();
}
function blobPath(c, cx, cy, r, seed) {
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, rr = r * (1 + (vnoise(i / 6, seed) - 0.5) * 0.34 + (h2(i, seed) - 0.5) * 0.05);
    i ? c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  c.closePath();
}
function inkT(c, A, B, p, seed) {
  const cx = W * 0.55, cy = H * 0.52, R = Math.hypot(W, H) * 0.62;
  if (p < 0.5) {
    c.drawImage(A, 0, 0);
    const q = E.inC(p / 0.5);
    c.fillStyle = COL.ink; c.beginPath(); blobPath(c, cx, cy, R * q * 1.1, seed); c.fill();
    for (let i = 0; i < 26; i++) { const a = h2(i, seed) * 6.28, d = R * q * (1.05 + h2(i, seed + 1) * 0.4); c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 4 + h2(i, seed + 2) * 22 * q, 0, 6.28); c.fill(); }
  } else {
    c.drawImage(B, 0, 0);
    const q = E.outC((p - 0.5) / 0.5);
    c.fillStyle = COL.ink; c.beginPath(); c.rect(0, 0, W, H); blobPath(c, cx, cy, R * q * 1.12, seed + 1); c.fill('evenodd');
  }
}

/* ---------------------------------------------------------------- global */
const GRAIN = [];
function buildGrain() {
  for (let k = 0; k < 6; k++) {
    const cv = mk(540, 960), g = cv.getContext('2d'), id = g.createImageData(540, 960);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 128 + ((h2(i >> 2, k * 7 + 1) + h2(i >> 2, k * 7 + 2) + h2(i >> 2, k * 7 + 3)) / 3 - 0.5) * 190;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0); GRAIN.push(cv);
  }
}
function shakeAt(t) {
  let x = 0, y = 0, r = 0;
  for (const s of SHAKES) {
    const dt = t - s.t; if (dt < 0 || dt > 0.7) continue;
    const a = s.amp * Math.exp(-dt * 8);
    x += (vnoise(dt * 38, s.t * 100) - 0.5) * 2 * a; y += (vnoise(dt * 38, s.t * 100 + 1) - 0.5) * 2 * a; r += (vnoise(dt * 30, s.t * 100 + 2) - 0.5) * a * 0.0018;
  }
  return { x, y, r };
}
function post(c) {
  // exposure flicker
  const fl = (vnoise(T * 9, 3) - 0.5) * 0.05;
  c.save(); c.fillStyle = fl > 0 ? `rgba(255,246,225,${fl})` : `rgba(40,25,10,${-fl})`; c.fillRect(0, 0, W, H); c.restore();
  // vignette
  c.save(); c.globalCompositeOperation = 'multiply';
  const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H / 2, H * 0.78);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(150,118,80,1)');
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  // film grain
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.11;
  c.drawImage(GRAIN[(Math.floor(T * FPS)) % GRAIN.length], -h2(Math.floor(T * FPS), 5) * 60, -h2(Math.floor(T * FPS), 6) * 60, W + 120, H + 120); c.restore();
  // dust & hairs (12fps)
  c.save(); c.fillStyle = 'rgba(30,20,10,0.55)';
  for (let i = 0; i < 7; i++) {
    const x = h2(i, BT * 3 + 1) * W, y = h2(i, BT * 3 + 2) * H, r = 0.8 + h2(i, BT * 3 + 3) * 2.4;
    c.beginPath(); c.ellipse(x, y, r, r * 0.7, h2(i, BT) * 3, 0, 6.28); c.fill();
  }
  if (h2(BT, 99) > 0.7) {
    const x = h2(BT, 98) * W, y = h2(BT, 97) * H;
    c.strokeStyle = 'rgba(30,20,10,0.4)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x, y);
    c.bezierCurveTo(x + 20, y + 10, x + 10, y + 40, x + 36, y + 55); c.stroke();
  }
  if (h2(BT, 77) > 0.93) {
    const x = h2(BT, 76) * W; c.strokeStyle = 'rgba(255,248,230,0.35)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (h2(BT, 75) - 0.5) * 30, H); c.stroke();
  }
  c.restore();
}

const offA = mk(W, H).getContext('2d'), offB = mk(W, H).getContext('2d');
const stage = document.getElementById('stage').getContext('2d');
function sceneIndexAt(t) { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].start) return i; return 0; }
function drawScene(i, c) {
  c.save(); c.clearRect(0, 0, W, H);
  if (i < SCENES.length - 1) { const sc = SCENES[i], z = 1 + 0.028 * E.ioC(prog(T, sc.start, sc.end + 0.3)); c.translate(W / 2, H * 0.55); c.scale(z, z); c.translate(-W / 2, -H * 0.55); }
  SCENES[i].draw(c); c.restore();
}
async function prepare(t) {
  const need = new Set();
  const i = sceneIndexAt(t); need.add(i);
  for (let k = 0; k < TRANS.length; k++) { const tr = TRANS[k]; if (t >= tr.at - tr.d / 2 && t < tr.at + tr.d / 2) { need.add(k); need.add(k + 1); } }
  const jobs = [];
  for (const si of need) for (const cl of SCENES[si].clips) jobs.push(getFrameImg(cl, clipIndex(cl, t)));
  await Promise.all(jobs);
}
async function renderFrame(t) {
  T = t; BT = Math.floor(t * 12 + 1e-6);
  await prepare(t);
  const sh = shakeAt(t);
  stage.save();
  stage.fillStyle = '#2a1e10'; stage.fillRect(0, 0, W, H);
  const zoom = 1 + Math.min(0.03, (Math.abs(sh.x) + Math.abs(sh.y)) / 600);
  stage.translate(W / 2 + sh.x, H / 2 + sh.y); stage.rotate(sh.r); stage.scale(zoom, zoom); stage.translate(-W / 2, -H / 2);
  const k = TRANS.findIndex(tr => t >= tr.at - tr.d / 2 && t < tr.at + tr.d / 2);
  if (k >= 0) {
    const tr = TRANS[k], p = (t - (tr.at - tr.d / 2)) / tr.d;
    // outgoing scene frozen-in-time feel: keep its own clock
    drawScene(k, offA); drawScene(k + 1, offB);
    const A = offA.canvas, B = offB.canvas;
    if (tr.type === 'tear') tearT(stage, A, B, p, tr.seed, false);
    else if (tr.type === 'tearH') tearT(stage, A, B, p, tr.seed, true);
    else if (tr.type === 'slideUp') slideUpT(stage, A, B, p);
    else if (tr.type === 'push') pushT(stage, A, B, p);
    else if (tr.type === 'ink') inkT(stage, A, B, p, tr.seed);
  } else {
    drawScene(sceneIndexAt(t), offA); stage.drawImage(offA.canvas, 0, 0);
  }
  stage.restore();
  post(stage);
  return true;
}

/* ------------------------------------------------------------------ init */
let CERT = null; const SEAL = {};
async function init() {
  const P = '../assets/prep/';
  const list = { paper: 'paper_bg.jpg', paperCta: 'paper_cta.jpg', car: 'eng_car.png', kettle: 'eng_kettle.png', roll: 'eng_roll.png', standing: 'eng_standing.png', bust: 'eng_bust.png', mag: 'eng_magnifier.png' };
  await Promise.all(Object.entries(list).map(async ([k, f]) => { IMG[k] = await loadImg(P + f); }));
  const fams = ['400 40px Plex', '500 40px Plex', '600 40px Plex', '700 40px Plex', '500 40px PlexLatin', '700 40px Ruqaa', '400 40px Ruqaa', '700 40px Amiri', '600 40px Cormorant', '700 40px Cormorant', '400 40px Elite'];
  await Promise.all(fams.map(f => document.fonts.load(f, f.includes('Latin') || f.includes('Cormorant') || f.includes('Elite') ? 'FILMX PPF 0123' : 'أصلي ١٢٣٤')));
  await document.fonts.ready;
  // magnifier with clean glass
  { const cv = mk(IMG.mag.width, IMG.mag.height), g = cv.getContext('2d'); g.drawImage(IMG.mag, 0, 0); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(MAG.cx, MAG.cy, MAG.r * 0.93, 0, Math.PI * 2); g.fill(); IMG.magClean = cv; }
  IMG.carGold = tint(IMG.car, COL.gold);
  buildGrain();
  SHEETS.aged = buildSheet('aged'); SHEETS.cta = buildSheet('cta');
  const mkStamp = (cv, col) => { cv._color = col; return cv; };
  STAMP.genuine = mkStamp(roundStamp('أصلي', COL.gold, '✦ FILMX ✦ GENUINE ✦ FILMX ✦ GENUINE ', 3), COL.gold);
  STAMP.flex = mkStamp(roundStamp('مرن', COL.gold, '✦ FILMX ✦ GENUINE ✦ FILMX ✦ GENUINE ', 4), COL.gold);
  STAMP.heal = mkStamp(roundStamp('يلتئم', COL.gold, '✦ SELF HEALING ✦ FILMX ✦ GENUINE ', 5), COL.gold);
  STAMP.fake = mkStamp(rectStamp('مغشوش', COL.red, 6), COL.red);
  STAMP.snap = mkStamp(rectStamp('ينقطع', COL.red, 7), COL.red);
  STAMP.stays = mkStamp(rectStamp('يبقى', COL.red, 8), COL.red);
  SEAL.fx = waxSeal('FX', 4); SEAL.check = waxSeal('✓', 9);
  CERT = certificate();
  window.READY = true;
}

window.TIMELINE = {
  fps: FPS, duration: DURATION, width: W, height: H,
  vo: [1, 2, 3, 4, 5, 6, 7].map(i => ({ file: `assets/audio/vo_${i}.wav`, t: V['v' + i] })),
  sfx: SFX, shakes: SHAKES,
  clips: Object.entries(CLIPS).map(([name, c]) => ({ name, file: `assets/video/${name}.mp4`, ...c,
    visible: (() => { const s = SCENES.find(sc => sc.clips.includes(name)); const i = SCENES.indexOf(s); const tin = TRANS[i - 1], tout = TRANS[i];
      return [Math.max(c.start, tin ? tin.at - tin.d / 2 : 0), tout ? tout.at + tout.d / 2 : DURATION]; })() })),
  scenes: SCENES.map(s => [s.start, s.end]), transitions: TRANS,
};
window.renderFrame = renderFrame;
window.initPromise = init();
})();
