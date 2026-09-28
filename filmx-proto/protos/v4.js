// V4 — «الأصلي من المغشوش» (≈95 s). Built on the approved P4 prototype, driven by the Ken VO (ElevenLabs, Saudi male).
// Hook: presenter column (placeholder silhouette until the client's photo arrives) → status-quo montage
// → typewriter pivot (the one still frame) → framework «٤ أشياء» → four tests (thickness, self-healing, colour, warranty)
// → whip (act break) → FILMX's answers: brands, packages, pledge, registered warranty, 30-day install warranty,
// free transport → services montage → gold burn → dark CTA card.
// Wording follows filmx.capital (re-verified 2026-09-28): no prices/ranges; XPEL named first; no XPEL-authorization claims;
// Ravoony only as «أفلام Ravoony الأصلية»; refund clause dropped (conditional policy).
(() => {
  const V = { v4_01: 0.25, v4_02: 3.32, v4_03: 6.52, v4_04: 8.46, v4_05: 11.24, v4_06: 17.03, v4_07: 24.97, v4_08: 32.82,
    v4_11: 38.86, v4_12: 41.28, v4_13: 44.58, v4_14: 54.33, v4_15: 65.47, v4_16: 75.22, v4_17: 86.54 };
  const at = (k, s) => V[k] + s; // absolute time of a word (offsets from Whisper word timings)
  const TB = at('v4_17', -0.53), TC = TB + 0.45, DUR = 94.9;
  const { W, H, IMG, INK, COL, E, prog, clamp, lerp, h2, resolve, grey, pillUnfold, typeOn, hero, text, measure, strikeWord,
    goldBurn, ctaCard, glint, scratch, badge, filmBar, sequence } = FX;
  const LEAD = { size: 62, w: 500, color: '#5F5D59', dur: 0.26 };
  const INKL = (size = 64) => ({ size, w: 600, color: INK, dur: 0.28 });
  const sine01 = (t, t0, d) => Math.sin(clamp((t - t0) / d) * Math.PI);
  const fit = (s, size, maxW = 880) => Math.min(size, size * maxW / measure(s, { fam: 'Plex', w: 700, size })); // mega words never clip

  // engraved text on the black metal card (face corners measured in the 2048x1360 render → affine 1000 x 630 card space)
  const cardText = (t, t0, lines) => (cc) => {
    const tp = prog(t, t0, t0 + 0.4); if (tp <= 0) return;
    const TLc = [347, 404], TRc = [1511, 168], BLc = [590, 1175];
    cc.transform((TRc[0] - TLc[0]) / 1000, (TRc[1] - TLc[1]) / 1000, (BLc[0] - TLc[0]) / 630, (BLc[1] - TLc[1]) / 630, TLc[0], TLc[1]);
    cc.globalAlpha *= tp; cc.filter = `blur(${(6 * (1 - tp)).toFixed(1)}px)`;
    lines.forEach(([s, y, size, col, wt]) => text(cc, s, 770, y, { fam: 'Plex', w: wt || 600, size, color: col, align: 'right' }));
    text(cc, 'FILMX', 80, 560, { fam: 'PlexLatin', w: 500, size: 46, color: COL.goldL, dir: 'ltr', align: 'left', ls: '12px' });
  };
  // test header: numbered badge + grey topic word
  const testHead = (w, t, n, word, t0, tw, size = 210) => {
    badge(w, n, W / 2, 420, t, t0, { r: 44 });
    resolve(w, { '١': 'أول شي', '٢': 'ثاني شي', '٣': 'ثالث شي', '٤': 'رابع شي' }[n], W / 2, 540, t, t0 + 0.04, { ...LEAD, size: 66, color: INK });
    resolve(w, word, W / 2, 720, t, tw, grey({ size: fit(word, size), w: 700, dur: 0.34 }));
  };
  // dimension marker (thickness gauge) at x: two small arrows pointing at the film's top and bottom edges
  function gauge(w, x, yTop, yBot, a, col = INK) {
    if (a <= 0) return; w.save(); w.globalAlpha *= a; w.strokeStyle = col; w.fillStyle = col; w.lineWidth = 3;
    for (const [y, d] of [[yTop, -1], [yBot, 1]]) {
      w.beginPath(); w.moveTo(x, y + d * 46); w.lineTo(x, y + d * 6); w.stroke();
      w.beginPath(); w.moveTo(x, y + d * 2); w.lineTo(x - 9, y + d * 16); w.lineTo(x + 9, y + d * 16); w.closePath(); w.fill();
    }
    w.restore();
  }
  // outlined speech bubble with three dots; draws on, then dissolves (blur + fade) — «مجرد كلام»
  function bubble(w, x, y, t, t0, tOut) {
    const p = E.outC(prog(t, t0, t0 + 0.5)), q = prog(t, tOut, tOut + 0.6); if (p <= 0 || q >= 1) return;
    w.save(); w.globalAlpha *= 1 - q; if (q > 0) w.filter = `blur(${(q * 14).toFixed(1)}px)`;
    w.translate(x, y - q * 40); w.strokeStyle = '#6E6A62'; w.lineWidth = 6; w.lineJoin = 'round'; w.setLineDash([900 * p, 2000]);
    w.beginPath(); w.ellipse(0, 0, 190, 130, 0, 0.62 * Math.PI, 2.38 * Math.PI); w.lineTo(-150, 160); w.closePath(); w.stroke();
    w.setLineDash([]); w.fillStyle = '#6E6A62';
    for (let i = 0; i < 3; i++) { const d = prog(t, t0 + 0.35 + i * 0.12, t0 + 0.5 + i * 0.12); if (d > 0) { w.beginPath(); w.arc(-60 + i * 60, 5, 15 * E.outBack(d, 2), 0, Math.PI * 2); w.fill(); } }
    w.restore();
  }
  // white car-paint swatch under film that yellows and shrinks with age k (0..1)
  function agingPanel(w, x, y, pw, ph, t, t0, k) {
    const p = E.outExpo(prog(t, t0, t0 + 0.8)); if (p <= 0) return;
    w.save(); w.translate(x, y + (1 - p) * 300); w.globalAlpha *= p; w.rotate(-0.03);
    w.shadowColor = 'rgba(25,20,12,0.28)'; w.shadowBlur = 40; w.shadowOffsetX = 18; w.shadowOffsetY = 26;
    const g = w.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.55, '#ECEAE5'); g.addColorStop(1, '#D4D1CA');
    w.fillStyle = g; w.beginPath(); w.roundRect(-pw / 2, -ph / 2, pw, ph, 26); w.fill(); w.shadowColor = 'transparent';
    const ins = 10 + 22 * k; // film retracts from the edges as it shrinks, leaving a dirt line
    w.strokeStyle = `rgba(90,80,60,${0.5 * k})`; w.lineWidth = 3; w.beginPath(); w.roundRect(-pw / 2 + ins - 3, -ph / 2 + ins - 3, pw - 2 * ins + 6, ph - 2 * ins + 6, 20); w.stroke();
    w.fillStyle = `rgba(214,178,70,${0.08 + 0.5 * k})`; w.beginPath(); w.roundRect(-pw / 2 + ins, -ph / 2 + ins, pw - 2 * ins, ph - 2 * ins, 18); w.fill();
    const sh = w.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.42, `rgba(255,255,255,${0.7 - 0.5 * k})`); sh.addColorStop(0.5, 'rgba(255,255,255,0)');
    w.fillStyle = sh; w.fillRect(-pw / 2 + ins, -ph / 2 + ins, pw - 2 * ins, ph - 2 * ins);
    w.restore();
  }

  const BEATS = [
    // ---------------- hook: presenter column
    { t0: 0, zoom: 0.025, px: W * 0.7, draw: (w, t) => {
      const hp = E.outExpo(prog(t, 0.0, 1.2));
      w.save(); w.globalAlpha *= hp; w.fillStyle = '#DDD8CE'; w.beginPath(); w.arc(330, 1120, 300, 0, Math.PI * 2); w.fill(); w.restore();
      hero(w, IMG.sil, 250, 1290, 1150, t, -0.05, { fromX: -420, dur: 2.4, shadowA: 0.5 });
      resolve(w, 'أغلب سوالف', 990, 600, t, at('v4_01', -0.05), { ...LEAD, align: 'right' });
      resolve(w, 'الحماية', 990, 830, t, at('v4_01', 0.9), grey({ size: 210, w: 700, dur: 0.34, align: 'right' }));
      resolve(w, 'تبدأ من هنا:', 990, 965, t, at('v4_01', 1.78), { size: 86, w: 700, color: INK, dur: 0.28, align: 'right' });
    } },
    // ---------------- status-quo montage (one noun, one object)
    ...[['السعر', 'tag', { fromX: 1350, fromY: 1500, fromRot: 1.0 }, 560, 1150, 720, 0.35, -0.06],
      ['اللمعة', 'tile', { fromX: -300, fromY: 1250, fromRot: -0.8 }, 540, 1180, 640, -0.06, 1.0],
      ['السرعة', 'watch', { fromY: 2300, fromRot: 0.6 }, 545, 1170, 720, -0.12, 2.05]].map(([word, img, from, x, y, h, rot, off], i) => ({
      t0: at('v4_02', i === 0 ? -0.05 : off), zoom: 0.045, draw: (w, t, b) => {
        resolve(w, word, W / 2, 560, t, b.t0 - 0.04, { size: 124, w: 700, color: INK, dur: 0.26 });
        hero(w, IMG[img], x, y, h, t, b.t0 - 0.03, { ...from, rot, dur: 2.3 });
        if (img === 'tile') glint(w, x + 190, y - 190, sine01(t, b.t0, 0.8), 1.4);
      } })),
    // ---------------- pivot: typewriter, the one still frame
    { t0: at('v4_03', -0.06), cut: 'hard', zoom: 0, palmsFreeze: at('v4_03', -0.06), draw: (w, t) => {
      typeOn(w, 'بس قبل ما تركّب…', W / 2, 905, t, at('v4_03', 0.0), { size: 92, w: 600, cps: 24 });
    } },
    // ---------------- framework: 4 things
    { t0: at('v4_04', -0.05), cut: 'hard', zoom: 0.03, draw: (w, t) => {
      resolve(w, 'فيه', W / 2, 560, t, at('v4_04', -0.02), LEAD);
      resolve(w, '٤ أشياء', W / 2, 790, t, at('v4_04', 0.4), grey({ size: 220, w: 700, dur: 0.34 }));
      resolve(w, 'لازم تكون واضحة', W / 2, 935, t, at('v4_04', 1.2), INKL(86));
      ['السماكة', 'الخدش', 'اللون', 'الضمان'].forEach((s, i) => {
        const x = 810 - i * 180, t0 = at('v4_04', 0.55 + i * 0.16);
        badge(w, '١٢٣٤'[i], x, 1220, t, t0, { r: 62 });
        resolve(w, s, x, 1340, t, t0 + 0.15, { size: 34, w: 600, color: '#6B665D', dur: 0.26, rise: 10 });
      });
    } },
    // ---------------- test 1: thickness
    { t0: at('v4_05', -0.05), zoom: 0.02, draw: (w, t) => {
      testHead(w, t, '١', 'السماكة', at('v4_05', -0.02), at('v4_05', 0.75));
      resolve(w, 'الفيلم الأصلي سماكته وحدة…', W / 2, 880, t, at('v4_05', 1.95), INKL(62));
      resolve(w, 'من طرفه لطرفه', W / 2, 965, t, at('v4_05', 4.05), { ...INKL(62), color: COL.gold });
      const g1 = at('v4_05', 2.1), g2 = at('v4_05', 2.5);
      resolve(w, 'الأصلي', 920, 1120, t, g1, { size: 42, w: 700, color: INK, dur: 0.26, rise: 10, align: 'right' });
      filmBar(w, 540, 1190, 780, 40, t, g1);
      resolve(w, 'المغشوش', 920, 1370, t, g2, { size: 42, w: 700, color: '#8C877D', dur: 0.26, rise: 10, align: 'right' });
      filmBar(w, 540, 1440, 780, 40, t, g2, { wavy: 14, seed: 5, c0: '#6A665F', c1: '#3A3733', c2: '#24221F' });
      const ga = prog(t, at('v4_05', 4.1), at('v4_05', 4.5));
      [300, 540, 780].forEach(x => gauge(w, x, 1170, 1210, ga, COL.gold));
      [300, 540, 780].forEach((x, i) => { const d = [9, -11, 6][i]; gauge(w, x, 1420 - d, 1460 + d * 0.6, ga, '#8C877D'); });
      hero(w, IMG.micro, 700, 1720, 360, t, at('v4_05', 0.05), { fromX: 1500, fromRot: 0.5, rot: -0.18, dur: 2.0, lev: 0.006 });
    } },
    // ---------------- test 2: self-healing (two identical panels, one scratch, hot water on the genuine one)
    { t0: at('v4_06', -0.05), zoom: 0.02, draw: (w, t, b) => {
      testHead(w, t, '٢', 'الخدش السطحي', at('v4_06', -0.02), at('v4_06', 0.6), 150);
      resolve(w, 'الفيلم الأصلي يصلّح نفسه…', W / 2, 875, t, at('v4_06', 2.4), INKL(60));
      resolve(w, 'صبّ عليه موية حارة', W / 2, 960, t, at('v4_06', 4.55), { ...INKL(60), color: COL.gold });
      const L = { x: 290, y: 1260, r: -0.07 }, R = { x: 790, y: 1260, r: 0.07 }, TH = 440;
      hero(w, IMG.tile, R.x, R.y, TH, t, b.t0, { fromY: 2100, fromRot: 0.5, rot: R.r, dur: 2.2, lev: 0.004 });
      hero(w, IMG.tile, L.x, L.y, TH, t, b.t0 + 0.06, { fromY: 2100, fromRot: -0.5, rot: L.r, dur: 2.2, lev: 0.004 });
      const sp = E.outC(prog(t, at('v4_06', 0.75), at('v4_06', 1.2))), heal = E.ioC(prog(t, at('v4_06', 5.9), at('v4_06', 6.9)));
      scratch(w, R.x, R.y - 10, clamp(sp * 2), 1 - heal, 23);
      scratch(w, L.x, L.y - 10, clamp(sp * 2 - 1), 1, 11);
      const d0 = at('v4_06', 4.95), dp = prog(t, d0, d0 + 0.45);
      if (dp > 0 && dp < 1) hero(w, IMG.drop, R.x + 10, lerp(420, R.y - 150, E.inQ(dp)), 250, t, d0, { dur: 0.01, shadow: false });
      if (t >= d0 + 0.45 && t < d0 + 1.0) {
        const q = prog(t, d0 + 0.45, d0 + 1.0);
        w.save(); w.globalAlpha *= (1 - q) * 0.8; w.strokeStyle = '#FFFFFF'; w.lineWidth = 3;
        w.beginPath(); w.ellipse(R.x + 10, R.y - 40, 40 + 120 * q, 12 + 34 * q, -0.1, 0, Math.PI * 2); w.stroke(); w.restore();
      }
      glint(w, R.x + lerp(-120, 110, heal), R.y - 10 + lerp(-30, 50, heal), Math.sin(heal * Math.PI), 1.3);
      pillUnfold(w, 'الأصلي · يختفي الخدش', R.x, 1540, t, at('v4_06', 6.2), { size: 34, h: 68, gold: true, tick: true });
      pillUnfold(w, 'المغشوش · يبقى', L.x, 1540, t, at('v4_06', 6.5), { size: 34, h: 68, bg: '#55524D', color: '#E4E0D8' });
    } },
    // ---------------- test 3: colour (the fake yellows and shrinks over a 2-year timeline)
    { t0: at('v4_07', -0.05), zoom: 0.02, draw: (w, t) => {
      testHead(w, t, '٣', 'اللون', at('v4_07', -0.02), at('v4_07', 0.8));
      resolve(w, 'المغشوش ممكن يبان مقبول أول يوم…', W / 2, 880, t, at('v4_07', 1.35), INKL(56));
      resolve(w, 'بس غالباً يصفرّ ويتقلّص', W / 2, 965, t, at('v4_07', 4.4), { ...INKL(56), color: COL.gold });
      const m0 = at('v4_07', 5.0), m1 = at('v4_07', 6.55), m2 = at('v4_07', 7.1);
      const u = t < m1 ? 0.5 * E.ioC(prog(t, m0, m1)) : 0.5 + 0.5 * E.ioC(prog(t, m1, m2)); // 0 → «سنة» 0.5 → «سنتين» 1
      agingPanel(w, 540, 1290, 640, 380, t, at('v4_07', 0.05), u);
      resolve(w, 'المغشوش', 540, 1070, t, at('v4_07', 1.4), { size: 34, w: 600, color: '#8C877D', dur: 0.26, rise: 10 });
      // timeline: right (first day) → left (two years)
      const tl = prog(t, at('v4_07', 3.3), at('v4_07', 3.9)); if (tl > 0) {
        const x0 = 880, x1 = 200, y = 1560;
        w.save(); w.strokeStyle = '#B9B3A7'; w.lineWidth = 3; w.beginPath(); w.moveTo(x0, y); w.lineTo(lerp(x0, x1, E.outC(tl)), y); w.stroke(); w.restore();
        [['أول يوم', 0], ['سنة', 0.5], ['سنتين', 1]].forEach(([s, k], i) => {
          const x = lerp(x0, x1, k), on = u >= k - 0.001;
          w.save(); w.globalAlpha *= clamp(tl * 3 - i); w.fillStyle = on ? COL.gold : '#B9B3A7'; w.beginPath(); w.arc(x, y, on ? 14 : 10, 0, Math.PI * 2); w.fill(); w.restore();
          if (tl * 3 - i > 0) text(w, s, x, y + 62, { fam: 'Plex', w: 600, size: 34, color: on ? INK : '#8C877D', alpha: clamp(tl * 3 - i) });
        });
        const mx = lerp(x0, x1, u); w.save(); w.fillStyle = INK; w.beginPath(); w.arc(mx, y, 20, 0, Math.PI * 2); w.fill();
        w.strokeStyle = COL.goldL; w.lineWidth = 2; w.beginPath(); w.arc(mx, y, 14, 0, Math.PI * 2); w.stroke(); w.restore();
      }
    } },
    // ---------------- test 4: warranty (written & registered vs just words)
    { t0: at('v4_08', -0.05), zoom: 0.02, draw: (w, t) => {
      testHead(w, t, '٤', 'الضمان', at('v4_08', -0.02), at('v4_08', 0.95));
      resolve(w, 'مكتوب ومسجّل برقم سيارتك؟', W / 2, 880, t, at('v4_08', 2.0), INKL(60));
      resolve(w, 'ولا مجرد كلام؟', W / 2, 965, t, at('v4_08', 4.45), { ...INKL(60), color: '#8C877D' });
      const c0 = at('v4_08', 2.05);
      hero(w, IMG.card, 700, 1280, 380, t, at('v4_08', 0.05), { fromX: 1500, fromY: 1500, fromRot: 0.6, rot: 0.08, dur: 2.0, lev: 0.004,
        overlay: cardText(t, c0 + 0.5, [['ضمان مكتوب', 215, 76, COL.goldL, 700], ['مسجّل برقم السيارة', 305, 50, '#E3D3AE']]) });
      pillUnfold(w, 'مكتوب ومسجّل', 700, 1560, t, c0 + 0.7, { size: 34, h: 68, gold: true, tick: true });
      bubble(w, 300, 1270, t, at('v4_08', 4.5), at('v4_08', 5.55));
      pillUnfold(w, 'مجرد كلام', 300, 1560, t, at('v4_08', 4.75), { size: 34, h: 68, bg: '#55524D', color: '#E4E0D8' });
      const sk = at('v4_08', 5.6); if (t >= sk) { const tw = measure('مجرد كلام', { fam: 'Plex', w: 600, size: 34 }); strikeWord(w, 300 + tw / 2, 300 - tw / 2, 1560 + 12, 34, t, sk, 0.35, COL.goldL); }
    } },
    // ---------------- act break → FILMX's answers
    { t0: at('v4_11', -0.08), cut: 'whip', zoom: 0.03, draw: (w, t, b) => {
      resolve(w, 'في FILMX', W / 2, 700, t, b.t0 - 0.02, { size: 120, w: 700, color: INK, dur: 0.3 });
      resolve(w, 'الجواب واضح', W / 2, 900, t, at('v4_11', 0.95), grey({ size: 170, w: 700, dur: 0.34 }));
      hero(w, IMG.car, 560, 1350, 560, t, b.t0 - 0.05, { fromX: 1700, fromRot: 0.12, rot: 0, dur: 2.2, drift: -14 });
    } },
    { t0: at('v4_12', -0.05), zoom: 0.03, draw: (w, t) => {
      resolve(w, 'نركّب', W / 2, 560, t, at('v4_12', -0.02), LEAD);
      pillUnfold(w, 'XPEL', W / 2, 740, t, at('v4_12', 0.45), { fam: 'PlexLatin', w: 500, dir: 'ltr', ls: '10px', size: 84, h: 140, padX: 60, gold: true });
      pillUnfold(w, 'أفلام Ravoony الأصلية', W / 2, 910, t, at('v4_12', 1.3), { size: 50, h: 100, gold: true });
      hero(w, IMG.roll, 540, 1360, 620, t, at('v4_12', 0.1), { fromY: 2300, fromRot: -0.6, rot: -0.1, dur: 2.2, lev: 0.006 });
    } },
    { t0: at('v4_13', -0.05), zoom: 0.015, draw: (w, t) => {
      resolve(w, 'والحماية بـ', W / 2, 460, t, at('v4_13', -0.02), LEAD);
      resolve(w, '٤ باقات', W / 2, 640, t, at('v4_13', 0.7), grey({ size: 190, w: 700, dur: 0.34 }));
      resolve(w, 'تغطية كاملة', W / 2, 775, t, at('v4_13', 1.7), INKL(80));
      [['لمعان ٧٫٥ مل', 7.5, 3.2, false], ['لمعان ٨٫٥ مل', 8.5, 4.95, false], ['لمعان ١٠ مل', 10, 6.25, false], ['مطفّي ٧٫٥ مل', 7.5, 7.45, true]].forEach(([s, mil, off, matte], i) => {
        const y = 960 + i * 150, t0 = at('v4_13', off);
        resolve(w, s, 950, y + 16, t, t0, { size: 50, w: 700, color: INK, dur: 0.26, rise: 10, align: 'right' });
        filmBar(w, 330, y, 400, mil * 5.2, t, t0 + 0.05, matte ? { c0: '#3C3935', c1: '#2E2C29', c2: '#262421' } : {});
        if (!matte) glint(w, 330 + 170 - 380 * prog(t, t0 + 0.4, t0 + 1.1), y - mil * 2.6, sine01(t, t0 + 0.4, 0.7) * 0.8, 0.8);
      });
    } },
    { t0: at('v4_14', -0.05), zoom: 0.008, py: H * 0.5,
      cam: t => ({ dy: -lerp(0, 90, E.ioC(prog(t, at('v4_14', 4.8), at('v4_14', 9.2)))) }),
      draw: (w, t, b) => {
        resolve(w, 'تعهّد FILMX', W / 2, 520, t, b.t0 - 0.02, { size: 110, w: 700, color: INK, dur: 0.3 });
        const P = { size: 44, h: 88, gold: true, tick: true };
        pillUnfold(w, 'أي قطعة PPF ركّبناها وتضررت…', W / 2, 690, t, at('v4_14', 0.05), P);
        pillUnfold(w, 'نستبدلها لك مجاناً', W / 2, 830, t, at('v4_14', 2.85), { ...P, size: 52, h: 104 });
        pillUnfold(w, 'لأي سبب كان', W / 2, 970, t, at('v4_14', 4.95), P);
        pillUnfold(w, 'طوال مدة ضمان FILMX', W / 2, 1100, t, at('v4_14', 6.45), P);
        pillUnfold(w, 'بلا حدّ لعدد القطع', W / 2, 1230, t, at('v4_14', 8.6), P);
        hero(w, IMG.shield, 540, 1560, 360, t, b.t0, { fromY: 2300, fromRot: -0.5, rot: 0.05, dur: 2.4, lev: 0.004 });
        glint(w, 630, 1420, sine01(t, at('v4_14', 4.2), 0.8), 1.2);
      } },
    { t0: at('v4_15', -0.05), zoom: 0.025, draw: (w, t, b) => {
      resolve(w, 'ضمان FILMX', W / 2, 560, t, b.t0 + 0.02, LEAD);
      resolve(w, 'مسجّل', W / 2, 790, t, at('v4_15', 1.1), grey({ size: 230, w: 700, dur: 0.34 }));
      resolve(w, 'برقم سيارتك', W / 2, 935, t, at('v4_15', 1.8), INKL(96));
      hero(w, IMG.card, 540, 1390, 520, t, b.t0, { fromY: 2200, fromRot: -0.4, rot: 0.1, dur: 2.2, lev: 0.004,
        overlay: cardText(t, b.t0 + 0.55, [['ضمان FILMX', 205, 70, COL.goldL, 700], ['مسجّل برقم سيارتك', 290, 46, '#E3D3AE'], ['استبدال مجاني · بلا شروط', 360, 40, '#CDBE9A', 500]]) });
    } },
    { t0: at('v4_15', 3.12), zoom: 0.025, draw: (w, t, b) => {
      resolve(w, 'جودة التركيب', W / 2, 560, t, b.t0 + 0.02, INKL(80));
      resolve(w, 'مضمونة', W / 2, 650, t, at('v4_15', 4.35), { size: 56, w: 500, color: '#5F5D59', dur: 0.26 });
      resolve(w, '٣٠ يوم', W / 2, 900, t, at('v4_15', 5.2), grey({ size: 230, w: 700, dur: 0.34 }));
      hero(w, IMG.seal, 540, 1390, 540, t, b.t0, { fromX: -500, fromY: 1800, fromRot: -1.2, rot: -0.06, dur: 2.0, lev: 0.006,
        overlay: (cc) => { const tp = prog(t, at('v4_15', 5.2), at('v4_15', 5.6)); if (tp <= 0) return;
          cc.globalAlpha *= tp; cc.filter = `blur(${(8 * (1 - tp)).toFixed(1)}px)`;
          text(cc, '٣٠', 1098, 1080, { fam: 'Plex', w: 700, size: 480, color: COL.goldL });
          text(cc, 'يوماً', 1098, 1330, { fam: 'Plex', w: 600, size: 150, color: '#D9C391' }); } });
    } },
    { t0: at('v4_15', 6.12), zoom: 0.025, draw: (w, t, b) => {
      resolve(w, 'نقل مجاني', W / 2, 720, t, b.t0 + 0.05, grey({ size: 190, w: 700, dur: 0.34 }));
      resolve(w, 'داخل الرياض', W / 2, 870, t, at('v4_15', 8.45), INKL(92));
      hero(w, IMG.truck, 540, 1330, 420, t, b.t0, { fromX: 1900, ease: 'outQuart', dur: 1.7, drift: -10 });
    } },
    // ---------------- services montage (rack cut per service, progress dots)
    ...[[null, null, 0], ['تظليل', 'tint', 1.83, 'وعزل حراري'], ['نانو سيراميك', 'beads', 3.33], ['تلميع', 'polisher', 4.46, 'وتصحيح طلاء'],
      ['عناية تفصيلية', 'seat', 6.4], ['ستيكرات مخصصة', 'vinyl', 8.02], ['دهان كاليبر', 'caliper', 9.6]].map(([word, img, off, sub], i) => ({
      t0: at('v4_16', off - (i ? 0 : 0.05)), zoom: 0.035, draw: (w, t, b) => {
        if (i === 0) {
          resolve(w, 'وغير الحماية', W / 2, 800, t, b.t0 + 0.02, grey({ size: 160, w: 700, dur: 0.34 }));
          resolve(w, 'عندنا:', W / 2, 950, t, at('v4_16', 1.0), INKL(86));
          return;
        }
        resolve(w, word, W / 2, 700, t, b.t0 - 0.03, grey({ size: fit(word, 200), w: 700, dur: 0.3 }));
        if (sub) resolve(w, sub, W / 2, 850, t, b.t0 + 0.45, INKL(80));
        const from = [{ fromX: 1500, fromRot: 0.7 }, { fromX: -500, fromRot: -0.7 }, { fromY: 2300, fromRot: 0.5 }][i % 3];
        const hh = { tint: 470, beads: 470, polisher: 520, seat: 640, vinyl: 520, caliper: 600 }[img];
        hero(w, IMG[img], 540, 1340, hh, t, b.t0 - 0.03, { ...from, rot: [0.05, -0.08, 0.1][i % 3], dur: 2.0, lev: 0.008, spin: img === 'caliper' ? 0.05 : 0 });
        for (let k = 0; k < 6; k++) { const x = 540 + (2.5 - k) * 34, on = k === i - 1;
          w.save(); w.fillStyle = on ? COL.gold : k < i - 1 ? '#8C877D' : '#CFCAC0'; w.beginPath(); w.arc(x, 1720, on ? 9 : 6, 0, Math.PI * 2); w.fill(); w.restore(); }
      } })),
  ];

  window.PROTO = {
    duration: DUR, fps: 30,
    assets: { palm: '../assets/obj/palm.png', sil: '../assets/obj/silhouette.png', tag: '../assets/obj/tag.png', tile: '../assets/obj/tile.png',
      watch: '../assets/obj/stopwatch.png', micro: '../assets/obj/micrometer.png', drop: '../assets/obj/drop.png', card: '../assets/obj/card.png',
      car: '../assets/obj/car.png', roll: '../assets/obj/roll.png', shield: '../assets/obj/shield.png', seal: '../assets/obj/seal.png',
      truck: '../assets/obj/transporter.png', tint: '../assets/obj/window_tint.png', beads: '../assets/obj/beads.png', polisher: '../assets/obj/polisher.png',
      seat: '../assets/obj/seat.png', vinyl: '../assets/obj/vinyl.png', caliper: '../assets/obj/caliper.png' },
    vo: Object.entries(V).map(([k, t]) => ({ file: `assets/vo/${k}.mp3`, t })),
    voLufs: -15,
    sfx: [{ t: at('v4_11', -0.08) - 0.12, type: 'squeegee', gain: 1 }, { t: TC + 0.15 - 0.7, type: 'hiss', gain: 1 }],
    sfxGain: 0.12,
    music: { bpm: 90, start: 0, gain: 1 },
    fadeOut: [DUR - 0.5, DUR],
    draw(c, t) {
      if (t < TC + 0.3) sequence(c, t, BEATS);
      ctaCard(c, t, TC, {
        tagline: 'دار حماية السيارات الفاخرة في الرياض', taglineAt: at('v4_17', 1.0), taglineSize: 42,
        rows: [
          { text: 'بالموعد فقط', at: at('v4_17', 3.75), size: 40, color: '#D9D4CA' },
          { text: 'احجز عبر واتساب', at: at('v4_17', 5.2), size: 40, color: '#D9D4CA' },
          { text: '055 375 4507', at: at('v4_17', 5.55), size: 64, w: 500, fam: 'PlexLatin', dir: 'ltr', color: COL.goldL, ls: '4px', dy: 14, gap: 100 },
          { text: '@filmx.sa  ·  filmx.capital', at: at('v4_17', 5.85), size: 38, fam: 'PlexLatin', dir: 'ltr', color: '#A9A397' },
          { text: 'حي الياسمين · الرياض', at: at('v4_17', 6.1), size: 36, color: '#A9A397' },
        ],
        fadeOut: [DUR - 0.5, DUR],
      });
      goldBurn(c, t, TB);
    },
  };
})();
