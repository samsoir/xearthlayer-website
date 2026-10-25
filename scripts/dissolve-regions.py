#!/usr/bin/env python3
"""Dissolve 1x1 degree scenery tiles into one MultiPolygon per region.

Usage: dissolve-regions.py <coverage.geojson> <out.geojson>

The input is the scenery repository's coverage.geojson: a FeatureCollection
of Polygon features, each a unit square on the integer degree grid with a
`region` property. The output is a FeatureCollection with one Feature per
region, geometry MultiPolygon, properties {"code": "<REGION>"}, written as
compact JSON with regions sorted by code. Standard library only.

Exit codes: 0 success, 1 bad input (DissolveError), 2 usage.
"""
import json
import os
import sys
from collections import defaultdict


class DissolveError(Exception):
    """The input is not a grid of unit tiles, or the geometry failed its checks."""


def load_tiles(collection):
    """Return {region: {(x, y), ...}} of integer tile origins, deduplicated."""
    tiles = defaultdict(set)
    for i, feature in enumerate(collection.get("features", [])):
        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "Polygon":
            raise DissolveError(f"feature {i}: geometry is {geometry.get('type')!r}, not Polygon")
        ring = geometry["coordinates"][0]
        xs = {p[0] for p in ring}
        ys = {p[1] for p in ring}
        if len(xs) != 2 or len(ys) != 2:
            raise DissolveError(f"feature {i}: ring is not an axis-aligned square")
        x, y = min(xs), min(ys)
        if max(xs) - x != 1 or max(ys) - y != 1 or x != int(x) or y != int(y):
            raise DissolveError(f"feature {i}: not a unit tile on the integer grid")
        code = (feature.get("properties") or {}).get("region")
        if not code:
            raise DissolveError(f"feature {i}: no region property")
        tiles[code].add((int(x), int(y)))
    return dict(tiles)


def unwrap_antimeridian(tiles):
    """Shift the smaller side of a region that touches both x=-180 and x=179 by 360.

    The region then renders as one contiguous shape, and its bounds do not span
    the globe. Tiles are left alone when the region does not touch both edges.
    """
    xs = {x for x, _ in tiles}
    if -180 not in xs or 179 not in xs:
        return set(tiles)
    west = {t for t in tiles if t[0] < 0}
    east = set(tiles) - west
    if len(west) <= len(east):
        return east | {(x + 360, y) for x, y in west}
    return west | {(x - 360, y) for x, y in east}


def boundary_edges(tiles):
    """Directed unit edges not shared with a neighbour, counter-clockwise around each tile.

    The region lies to the left of every edge, so outer rings come out
    counter-clockwise and holes clockwise.
    """
    edges = []
    for x, y in sorted(tiles):
        if (x, y - 1) not in tiles:
            edges.append(((x, y), (x + 1, y)))              # bottom, west to east
        if (x + 1, y) not in tiles:
            edges.append(((x + 1, y), (x + 1, y + 1)))      # right, south to north
        if (x, y + 1) not in tiles:
            edges.append(((x + 1, y + 1), (x, y + 1)))      # top, east to west
        if (x - 1, y) not in tiles:
            edges.append(((x, y + 1), (x, y)))              # left, north to south
    return edges


def assemble_rings(edges):
    """Chain directed edges into closed rings (first vertex not repeated).

    Where a vertex has two outgoing edges (two tiles touching only at a
    corner), take the left turn so the walk stays on the tile it is on and
    the two tiles become two rings.
    """
    outgoing = defaultdict(list)
    for a, b in edges:
        outgoing[a].append(b)
    rings = []
    for a, b in edges:
        if b not in outgoing[a]:
            continue  # consumed by an earlier ring
        outgoing[a].remove(b)
        ring = [a]
        prev, cur = a, b
        while cur != a:
            ring.append(cur)
            candidates = outgoing[cur]
            if not candidates:
                raise DissolveError(f"open ring at vertex {cur}")
            dx, dy = cur[0] - prev[0], cur[1] - prev[1]
            left = (cur[0] - dy, cur[1] + dx)
            nxt = left if left in candidates else candidates[0]
            candidates.remove(nxt)
            prev, cur = cur, nxt
        rings.append(ring)
    return rings


def merge_collinear(ring):
    """Drop vertices whose incoming and outgoing edges point the same way."""
    n = len(ring)
    out = []
    for i in range(n):
        p, c, q = ring[i - 1], ring[i], ring[(i + 1) % n]
        if (c[0] - p[0], c[1] - p[1]) != (q[0] - c[0], q[1] - c[1]):
            out.append(c)
    return out


def rotate_to_min(ring):
    """Start the ring at its smallest (x, y) vertex so output is canonical."""
    i = ring.index(min(ring))
    return ring[i:] + ring[:i]


def signed_area(ring):
    """Shoelace area: positive for counter-clockwise rings, negative for clockwise."""
    total = 0
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        total += x1 * y2 - x2 * y1
    return total / 2


def point_in_ring(pt, ring):
    """Ray-casting point-in-polygon. The point must not lie on an edge."""
    x, y = pt
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            x_cross = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < x_cross:
                inside = not inside
    return inside


def build_polygons(rings):
    """Group rings into [outer, hole, hole, ...] lists by orientation and containment."""
    outers = [r for r in rings if signed_area(r) > 0]
    holes = [r for r in rings if signed_area(r) < 0]
    polygons = [[o] for o in outers]
    for hole in holes:
        # A cell centre next to the hole boundary: never on a grid line, and
        # always inside the outer ring that encloses the hole.
        probe = (hole[0][0] + 0.5, hole[0][1] + 0.5)
        containing = [i for i, o in enumerate(outers) if point_in_ring(probe, o)]
        if not containing:
            raise DissolveError(f"hole at {hole[0]} has no enclosing ring")
        innermost = min(containing, key=lambda i: signed_area(outers[i]))
        polygons[innermost].append(hole)
    return polygons


def dissolve(tiles):
    """MultiPolygon coordinates (closed rings) for one region's tile set."""
    tiles = unwrap_antimeridian(tiles)
    rings = [rotate_to_min(merge_collinear(r)) for r in assemble_rings(boundary_edges(tiles))]
    rings.sort(key=lambda r: (-signed_area(r), r[0]))
    area = sum(signed_area(r) for r in rings)
    if area != len(tiles):
        raise DissolveError(f"dissolved area {area} does not match {len(tiles)} tiles")
    return [[r + [r[0]] for r in polygon] for polygon in build_polygons(rings)]


def main(argv):
    if len(argv) != 3:
        print(__doc__.strip().splitlines()[2], file=sys.stderr)
        return 2
    src, dst = argv[1], argv[2]
    try:
        with open(src) as f:
            collection = json.load(f)
        tiles = load_tiles(collection)
        features = []
        for code in sorted(tiles):
            coords = dissolve(tiles[code])
            vertices = sum(len(ring) - 1 for polygon in coords for ring in polygon)
            print(f"{code}: {len(tiles[code])} tiles, {len(coords)} polygons, {vertices} vertices", file=sys.stderr)
            features.append({
                "type": "Feature",
                "properties": {"code": code},
                "geometry": {"type": "MultiPolygon", "coordinates": coords},
            })
    except (DissolveError, json.JSONDecodeError, KeyError, TypeError) as err:
        print(f"error: {err}", file=sys.stderr)
        return 1
    with open(dst, "w") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, separators=(",", ":"))
    print(f"wrote {dst} ({os.path.getsize(dst)} bytes, {len(features)} regions)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
