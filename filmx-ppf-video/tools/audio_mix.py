"""Builds the full soundtrack for the FILMX PPF video from out/timeline.json:
Arabic VO (Higgsfield / ElevenLabs, voice "Luna"), Higgsfield clip ambience, procedurally
synthesised foley (paper, stamps, typewriter, ink...) and a vintage pizzicato music bed
with VO side-chain ducking. Output: out/mix.wav (48 kHz stereo, ~-14 LUFS)."""
import json, subprocess, sys
import numpy as np
from scipy.signal import lfilter, butter, sosfilt

SR = 48000
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
TL = json.load(open(f'{ROOT}/out/timeline.json'))
DUR = TL['duration']
N = int(DUR * SR) + SR
rng = np.random.default_rng(7)


def load(path, speed=1.0):
    af = [] if abs(speed - 1) < 1e-3 else ['-af', f'atempo={speed}']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, *af, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def place(buf, x, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        x = x[-i:]; i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[:j - i] * gain


def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def sine_sweep(f0, f1, sec, curve=1.0):
    n = int(sec * SR); k = np.linspace(0, 1, n) ** curve
    f = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-9
    return x / m * peak


# ------------------------------------------------------------------ foley
def crinkle(sec, density=260, lo=1500, hi=7000, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros(int(sec * SR) + 2000)
    for _ in range(int(density * sec)):
        i = r.integers(0, int(sec * SR)); L = r.integers(60, 700)
        g = r.standard_normal(L) * np.exp(-np.linspace(0, 6, L)) * r.uniform(0.2, 1)
        out[i:i + L] += g
    return bp(out, lo, hi)


def sfx_drop():
    thump = sine_sweep(95, 42, 0.22) * env(int(0.22 * SR), 0.002, 0.07)
    slap = bp(noise(0.09), 250, 3200) * env(int(0.09 * SR), 0.001, 0.025)
    cr = crinkle(0.18, 200, seed=1) * 0.35
    x = np.zeros(int(0.3 * SR)); x[:len(thump)] += thump * 1.0; x[:len(slap)] += slap * 0.7; x[:len(cr)] += cr[:len(x)] if len(cr) <= len(x) else cr[:len(x)]
    return norm(x, 0.9)


def sfx_thud():
    t = sine_sweep(80, 38, 0.4) * env(int(0.4 * SR), 0.003, 0.12)
    n = lp(noise(0.12), 900) * env(int(0.12 * SR), 0.001, 0.03)
    x = np.zeros(int(0.45 * SR)); x[:len(t)] += t; x[:len(n)] += n * 0.6
    return norm(x, 0.9)


def sfx_stamp():
    click = hp(noise(0.012), 2500) * env(int(0.012 * SR), 0.0005, 0.003)
    body = sine_sweep(140, 60, 0.16) * env(int(0.16 * SR), 0.001, 0.05)
    wood = bp(noise(0.08), 400, 1800) * env(int(0.08 * SR), 0.0008, 0.02)
    rattle = bp(noise(0.12), 2500, 6000) * env(int(0.12 * SR), 0.01, 0.03) * 0.25
    x = np.zeros(int(0.25 * SR)); x[:len(click)] += click * 0.9; x[:len(body)] += body; x[:len(wood)] += wood * 0.8; x[int(0.02 * SR):int(0.02 * SR) + len(rattle)] += rattle
    return norm(x, 1.0)


def sfx_pop():
    n = int(0.05 * SR)
    x = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 1300, n)) / SR) * env(n, 0.001, 0.012)
    x += hp(noise(0.05), 3000) * env(n, 0.0005, 0.004) * 0.4
    return norm(x, 0.5)


def sfx_tick():
    n = int(0.04 * SR)
    x = bp(noise(0.04), 1800, 5000) * env(n, 0.0004, 0.006) + np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * env(n, 0.0005, 0.01) * 0.4
    return norm(x, 0.55)


def sfx_whoosh(sec=0.45):
    n = int(sec * SR); x = noise(sec); out = np.zeros(n)
    # time-varying band via block processing
    blk = 480
    for k in range(0, n, blk):
        u = k / n; fc = 350 + 2600 * np.sin(np.pi * u) ** 1.5
        seg = bp(x[max(0, k - 2000):k + blk], fc * 0.6, min(fc * 1.6, 20000))[-min(blk, n - k):]
        out[k:k + len(seg)] = seg
    out *= np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return norm(out, 0.7)


