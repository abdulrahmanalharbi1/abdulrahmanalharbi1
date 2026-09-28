// P2 — Genuine vs fake, live: «المغشوش يلمع مثل الأصلي» → whip (act break) → «لين ينخدش.»
// Two identical glossy panels; one scratch across both; hot water on the genuine one heals it, the fake keeps it.
window.PROTO = {
  duration: 5.0, fps: 30,
  assets: { palm: '../assets/obj/palm.png', tile: '../assets/obj/tile.png', drop: '../assets/obj/drop.png' },
  sfx: [{ t: 1.83, type: 'squeegee', gain: 1 }],
  music: { bpm: 90, start: 0, gain: 1 },
  draw(c, t) {
    const { W, H, IMG, INK, COL, E, prog, clamp, lerp, stage, world, whip, creep, hud, resolve, grey, hero, pillUnfold } = FX;
    stage(c);
    const TC = 1.95, TL = { x: 290, y: 1200, r: -0.07 }, TR = { x: 790, y: 1200, r: 0.07 }, TH = 470;
    const tiles = (w, t0, fromY) => {
      hero(w, IMG.tile, TL.x, TL.y, TH, t, t0, { fromY, fromRot: -0.5, rot: TL.r, dur: 2.2, lev: 0.004 });
      hero(w, IMG.tile, TR.x, TR.y, TH, t, t0 + 0.06, { fromY, fromRot: 0.5, rot: TR.r, dur: 2.2, lev: 0.004 });
    };
    const glint = (w, x, y, a, s = 1) => {
      if (a <= 0) return; w.save(); w.globalAlpha *= a; w.fillStyle = '#FFFDF6'; w.translate(x, y); w.scale(s, s);
      w.shadowColor = 'rgba(255,240,200,0.9)'; w.shadowBlur = 16;
      w.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 5 : 30, an = i * Math.PI / 4; w.lineTo(Math.cos(an) * r, Math.sin(an) * r); } w.closePath(); w.fill(); w.restore();
    };
    const wp = whip(t, TC);
    if (t < TC) {
      world(c, { zoom: creep(t, 0, 0.032), dy: wp?.dy || 0, rot: wp?.rot || 0, motionBlur: wp?.motionBlur || 0 }, w => {
        resolve(w, 'المغشوش يلمع مثل', W / 2, 545, t, -0.12, { size: 62, w: 500, color: '#5F5D59', dur: 0.26 });
        resolve(w, 'الأصلي', W / 2, 800, t, 0.05, grey({ size: 250, w: 700, dur: 0.34 }));
        tiles(w, -0.05, 1900);
        const g = Math.max(0, Math.sin((t - 0.6) * 3.2));
        glint(w, TL.x + 140, TL.y - 140, g); glint(w, TR.x + 140, TR.y - 150, g);
      });
    } else {
      const cam = { zoom: creep(t, TC, 0.025), dy: wp?.dy || 0, rot: wp?.rot || 0, motionBlur: wp?.motionBlur || 0 };
      world(c, cam, w => {
        resolve(w, 'لين', W / 2, 520, t, TC + 0.12, { size: 62, w: 500, color: '#5F5D59', dur: 0.24 });
        resolve(w, 'ينخدش.', W / 2, 740, t, TC + 0.22, { size: 170, w: 700, color: INK, dur: 0.3 });
        tiles(w, TC - 1.0, TL.y); // already settled, carried in by the whip
        // one scratch across both panels
        const sp = E.outC(prog(t, 2.45, 2.8)), heal = E.ioC(prog(t, 3.45, 4.1));
        const scratch = (x, y, p, a, seed) => { // jagged key-scratch with a few hairline branches
          if (p <= 0 || a <= 0) return;
          const pts = []; const x0 = x - 150, y0 = y - 40, x1 = x + 135, y1 = y + 62;
          for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([lerp(x0, x1, u) + (FX.h2(i, seed) - 0.5) * 7, lerp(y0, y1, u) + (FX.h2(i, seed + 1) - 0.5) * 7]); }
          const n = Math.max(2, Math.floor(p * 24) + 1);
          const line = (lw, col, dx = 0, dy = 0) => { w.strokeStyle = col; w.lineWidth = lw; w.beginPath(); pts.slice(0, n).forEach(([px, py], i) => (i ? w.lineTo(px + dx, py + dy) : w.moveTo(px + dx, py + dy))); w.stroke(); };
          w.save(); w.globalAlpha *= a; w.lineCap = 'round'; w.lineJoin = 'round';
          line(7, 'rgba(10,10,10,0.55)', 1.5, 2);
          w.shadowColor = 'rgba(255,255,255,0.9)'; w.shadowBlur = 8; line(5, 'rgba(250,249,244,1)');
          w.shadowBlur = 0; line(1.6, 'rgba(250,249,244,0.8)', -10, 16); line(1.2, 'rgba(250,249,244,0.7)', 12, -12);
          w.restore();
        };
        scratch(TL.x, TL.y - 10, clamp(sp * 2), 1, 11);
        scratch(TR.x, TR.y - 10, clamp(sp * 2 - 1), 1 - heal, 23);
        // hot water drop falls onto the genuine panel
        const dp = prog(t, 2.9, 3.35);
        if (dp > 0 && dp < 1) hero(w, IMG.drop, TR.x + 10, lerp(360, TR.y - 150, E.inQ(dp)), 250, t, 2.9, { dur: 0.01, shadow: false });
        if (t >= 3.35 && t < 3.9) { // splash ring + steam
          const q = prog(t, 3.35, 3.9);
          w.save(); w.globalAlpha *= (1 - q) * 0.8; w.strokeStyle = '#FFFFFF'; w.lineWidth = 3;
          w.beginPath(); w.ellipse(TR.x + 10, TR.y - 40, 40 + 120 * q, 12 + 34 * q, -0.1, 0, Math.PI * 2); w.stroke(); w.restore();
        }
        glint(w, TR.x + lerp(-120, 110, heal), TR.y - 10 + lerp(-30, 50, heal), Math.sin(heal * Math.PI), 1.3);
        pillUnfold(w, 'الأصلي · يلتئم', TR.x, 1500, t, 3.95, { size: 36, h: 70, gold: true, tick: true });
        pillUnfold(w, 'المغشوش · يبقى', TL.x, 1500, t, 4.2, { size: 36, h: 70, bg: '#55524D', color: '#E4E0D8' });
      });
    }
    hud(c, t);
  },
};
