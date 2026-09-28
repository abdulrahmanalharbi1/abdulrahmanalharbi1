/* lib3 — beat sequencer + shared drawing helpers for the long-form FILMX videos.
 * A video is a list of beats: { t0, cut: 'rack'|'whip'|'hard', zoom (creep rate /s), py, palms, draw(w, t, beat), cam(t, beat) }.
 * The transition belongs to the beat it cuts INTO. Rack-focus blurs the grid + world together; whip moves the
 * outgoing beat up with roll + motion blur and brings the new one up from +37%H; hard cuts are instant (typewriter).
 * beat.cam(t) may return { dy, dx, zoom } to pan/push the camera inside a long beat (list boards). */
'use strict';
(() => {
  const { stage, world, rack, whip, creep, hud, E, prog, lerp, clamp, h2, text, measure, COL } = FX;
  function beatAt(beats, t) { let i = 0; for (let k = 0; k < beats.length; k++) if (t >= beats[k].t0) i = k; return i; }
  function sequence(c, t, beats, o = {}) {
    const cuts = beats.filter((b, k) => k > 0 && (b.cut || 'rack') === 'rack').map(b => b.t0);
    let i = beatAt(beats, t), cam = {};
    // whip-out: the outgoing beat is still on screen during the 0.25 s before a whip cut
    const next = beats[i + 1];
    if (next && next.cut === 'whip' && t >= next.t0 - 0.25) { const wp = whip(t, next.t0); if (wp) cam = wp; }
    else if (beats[i].cut === 'whip') { const wp = whip(t, beats[i].t0); if (wp) cam = wp; }
    const b = beats[i];
    const ex = b.cam ? b.cam(t, b) || {} : {};
    const blur = Math.max(rack(t, cuts), o.blur || 0);
    const z = creep(t, b.t0, b.zoom ?? 0.025) * (ex.zoom ?? 1);
    stage(c, cam.motionBlur ? 0 : blur, z);
    world(c, { zoom: z, blur, py: b.py ?? FX.H * 0.45, px: b.px, dx: ex.dx || 0, dy: (cam.dy || 0) + (ex.dy || 0), rot: cam.rot || 0, motionBlur: cam.motionBlur || 0 }, w => b.draw(w, t, b));
    if (b.overlay) b.overlay(c, t, b);
    hud(c, b.palmsFreeze != null ? Math.min(t, b.palmsFreeze) : t, { palms: b.palms !== false, header: b.header !== false });
    return b;
  }
  // four-point sparkle glint (the only "light" accent on glossy objects)
  function glint(w, x, y, a, s = 1) {
    if (a <= 0) return; w.save(); w.globalAlpha *= a; w.fillStyle = '#FFFDF6'; w.translate(x, y); w.scale(s, s);
    w.shadowColor = 'rgba(255,240,200,0.9)'; w.shadowBlur = 16;
    w.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 5 : 30, an = i * Math.PI / 4; w.lineTo(Math.cos(an) * r, Math.sin(an) * r); } w.closePath(); w.fill(); w.restore();
  }
  // jagged key-scratch with hairline branches, drawn along p (0..1), faded by a (heal)
  function scratch(w, x, y, p, a, seed, len = 1) {
    if (p <= 0 || a <= 0) return;
    const pts = []; const x0 = x - 150 * len, y0 = y - 40 * len, x1 = x + 135 * len, y1 = y + 62 * len;
    for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([lerp(x0, x1, u) + (h2(i, seed) - 0.5) * 7, lerp(y0, y1, u) + (h2(i, seed + 1) - 0.5) * 7]); }
    const n = Math.max(2, Math.floor(p * 24) + 1);
    const line = (lw, col, dx = 0, dy = 0) => { w.strokeStyle = col; w.lineWidth = lw; w.beginPath(); pts.slice(0, n).forEach(([px, py], i) => (i ? w.lineTo(px + dx, py + dy) : w.moveTo(px + dx, py + dy))); w.stroke(); };
    w.save(); w.globalAlpha *= a; w.lineCap = 'round'; w.lineJoin = 'round';
    line(7, 'rgba(10,10,10,0.55)', 1.5, 2);
    w.shadowColor = 'rgba(255,255,255,0.9)'; w.shadowBlur = 8; line(5, 'rgba(250,249,244,1)');
    w.shadowBlur = 0; line(1.6, 'rgba(250,249,244,0.8)', -10, 16); line(1.2, 'rgba(250,249,244,0.7)', 12, -12);
    w.restore();
  }
  // numbered badge (framework index): dark disc, gold hairline ring, Arabic-Indic numeral; pops in with overshoot
  function badge(w, n, x, y, t, t0, o = {}) {
    const p = prog(t, t0, t0 + 0.4); if (p <= 0) return;
    const r = (o.r || 46) * E.outBack(p, 2.4);
    w.save(); w.translate(x, y);
    w.shadowColor = 'rgba(25,20,12,0.28)'; w.shadowBlur = 20; w.shadowOffsetY = 6;
    w.fillStyle = o.bg || '#2B2926'; w.beginPath(); w.arc(0, 0, Math.max(0, r), 0, Math.PI * 2); w.fill();
    w.shadowColor = 'transparent';
    if (r > 12) { w.strokeStyle = COL.goldL; w.lineWidth = 1.5; w.globalAlpha *= clamp((r - 12) / 20); w.beginPath(); w.arc(0, 0, r - 6, 0, Math.PI * 2); w.stroke(); }
    const tp = prog(t, t0 + 0.12, t0 + 0.35);
    if (tp > 0) { w.globalAlpha = tp; text(w, n, 0, (o.r || 46) * 0.36, { fam: 'Plex', w: 600, size: (o.r || 46) * 1.0, color: '#F1ECE1' }); }
    w.restore();
  }
  // film cross-section bar: glossy dark strip whose thickness is even (genuine) or wavy (fake); drawn in from the right
  function filmBar(w, x, y, len, th, t, t0, o = {}) {
    const p = E.outExpo(prog(t, t0, t0 + 0.7)); if (p <= 0) return;
    const L = len * p, wav = o.wavy || 0, seed = o.seed || 3;
    w.save(); w.translate(x + len / 2, y);
    const top = u => -th / 2 - (wav ? (Math.sin(u * 17 + seed) * 0.5 + Math.sin(u * 41 + seed * 2) * 0.3) * wav : 0);
    const bot = u => th / 2 + (wav ? (Math.sin(u * 23 + seed * 3) * 0.5 + Math.sin(u * 37 + seed) * 0.35) * wav : 0);
    w.beginPath(); const N = 80;
    for (let i = 0; i <= N; i++) { const u = i / N; w.lineTo(-u * L, top(u)); }
    for (let i = N; i >= 0; i--) { const u = i / N; w.lineTo(-u * L, bot(u)); }
    w.closePath();
    w.shadowColor = 'rgba(25,20,12,0.25)'; w.shadowBlur = 18; w.shadowOffsetY = 8;
    const g = w.createLinearGradient(0, -th, 0, th); g.addColorStop(0, o.c0 || '#4A4640'); g.addColorStop(0.45, o.c1 || '#1E1C19'); g.addColorStop(1, o.c2 || '#0E0D0B');
    w.fillStyle = g; w.fill(); w.shadowColor = 'transparent';
    w.strokeStyle = 'rgba(255,255,255,0.22)'; w.lineWidth = 2; w.beginPath();
    for (let i = 0; i <= N; i++) { const u = i / N; w.lineTo(-u * L, top(u) + 3); } w.stroke();
    w.restore();
  }
  Object.assign(FX, { sequence, beatAt, glint, scratch, badge, filmBar });
})();
