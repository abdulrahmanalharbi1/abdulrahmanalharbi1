#!/usr/bin/env bash
# Render prototypes: frames -> video, soundtrack, mux.  usage: tools/build_protos.sh p1 p2 p3 p4
set -euo pipefail
cd "$(dirname "$0")/.."
for p in "${@:-p1 p2 p3 p4}"; do
  node engine/render.mjs --proto "$p" --video
  python3 tools/proto_audio.py "$p" .
  ffmpeg -v error -y -i "out/$p/video_noaudio.mp4" -i "out/$p/mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest "out/FILMX_proto_${p}.mp4"
  echo "built out/FILMX_proto_${p}.mp4"
done
