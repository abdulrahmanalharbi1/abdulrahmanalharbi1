"""Soundtrack for a prototype: reads out/<proto>/timeline.json ({duration, sfx:[{t,type,gain}], music:{...}})
and writes out/<proto>/mix.wav. Modern-minimal sound palette matching the reference ad
(soft blur whooshes, sub hits on hero words, UI clicks on pills, shimmer on the logo) + a synthesised bed."""
import json, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, lfilter

SR = 48000
proto = sys.argv[1]
ROOT = sys.argv[2] if len(sys.argv) > 2 else '.'
TL = json.load(open(f'{ROOT}/out/{proto}/timeline.json'))
DUR = TL['duration']; N = int(DUR * SR) + SR
rng = np.random.default_rng(11)

bp = lambda x, lo, hi, o=2: sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
lp = lambda x, f, o=2: sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
noise = lambda s: rng.standard_normal(int(s * SR))
m2f = lambda m: 440 * 2 ** ((m - 69) / 12)


def env(n, a=0.002, d=0.2, c=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-c * np.maximum(0, t - a) / max(d, 1e-4))


def norm(x, p=1.0):
    return x / (np.max(np.abs(x)) + 1e-9) * p


def place(buf, x, t, g=1.0):
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[:j - i] * g


def sweep(f0, f1, s, curve=1.0):
    n = int(s * SR); k = np.linspace(0, 1, n) ** curve
    return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * k) / SR)


# ---------------------------------------------------------------- sfx
def whoosh(s=0.5, lo=250, hi=3200, air=0.6):
    n = int(s * SR); x = noise(s); out = np.zeros(n); blk = 480
    for k in range(0, n, blk):
        u = k / n; fc = lo + (hi - lo) * np.sin(np.pi * u) ** 1.6
        seg = bp(x[max(0, k - 2400):k + blk], fc * 0.55, min(fc * 1.7, 20000))[-min(blk, n - k):]
        out[k:k + len(seg)] = seg
    out *= np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    out += hp(noise(s), 6000) * np.sin(np.pi * np.linspace(0, 1, n)) ** 3 * 0.08 * air
    return norm(out, 0.7)


def sub_hit(f0=62, s=0.9):
    n = int(s * SR)
    body = sweep(f0 * 1.6, f0, s, 0.3) * env(n, 0.004, 0.35)
    click = hp(noise(0.02), 2500) * env(int(0.02 * SR), 0.0005, 0.004)
    out = body.copy(); out[:len(click)] += click * 0.35
    return norm(np.tanh(out * 1.6), 0.95)


def click(f=2600):
    n = int(0.05 * SR)
    x = np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.0005, 0.008) + hp(noise(0.05), 3500) * env(n, 0.0003, 0.003) * 0.5
    return norm(x, 0.55)


def pop():
    n = int(0.08 * SR)
    return norm(sweep(420, 900, 0.08) * env(n, 0.001, 0.02), 0.5)


def shimmer(s=1.6):
    out = np.zeros(int(s * SR)); t = np.arange(int(1.2 * SR)) / SR
    for k, m in enumerate([74, 78, 81, 86, 90, 93]):
        tone = sum(a * np.sin(2 * np.pi * m2f(m) * h * t) for h, a in ((1, 1), (2, 0.3), (3.01, 0.12))) * np.exp(-t * 3.5)
        place(out, tone * np.minimum(1, t / 0.004), k * 0.05)
    return norm(out, 0.45)


def riser(s=1.0):
    n = int(s * SR); k = np.linspace(0, 1, n)
    x = bp(noise(s), 600, 7000) * k ** 2.2 * 0.6 + sweep(180, 720, s, 2) * k ** 2 * 0.3
    x *= np.minimum(1, (s - np.arange(n) / SR) / 0.03)
    return norm(x, 0.55)


def paper(s=0.4):
    n = int(s * SR); out = np.zeros(n + 2000)
    for _ in range(int(300 * s)):
        i = rng.integers(0, n); L = rng.integers(60, 600)
        out[i:i + L] += rng.standard_normal(L) * np.exp(-np.linspace(0, 6, L)) * rng.uniform(0.2, 1)
    return norm(bp(out[:n], 900, 7000) * np.sin(np.pi * np.linspace(0, 1, n)), 0.55)


