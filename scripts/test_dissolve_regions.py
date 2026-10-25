"""Tests for scripts/dissolve-regions.py. Run: python3 -m unittest scripts/test_dissolve_regions.py"""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "dissolve-regions.py")

spec = importlib.util.spec_from_file_location("dissolve_regions", SCRIPT)
dr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dr)


def tile_feature(x, y, region="R"):
    return {
        "type": "Feature",
        "properties": {"region": region},
        "geometry": {"type": "Polygon",
                     "coordinates": [[[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1], [x, y]]]},
    }


def collection(*features):
    return {"type": "FeatureCollection", "features": list(features)}


def ring_set(ring):
    """Vertices of a ring as a set, ignoring the closing repeat and start point."""
    return set(tuple(p) for p in ring)


class LoadTiles(unittest.TestCase):
    def test_rejects_empty_collection(self):
        with self.assertRaises(dr.DissolveError):
            dr.load_tiles(collection())

    def test_groups_by_region_and_dedupes(self):
        tiles = dr.load_tiles(collection(tile_feature(0, 0), tile_feature(0, 0), tile_feature(5, 5, "S")))
        self.assertEqual(tiles, {"R": {(0, 0)}, "S": {(5, 5)}})

    def test_rejects_non_unit_square(self):
        bad = tile_feature(0, 0)
        bad["geometry"]["coordinates"] = [[[0, 0], [2, 0], [2, 1], [0, 1], [0, 0]]]
        with self.assertRaises(dr.DissolveError):
            dr.load_tiles(collection(bad))

    def test_rejects_missing_region(self):
        bad = tile_feature(0, 0)
        bad["properties"] = {}
        with self.assertRaises(dr.DissolveError):
            dr.load_tiles(collection(bad))


class Geometry(unittest.TestCase):
    def test_single_tile(self):
        polys = dr.dissolve({(3, 4)})
        self.assertEqual(len(polys), 1)
        self.assertEqual(len(polys[0]), 1)
        ring = polys[0][0]
        self.assertEqual(ring[0], ring[-1])
        self.assertEqual(ring_set(ring), {(3, 4), (4, 4), (4, 5), (3, 5)})
        self.assertGreater(dr.signed_area(ring[:-1]), 0)

    def test_block_merges_collinear_edges(self):
        polys = dr.dissolve({(x, y) for x in range(3) for y in range(2)})
        ring = polys[0][0]
        self.assertEqual(ring, [(0, 0), (3, 0), (3, 2), (0, 2), (0, 0)])

    def test_ring_starts_at_smallest_vertex_whatever_the_tile_order(self):
        a = dr.dissolve({(0, 0), (1, 0)})
        b = dr.dissolve({(1, 0), (0, 0)})
        self.assertEqual(a, b)
        self.assertEqual(a[0][0][0], (0, 0))

    def test_hole(self):
        tiles = {(x, y) for x in range(3) for y in range(3)} - {(1, 1)}
        polys = dr.dissolve(tiles)
        self.assertEqual(len(polys), 1)
        outer, hole = polys[0]
        self.assertGreater(dr.signed_area(outer[:-1]), 0)
        self.assertLess(dr.signed_area(hole[:-1]), 0)
        self.assertEqual(ring_set(hole), {(1, 1), (2, 1), (2, 2), (1, 2)})

    def test_two_islands(self):
        polys = dr.dissolve({(0, 0), (5, 5)})
        self.assertEqual(len(polys), 2)

    def test_corner_touching_tiles_are_separate_polygons(self):
        polys = dr.dissolve({(0, 0), (1, 1)})
        self.assertEqual(len(polys), 2)
        self.assertEqual(sorted(len(p[0]) for p in polys), [5, 5])

    def test_island_inside_hole(self):
        tiles = {(x, y) for x in range(5) for y in range(5)}
        tiles -= {(x, y) for x in range(1, 4) for y in range(1, 4)}  # 3x3 hole
        tiles.add((2, 2))  # island in the middle of the hole
        polys = dr.dissolve(tiles)
        self.assertEqual(len(polys), 2)
        holes = [len(p) - 1 for p in polys]
        self.assertEqual(sorted(holes), [0, 1])

    def test_area_equals_tile_count(self):
        tiles = {(0, 0), (1, 0), (1, 1), (3, 0), (3, 1), (3, 2), (4, 2)}
        polys = dr.dissolve(tiles)
        area = sum(dr.signed_area(r[:-1]) for p in polys for r in p)
        self.assertEqual(area, len(tiles))


class Antimeridian(unittest.TestCase):
    def test_small_west_side_shifts_east(self):
        tiles = {(178, 0), (179, 0), (-180, 0)}
        shifted = dr.unwrap_antimeridian(tiles)
        self.assertEqual(shifted, {(178, 0), (179, 0), (180, 0)})

    def test_small_east_side_shifts_west(self):
        tiles = {(-180, 0), (-179, 0), (-178, 0), (179, 0)}
        shifted = dr.unwrap_antimeridian(tiles)
        self.assertEqual(shifted, {(-181, 0), (-180, 0), (-179, 0), (-178, 0)})

    def test_untouched_when_not_spanning(self):
        tiles = {(-180, 0), (-179, 0), (10, 0)}
        self.assertEqual(dr.unwrap_antimeridian(tiles), tiles)

    def test_dissolve_is_contiguous_across_antimeridian(self):
        polys = dr.dissolve({(178, 0), (179, 0), (-180, 0)})
        self.assertEqual(len(polys), 1)
        xs = [p[0] for p in polys[0][0]]
        self.assertEqual((min(xs), max(xs)), (178, 181))


class Cli(unittest.TestCase):
    def test_writes_feature_collection_sorted_by_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, "in.geojson")
            dst = os.path.join(tmp, "out.geojson")
            with open(src, "w") as f:
                json.dump(collection(tile_feature(0, 0, "ZZ"), tile_feature(1, 0, "ZZ"), tile_feature(9, 9, "AA")), f)
            proc = subprocess.run([sys.executable, SCRIPT, src, dst], capture_output=True, text=True)
            self.assertEqual(proc.returncode, 0, proc.stderr)
            with open(dst) as f:
                out = json.load(f)
            self.assertEqual(out["type"], "FeatureCollection")
            self.assertEqual([ft["properties"]["code"] for ft in out["features"]], ["AA", "ZZ"])
            self.assertEqual(out["features"][1]["geometry"]["type"], "MultiPolygon")
            self.assertEqual(out["features"][1]["geometry"]["coordinates"][0][0][0], [0, 0])
            with open(dst) as f:
                self.assertNotIn("\n", f.read())

    def test_usage_error(self):
        proc = subprocess.run([sys.executable, SCRIPT], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 2)

    def test_bad_input_exits_one(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, "in.geojson")
            dst = os.path.join(tmp, "out.geojson")
            bad = tile_feature(0, 0)
            bad["geometry"]["type"] = "Point"
            with open(src, "w") as f:
                json.dump(collection(bad), f)
            proc = subprocess.run([sys.executable, SCRIPT, src, dst], capture_output=True, text=True)
            self.assertEqual(proc.returncode, 1)
            self.assertFalse(os.path.exists(dst))


if __name__ == "__main__":
    unittest.main()
