// node engine/render.mjs --proto p1 [--stills 0.5,1.2] [--video] [--scale 0.5]
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2); const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const proto = opt('--proto') || 'p1';
const OUT = path.join(ROOT, 'out', proto); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !m.text().includes('favicon')) console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/engine/index.html?p=${proto}`);
await page.waitForFunction(() => window.initPromise);
await page.evaluate(() => window.initPromise);
const meta = await page.evaluate(() => ({ duration: PROTO.duration, fps: PROTO.fps || 30, sfx: PROTO.sfx || [], music: PROTO.music || null, clips: PROTO.clipsAudio || [],
  vo: PROTO.vo || [], fadeOut: PROTO.fadeOut || null, voLufs: PROTO.voLufs ?? -15, sfxGain: PROTO.sfxGain ?? 0.12 }));
fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(meta, null, 1));
const canvas = await page.$('#stage');
const shot = async (t, type = 'png') => { await page.evaluate(tt => window.renderFrame(tt), t); return canvas.screenshot({ type, quality: type === 'jpeg' ? 94 : undefined }); };
if (args.includes('--stills')) {
  const dir = path.join(OUT, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const t of (opt('--stills') || '1').split(',').map(Number)) { fs.writeFileSync(path.join(dir, `t_${t.toFixed(2).padStart(5, '0')}.png`), await shot(t)); }
  console.log('stills ->', dir);
}
if (args.includes('--video')) {
  // --workers N: N pages render contiguous frame ranges into separate segments, then a lossless concat
  const fps = meta.fps, n1 = Math.round(meta.duration * fps), scale = opt('--scale'), workers = Math.max(1, Number(opt('--workers') || 1));
  const outFile = path.join(OUT, 'video_noaudio.mp4');
  const encode = (file) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', ...(scale ? ['-vf', `scale=${Math.round(1080 * scale / 2) * 2}:-2`] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-r', String(fps), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const pages = [page];
  for (let k = 1; k < workers; k++) {
    const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    pg.on('pageerror', e => console.log('[pageerror]', e.message));
    await pg.goto(`http://127.0.0.1:${server.address().port}/engine/index.html?p=${proto}`);
    await pg.waitForFunction(() => window.initPromise); await pg.evaluate(() => window.initPromise); pages.push(pg);
  }
  const per = Math.ceil(n1 / workers), segs = [];
  const t0 = Date.now(); let done = 0;
  await Promise.all(pages.map(async (pg, k) => {
    const a = k * per, b = Math.min(n1, a + per); if (a >= b) return;
    const file = workers === 1 ? outFile : path.join(OUT, `seg_${k}.mp4`); segs[k] = file;
    const ff = encode(file), cv = await pg.$('#stage');
    for (let n = a; n < b; n++) {
      await pg.evaluate(tt => window.renderFrame(tt), n / fps);
      const buf = await cv.screenshot({ type: 'jpeg', quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 150 === 0) console.log(`${done}/${n1} frames, ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  if (workers > 1) {
    const list = path.join(OUT, 'segs.txt'); fs.writeFileSync(list, segs.filter(Boolean).map(f => `file '${f}'`).join('\n'));
    await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', outFile], { stdio: 'inherit' }).on('close', r));
    segs.filter(Boolean).forEach(f => fs.unlinkSync(f));
  }
  console.log('video ->', outFile, `${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await browser.close(); server.close();
