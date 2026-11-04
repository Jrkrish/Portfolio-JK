"""Turns the frames from tools/record_demo.mjs into the README's demo.

    python tools/encode_demo.py

Writes docs/demo.webp, which plays inline in a GitHub README, and
docs/demo.webm, the full-size video. Needs Pillow and opencv-python.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ROOT / "tests" / "shots" / "frames"
DOCS = ROOT / "docs"
DOCS.mkdir(exist_ok=True)

SEQUENCE_FPS = 24
PREVIEW_EVERY = 2  # the README preview runs at 12 fps
PREVIEW_WIDTH = 960

records = json.loads((FRAMES / "frames.json").read_text())
start = records[0]["t"]
end = records[-1]["t"]


def timeline():
    """The latest captured frame at each tick, so time runs true."""
    i = 0
    for tick in range(int((end - start) * SEQUENCE_FPS) + 1):
        now = start + tick / SEQUENCE_FPS
        while i + 1 < len(records) and records[i + 1]["t"] <= now:
            i += 1
        yield tick, records[i]["name"]


first = cv2.imread(str(FRAMES / records[0]["name"]))
height, width = first.shape[:2]
video = cv2.VideoWriter(str(DOCS / "demo.webm"), cv2.VideoWriter_fourcc(*"VP90"), SEQUENCE_FPS, (width, height))
if not video.isOpened():
    raise SystemExit("VP9 encoder unavailable")

preview = []
ratio = PREVIEW_WIDTH / width
for tick, name in timeline():
    frame = cv2.imread(str(FRAMES / name))
    video.write(frame)
    if tick % PREVIEW_EVERY == 0:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        small = cv2.resize(rgb, (PREVIEW_WIDTH, round(height * ratio)), interpolation=cv2.INTER_AREA)
        preview.append(Image.fromarray(np.asarray(small)))
video.release()

preview[0].save(
    DOCS / "demo.webp",
    save_all=True,
    append_images=preview[1:],
    duration=round(1000 * PREVIEW_EVERY / SEQUENCE_FPS),
    loop=0,
    quality=72,
    method=4,
)
for f in ("demo.webp", "demo.webm"):
    print(f, f"{(DOCS / f).stat().st_size / 1e6:.1f} MB")
print(f"{end - start:.1f}s, {len(preview)} preview frames")