def sfx_slide():
    sec = 0.42; n = int(sec * SR)
    x = lp(noise(sec), 3200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    x += crinkle(sec, 120, seed=3)[:n] * 0.3
    return norm(x, 0.7)


def sfx_paper():
    sec = 0.5; n = int(sec * SR)
    x = crinkle(sec, 420, 900, 6500, seed=5)[:n] * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.8
    return norm(x, 0.7)


def sfx_tear():
    sec = 0.62; n = int(sec * SR)
    shape = np.linspace(0.3, 1, n) ** 1.5 * np.exp(-np.maximum(0, np.linspace(0, sec, n) - 0.5) * 30)
    x = crinkle(sec, 1400, 700, 7000, seed=9)[:n] * shape
    x += lp(noise(sec), 600) * shape * 0.35
    return norm(x, 0.95)


def sfx_scribble(sec=0.5):
    n = int(sec * SR); t = np.arange(n) / SR
    strokes = 0.5 + 0.5 * np.sin(2 * np.pi * (11 + 4 * np.sin(2 * np.pi * 1.3 * t)) * t) ** 2
    x = bp(noise(sec), 1800, 7000) * strokes * np.minimum(1, t / 0.03) * np.minimum(1, (sec - t) / 0.05)
    return norm(x, 0.35)


def sfx_type(n_chars=16, sec=1.0):
    out = np.zeros(int((sec + 0.2) * SR))
    for k in range(n_chars):
        t = k * sec / n_chars + rng.uniform(-0.012, 0.012)
        m = int(0.05 * SR)
        c = hp(noise(0.05), 1500) * env(m, 0.0003, 0.004) * 0.8
        c += np.sin(2 * np.pi * rng.uniform(1700, 2300) * np.arange(m) / SR) * env(m, 0.0005, 0.008) * 0.3
        c += sine_sweep(180, 90, 0.05) * env(m, 0.0005, 0.012) * 0.5
        place(out, c, max(0, t))
    return norm(out, 0.8)


def sfx_ding():
    sec = 1.4; n = int(sec * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(2093, 1, 2.8), (4186, 0.35, 4), (5920, 0.2, 6), (3136, 0.25, 3.5)])
    x *= np.minimum(1, t / 0.002)
    return norm(x, 0.5)


def sfx_seal():
    squish = bp(noise(0.3), 300, 1100) * env(int(0.3 * SR), 0.01, 0.09)
    thump = sine_sweep(110, 45, 0.3) * env(int(0.3 * SR), 0.002, 0.09)
    click = hp(noise(0.01), 2000) * env(int(0.01 * SR), 0.0005, 0.003)
    x = np.zeros(int(0.35 * SR)); x[:len(squish)] += squish * 0.6; x[:len(thump)] += thump; x[:len(click)] += click * 0.6
    return norm(x, 1.0)


def sfx_snap():
    x = hp(noise(0.03), 1200) * env(int(0.03 * SR), 0.0003, 0.006)
    y = crinkle(0.18, 600, 1500, 8000, seed=13)[:int(0.18 * SR)] * np.exp(-np.linspace(0, 8, int(0.18 * SR)))
    out = np.zeros(int(0.2 * SR)); out[:len(x)] += x; out[:len(y)] += y * 0.8
    return norm(out, 0.9)


def sfx_ink():
    sec = 0.75; n = int(sec * SR); t = np.arange(n) / SR
    swell = lp(noise(sec), 1400) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.2
    blips = np.zeros(n)
    for k in range(9):
        f = rng.uniform(220, 700); m = int(0.06 * SR); s = int(rng.uniform(0.1, 0.6) * SR)
        b = np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.8, m)) / SR) * env(m, 0.002, 0.015)
        blips[s:s + m] += b[:max(0, min(m, n - s))]
    return norm(swell + blips * 0.35, 0.8)


def sfx_riser(sec=1.0):
    n = int(sec * SR)
    x = bp(noise(sec), 800, 5000) * np.linspace(0, 1, n) ** 2 * 0.6 + sine_sweep(300, 900, sec, 2) * np.linspace(0, 1, n) ** 2 * 0.3
    x *= np.minimum(1, (sec - np.arange(n) / SR) / 0.05)
    return norm(x, 0.5)


def sfx_sparkle():
    out = np.zeros(int(0.8 * SR))
    for k in range(7):
        f = rng.uniform(3000, 6500); m = int(0.35 * SR)
        place(out, np.sin(2 * np.pi * f * np.arange(m) / SR) * env(m, 0.001, 0.08), k * 0.05 + rng.uniform(0, 0.02))
    return norm(out, 0.45)


