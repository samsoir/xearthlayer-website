"""Tests for scripts/extract-scrolly-frames.py. Run: python3 -m unittest scripts/test_extract_scrolly_frames.py"""
import importlib.util
import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "extract-scrolly-frames.py")

spec = importlib.util.spec_from_file_location("extract_scrolly_frames", SCRIPT)
ex = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ex)

SOURCE = {"width": 5120, "height": 2160, "fps": 24.0, "frames": 488}


class KeptCount(unittest.TestCase):
    def test_exact_multiple(self):
        self.assertEqual(ex.kept_count(486, 3), 162)

    def test_remainder_rounds_up(self):
        self.assertEqual(ex.kept_count(488, 3), 163)

    def test_step_one_keeps_all(self):
        self.assertEqual(ex.kept_count(10, 1), 10)

    def test_rejects_bad_input(self):
        with self.assertRaises(ex.ExtractError):
            ex.kept_count(0, 3)
        with self.assertRaises(ex.ExtractError):
            ex.kept_count(10, 0)


class HoldIndex(unittest.TestCase):
    def test_exact_hold(self):
        self.assertEqual(ex.hold_index(99, 3, 488), 33)

    def test_rounds_to_nearest_kept_frame(self):
        self.assertEqual(ex.hold_index(377, 3, 488), 126)

    def test_rounds_down_when_closer(self):
        self.assertEqual(ex.hold_index(376, 3, 488), 125)

    def test_clamps_to_last_kept_index(self):
        # total 10, step 3 keeps 0,3,6,9 -> indices 0..3; frame 8 rounds to 3
        self.assertEqual(ex.hold_index(8, 3, 10), 3)

    def test_rejects_hold_past_end(self):
        with self.assertRaises(ex.ExtractError):
            ex.hold_index(488, 3, 488)
        with self.assertRaises(ex.ExtractError):
            ex.hold_index(-1, 3, 488)


class PadWidth(unittest.TestCase):
    def test_three_digits_up_to_a_thousand(self):
        self.assertEqual(ex.pad_width(163), 3)
        self.assertEqual(ex.pad_width(1000), 3)

    def test_four_digits_beyond(self):
        self.assertEqual(ex.pad_width(1001), 4)


class Parsing(unittest.TestCase):
    def test_parse_holds(self):
        self.assertEqual(ex.parse_holds("streaming=99,night=377"), {"streaming": 99, "night": 377})

    def test_parse_holds_rejects_malformed(self):
        for bad in ("streaming", "=99", "night=abc", "a=1,,b=x"):
            with self.assertRaises(ex.ExtractError, msg=bad):
                ex.parse_holds(bad)

    def test_parse_widths(self):
        self.assertEqual(ex.parse_widths("1440,960"), [1440, 960])

    def test_parse_widths_rejects_empty_and_zero(self):
        with self.assertRaises(ex.ExtractError):
            ex.parse_widths("")
        with self.assertRaises(ex.ExtractError):
            ex.parse_widths("1440,0")


class FfmpegArgs(unittest.TestCase):
    def test_command_shape(self):
        args = ex.ffmpeg_args("/m/master.mov", 3, 1440, 78, "/o/1440", 3)
        self.assertEqual(args[0], "ffmpeg")
        self.assertIn("-i", args)
        self.assertEqual(args[args.index("-i") + 1], "/m/master.mov")
        self.assertEqual(args[args.index("-vf") + 1], "select='not(mod(n\\,3))',scale=1440:-2")
        self.assertEqual(args[args.index("-start_number") + 1], "0")
        self.assertEqual(args[args.index("-quality") + 1], "78")
        self.assertEqual(args[args.index("-c:v") + 1], "libwebp")
        self.assertEqual(args[-1], "/o/1440/%03d.webp")

    def test_four_digit_pattern(self):
        args = ex.ffmpeg_args("/m/master.mov", 1, 960, 78, "/o/960", 4)
        self.assertEqual(args[-1], "/o/960/%04d.webp")


class Manifest(unittest.TestCase):
    def test_build_manifest(self):
        m = ex.build_manifest(SOURCE, 3, [1440, 960], {"streaming": 99, "night": 377})
        self.assertEqual(m, {
            "fps": 24,
            "step": 3,
            "frames": 163,
            "source": {"width": 5120, "height": 2160, "frames": 488},
            "widths": [1440, 960],
            "pad": 3,
            "holds": {"streaming": 33, "night": 126},
            "end": 162,
        })

    def test_fractional_fps_is_kept(self):
        src = dict(SOURCE, fps=23.976)
        self.assertEqual(ex.build_manifest(src, 3, [1440], {})["fps"], 23.976)


class Cli(unittest.TestCase):
    def test_missing_master_exits_one(self):
        proc = subprocess.run(
            [sys.executable, SCRIPT, "/nonexistent/master.mov"],
            capture_output=True, text=True,
        )
        self.assertEqual(proc.returncode, 1)
        self.assertIn("not found", proc.stderr)


if __name__ == "__main__":
    unittest.main()
