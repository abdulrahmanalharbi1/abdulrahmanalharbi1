#!/usr/bin/env bash
# Full pipeline: frames -> motion graphic render -> soundtrack -> final MP4.
# Requires: node + playwright (npm install), ffmpeg, python3 (numpy, scipy, pillow).
set -euo pipefail
cd "$(dirname "$0")/.."

# 1) footage frames from the Higgsfield clips (24 fps JPEG sequences, git-ignored)
for v in assets/video/*.mp4; do
  n=$(basename "$v" .mp4)
  if [ ! -f "assets/frames/$n/0121.jpg" ]; then
    mkdir -p "assets/frames/$n" && ffmpeg -v error -y -i "$v" -q:v 3 "assets/frames/$n/%04d.jpg"
  fi
  [ -f "assets/clipaudio/$n.wav" ] || { mkdir -p assets/clipaudio; ffmpeg -v error -y -i "$v" -vn -ac 1 -ar 48000 "assets/clipaudio/$n.wav"; }
done

# 2) motion graphic (also writes out/timeline.json used by the mixer)
node engine/render.mjs --video

# 3) soundtrack
python3 tools/audio_mix.py .

# 4) mux
ffmpeg -v error -y -i out/video_noaudio.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 \
  -movflags +faststart -shortest -metadata title="FILMX — كيف تفرّق حماية PPF الأصلية من المغشوشة" out/FILMX_PPF_Original_vs_Fake.mp4
echo "done -> out/FILMX_PPF_Original_vs_Fake.mp4"