def ks(freq, sec, bright=0.5, decay=0.996, seed=0):
    """Karplus-Strong plucked string."""
    r = np.random.default_rng(seed)
    n = int(sec * SR); D = max(2, int(round(SR / freq - 0.5)))
    exc = r.uniform(-1, 1, D)
    exc = lp(exc, 800 + 9000 * bright) if D > 12 else exc
    x = np.zeros(n); x[:D] = exc
    a = np.zeros(D + 2); a[0] = 1; a[D] = -decay * 0.5; a[D + 1] = -decay * 0.5
    y = lfilter([1.0], a, x)
    y *= np.minimum(1, (sec - np.arange(n) / SR) / 0.03)
    return y / (np.max(np.abs(y)) + 1e-9)


def sfx_shimmer():
    out = np.zeros(int(1.6 * SR))
    notes = [62, 66, 69, 74, 78, 81, 86, 90]
    for k, m in enumerate(notes):
        place(out, ks(440 * 2 ** ((m - 69) / 12), 1.2, 0.8, 0.997, k) * 0.5, k * 0.045)
    place(out, sfx_sparkle() * 0.6, 0.25)
    return norm(out, 0.6)


def sfx_boing():
    sec = 0.45; n = int(sec * SR); t = np.arange(n) / SR
    f = 180 + 60 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 5) + 80 * t
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.005, 0.12), 0.35)


SFX = {'drop': sfx_drop, 'thud': sfx_thud, 'stamp': sfx_stamp, 'pop': sfx_pop, 'tick': sfx_tick, 'whoosh': sfx_whoosh,
       'slide': sfx_slide, 'paper': sfx_paper, 'tear': sfx_tear, 'ding': sfx_ding, 'seal': sfx_seal, 'snap': sfx_snap,
       'ink': sfx_ink, 'sparkle': sfx_sparkle, 'shimmer': sfx_shimmer, 'boing': sfx_boing, 'swing': sfx_tick}
cache = {}


def get_sfx(c):
    t = c['type']
    if t == 'scribble': return sfx_scribble(c.get('dur', 0.5))
    if t == 'type': return sfx_type(c.get('n', 16), c.get('dur', 1.0))
    if t == 'riser': return sfx_riser(c.get('dur', 1.0))
    if t not in cache: cache[t] = SFX[t]()
    return cache[t]


# ------------------------------------------------------------------ music
BPM = 96.0; BEAT = 60 / BPM
m2f = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = {  # bass, arpeggio notes
    'Dm': (38, [62, 65, 69, 74]), 'Bb': (34, [58, 62, 65, 70]), 'F': (41, [65, 69, 72, 77]), 'C': (36, [60, 64, 67, 72]),
    'Gm': (43, [62, 67, 70, 74]), 'A': (45, [61, 64, 69, 73]), 'D': (38, [62, 66, 69, 74]),
}


def music():
    mus = np.zeros(N); perc = np.zeros(N)
    start, stop = 0.36, 32.25
    prog_ = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A']
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]
    bar = 0; t = start
    while t < stop - 0.05:
        ch = CH[prog_[bar % len(prog_)]]
        for k in range(8):  # eighth-note pizzicato arpeggio
            tt = t + k * BEAT / 2
            if tt >= stop: break
            note = ch[1][pattern[k]] + (12 if (bar % 4 == 3 and k >= 6) else 0)
            vel = 0.55 if k % 2 == 0 else 0.38
            place(mus, ks(m2f(note), 0.7, 0.45, 0.993, bar * 8 + k) * vel, tt)
        if t >= 4.8 - 0.1:  # upright bass from the intro on
            for k, off in ((0, 0), (2, 7)):
                tt = t + k * BEAT
                if tt < stop: place(mus, lp(ks(m2f(ch[0] + off), 0.9, 0.2, 0.995, 900 + bar * 2 + k), 900) * 0.9, tt)
        for k in range(4):  # clock tick / soft brush
            tt = t + k * BEAT
            if tt >= stop: break
            m = int(0.03 * SR)
            tick = bp(noise(0.03), 2500 if k % 2 == 0 else 1800, 7000) * env(m, 0.0003, 0.005)
            place(perc, tick * (0.35 if t > 4.7 else 0.22), tt)
            if k in (1, 3) and t > 8.4:
                place(perc, bp(noise(0.12), 3000, 9000) * env(int(0.12 * SR), 0.01, 0.04) * 0.18, tt)
        bar += 1; t += 4 * BEAT
    # CTA: warm pad + resolution to D major on the wordmark
    def pad(notes, t0, sec, g=0.18):
        n = int(sec * SR); tt = np.arange(n) / SR; x = np.zeros(n)
        for m in notes:
            for det in (-0.12, 0.0, 0.11):
                f = m2f(m) * 2 ** (det / 12)
                x += 2 * ((tt * f) % 1) - 1
        x = lp(x, 1400, 4) * np.minimum(1, tt / 0.35) * np.minimum(1, (sec - tt) / 0.6)
        place(mus, x / (len(notes) * 3) * g * 6, t0)
    pad([46, 58, 62, 65], 32.75, 1.65, 0.16)
    pad([38, 57, 62, 66, 69], 34.3, DUR - 34.3, 0.2)
    for k, m in enumerate([62, 66, 69, 74, 78, 74, 69, 66, 62, 66, 69, 74]):
        tt = 34.3 + 0.9 + k * BEAT / 2
        if tt < DUR - 0.8: place(mus, ks(m2f(m), 1.0, 0.4, 0.996, 500 + k) * 0.32 * (1 - k / 16), tt)
    place(mus, lp(ks(m2f(38), 2.5, 0.2, 0.998, 777), 700) * 1.0, 34.3)
    return mus, perc


