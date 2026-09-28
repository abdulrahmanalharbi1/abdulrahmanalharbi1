// V3 — «تعهّد FILMX» (≈32 s). Built on the approved P3 prototype, driven by the Ken VO (ElevenLabs, Saudi male).
// typewriter hook (the one still frame) → hard cut «اسأل سؤال واحد» → rack «وش يصير لو تضررت قطعة؟» (scratched panel)
// → whip (act break) into the pledge board: title + 4 pills timed to the VO → rack to the registered-warranty card
// → gold burn → dark CTA card (WhatsApp / handle / site).
// Wording follows filmx.capital (/FreeReplacement, re-verified 2026-09-28); XPEL authorization claims are held back.
(() => {
  const V = { v3_01: 0.25, v3_02: 4.2, v3_03: 6.95, v3_04: 13.68, v3_05: 16.98, v3_06: 21.7, v3_07: 25.25 };
  const at = (k, s) => V[k] + s; // absolute time of a word (offsets from Whisper word timings)
  const TB = at('v3_07', -0.53), TC = TB + 0.45, DUR = 32.3;
  const { W, H, IMG, INK, COL, E, prog, lerp, clamp, resolve, grey, pillUnfold, typeOn, hero, text, goldBurn, ctaCard, glint, scratch, sequence } = FX;
  const LEAD = { size: 62, w: 500, color: '#5F5D59', dur: 0.26 };
  const sine01 = (t, t0, d) => Math.sin(clamp((t - t0) / d) * Math.PI);

  const BEATS = [
    { t0: 0, cut: 'hard', zoom: 0, palms: false, draw: (w, t) => {
      typeOn(w, 'قبل ما تركّب', W / 2, 860, t, at('v3_01', 0.02), { size: 84, w: 600, cps: 22 });
      typeOn(w, 'حماية لسيارتك…', W / 2, 990, t, at('v3_01', 0.62), { size: 84, w: 600, cps: 22 });
    } },
    { t0: at('v3_01', 2.18), cut: 'hard', zoom: 0.035, draw: (w, t, b) => {
      resolve(w, 'اسأل', W / 2, 640, t, b.t0 + 0.02, LEAD);
      resolve(w, 'سؤال واحد', W / 2, 860, t, at('v3_01', 2.58), grey({ size: 190, w: 700, dur: 0.34 }));
      hero(w, IMG.mag, 600, 1330, 700, t, b.t0 + 0.05, { fromX: 1350, fromY: 1800, fromRot: 0.9, rot: -0.32, dur: 2.2, lev: 0.01 });
    } },
    { t0: at('v3_02', -0.08), zoom: 0.03, draw: (w, t, b) => {
      resolve(w, 'وش يصير', W / 2, 720, t, b.t0 + 0.04, grey({ size: 200, w: 700, dur: 0.34 }));
      resolve(w, 'لو تضررت قطعة؟', W / 2, 880, t, at('v3_02', 0.9), { size: 88, w: 700, color: INK, dur: 0.28 });
      hero(w, IMG.tile, 540, 1350, 580, t, b.t0, { fromY: 2300, fromRot: 0.7, rot: -0.07, dur: 2.2, lev: 0.006 });
      glint(w, 700, 1180, Math.sin(Math.min(1, Math.max(0, t - b.t0 - 0.35) / 0.7) * Math.PI));
      scratch(w, 540, 1330, E.outC(prog(t, at('v3_02', 1.3), at('v3_02', 1.7))), 1, 17, 1.25);
    } },
    // act break → the pledge, one idea per shot, then the list board
    { t0: at('v3_03', -0.08), cut: 'whip', zoom: 0.03, draw: (w, t, b) => {
      resolve(w, 'تعهّد', W / 2, 760, t, b.t0 - 0.02, grey({ size: 230, w: 700, dur: 0.34 }));
      resolve(w, 'FILMX', W / 2, 900, t, at('v3_03', 0.3), { fam: 'PlexLatin', w: 500, size: 96, color: INK, dir: 'ltr', ls: '18px', dur: 0.3 });
      hero(w, IMG.shield, 540, 1360, 500, t, b.t0 - 0.05, { fromY: 2300, fromRot: -0.5, rot: 0.05, dur: 2.2, lev: 0.008 });
      glint(w, 660, 1180, sine01(t, b.t0 + 0.6, 0.8), 1.2);
    } },
    { t0: at('v3_03', 1.55), zoom: 0.035, draw: (w, t, b) => {
      resolve(w, 'أي قطعة', W / 2, 720, t, b.t0 + 0.03, grey({ size: 210, w: 700, dur: 0.34 }));
      resolve(w, 'PPF ركّبناها وتضررت…', W / 2, 870, t, at('v3_03', 2.35), { size: 80, w: 700, color: INK, dur: 0.28 });
      hero(w, IMG.tile, 540, 1340, 560, t, b.t0, { fromX: 1400, fromY: 1700, fromRot: 0.9, rot: 0.08, dur: 2.0, lev: 0.006 });
      scratch(w, 540, 1320, E.outC(prog(t, at('v3_03', 3.65), at('v3_03', 4.0))), 1, 29, 1.2);
    } },
    { t0: at('v3_03', 4.6), zoom: 0.04, draw: (w, t, b) => {
      resolve(w, 'نستبدلها لك', W / 2, 600, t, b.t0 + 0.03, { ...LEAD, size: 70 });
      resolve(w, 'مجاناً', W / 2, 840, t, at('v3_03', 5.7), { size: 240, w: 700, color: INK, dur: 0.34 });
      hero(w, IMG.tile, 540, 1360, 560, t, b.t0, { fromY: 2300, fromRot: -0.7, rot: -0.06, dur: 2.0, lev: 0.006 });
      glint(w, 720, 1170, sine01(t, at('v3_03', 5.8), 0.8), 1.5);
    } },
    { t0: at('v3_04', -0.08), zoom: 0.012, py: H * 0.5,
      cam: t => ({ dy: -lerp(0, 60, E.ioC(prog(t, V.v3_05 - 0.2, V.v3_05 + 2.6))) }),
      draw: (w, t, b) => {
        resolve(w, 'تعهّد FILMX', W / 2, 540, t, b.t0 - 0.02, { size: 110, w: 700, color: INK, dur: 0.3 });
        const P = { size: 44, h: 88, gold: true, tick: true };
        pillUnfold(w, 'استبدال مجاني لأي قطعة PPF', W / 2, 710, t, b.t0 + 0.02, P);
        pillUnfold(w, 'لأي سبب كان · بلا شروط', W / 2, 845, t, at('v3_04', 0.35), P);
        pillUnfold(w, 'طوال مدة ضمان FILMX', W / 2, 980, t, at('v3_05', 0.3), P);
        pillUnfold(w, 'بلا حدّ لعدد القطع', W / 2, 1115, t, at('v3_05', 2.35), { ...P, size: 52, h: 104 });
        hero(w, IMG.shield, 540, 1490, 380, t, b.t0 - 0.05, { fromY: 2300, fromRot: -0.5, rot: 0.05, dur: 2.4, lev: 0.004 });
        glint(w, 630, 1340, sine01(t, at('v3_05', 2.6), 0.8), 1.2);
      } },
    { t0: at('v3_06', -0.08), zoom: 0.025, draw: (w, t, b) => {
      resolve(w, 'ضمان FILMX', W / 2, 560, t, b.t0 + 0.04, LEAD);
      resolve(w, 'مسجّل', W / 2, 790, t, at('v3_06', 1.16), grey({ size: 230, w: 700, dur: 0.34 }));
      resolve(w, 'برقم سيارتك', W / 2, 935, t, at('v3_06', 1.8), { size: 96, w: 700, color: INK, dur: 0.28 });
      // black metal card: face corners measured in the render (2048x1360) → affine card space 1000 x 630
      const TLc = [347, 404], TRc = [1511, 168], BLc = [590, 1175];
      hero(w, IMG.card, 540, 1390, 520, t, b.t0, { fromY: 2200, fromRot: -0.4, rot: 0.1, dur: 2.2, lev: 0.004,
        overlay: (cc) => {
          const tp = prog(t, b.t0 + 0.55, b.t0 + 0.95); if (tp <= 0) return;
          cc.transform((TRc[0] - TLc[0]) / 1000, (TRc[1] - TLc[1]) / 1000, (BLc[0] - TLc[0]) / 630, (BLc[1] - TLc[1]) / 630, TLc[0], TLc[1]);
          cc.globalAlpha *= tp; cc.filter = `blur(${(6 * (1 - tp)).toFixed(1)}px)`;
          text(cc, 'ضمان FILMX', 770, 205, { fam: 'Plex', w: 700, size: 70, color: COL.goldL, align: 'right' });
          text(cc, 'مسجّل برقم سيارتك', 770, 290, { fam: 'Plex', w: 600, size: 46, color: '#E3D3AE', align: 'right' });
          text(cc, 'استبدال مجاني · بلا شروط', 770, 360, { fam: 'Plex', w: 500, size: 40, color: '#CDBE9A', align: 'right' });
          text(cc, 'FILMX', 80, 560, { fam: 'PlexLatin', w: 500, size: 46, color: COL.goldL, dir: 'ltr', align: 'left', ls: '12px' });
        } });
    } },
  ];

  window.PROTO = {
    duration: DUR, fps: 30,
    assets: { palm: '../assets/obj/palm.png', mag: '../assets/obj/magnifier.png', tile: '../assets/obj/tile.png', shield: '../assets/obj/shield.png', card: '../assets/obj/card.png' },
    vo: Object.entries(V).map(([k, t]) => ({ file: `assets/vo/${k}.mp3`, t })),
    voLufs: -15,
    sfx: [{ t: at('v3_03', -0.08) - 0.12, type: 'squeegee', gain: 1 }, { t: TC + 0.15 - 0.7, type: 'hiss', gain: 1 }],
    sfxGain: 0.12,
    music: { bpm: 90, start: 0, gain: 1 },
    fadeOut: [DUR - 0.5, DUR],
    draw(c, t) {
      if (t < TC + 0.3) sequence(c, t, BEATS);
      ctaCard(c, t, TC, {
        tagline: 'حيث تُصان الفخامة بصمت', taglineAt: at('v3_07', 1.12),
        rows: [
          { text: 'احجز موعدك عبر واتساب', at: at('v3_07', 3.62), size: 42, color: '#D9D4CA' },
          { text: '055 375 4507', at: at('v3_07', 4.1), size: 64, w: 500, fam: 'PlexLatin', dir: 'ltr', color: COL.goldL, ls: '4px', dy: 14, gap: 100 },
          { text: '@filmx.sa  ·  filmx.capital', at: at('v3_07', 4.45), size: 40, fam: 'PlexLatin', dir: 'ltr', color: '#A9A397' },
        ],
        fadeOut: [DUR - 0.5, DUR],
      });
      goldBurn(c, t, TB);
    },
  };
})();