def tick():
    n = int(0.03 * SR)
    return norm(bp(noise(0.03), 2500, 8000) * env(n, 0.0003, 0.005), 0.4)


def stamp():
    n = int(0.25 * SR)
    x = sweep(150, 55, 0.25) * env(n, 0.001, 0.06)
    x[:int(0.012 * SR)] += hp(noise(0.012), 2500) * env(int(0.012 * SR), 0.0005, 0.003)
    return norm(x, 0.95)


def reverse_swell(s=0.8):
    x = whoosh(s, 300, 5000)[::-1] * np.linspace(0.2, 1, int(s * SR)) ** 2
    return norm(x, 0.6)


SFX = {'whoosh': whoosh, 'whoosh_long': lambda: whoosh(0.9, 200, 2600), 'sub': sub_hit, 'sub_low': lambda: sub_hit(48, 1.2),
       'click': click, 'pop': pop, 'shimmer': shimmer, 'riser': riser, 'paper': paper, 'tick': tick, 'stamp': stamp,
       'swell': reverse_swell}


# ---------------------------------------------------------------- music bed (modern minimal)
def felt_piano(m, s, vel=0.5):
    n = int(s * SR); t = np.arange(n) / SR; f = m2f(m)
    x = sum(a * np.sin(2 * np.pi * f * h * (1 + 0.0004 * h * h) * t) * np.exp(-t * (1.8 + h * 0.9)) for h, a in ((1, 1), (2, 0.42), (3, 0.18), (4, 0.08), (5, 0.04)))
    x *= np.minimum(1, t / 0.006) * np.minimum(1, (s - t) / 0.08)
    return lp(x, 2600) * vel


def music(cfg):
    bpm = cfg.get('bpm', 100); beat = 60 / bpm; start = cfg.get('start', 0.0); end = cfg.get('end', DUR)
    prog_ = cfg.get('chords', [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64]])
    out = np.zeros(N); pulse = np.zeros(N)
    t = start; bar = 0
    while t < end - 0.05:
        ch = prog_[bar % len(prog_)]
        for k, m in enumerate(ch[1:]):  # soft piano chord, slightly spread
            place(out, felt_piano(m, 4 * beat + 1.2, 0.26), t + k * 0.018)
        place(out, felt_piano(ch[0], 4 * beat + 1.5, 0.4), t)
        for b in range(4):  # sub pulse on every beat + air tick on offbeats
            tt = t + b * beat
            if tt >= end: break
            n = int(0.35 * SR)
            place(pulse, np.sin(2 * np.pi * m2f(ch[0] - 12) * np.arange(n) / SR) * env(n, 0.01, 0.16) * (0.9 if b == 0 else 0.55), tt)
            place(pulse, tick() * 0.55, tt + beat / 2)
        bar += 1; t += 4 * beat
    return out + pulse * 0.8


if __name__ == '__main__':
    fol = np.zeros(N)
    for c in TL.get('sfx', []):
        place(fol, SFX[c['type']](), c['t'], c.get('gain', 1))
    mus = music(TL['music']) if TL.get('music') else np.zeros(N)
    end = int(DUR * SR)
    mus[end - int(0.4 * SR):end] *= np.linspace(1, 0, int(0.4 * SR))
    mix = fol * 0.8 + mus * TL.get('music', {}).get('gain', 0.35) if TL.get('music') else fol * 0.8
    d = int(0.012 * SR)
    L = mix + np.concatenate([np.zeros(d), mus[:-d]]) * 0.08; R = mix - np.concatenate([np.zeros(d), mus[:-d]]) * 0.08
    st = np.stack([L[:end], R[:end]], 1); st = st / (np.max(np.abs(st)) + 1e-9) * 0.9
    raw = f'{ROOT}/out/{proto}/mix_raw.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=st.tobytes(), check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9', '-ar', str(SR), f'{ROOT}/out/{proto}/mix.wav'], check=True)
    print('audio ->', f'out/{proto}/mix.wav')
