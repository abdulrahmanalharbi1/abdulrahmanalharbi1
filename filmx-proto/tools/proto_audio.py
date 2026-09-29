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
    """Reference-style pulse bed (measured): ~90 BPM, soft shaker on every 8th (>5 kHz), felt pluck on every quarter
    (250-600 Hz), sustained pad under 700 Hz; flat energy, no kick/snare/riser, never ducked."""
    bpm = cfg.get('bpm', 90); beat = 60 / bpm; start = cfg.get('start', 0.0); end = cfg.get('end', DUR)
    pad_notes = cfg.get('pad', [57, 62, 65, 69, 74])        # A3 D4 F4 A4 D5 (220-587 Hz): audible on phones, below the VO core
    pluck_seq = cfg.get('pluck', [62, 65, 69, 67, 62, 65, 69, 72])  # D4 F4 A4 G4 ... (293-523 Hz)
    out = np.zeros(N)
    n = int((end - start + 1.5) * SR); tt = np.arange(n) / SR; pad = np.zeros(n)
    for m in pad_notes:
        for det in (-0.08, 0.07):
            f = m2f(m) * 2 ** (det / 12)
            pad += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
    pad = hp(lp(pad, 1000, 4), 120) * np.minimum(1, tt / 0.25) * 0.05
    place(out, pad, start)
    k = 0; t = start
    while t < end - 0.02:
        place(out, felt_piano(pluck_seq[k % len(pluck_seq)], 1.4, 0.34 if k % 4 == 0 else 0.26), t)
        for h in (0, 0.5):  # shaker 8ths, on-beat louder
            m = int(0.12 * SR)
            sh = bp(noise(0.12), 5200, 12000) * env(m, 0.004, 0.035)
            place(out, sh * (0.55 if h == 0 else 0.32), t + h * beat)
        k += 1; t += beat
    return out


def squeegee():
    """Act-break swish, re-voiced as a film squeegee swipe: 150 ms bright burst (3-10 kHz) with a ~4.3 kHz ping,
    then a 250 ms tonal tail falling ~4 semitones. Peak on the cut frame (place 0.12 s early)."""
    n1 = int(0.15 * SR); burst = bp(noise(0.15), 3000, 10000) * np.sin(np.pi * np.linspace(0, 1, n1)) ** 0.7
    ping = np.sin(2 * np.pi * 4300 * np.arange(int(0.11 * SR)) / SR) * env(int(0.11 * SR), 0.004, 0.05)
    tail = sweep(6300, 5000, 0.25) * np.linspace(1, 0, int(0.25 * SR)) ** 2 * 0.35
    out = np.zeros(int(0.45 * SR)); out[:n1] += burst; out[int(0.03 * SR):int(0.03 * SR) + len(ping)] += ping * 0.5
    out[n1:n1 + len(tail)] += tail
    return norm(out, 0.8)


def hiss_swell():
    """Logo swell, re-voiced as a heat-gun hiss: noise 250-1500 Hz rising ~17 dB over 0.7 s, cut hard at the peak."""
    n = int(0.7 * SR); k = np.linspace(0, 1, n)
    x = bp(noise(0.7), 250, 1500) * (10 ** (-17 / 20) + (1 - 10 ** (-17 / 20)) * k ** 2)
    x[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return norm(x, 0.7)


SFX.update({'squeegee': squeegee, 'hiss': hiss_swell})


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def lufs_norm(x, target):
    """Normalise a mono stem to an integrated loudness target via ffmpeg loudnorm (linear, two-pass-ish)."""
    tmp = f'{ROOT}/out/{proto}/_stem.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', tmp], input=x.tobytes(), check=True)
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float([l for l in r.splitlines() if l.strip().startswith('I:')][-1].split()[1])
    return x * 10 ** ((target - I) / 20)


if __name__ == '__main__':
    end = int(DUR * SR)
    vo = np.zeros(N)
    for v in TL.get('vo', []):
        x = load(f"{ROOT}/{v['file']}")
        if v.get('to') is not None:  # trim a take at a natural pause (0.04 s fade so the cut is inaudible)
            x = x[:int(v['to'] * SR)].copy(); f = int(0.04 * SR); x[-f:] *= np.linspace(1, 0, f)
        place(vo, x, v['t'], v.get('gain', 1.0))
    fol = np.zeros(N)
    for c in TL.get('sfx', []):
        place(fol, SFX[c['type']](), c['t'], c.get('gain', 1))
    mus = music(TL['music']) if TL.get('music') else np.zeros(N)
    if TL.get('fadeOut'):  # music fades with the picture fade, silent 6 frames before black
        a, b = TL['fadeOut']; ia, ib = int(a * SR), int((b - 0.2) * SR)
        mus[ia:ib] *= np.linspace(1, 0, ib - ia) ** 1.3; mus[ib:] = 0
    else:
        mus[end - int(0.03 * SR):end] *= np.linspace(1, 0, int(0.03 * SR))
    has_vo = np.abs(vo).max() > 0
    vo_t = TL.get('voLufs', -15.0)
    if has_vo: vo = lufs_norm(vo[:end], vo_t)
    mus = lufs_norm(mus[:end], (vo_t - 11) if has_vo else -25) * TL.get('music', {}).get('gain', 1.0)
    fol = fol[:end] * (10 ** ((vo_t + 3 - 0) / 20) if False else 1.0)
    mix = (vo[:end] if has_vo else 0) + mus + fol[:end] * TL.get('sfxGain', 0.12)
    d = int(0.012 * SR)
    L = mix + np.concatenate([np.zeros(d), mus[:-d]]) * 0.08; R = mix - np.concatenate([np.zeros(d), mus[:-d]]) * 0.08
    st = np.stack([L, R], 1)
    raw = f'{ROOT}/out/{proto}/mix_raw.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=st.tobytes(), check=True)
    target = -14 if has_vo else -25
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'loudnorm=I={target}:TP=-1.2:LRA=11', '-ar', str(SR), f'{ROOT}/out/{proto}/mix.wav'], check=True)
    print('audio ->', f'out/{proto}/mix.wav', 'vo' if has_vo else 'bed-only')
    if has_vo:  # M&E stem (music + effects, no VO) at exactly the level it sits under the VO in mix.wav,
        # so a re-recorded voice at ~-15 LUFS drops in with the same balance
        r = subprocess.run(['ffmpeg', '-v', 'info', '-i', raw, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
        I = float([l for l in r.splitlines() if l.strip().startswith('I:')][-1].split()[1])
        me = mus + fol[:end] * TL.get('sfxGain', 0.12)
        side = np.concatenate([np.zeros(d), mus[:-d]]) * 0.08
        st = np.stack([me + side, me - side], 1) * 10 ** ((target - I) / 20)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', f'{ROOT}/out/{proto}/mix_me.wav'], input=st.tobytes(), check=True)
        print('audio ->', f'out/{proto}/mix_me.wav', 'music + effects')
