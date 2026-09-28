// P1 — Contrarian hook (reference opener): «ما نبدأ بالسعر.» → breath → «نبدأ بالأصل.»
// Price tag flies through at peak velocity; then the magnifier travels R→L and sharpens «بالأصل».
const MAG = { cx: 840, cy: 568, r: 432 };
window.PROTO = {
  duration: 5.0, fps: 30,
  assets: { palm: '../assets/obj/palm.png', tag: '../assets/obj/tag.png', mag: '../assets/obj/magnifier_open.png' },
  sfx: [],
  music: { bpm: 90, start: 0, gain: 1 },
  draw(c, t) {
    const { W, H, IMG, INK, stage, world, rack, creep, hud, echo, resolve, grey, hero, lens, measure, clamp } = FX;
    stage(c);
    const cut = 1.6, cutB = 2.0;
    const blur = rack(t, [cut, cutB]);
    if (t < cut) {
      world(c, { zoom: creep(t, 0, 0.035), blur }, w => {
        const mega = 'بالسعر', size = 250;
        const mw = measure(mega, { fam: 'Plex', w: 700, size });
        resolve(w, 'ما', W / 2 + mw / 2 - 30, 575, t, -0.14, { size: 62, w: 500, color: '#5F5D59', dur: 0.24 });
        resolve(w, 'نبدأ', W / 2 - mw / 2 + 70, 575, t, -0.04, { size: 62, w: 500, color: '#5F5D59', dur: 0.24 });
        resolve(w, mega, W / 2, 800, t, -0.02, grey({ size, w: 700, dur: 0.33 }));
        hero(w, IMG.tag, 600, 1060, 640, t, -0.1, { fromX: 1250, fromY: 1760, fromRot: 0.9, rot: 0.32, dur: 2.4, spin: 0.07 });
      });
    } else if (t >= cutB) {
      const k = t - cutB;
      const words = (w, sharp) => {
        if (sharp) resolve(w, 'بالأصل', W / 2, 870, t, cutB + 0.05, grey({ size: 250, w: 700, dur: 0.34 }));
        else { w.save(); w.filter = 'blur(8px)'; w.globalAlpha = 0.5; resolve(w, 'بالأصل', W / 2, 870, t, cutB + 0.05, grey({ size: 250, w: 700, dur: 0.34 })); w.restore(); }
      };
      const e = FX.E.outExpo(clamp(k / 2.4));
      const lx = 1380 + (400 - 1380) * e - 16 * k, ly = 792 + Math.sin(k * 1.6) * 6;
      world(c, { zoom: creep(t, cutB, 0.028), blur }, w => {
        resolve(w, 'نبدأ', W / 2, 545, t, cutB - 0.05, { size: 96, w: 700, color: INK, dur: 0.26 });
        // focus wipe: the word is sharp where the lens has already passed (right of it), soft ahead of it (left)
        w.save(); w.beginPath(); w.rect(lx, 0, W, H); w.clip(); words(w, true); w.restore();
        w.save(); w.beginPath(); w.rect(0, 0, lx, H); w.clip(); words(w, false); w.restore();
        lens(w, IMG.mag, MAG, lx, ly, 920, 1.28, ww => words(ww, true), t, [cutB, cutB + 0.01], { blurIn: 0, scaleFrom: 1, rot: 0.06 });
      });
    }
    hud(c, t);
  },
};
