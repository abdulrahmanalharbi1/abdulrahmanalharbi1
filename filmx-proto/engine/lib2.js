/* lib2 — reference-accurate layer on top of lib.js, built from the measured analysis
 * (filmx-ref/analysis/{motion,design,audio,narrative}.md):
 * stage (paper + masked dashed grid + vignette), world layer with camera creep / rack-focus / whip,
 * HUD (locked header + swaying palm fan + blurred echo), blur-resolve text, unfolding pills,
 * linear ink strikethrough, RTL typewriter, gold burn into the dark end card. */
'use strict';
(() => {
  const { W, H, COL, clamp, lerp, prog, E, mk, measure, text, IMG, h2 } = FX;
  const INK = '#1C1B18';
  const GREY_GRAD = [[0, '#615D57'], [1, '#9A958D']]; // warm version of the measured #5E5E5E→#969696 hero gradient
  let PAPER = null, GRID = null;
  function buildPaper() {
    const cv = mk(W, H), g = cv.getContext('2d');
    g.fillStyle = '#FCFAF4'; g.fillRect(0, 0, W, H);
    // elliptical vignette fitted to the reference luminance table: corners ~208, sides ~223, centre ~252
    g.save(); g.translate(540, 960); g.scale(1, 2.2);
    const v = g.createRadialGradient(0, 0, 350, 0, 0, 600);
    v.addColorStop(0, 'rgba(60,50,38,0)'); v.addColorStop(1, 'rgba(60,50,38,0.25)');
    g.fillStyle = v; g.fillRect(-540, -440, 1080, 880); g.restore();
    return cv;
  }
  function buildGrid() { // dashed architectural grid: 140px cells centred on x=540, 18 on / 13 off, 2px; visible only in an oval
    const gc = mk(W, H), gg = gc.getContext('2d');
    gg.strokeStyle = '#D6D2C8'; gg.lineWidth = 2; gg.setLineDash([18, 13]);
    for (let x = 540 - 70 - 140 * 3; x <= W; x += 140) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, H); gg.stroke(); }
    for (let y = 963 - 140 * 6; y <= H; y += 140) { gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
    gg.setLineDash([]); gg.globalCompositeOperation = 'destination-in';
    gg.save(); gg.translate(540, 905); gg.scale(380 / 415, 1);
    const m = gg.createRadialGradient(0, 0, 60, 0, 0, 415); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.6, 'rgba(0,0,0,0.8)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    gg.fillStyle = m; gg.fillRect(-600, -600, 1200, 1200); gg.restore();
    return gc;
  }
  // stage(c, blur, zoom): paper + vignette locked; the grid refocuses with the shot and zooms at 0.45x the camera rate
  function stage(c, blur = 0, zoom = 1) {
    if (!PAPER) { PAPER = buildPaper(); GRID = buildGrid(); }
    c.drawImage(PAPER, 0, 0);
    const gz = 1 + (zoom - 1) * 0.45;
    c.save(); if (blur > 0.3) c.filter = `blur(${blur.toFixed(2)}px)`;
    c.translate(540, 905); c.scale(gz, gz); c.translate(-540, -905); c.drawImage(GRID, 0, 0); c.restore();
  }

  // world layer: everything that the virtual camera sees (text + objects), composited with camera + blur
  const WORLD = mk(W, H).getContext('2d'), ACC = mk(W, H).getContext('2d');
  function world(c, cam, fn) {
    const w = WORLD; w.save(); w.setTransform(1, 0, 0, 1, 0, 0); w.clearRect(0, 0, W, H);
    const z = cam.zoom ?? 1, px = cam.px ?? W / 2, py = cam.py ?? H * 0.45;
    w.translate(px + (cam.dx || 0), py + (cam.dy || 0)); w.rotate(cam.rot || 0); w.scale(z, z); w.translate(-px, -py);
    fn(w); w.restore();
    c.save();
    const blur = cam.blur || 0, mb = cam.motionBlur || 0;
    if (mb > 0.5) { // vertical motion blur for the whip: stacked offset copies
      // true vertical-only Gaussian (normalised, keeps opacity): SVG feGaussianBlur stdDeviation="0 σ"
      document.getElementById('vmbG').setAttribute('stdDeviation', `0 ${(mb / 3).toFixed(1)}`);
      c.filter = 'url(#vmb)'; c.drawImage(WORLD.canvas, 0, 0); c.filter = 'none';
    } else {
      if (blur > 0.3) c.filter = `blur(${blur.toFixed(2)}px)`;
      c.globalAlpha = cam.alpha ?? 1;
      c.drawImage(WORLD.canvas, 0, 0);
    }
    c.restore();
  }
  // rack-focus cut: 0→17px over 0.15s before the cut, 17→0 over 0.18s after
  function rack(t, cuts, peak = 17) {
    let b = 0;
    for (const tc of cuts) {
      if (t >= tc - 0.15 && t < tc) b = Math.max(b, peak * E.inQ(prog(t, tc - 0.15, tc - 1 / 30)));
      if (t >= tc && t < tc + 0.18) b = Math.max(b, peak * (1 - E.outC(prog(t, tc, tc + 0.18))));
    }
    return b;
  }
  // whip: outgoing accelerates up (tc-0.25..tc) with roll + motion blur; incoming rises from +37%H and settles by tc+0.75
  function whip(t, tc) {
    if (t < tc - 0.25 || t > tc + 0.75) return null;
    if (t < tc) { const p = E.inC(prog(t, tc - 0.25, tc)); return { side: 'out', dy: -p * H * 0.55, rot: -p * 0.14, motionBlur: p * 220 }; }
    const p = E.outExpo(prog(t, tc, tc + 0.75)); return { side: 'in', dy: (1 - p) * H * 0.37, rot: (1 - p) * 0.05, motionBlur: (1 - p) * 180 };
  }
  // camera creep: push-in `rate` (fraction per second) from t0
  const creep = (t, t0, rate = 0.03) => 1 + Math.max(0, t - t0) * rate;

  // HUD: palm fan (sharp, swaying) top-left, blurred palm bottom-right, locked header
  function hud(c, t, o = {}) {
    const pal = IMG.palm;
    if (pal && o.palms !== false) {
      const sway = Math.sin(t * (2 * Math.PI / 5)) * 0.045;
      c.save(); c.globalAlpha = 0.95; c.filter = 'brightness(0.18)';
      c.translate(-30, -40); c.rotate(-0.25 + sway); c.drawImage(pal, -120, -120, 470, 470); c.restore();
      c.save(); c.globalAlpha = 0.55; c.filter = 'blur(12px) brightness(0.25)';
      c.translate(W + 60, H - 10); c.rotate(Math.PI * 0.92 - sway * 0.6); c.drawImage(pal, -90, -90, 360, 360); c.restore();
    }
    if (o.header !== false) {
      c.save(); c.globalAlpha = o.headerA ?? 1;
      text(c, 'FILMX', W / 2, 172, { fam: 'PlexLatin', w: 500, size: 66, color: INK, dir: 'ltr', ls: '20px' });
      c.fillStyle = COL.gold; c.fillRect(W / 2 - 70, 196, 140, 2);
      text(c, 'العناية الفاخرة وتخصيص السيارات', W / 2, 232, { fam: 'Plex', w: 400, size: 22, color: '#6B665D' });
      c.restore();
    }
  }
  // blurred echo of the hero object in an upper corner (depth plane)
  function echo(c, img, x, y, h, a = 0.5, rot = 0) {
    if (!img) return; const w = h * img.width / img.height;
    c.save(); c.globalAlpha = a; c.filter = 'blur(13px)'; c.translate(x, y); c.rotate(rot); c.drawImage(img, -w / 2, -h / 2, w, h); c.restore();
  }

  // blur-resolve text: blur 48→0 (exp decay), opacity linear, optional rise 2.5%H. dur ~0.2–0.42s
  function resolve(c, s, x, y, t, t0, o = {}) {
    const dur = o.dur ?? 0.3, p = prog(t, t0, t0 + dur);
    const q = o.out != null ? prog(t, o.out, o.out + (o.outDur ?? 0.15)) : 0;
    if (p <= 0 || q >= 1) return;
    const blur = 48 * Math.pow(1 - p, 2.2) + q * 17, a = Math.min(1, p * 1.15) * (1 - q * 0.1);
    const rise = (o.rise ?? 0.025 * H) * (1 - E.outC(p));
    c.save(); c.globalAlpha *= a; if (blur > 0.3) c.filter = `blur(${blur.toFixed(2)}px)`;
    text(c, s, x, y + rise, { fam: 'Plex', w: 700, ...o });
    c.restore();
  }
  const grey = (o = {}) => ({ grad: GREY_GRAD, ...o });

  // pill that unfolds from a 1px line at 14% width (easeOutBack ~+13.7%, settled ~0.45s); height lags width
  function pillUnfold(c, s, cx, cy, t, t0, o = {}) {
    const size = o.size || 42, h = o.h || 78, padX = o.padX ?? 30;
    const tw = measure(s, { fam: o.fam || 'Plex', w: o.w || 600, size, dir: o.dir, ls: o.ls }) + (o.tick ? 58 : 0);
    const w = tw + padX * 2;
    const pw = prog(t, t0, t0 + 0.45), ph = prog(t, t0 + 0.05, t0 + 0.5);
    if (pw <= 0) return w;
    const ew = lerp(0.14, 1, E.outBack(pw, 2.6)), eh = Math.max(1 / h, E.outBack(ph, 2.2));
    const rise = (1 - E.outC(pw)) * 10;
    c.save(); c.translate(cx, cy + rise);
    const ww = w * ew, hh = h * eh;
    c.shadowColor = 'rgba(25,20,12,0.25)'; c.shadowBlur = 24; c.shadowOffsetY = 6;
    c.fillStyle = o.bg || '#2B2926'; c.beginPath(); c.roundRect(-ww / 2, -hh / 2, ww, hh, Math.min(10, hh / 2)); c.fill();
    c.shadowColor = 'transparent';
    if (o.gold && hh > 16) { c.save(); c.globalAlpha *= clamp((hh - 16) / 30); c.strokeStyle = COL.goldL; c.lineWidth = 1.5; c.beginPath(); c.roundRect(-ww / 2 + 5, -hh / 2 + 5, ww - 10, hh - 10, Math.min(7, hh / 2)); c.stroke(); c.restore(); }
    const tp = prog(t, t0 + 0.12, t0 + 0.4);
    if (tp > 0 && eh > 0.6) {
      c.beginPath(); c.rect(-ww / 2, -hh / 2, ww, hh); c.clip();
      c.globalAlpha *= tp; c.filter = `blur(${(6 * (1 - tp)).toFixed(2)}px)`;
      const tx = o.tick ? 29 : 0;
      text(c, s, tx, size * 0.36, { fam: o.fam || 'Plex', w: o.w || 600, size, dir: o.dir, ls: o.ls, color: o.color || '#EDE9E0' });
      if (o.tick) { // gold tick at the left end (RTL: end of the line)
        c.filter = 'none'; c.strokeStyle = o.gold ? COL.goldL : '#EDE9E0'; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
        const x0 = -tw / 2 + 4; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + 9, 10); c.lineTo(x0 + 28, -12); c.stroke();
      }
    }
    c.restore();
    return w;
  }
  // linear ink strikethrough: 0.13em thick at mid-cap height, overhang 0.35em, constant speed, RTL
  function strikeWord(c, xRight, xLeft, yBase, size, t, t0, dur = 0.6, color = INK) {
    const p = prog(t, t0, t0 + dur); if (p <= 0) return;
    const over = size * 0.35, y = yBase - size * 0.36, th = size * 0.13;
    const x1 = xRight + over, x0 = xLeft - over;
    c.save(); c.fillStyle = color; c.fillRect(lerp(x1, x0, p), y - th / 2, (x1 - x0) * p, th); c.restore();
  }
  // RTL typewriter: ~29 cps, blinking block cursor at the writing (left) edge
  function typeOn(c, s, x, y, t, t0, o = {}) {
    const cps = o.cps ?? 29, chars = [...s], n = Math.min(chars.length, Math.max(0, Math.floor((t - t0) * cps)));
    if (t < t0) return;
    const sub = chars.slice(0, n).join('');
    const size = o.size || 64, oo = { fam: 'Plex', w: 500, size, color: INK, ...o };
    const full = measure(s, oo), cur = measure(sub, oo);
    const right = x + full / 2; // anchor so the finished line is centred
    if (n > 0) text(c, sub, right, y, { ...oo, align: 'right' });
    const blink = n < chars.length && Math.floor((t - t0) * 12) % 2 === 0;
    if (blink && (o.cursorUntil == null || t < o.cursorUntil)) { c.fillStyle = o.cursorColor || COL.goldL; c.fillRect(right - cur - 10 - size * 0.5, y - size * 0.62, size * 0.5, size * 0.5); }
  }
  // warm gold light-leak burn (only colour moment): edges creep in, flash, gold wash → charcoal
  function goldBurn(c, t, t0) {
    // phase 1: amber light leak creeps in from the edges (multiply tint + warm screen glow, reads on ivory paper);
    // phase 2: warm white flash; phase 3: gold wash thins out over whatever is drawn underneath (the end card).
    const p = prog(t, t0, t0 + 0.9); if (p <= 0 || p >= 1) return;
    c.save();
    if (p < 0.45) { const q = E.inQ(p / 0.45);
      const g = c.createRadialGradient(W / 2, H / 2, H * (0.62 - 0.5 * q), W / 2, H / 2, H * 0.8);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(214,160,86,${0.55 * q})`); g.addColorStop(1, `rgba(150,96,40,${0.95 * q})`);
      c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,214,140,${0.35 * q})`; c.fillRect(0, 0, W, H); }
    else if (p < 0.52) { c.fillStyle = 'rgba(255,246,226,0.96)'; c.fillRect(0, 0, W, H); }
    else { const q = (p - 0.52) / 0.48; c.fillStyle = `rgba(201,160,96,${Math.pow(1 - q, 1.6)})`; c.fillRect(0, 0, W, H); }
    c.restore();
  }
  const SIL = new Map();
  function silhouette(img) { if (!SIL.has(img)) { const cv = mk(Math.min(img.width, 900), Math.round(Math.min(img.width, 900) * img.height / img.width)), g = cv.getContext('2d'); g.drawImage(img, 0, 0, cv.width, cv.height); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#1E1810'; g.fillRect(0, 0, cv.width, cv.height); SIL.set(img, cv); } return SIL.get(img); }
  // object with the measured two-layer shadow (tight contact + wide soft drop right/down)
  function hero(c, img, x, y, h, t, t0, o = {}) {
    if (!img) return;
    const w = h * img.width / img.height;
    const dur = o.dur ?? 2.4, p = prog(t, t0, t0 + dur), e = E[o.ease || 'outExpo'](p);
    if (p <= 0) return;
    const fx = lerp(o.fromX ?? x, x, e) + (o.drift || 0) * (t - t0), fy = lerp(o.fromY ?? y, y, e);
    const rot = lerp(o.fromRot ?? (o.rot || 0), o.rot || 0, e) + (o.spin || 0) * (t - t0);
    const s = lerp(o.fromScale ?? 1, 1, e) * (1 + (o.lev || 0) * (t - t0));
    const blur = (o.blurIn ?? 0) * (1 - e);
    c.save();
    if (o.shadow !== false) { // silhouette shadows: wide soft drop (+30,+38, blur ~40) and a tighter core (+6,+12, blur 8)
      const sil = silhouette(img), sa = o.shadowA ?? 1;
      for (const [ox, oy, b, a] of [[30, 38, 40, 0.28], [6, 12, 8, 0.34]]) {
        c.save(); c.globalAlpha *= a * sa; c.filter = `blur(${b}px)`;
        c.translate(fx + ox, fy + oy); c.rotate(rot); c.scale(s, s); c.drawImage(sil, -w / 2, -h / 2, w, h); c.restore();
      }
    }
    { const f = (blur > 0.3 ? `blur(${blur.toFixed(2)}px) ` : '') + (o.mono ? 'grayscale(1)' : ''); if (f) c.filter = f; }
    c.translate(fx, fy); c.rotate(rot); c.scale(s, s); c.drawImage(img, -w / 2, -h / 2, w, h);
    if (o.overlay) { c.filter = 'none'; c.translate(-w / 2, -h / 2); c.scale(w / img.width, h / img.height); o.overlay(c, p); } // overlay draws in image-pixel coords
    c.restore();
  }
  // dark CTA end card (reference end-card language, FILMX identity): charcoal + faint swirl, wordmark writes on
  // letter by letter, gold hairline, Arabic positioning line, then CTA rows (resolve), slow pull-back, optional fade to black.
  function ctaCard(c, t, t0, o = {}) {
    const p = prog(t, t0, t0 + 0.25); if (p <= 0) return;
    c.save(); c.globalAlpha = E.outC(p);
    const g = c.createRadialGradient(W / 2, H * 0.44, 30, W / 2, H * 0.5, H * 0.75); g.addColorStop(0, '#2A2825'); g.addColorStop(1, '#121110');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,0.025)'; c.lineWidth = 2;
    for (let r = 120; r < 1400; r += 70) { c.beginPath(); c.arc(W / 2, H * 0.46, r + Math.sin(r * 0.01 + t * 0.3) * 6, 0, Math.PI * 2); c.stroke(); }
    c.restore();
    const k = Math.max(0, t - t0), z = 1.06 - Math.min(0.06, k * 0.025);
    c.save(); c.translate(W / 2, H * 0.46); c.scale(z, z); c.translate(-W / 2, -H * 0.46);
    const letters = [...'FILMX'], size = 150, ls = 46, y = o.y || 800;
    const lw = letters.map(ch => measure(ch, { fam: 'PlexLatin', w: 500, size, dir: 'ltr' }));
    const total = lw.reduce((a2, b2) => a2 + b2, 0) + ls * (letters.length - 1);
    let x = W / 2 - total / 2;
    letters.forEach((ch, i) => { resolve(c, ch, x + lw[i] / 2, y, t, t0 + 0.15 + i * 0.07 + (h2(i, 7) - 0.5) * 0.04, { fam: 'PlexLatin', w: 500, size, dir: 'ltr', color: '#F4F1EA', dur: 0.32, rise: 0 }); x += lw[i] + ls; });
    const hp = E.ioC(prog(t, t0 + 0.7, t0 + 1.2));
    if (hp > 0) { c.fillStyle = COL.goldL; c.fillRect(W / 2 - 160 * hp, y + 52, 320 * hp, 2); }
    resolve(c, o.tagline || 'دار حماية السيارات الفاخرة في الرياض', W / 2, y + 124, t, o.taglineAt ?? t0 + 0.85, { size: o.taglineSize || 44, w: 500, color: '#D9D4CA', dur: 0.3, rise: 12 });
    let ry = y + 250;
    (o.rows || []).forEach((r, i) => { const at = r.at ?? (o.rowsAt ?? t0 + 1.25) + i * 0.22;
      resolve(c, r.text, W / 2, ry + (r.dy || 0), t, at, { fam: r.fam || 'Plex', size: r.size || 40, w: r.w || 500, color: r.color || '#BDB7AB', dir: r.dir || 'rtl', ls: r.ls, dur: 0.28, rise: 10 });
      ry += r.gap || 78; });
    c.restore();
    if (o.fadeOut) { const q = prog(t, o.fadeOut[0], o.fadeOut[1]); if (q > 0) { c.fillStyle = `rgba(0,0,0,${q})`; c.fillRect(0, 0, W, H); } }
  }
  Object.assign(FX, { INK, GREY_GRAD, stage, world, rack, whip, creep, hud, echo, resolve, grey, pillUnfold, strikeWord, typeOn, goldBurn, hero, ctaCard });
})();
