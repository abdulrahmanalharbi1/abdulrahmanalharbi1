// Frame-accurate renderer: serves the project, drives engine/index.html in headless Chromium,
// and either writes stills (--stills 1.2,5.0) or pipes every frame into ffmpeg (--video).
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/engine/index.html`);
await page.evaluate(() => window.initPromise);
const TL = await page.evaluate(() => window.TIMELINE);
fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(TL, null, 1));
const canvas = await page.$('#stage');

async function shot(t, type = 'png') {
  await page.evaluate(tt => window.renderFrame(tt), t);
  return canvas.screenshot({ type, quality: type === 'jpeg' ? 95 : undefined, animations: 'disabled' });
}

if (args.includes('--stills')) {
  const times = (opt('--stills') || '1').split(',').map(Number);
  const dir = path.join(OUT, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const t of times) {
    const buf = await shot(t);
    fs.writeFileSync(path.join(dir, `t_${t.toFixed(2).padStart(6, '0')}.png`), buf);
    console.log('still', t);
  }
} else if (args.includes('--video')) {
  const fps = TL.fps, from = +(opt('--from') ?? 0), to = +(opt('--to') ?? TL.duration);
  const scale = opt('--scale');
  const outFile = opt('--out') || path.join(OUT, 'video_noaudio.mp4');
  const vf = scale ? ['-vf', `scale=${Math.round(1080 * scale / 2) * 2}:-2`] : [];
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ...vf, '-c:v', 'libx264', '-preset', scale ? 'veryfast' : 'slow', '-crf', scale ? '24' : '17', '-maxrate', '11M', '-bufsize', '22M', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p', '-r', String(fps), outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * fps), n1 = Math.round(to * fps);
  const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    const buf = await shot(n / fps, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 30 === 0) console.log(`frame ${n}/${n1}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', outFile);
}
await browser.close();
server.close();
