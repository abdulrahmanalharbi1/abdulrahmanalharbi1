// smoke test for the shared engine
const MAGM = { cx: 840, cy: 568, r: 432 };
window.PROTO = {
  duration: 5, fps: 30,
  assets: { mag: '../assets/obj/magnifier_open.png', palm: '../assets/obj/palm.png', roll: '../assets/obj/roll.png' },
  draw(c, t) {
    const { W, COL, focusWords, focusText, pill, page, post, IMG, lens, palms, object } = FX;
    page(c); palms(c, IMG.palm, t);
    const words = cc => {
      focusWords(cc, ['ما', 'نبدأ', 'بـ'], 700, 700, t, 0.1, 0.08, 0.5, 9, 9, { size: 44, w: 500, color: COL.grey });
      focusText(cc, 'الفيلم', W / 2, 860, t, [0.3, 0.9], { fam: 'Plex', w: 700, size: 230, grad: [[0, '#B9B3A7'], [1, '#6f6a61']] });
    };
    words(c);
    object(c, IMG.roll, 560, 1180, 520, t, [0.6, 1.2], { rot: -0.2 });
    lens(c, IMG.mag, MAGM, 470 + t * 40, 800, 620, 1.7, words, t, [1.0, 1.6], { rot: 0 });
    post(c, t);
  },
};
