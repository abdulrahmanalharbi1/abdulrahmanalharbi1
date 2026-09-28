import sys, glob
from PIL import Image, ImageDraw
files = sys.argv[2:]
out = sys.argv[1]
w = 400; ims = []
for f in files:
    im = Image.open(f).convert('RGB'); im = im.resize((w, int(im.height * w / im.width)))
    d = ImageDraw.Draw(im); d.rectangle([0, 0, 90, 24], fill=(0, 0, 0)); d.text((4, 5), f.split('t_')[-1][:-4], fill=(255, 255, 0))
    ims.append(im)
cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 6), rows * (ims[0].height + 6)), (60, 60, 60))
for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * (w + 6), (i // cols) * (im.height + 6)))
sheet.save(out, quality=85)
