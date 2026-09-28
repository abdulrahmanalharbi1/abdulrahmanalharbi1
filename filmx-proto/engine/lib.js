/* FILMX prototype engine — shared primitives in the reference's motion language
 * (ivory paper + vignette + faint grid, blur/focus-pull entrances, huge hero word,
 * lead-in words, pill labels, strikethrough, floating monochrome 3D objects, dark end card).
 * A prototype file defines window.PROTO = { duration, assets: {key: path}, clips: {key: {path, fps, frames}}, draw(c, t) }.
 */
'use strict';
const FX = (() => {
  const W = 1080, H = 1920;
  const COL = {
    ivory: '#FBFAF7', cream: '#F2EFE7', paperEdge: '#DCD5C6', ink: '#1C1B18', inkSoft: '#2A2825',
    grey: '#8C877D', greyL: '#B9B3A7', gold: '#8A6E3F', goldL: '#C9A86A', hair: '#D8D3C7', red: '#7A2E24',
  };
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => (a === Infinity || a == null ? 0 : clamp((t - a) / (b - a)));
  const E = {
    lin: x => x,
    inQ: x => x * x, outQ: x => 1 - (1 - x) * (1 - x),
    inC: x => x * x * x, outC: x => 1 - Math.pow(1 - x, 3), ioC: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outQuart: x => 1 - Math.pow(1 - x, 4), outQuint: x => 1 - Math.pow(1 - x, 5),
    outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)), inExpo: x => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
    ioExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
    outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
    ioSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  };
  function hash(n) { n = (n | 0) ^ 0x9e3779b9; n = Math.imul(n ^ (n >>> 16), 0x85ebca6b); n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
  const h2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
  function vnoise(x, seed) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(h2(i, seed), h2(i + 1, seed), u); }
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* ---------- text ---------- */
  const fnt = (fam, size, w) => `${w} ${size}px ${fam}`;
  const SCR = mk(4, 4).getContext('2d');
  function style(c, o) { c.font = fnt(o.fam || 'Plex', o.size || 48, o.w || 600); c.direction = o.dir || 'rtl'; c.letterSpacing = o.ls || '0px'; }
  function measure(s, o = {}) { SCR.save(); style(SCR, o); const m = SCR.measureText(s); SCR.restore(); return m.width; }
  function text(c, s, x, y, o = {}) {
    c.save(); style(c, o); c.fillStyle = o.color || COL.ink; c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'alphabetic';
    c.globalAlpha *= (o.alpha ?? 1);
    if (o.grad) { const g = c.createLinearGradient(0, y - o.size, 0, y + o.size * 0.2); o.grad.forEach(([k, col]) => g.addColorStop(k, col)); c.fillStyle = g; }
    if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = o.shadowBlur ?? 18; c.shadowOffsetY = o.shadowY ?? 8; }
    c.fillText(s, x, y); c.restore();
  }
  // focus-pull entrance/exit: blur + opacity + scale + drift. times: [inStart, inEnd, outStart, outEnd]
  function focusState(t, tin0, tin1, tout0 = Infinity, tout1 = Infinity, o = {}) {
    const pi = E[o.easeIn || 'outExpo'](prog(t, tin0, tin1));
    const po = E[o.easeOut || 'inQ'](prog(t, tout0, tout1));
    const vis = pi * (1 - po);
    return {
      alpha: vis,
      blur: (1 - pi) * (o.blurIn ?? 22) + po * (o.blurOut ?? 26),
      scale: lerp(o.scaleFrom ?? 1.12, 1, pi) * lerp(1, o.scaleTo ?? 0.94, po),
      dy: (1 - pi) * (o.dyIn ?? 0) + po * (o.dyOut ?? 0),
      dx: (1 - pi) * (o.dxIn ?? 0) + po * (o.dxOut ?? 0),
      p: pi, q: po,
    };
  }
  function withFocus(c, st, cx, cy, fn) {
    if (st.alpha <= 0.002) return;
    c.save(); c.globalAlpha *= st.alpha;
    if (st.blur > 0.25) c.filter = `blur(${st.blur.toFixed(2)}px)`;
    c.translate(cx + st.dx, cy + st.dy); c.scale(st.scale, st.scale); c.translate(-cx, -cy);
    fn(c); c.restore();
  }
  function focusText(c, s, x, y, t, times, o = {}) {
    const st = focusState(t, times[0], times[1], times[2] ?? Infinity, times[3] ?? Infinity, o);
    withFocus(c, st, x, y - (o.size || 48) * 0.35, cc => text(cc, s, x, y, o));
  }
  // per-word staggered focus-in (RTL; words[0] is rightmost). returns total width
  function focusWords(c, words, x, y, t, t0, stagger, dur, tout0, tout1, o = {}) {
    const sp = measure(' ', o) * (o.spaceMul ?? 1);
    const ws = words.map((w, i) => measure(w, { ...o, ...(o.per?.[i] || {}) }));
    const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let cur = o.align === 'right' ? x : o.align === 'left' ? x + total : x + total / 2;
    words.forEach((w, i) => {
      const cx = cur - ws[i] / 2; cur -= ws[i] + sp;
      const a = t0 + i * stagger;
      focusText(c, w, cx, y, t, [a, a + dur, tout0 ?? Infinity, tout1 ?? Infinity], { ...o, ...(o.per?.[i] || {}), align: 'center' });
    });
    return total;
  }
  // strikethrough drawn across a span (rtl: from right to left)
  function strike(c, x0, x1, y, p, o = {}) {
    if (p <= 0) return;
    c.save(); c.strokeStyle = o.color || COL.ink; c.lineWidth = o.w || 8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y); c.lineTo(lerp(x1, x0, E.outExpo(p)), y + (o.tilt || 0) * p); c.stroke(); c.restore();
  }
  // dark pill label (reference list items)
  function pill(c, s, cx, cy, t, t0, o = {}) {
    const dur = o.dur ?? 0.35;
    const st = focusState(t, t0, t0 + dur, o.tout0 ?? Infinity, o.tout1 ?? Infinity, { blurIn: 14, scaleFrom: 1.06, dyIn: -26, ...o });
    const size = o.size || 34, padX = o.padX ?? 30, h = o.h ?? size * 1.9;
    const w = measure(s, { fam: o.fam || 'Plex', size, w: o.w || 600 }) + padX * 2;
    withFocus(c, st, cx, cy, cc => {
      cc.save();
      cc.shadowColor = 'rgba(20,16,10,0.28)'; cc.shadowBlur = 22; cc.shadowOffsetY = 10;
      cc.fillStyle = o.bg || COL.inkSoft; cc.beginPath(); cc.roundRect(cx - w / 2, cy - h / 2, w, h, o.r ?? 12); cc.fill();
      cc.restore();
      if (o.stroke) { cc.strokeStyle = o.stroke; cc.lineWidth = 1.5; cc.beginPath(); cc.roundRect(cx - w / 2 + 5, cy - h / 2 + 5, w - 10, h - 10, (o.r ?? 12) - 3); cc.stroke(); }
      text(cc, s, cx, cy + size * 0.36, { fam: o.fam || 'Plex', size, w: o.w || 600, color: o.color || COL.ivory });
    });
    return w;
  }

  /* ---------- images / objects ---------- */
  const IMG = {};
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; });
  // draw a (transparent) object image centred at x,y with height h; float + focus pull + contact shadow
  function object(c, img, x, y, h, t, times, o = {}) {
    if (!img) return;
    const st = focusState(t, times[0], times[1], times[2] ?? Infinity, times[3] ?? Infinity, { blurIn: 30, scaleFrom: 1.25, ...o });
    const w = h * img.width / img.height;
    const fl = o.float ?? 10, ph = o.phase ?? 0;
    const fy = Math.sin(t * 1.6 + ph) * fl, rot = (o.rot ?? 0) + Math.sin(t * 1.1 + ph) * (o.wobble ?? 0.012) + (1 - st.p) * (o.spin ?? 0);
    if (o.shadow !== false && st.alpha > 0) { // soft contact shadow on the paper
      c.save(); c.globalAlpha *= st.alpha * (o.shadowA ?? 0.32);
      const sw = w * (o.shadowW ?? 0.55) * (1 - fy / 200), sy = y + h * (o.shadowY ?? 0.48);
      const g = c.createRadialGradient(x, sy, 2, x, sy, sw); g.addColorStop(0, 'rgba(35,28,18,0.9)'); g.addColorStop(1, 'rgba(35,28,18,0)');
      c.fillStyle = g; c.scale(1, 0.16); c.beginPath(); c.arc(x, sy / 0.16, sw, 0, Math.PI * 2); c.fill(); c.restore();
    }
    withFocus(c, st, x, y, cc => { cc.translate(x, y + fy); cc.rotate(rot); cc.drawImage(img, -w / 2, -h / 2, w, h); });
  }

  // magnifier whose lens really magnifies whatever `content(c)` draws underneath.
  // meta = {cx, cy, r, size} of the lens in the source image; (x,y) = lens centre on screen; h = image height on screen
  function lens(c, img, meta, x, y, h, zoom, content, t, times, o = {}) {
    if (!img) return;
    const st = focusState(t, times[0], times[1], times[2] ?? Infinity, times[3] ?? Infinity, { blurIn: 24, scaleFrom: 1.2, ...o });
    if (st.alpha <= 0.002) return;
    const k = h / img.height, r = meta.r * k * st.scale;
    const lx = x + st.dx, ly = y + st.dy;
    c.save(); c.globalAlpha *= st.alpha;
    c.save(); c.beginPath(); c.arc(lx, ly, r * 0.97, 0, Math.PI * 2); c.clip();
    c.translate(lx, ly); c.scale(zoom, zoom); c.translate(-lx, -ly); content(c);
    c.restore();
    c.save(); c.beginPath(); c.arc(lx, ly, r, 0, Math.PI * 2); c.clip();
    const g = c.createRadialGradient(lx - r * 0.35, ly - r * 0.4, r * 0.05, lx, ly, r);
    g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.4, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(40,34,26,0.18)');
    c.fillStyle = g; c.fillRect(lx - r, ly - r, 2 * r, 2 * r); c.restore();
    if (st.blur > 0.25) c.filter = `blur(${st.blur.toFixed(2)}px)`;
    c.shadowColor = 'rgba(25,20,12,0.35)'; c.shadowBlur = 40; c.shadowOffsetX = 18; c.shadowOffsetY = 30;
    c.translate(lx, ly); c.scale(st.scale, st.scale); c.rotate(o.rot || 0);
    c.drawImage(img, -meta.cx * k, -meta.cy * k, img.width * k, img.height * k);
    c.restore();
  }
  // palm-frond silhouettes in two corners (reference corner-foliage language, Saudi twist)
  function palms(c, img, t, a = 1) {
    if (!img) return;
    c.save(); c.globalAlpha *= a * 0.9;
    const s = 560, sway = Math.sin(t * 0.9) * 0.02;
    c.save(); c.translate(-40, -60); c.rotate(-0.15 + sway); c.drawImage(img, -s * 0.25, -s * 0.2, s, s); c.restore();
    c.save(); c.globalAlpha *= 0.55; c.filter = 'blur(3px)'; c.translate(W + 30, H + 40); c.rotate(Math.PI - 0.1 - sway); c.drawImage(img, -s * 0.25, -s * 0.2, s * 0.8, s * 0.8); c.restore();
    c.restore();
  }

  /* ---------- page ---------- */
  let PAPER = null, GRID = null, GRAIN = [];
  function buildPaper(kind = 'ivory') {
    const cv = mk(W, H), g = cv.getContext('2d');
    const bg = g.createRadialGradient(W / 2, H * 0.46, H * 0.12, W / 2, H * 0.5, H * 0.72);
    bg.addColorStop(0, COL.ivory); bg.addColorStop(0.62, COL.cream); bg.addColorStop(1, '#CFC7B6');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // faint paper fibre noise
    const id = g.getImageData(0, 0, W, H), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (h2(i >> 2, 7) - 0.5) * 7; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
    g.putImageData(id, 0, 0);
    return cv;
  }
  function buildGrid() {
    const cv = mk(W, H), g = cv.getContext('2d'); g.strokeStyle = 'rgba(150,140,120,0.16)'; g.lineWidth = 1;
    for (let x = 60; x < W; x += 120) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 60; y < H; y += 120) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    const m = g.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.6);
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = m; g.fillRect(0, 0, W, H);
    return cv;
  }
  function buildGrain() {
    for (let k = 0; k < 5; k++) {
      const cv = mk(540, 960), g = cv.getContext('2d'), id = g.createImageData(540, 960);
      for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (h2(i >> 2, k * 3 + 11) - 0.5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      g.putImageData(id, 0, 0); GRAIN.push(cv);
    }
  }
  function page(c, o = {}) {
    c.drawImage(PAPER, 0, 0);
    if (o.grid !== false) { c.save(); c.globalAlpha = o.gridA ?? 1; c.drawImage(GRID, 0, 0); c.restore(); }
    if (o.header !== false) header(c, o.headerA ?? 1);
  }
  function header(c, a = 1) {
    c.save(); c.globalAlpha *= a;
    text(c, 'FILMX', W / 2, 138, { fam: 'PlexLatin', w: 500, size: 38, color: COL.ink, dir: 'ltr', ls: '11px' });
    c.fillStyle = COL.gold; c.fillRect(W / 2 - 60, 158, 120, 2);
    text(c, 'العناية الفاخرة وتخصيص السيارات', W / 2, 192, { fam: 'Plex', w: 500, size: 21, color: COL.gold });
    c.restore();
  }
  function post(c, t, o = {}) {
    // vignette + grain
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.34, W / 2, H / 2, H * 0.8);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, o.dark ? 'rgba(90,80,70,1)' : 'rgba(196,186,166,1)');
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = o.grain ?? 0.06;
    const f = Math.floor(t * 30); c.drawImage(GRAIN[f % GRAIN.length], -h2(f, 1) * 40, -h2(f, 2) * 40, W + 80, H + 80); c.restore();
  }
  // dark end card with the FILMX wordmark (reference end-card language, FILMX identity)
  function endCard(c, t, t0, o = {}) {
    const p = prog(t, t0, t0 + 0.5);
    if (p <= 0) return;
    c.save(); c.globalAlpha = E.outC(p);
    const g = c.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.5, H * 0.7); g.addColorStop(0, '#2B2925'); g.addColorStop(1, '#0F0E0C');
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    const letters = [...'FILMX'], size = o.size || 150, ls = size * 0.3;
    const lw = letters.map(ch => measure(ch, { fam: 'PlexLatin', w: 500, size, dir: 'ltr' }));
    const total = lw.reduce((a, b) => a + b, 0) + ls * (letters.length - 1);
    let x = W / 2 - total / 2; const y = o.y || H * 0.47;
    letters.forEach((ch, i) => {
      const a = t0 + 0.2 + i * 0.06;
      focusText(c, ch, x + lw[i] / 2, y, t, [a, a + 0.45], { fam: 'PlexLatin', w: 500, size, dir: 'ltr', color: COL.ivory, blurIn: 26, scaleFrom: 1.3 });
      x += lw[i] + ls;
    });
    const hp = E.ioC(prog(t, t0 + 0.55, t0 + 1.0));
    c.fillStyle = COL.goldL; c.fillRect(W / 2 - 150 * hp, y + 50, 300 * hp, 2);
    focusText(c, o.tagline || 'العناية الفاخرة وتخصيص السيارات', W / 2, y + 112, t, [t0 + 0.7, t0 + 1.15], { fam: 'Plex', w: 500, size: 40, color: COL.goldL });
    if (o.sub) focusText(c, o.sub, W / 2, y + 180, t, [t0 + 0.9, t0 + 1.35], { fam: 'Plex', w: 500, size: 30, color: 'rgba(251,250,247,0.7)' });
  }

  /* ---------- clips (image sequences) ---------- */
  const frameCache = new Map();
  async function preloadClipFrames(P, t) {
    if (!P.clips) return;
    const jobs = [];
    for (const [k, cl] of Object.entries(P.clips)) {
      const idx = clipIdx(cl, t);
      if (idx == null) continue;
      const key = k + ':' + idx;
      if (!frameCache.has(key)) jobs.push(loadImg(`${cl.path}/${String(idx).padStart(4, '0')}.jpg`).then(img => { frameCache.set(key, img); if (frameCache.size > 40) frameCache.delete(frameCache.keys().next().value); }));
    }
    await Promise.all(jobs);
  }
  function clipIdx(cl, t) {
    if (t < (cl.start ?? 0) - 0.5 || t > (cl.end ?? 999) + 0.5) return null;
    const ct = (cl.off ?? 0) + Math.max(0, t - (cl.start ?? 0)) * (cl.speed ?? 1);
    return Math.min(cl.frames, Math.max(1, Math.floor(ct * cl.fps) + 1));
  }
  const clipFrame = (P, k, t) => frameCache.get(k + ':' + clipIdx(P.clips[k], t)) || null;
  function coverDraw(c, img, x, y, w, h, fx = 0.5, fy = 0.5, zoom = 1) {
    const ir = img.width / img.height, r = w / h; let dw, dh;
    if (ir > r) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
    dw *= zoom; dh *= zoom; c.drawImage(img, x - (dw - w) * fx, y - (dh - h) * fy, dw, dh);
  }

  /* ---------- runtime ---------- */
  let stage;
  async function init() {
    const P = window.PROTO;
    stage = document.getElementById('stage').getContext('2d');
    const fams = ['500 40px Plex', '600 40px Plex', '700 40px Plex', '400 40px Plex', '500 40px PlexLatin', '700 40px Ruqaa', '700 40px Amiri', '700 40px Cormorant', '600 40px Cormorant'];
    await Promise.all(fams.map(f => document.fonts.load(f, /Latin|Cormorant/.test(f) ? 'FILMX PPF 0123' : 'أصلي ١٢٣')));
    await document.fonts.ready;
    PAPER = buildPaper(); GRID = buildGrid(); buildGrain();
    await Promise.all(Object.entries(P.assets || {}).map(async ([k, src]) => { IMG[k] = await loadImg(src); }));
    if (P.init) await P.init();
    window.READY = true;
  }
  async function renderFrame(t) {
    const P = window.PROTO;
    await preloadClipFrames(P, t);
    stage.save(); stage.clearRect(0, 0, W, H);
    P.draw(stage, t);
    stage.restore();
    return true;
  }
  window.renderFrame = renderFrame;
  window.addEventListener('load', () => { window.initPromise = init(); });
  return { W, H, COL, clamp, lerp, prog, E, h2, vnoise, mk, measure, text, focusState, withFocus, focusText, focusWords, strike, pill, IMG, object, lens, palms, page, header, post, endCard, clipFrame, coverDraw, loadImg };
})();
