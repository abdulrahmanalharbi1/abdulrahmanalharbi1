"""Tighten TTS voice-over takes: trim edges, shorten long internal pauses, gentle tempo-up."""
import subprocess, sys, json, numpy as np, os
SR = 48000
def load(path):
    raw = subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def save(path, x):
    p = subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-",path],input=x.astype(np.float32).tobytes(),check=True)
def tighten(x, max_pause=0.16, min_pause=0.22, thr_db=-38):
    hop = int(0.01*SR)
    n = len(x)//hop
    rms = np.sqrt(np.mean(x[:n*hop].reshape(n,hop)**2,axis=1)+1e-12)
    db = 20*np.log10(rms/ (rms.max()+1e-9))
    voiced = db > thr_db
    idx = np.where(voiced)[0]
    s, e = max(idx[0]-3,0), min(idx[-1]+6, n)
    segs=[]; cur=None
    for i in range(s,e):
        if voiced[i]:
            if cur is None: cur=[i,i]
            cur[1]=i
        else:
            if cur is not None and i-cur[1] > min_pause/0.01:
                segs.append(cur); cur=None
    if cur: segs.append(cur)
    out=[]; fade=int(0.012*SR)
    for k,(a,b) in enumerate(segs):
        a0=max(a*hop-int(0.03*SR),0); b0=min((b+1)*hop+int(0.05*SR),len(x))
        seg=x[a0:b0].copy()
        seg[:fade]*=np.linspace(0,1,fade); seg[-fade:]*=np.linspace(1,0,fade)
        out.append(seg)
        if k < len(segs)-1:
            gap = (segs[k+1][0]-b)*0.01
            out.append(np.zeros(int(min(gap, max_pause)*SR)))
    return np.concatenate(out)
if __name__=="__main__":
    src, dst, tempo = sys.argv[1], sys.argv[2], float(sys.argv[3])
    x = tighten(load(src))
    tmp = dst+".tmp.wav"; save(tmp, x)
    subprocess.run(["ffmpeg","-v","error","-y","-i",tmp,"-af",f"rubberband=tempo={tempo}:transients=smooth:formant=preserved,highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7","-ar",str(SR),dst],check=True)
    os.remove(tmp)
    d = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",dst],capture_output=True,text=True).stdout)
    print(os.path.basename(dst), round(d,3))
