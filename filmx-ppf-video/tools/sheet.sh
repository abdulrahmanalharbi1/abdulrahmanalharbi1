#!/bin/bash
# contact sheet of N frames across a clip: sheet.sh in.mp4 out.jpg [n]
n=${3:-6}; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
ffmpeg -v error -y -i "$1" -vf "fps=$n/$d,scale=270:-1,tile=${n}x1:padding=6" -frames:v 1 "$2"
