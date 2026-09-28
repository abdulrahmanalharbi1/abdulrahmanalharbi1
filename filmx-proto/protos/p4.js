// P4 — Presenter column + status-quo noun montage.
// The paper-cut silhouette is a PLACEHOLDER for the client's own photo (B&W cut-out, one real-person slot).
// «أغلب سوالف الحماية تبدأ من هنا» → rack-focus montage: «الخصم» / «اللمعة» / «السرعة» (one object each, alternating directions).
window.PROTO = {
  duration: 5.0, fps: 30,
  assets: { palm: '../assets/obj/palm.png', sil: '../assets/obj/silhouette.png', tag: '../assets/obj/tag.png', tile: '../assets/obj/tile.png', watch: '../assets/obj/stopwatch.png' },
  sfx: [],
  music: { bpm: 90, start: 0, gain: 1 },
  draw(c, t) {
    const { W, H, IMG, INK, COL, E, prog, stage, world, rack, creep, hud, resolve, grey, hero, text } = FX;
    stage(c);
    const cuts = [2.2, 3.13, 4.07];
    const blur = rack(t, cuts);
    if (t < cuts[0]) {
      world(c, { zoom: creep(t, 0, 0.025), blur, px: W * 0.7 }, w => {
        // halo disc behind the shoulder (~12% darker than the paper) + silhouette bleeding off left/bottom
        const hp = E.outExpo(prog(t, 0.0, 1.2));
        w.save(); w.globalAlpha *= hp; w.fillStyle = '#DDD8CE'; w.beginPath(); w.arc(330, 1120, 300, 0, Math.PI * 2); w.fill(); w.restore();
        hero(w, IMG.sil, 250, 1290, 1150, t, -0.05, { fromX: -420, dur: 2.4, shadowA: 0.5 });
        text(w, 'مكان صورتك', 250, 1628, { fam: 'Plex', w: 500, size: 26, color: '#8C877D', alpha: prog(t, 0.6, 1.0) * 0.9 });
        resolve(w, 'أغلب سوالف', 990, 600, t, -0.1, { size: 62, w: 500, color: '#5F5D59', dur: 0.26, align: 'right' });
        resolve(w, 'الحماية', 990, 830, t, 0.18, grey({ size: 210, w: 700, dur: 0.34, align: 'right' }));
        resolve(w, 'تبدأ من هنا', 990, 965, t, 0.75, { size: 86, w: 700, color: INK, dur: 0.28, align: 'right' });
      });
    } else {
      const beats = [
        { t0: cuts[0], word: 'الخصم', img: IMG.tag, from: { fromX: 1350, fromY: 1500, fromRot: 1.0 }, x: 560, y: 1150, h: 720, rot: 0.35 },
        { t0: cuts[1], word: 'اللمعة', img: IMG.tile, from: { fromX: -300, fromY: 1250, fromRot: -0.8 }, x: 540, y: 1180, h: 640, rot: -0.06, glint: true },
        { t0: cuts[2], word: 'السرعة', img: IMG.watch, from: { fromY: 2300, fromRot: 0.6 }, x: 545, y: 1170, h: 720, rot: -0.12 },
      ];
      const i = t < cuts[1] ? 0 : t < cuts[2] ? 1 : 2, b = beats[i];
      world(c, { zoom: creep(t, b.t0, 0.045), blur }, w => {
        resolve(w, b.word, W / 2, 560, t, b.t0 - 0.04, { size: 124, w: 700, color: INK, dur: 0.26 });
        hero(w, b.img, b.x, b.y, b.h, t, b.t0 - 0.03, { ...b.from, rot: b.rot, dur: 2.3 });
        if (b.glint) {
          const a = Math.sin(Math.min(1, (t - b.t0) / 0.8) * Math.PI);
          if (a > 0) { w.save(); w.globalAlpha *= a; w.fillStyle = '#FFFDF6'; w.shadowColor = 'rgba(255,240,200,0.9)'; w.shadowBlur = 20; w.translate(b.x + 190, b.y - 190);
            w.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 6 : 42, an = k * Math.PI / 4; w.lineTo(Math.cos(an) * r, Math.sin(an) * r); } w.closePath(); w.fill(); w.restore(); }
        }
      });
    }
    hud(c, t);
  },
};
