// P3 — Offer / pledge as proof pills (verified wording from filmx.capital, 2026-09-28):
// typewriter pivot «قبل ما تركّب…» (the one still frame) → hard cut → title «تعهّد FILMX» + grey sub-line
// → answer pills (ink, gold hairline + tick) → black warranty card rises with FILMX's own registered warranty line
// (XPEL claims held back: FILMX is not on Zan Arabia's authorized-installer list as of 2026-09-28 — pending client confirmation).
window.PROTO = {
  duration: 5.0, fps: 30,
  assets: { palm: '../assets/obj/palm.png', card: '../assets/obj/card.png' },
  sfx: [],
  music: { bpm: 90, start: 0, gain: 1 },
  draw(c, t) {
    const { W, H, IMG, INK, COL, E, prog, lerp, stage, world, creep, hud, resolve, grey, pillUnfold, typeOn, hero, text } = FX;
    stage(c);
    const cut = 1.05, open = 1.18;
    if (t < cut) {
      world(c, {}, w => typeOn(w, 'قبل ما تركّب…', W / 2, 905, t, 0.05, { size: 84, w: 600 }));
    } else if (t >= open) {
      world(c, { zoom: creep(t, open, 0.02), py: H * 0.4 }, w => {
        resolve(w, 'تعهّد FILMX', W / 2, 520, t, open, { size: 104, w: 700, color: INK, dur: 0.28 });
        resolve(w, 'خدمة يقدّمها FILMX وحده في الرياض', W / 2, 590, t, open + 0.3, grey({ size: 38, w: 500, dur: 0.3, rise: 10 }));
        pillUnfold(w, 'أي قطعة PPF تتضرر… نستبدلها لك مجاناً', W / 2, 720, t, 1.75, { size: 38, h: 76, gold: true, tick: true });
        pillUnfold(w, 'لأي سبب كان · بلا شروط ولا استثناءات', W / 2, 856, t, 2.3, { size: 38, h: 76, gold: true, tick: true });
        pillUnfold(w, 'طوال مدة الضمان · بلا حدّ لعدد القطع', W / 2, 992, t, 2.85, { size: 38, h: 76, gold: true, tick: true });
        // black metal warranty card rises in at peak velocity, text engraved in gold following its tilt
        const t0 = 3.3;
        // card face corners measured in the render (2048x1360): TL, TR, BL → affine card space 1000 x 630
        const TLc = [347, 404], TRc = [1511, 168], BLc = [590, 1175];
        hero(w, IMG.card, 540, 1370, 520, t, t0, { fromY: 2200, fromRot: -0.4, rot: 0.1, dur: 2.2, lev: 0.004,
          overlay: (cc) => {
            const tp = prog(t, 3.7, 4.1); if (tp <= 0) return;
            cc.transform((TRc[0] - TLc[0]) / 1000, (TRc[1] - TLc[1]) / 1000, (BLc[0] - TLc[0]) / 630, (BLc[1] - TLc[1]) / 630, TLc[0], TLc[1]);
            cc.globalAlpha *= tp; cc.filter = `blur(${(6 * (1 - tp)).toFixed(1)}px)`;
            text(cc, 'ضمان FILMX', 770, 205, { fam: 'Plex', w: 700, size: 70, color: COL.goldL, align: 'right' });
            text(cc, 'مسجّل برقم سيارتك', 770, 290, { fam: 'Plex', w: 600, size: 46, color: '#E3D3AE', align: 'right' });
            text(cc, 'استبدال مجاني · بلا شروط', 770, 360, { fam: 'Plex', w: 500, size: 40, color: '#CDBE9A', align: 'right' });
            text(cc, 'FILMX', 80, 560, { fam: 'PlexLatin', w: 500, size: 46, color: COL.goldL, dir: 'ltr', align: 'left', ls: '12px' });
          } });
      });
    }
    hud(c, t, { palms: t >= open });
  },
};
