"""Turns raw Higgsfield images (assets/img/*.png) into engine-ready assets in assets/prep/:
engravings -> transparent ink PNGs, aged paper -> two graded paper sheets (FILMX ivory palette)."""
from PIL import Image
import numpy as np

INK = np.array([0x1C, 0x1B, 0x18], float)


def ink_png(src, dst, maxdim=1400):
    a = np.asarray(Image.open(src).convert('L')).astype(float)
    bg = np.percentile(a, 90)
    alpha = np.clip((bg - 6 - a) / (bg - 40), 0, 1) ** 0.85
    ys, xs = np.where(alpha > 0.08); m = 24
    y0, y1, x0, x1 = max(ys.min() - m, 0), min(ys.max() + m, a.shape[0]), max(xs.min() - m, 0), min(xs.max() + m, a.shape[1])
    alpha = alpha[y0:y1, x0:x1]
    rgba = np.zeros(alpha.shape + (4,), np.uint8); rgba[..., :3] = INK; rgba[..., 3] = (alpha * 255).astype(np.uint8)
    out = Image.fromarray(rgba, 'RGBA'); s = min(1, maxdim / max(out.size))
    out.resize((int(out.width * s), int(out.height * s)), Image.LANCZOS).save(dst)


for f in ['eng_car', 'eng_kettle', 'eng_roll', 'eng_standing', 'eng_bust', 'eng_magnifier']:
    ink_png(f'assets/img/{f}.png', f'assets/prep/{f}.png')

a = np.asarray(Image.open('assets/img/paper.png').convert('RGB').resize((1080, 1920), Image.LANCZOS)).astype(float)
m = a.reshape(-1, 3).mean(0); lum = a.mean(2, keepdims=True); lm = lum.mean()


def grade(target, tex, chroma):
    return np.clip(np.array(target) + (lum - lm) * tex + ((a - lum) - (m - lm)) * chroma, 0, 255).astype(np.uint8)


Image.fromarray(grade([238, 228, 207], 1.15, 0.55)).save('assets/prep/paper_bg.jpg', quality=94)
Image.fromarray(grade([246, 241, 229], 0.6, 0.3)).save('assets/prep/paper_cta.jpg', quality=94)
print('prep done')