def vinyl():
    x = lp(noise(DUR + 1), 5000) * 0.004
    clicks = np.zeros(N)
    for _ in range(int(DUR * 7)):
        i = rng.integers(0, N - 100); L = rng.integers(8, 60)
        clicks[i:i + L] += rng.standard_normal(L) * np.exp(-np.linspace(0, 5, L)) * rng.uniform(0.01, 0.06)
    return x[:N] + hp(clicks, 1500)


def lufs_gain(x, target):
    # quick K-weighting-free loudness proxy (RMS of voiced parts) — final loudnorm happens in ffmpeg
    r = np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2) + 1e-12)
    return 10 ** ((target - 20 * np.log10(r)) / 20)


if __name__ == '__main__':
    vo = np.zeros(N)
    for v in TL['vo']:
        place(vo, load(f"{ROOT}/{v['file']}"), v['t'])
    fol = np.zeros(N)
    for c in TL['sfx']:
        place(fol, get_sfx(c), c['t'], c.get('gain', 1))
    amb = np.zeros(N)
    for c in TL['clips']:
        if c['name'] == 'c6_serial':  # may contain murmured speech — keep silent under the VO
            continue
        x = load(f"{ROOT}/assets/clipaudio/{c['name']}.wav", c['speed'])
        x = x[int(c['off'] / c['speed'] * SR):]
        a, b = c['visible']; n0 = int(max(0, a - c['start']) * SR); x = x[n0:int((b - c['start']) * SR)]
        f = int(0.15 * SR); x[:f] *= np.linspace(0, 1, min(f, len(x))); x[-f:] *= np.linspace(1, 0, min(f, len(x)))
        place(amb, x, max(a, c['start']), 2.2 * c.get('gain', 0.3))
    mus, perc = music()
    # side-chain ducking from VO envelope
    e = np.abs(vo); win = int(0.03 * SR)
    e = np.convolve(e, np.ones(win) / win, mode='same')
    e = e / (e.max() + 1e-9)
    att, rel = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.35 * SR))
    g = lfilter([1 - rel], [1, -rel], (e > 0.05).astype(float))
    duck = 1 - 0.5 * np.clip(g, 0, 1)
    music_bus = (mus * 0.34 + perc * 0.7) * duck
    vo *= 1.0
    mix = vo * 1.0 + fol * 0.45 + amb + music_bus + vinyl()
    # stereo: slight width for music/foley via tiny delay
    d = int(0.011 * SR)
    wide = music_bus * 0.25 + fol * 0.06
    L = mix + np.concatenate([np.zeros(d), wide[:-d]]) * 0.5 - wide * 0.25
    R = mix - np.concatenate([np.zeros(d), wide[:-d]]) * 0.5 + wide * 0.25
    fade = int(0.5 * SR); end = int(DUR * SR)
    for ch in (L, R):
        ch[end - fade:end] *= np.linspace(1, 0.0, fade) ** 0.5; ch[end:] = 0
    st = np.stack([L[:end], R[:end]], 1)
    st = st / (np.max(np.abs(st)) + 1e-9) * 0.9
    raw = f'{ROOT}/out/mix_raw.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=st.astype(np.float64).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9', '-ar', str(SR), f'{ROOT}/out/mix.wav'], check=True)
    # stems for QA
    for name, x in (('stem_vo', vo), ('stem_music', music_bus), ('stem_foley', fol * 0.45), ('stem_amb', amb)):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', f'{ROOT}/out/{name}.wav'], input=x[:end].astype(np.float64).tobytes(), check=True)
    print('mix done', DUR)
