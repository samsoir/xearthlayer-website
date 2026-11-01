#!/usr/bin/env python3
"""Extract the homepage scroll-story frames and write the manifest Hugo reads.

Keeps every Nth frame of a video master as WebP, in one directory per
output width, and writes data/scrolly.json describing the sequence and the
hold frames (where the picture pauses on a feature).

Usage:
  python3 scripts/extract-scrolly-frames.py MASTER [--step 3] [--widths 1440,960]
      [--holds streaming=99,night=377] [--quality 78]
      [--out static/images/scrolly] [--manifest data/scrolly.json]

Exit codes: 0 success, 1 usage or input error, 2 ffmpeg or ffprobe failure.
Requires ffmpeg and ffprobe on PATH; ffmpeg must have libwebp.
"""
import argparse
import json
import math
import os
import shutil
import subprocess
import sys


class ExtractError(Exception):
    """A usage or input problem the caller can fix."""


def kept_count(total_frames, step):
    if total_frames <= 0:
        raise ExtractError(f"frame count must be positive, got {total_frames}")
    if step <= 0:
        raise ExtractError(f"step must be positive, got {step}")
    return math.ceil(total_frames / step)


def hold_index(source_frame, step, total_frames):
    if not 0 <= source_frame < total_frames:
        raise ExtractError(
            f"hold frame {source_frame} is outside the master's 0..{total_frames - 1}"
        )
    last = kept_count(total_frames, step) - 1
    return min(round(source_frame / step), last)


def pad_width(count):
    return 3 if count <= 1000 else 4


def parse_holds(text):
    holds = {}
    for part in text.split(","):
        part = part.strip()
        if not part:
            raise ExtractError(f"empty hold in {text!r}")
        name, sep, value = part.partition("=")
        if not sep or not name or not value.isdigit():
            raise ExtractError(f"bad hold {part!r}, expected name=frame")
        holds[name] = int(value)
    return holds


def parse_widths(text):
    widths = []
    for part in text.split(","):
        part = part.strip()
        if not part.isdigit() or int(part) <= 0:
            raise ExtractError(f"bad width {part!r} in {text!r}")
        widths.append(int(part))
    if not widths:
        raise ExtractError("at least one width is required")
    return widths


def probe(master):
    cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,nb_frames,duration",
        "-of", "json", master,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed:\n{proc.stderr}")
    streams = json.loads(proc.stdout).get("streams") or []
    if not streams:
        raise ExtractError(f"no video stream in {master}")
    s = streams[0]
    num, _, den = s["r_frame_rate"].partition("/")
    fps = float(num) / float(den or 1)
    frames = int(s.get("nb_frames") or 0)
    if frames <= 0:
        frames = round(float(s["duration"]) * fps)
    return {"width": int(s["width"]), "height": int(s["height"]), "fps": fps, "frames": frames}


def ffmpeg_args(master, step, width, quality, out_dir, pad):
    return [
        "ffmpeg", "-v", "error", "-y", "-i", master,
        "-vf", f"select='not(mod(n\\,{step}))',scale={width}:-2",
        "-fps_mode", "vfr", "-start_number", "0",
        "-c:v", "libwebp", "-quality", str(quality), "-compression_level", "6",
        os.path.join(out_dir, f"%0{pad}d.webp"),
    ]


def build_manifest(source, step, widths, holds):
    count = kept_count(source["frames"], step)
    fps = source["fps"]
    return {
        "fps": int(fps) if float(fps).is_integer() else fps,
        "step": step,
        "frames": count,
        "source": {"width": source["width"], "height": source["height"], "frames": source["frames"]},
        "widths": list(widths),
        "pad": pad_width(count),
        "holds": {name: hold_index(frame, step, source["frames"]) for name, frame in holds.items()},
        "end": count - 1,
    }


def extract(master, manifest, widths, quality, out_root):
    for width in widths:
        out_dir = os.path.join(out_root, str(width))
        if os.path.isdir(out_dir):
            shutil.rmtree(out_dir)
        os.makedirs(out_dir)
        proc = subprocess.run(
            ffmpeg_args(master, manifest["step"], width, quality, out_dir, manifest["pad"]),
            capture_output=True, text=True,
        )
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg failed for width {width}:\n{proc.stderr}")
        written = len([n for n in os.listdir(out_dir) if n.endswith(".webp")])
        if written != manifest["frames"]:
            raise RuntimeError(
                f"width {width}: wrote {written} frames, manifest expects {manifest['frames']}"
            )
        print(f"{width}: {written} frames in {out_dir}")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("master")
    parser.add_argument("--step", type=int, default=3)
    parser.add_argument("--widths", default="1440,960")
    parser.add_argument("--holds", default="streaming=99,night=377")
    parser.add_argument("--quality", type=int, default=78)
    parser.add_argument("--out", default="static/images/scrolly")
    parser.add_argument("--manifest", default="data/scrolly.json")
    args = parser.parse_args(argv)

    try:
        if not os.path.isfile(args.master):
            raise ExtractError(f"master not found: {args.master}")
        widths = parse_widths(args.widths)
        holds = parse_holds(args.holds)
        source = probe(args.master)
        manifest = build_manifest(source, args.step, widths, holds)
    except ExtractError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    print(f"master: {source['width']}x{source['height']}, {source['fps']:g} fps, {source['frames']} frames")
    print(f"keeping every {args.step} frames: {manifest['frames']} frames, indices 0..{manifest['end']}")
    for name, frame in holds.items():
        idx = manifest["holds"][name]
        actual = idx * args.step
        print(f"hold {name}: frame {frame} -> index {idx} (source frame {actual}, {actual - frame:+d} frames)")

    try:
        extract(args.master, manifest, widths, args.quality, args.out)
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    os.makedirs(os.path.dirname(args.manifest) or ".", exist_ok=True)
    with open(args.manifest, "w") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    print(f"manifest: {args.manifest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
