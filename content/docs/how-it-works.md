---
title: "How It Works"
description: "What is inside a scenery tile, how XEarthLayer supplies each part of it, and how it stays ahead of your aircraft."
weight: 10
---

XEarthLayer uses a combination of technologies to stream satellite imagery directly into X-Plane, downloading only what you need, when you need it.

## The Problem

Traditional orthophoto scenery for X-Plane requires downloading entire regions upfront:

- **Hundreds of gigabytes** per continent, even if you only fly a few routes
- **Hours** of download and installation time before you can fly
- **Large disk space** requirements for scenery you may never use

## Anatomy of a Scenery Tile

X-Plane loads ortho scenery one 1°×1° tile at a time, and each tile is a set of files that work together. XEarthLayer handles each kind differently. Most of a tile ships in the package you install and is read straight from disk. The satellite imagery and the night lighting, the parts that make ortho scenery so large, are made on your machine when X-Plane asks for them.

![A scenery tile split into layers: the DSF, the terrain files, and the three resources they reference, with the ortho and night pipelines that make two of them](/images/docs/tile-anatomy.svg)

X-Plane sees all of it through one folder, `zzXEL_ortho`. It is a virtual filesystem that merges every installed package with any custom tile patches you have added, and patches take priority over package tiles. Only the three folders X-Plane needs are visible in it: `Earth nav data`, `terrain` and `textures`.

Overlays, the roads, forests and buildings drawn on top of the imagery, are not part of the tile shown here. They live in a separate `yzXEL_overlay` folder of ordinary files, and nothing in them is generated.

### DSF

The DSF describes the tile: its terrain mesh, which terrain type covers each part of it, and where everything sits. It ships in the package compressed with 7z, the same way Laminar compresses its own scenery, and X-Plane reads it compressed.

XEarthLayer never opens a DSF. It serves the bytes exactly as they are on disk.

### Terrain

Each `.ter` file describes one terrain type the DSF uses and names the textures to draw it with. Terrain files ship in the package and are read from disk. A tile can have thousands of them, so XEarthLayer looks each one up when X-Plane asks for it, rather than scanning them all at startup.

A terrain file references up to three resources:

- `BASE_TEX_NOWRAP` names the ortho texture. That file is not in the package. It is made when X-Plane asks for it.
- `BORDER_TEX` names the water mask, in terrain files along coastlines.
- `TEXTURE_LIT` names the night texture, in packages built for 0.5.0.

These lines are written when the package is built. XEarthLayer never edits a terrain file.

### Water Masks

Water masks blend the imagery into X-Plane's own water along coastlines. They ship as PNG images and are read from disk, with no pipeline of their own.

X-Plane first asks for a DDS version of each mask, and that name looks exactly like an ortho texture's. When the PNG exists, XEarthLayer turns the DDS request down, so X-Plane falls back to the real mask. Without that check, X-Plane would be handed satellite imagery where the sea should be.

### Ortho Textures

The satellite imagery is never shipped. When X-Plane asks for a texture, the ortho pipeline produces it:

1. **Memory, then DDS disk cache.** A finished texture is served straight back. The memory cache is a short-lived staging area, because X-Plane reads the same texture several times in quick succession. The DDS disk cache is what keeps textures between flights, so a second visit to the same place loads from disk instead of the network.
2. **Chunk disk cache.** Failing both, XEarthLayer looks for the source image chunks the texture is built from, so an interrupted texture only has to re-fetch the chunks that actually failed.
3. **Download missing chunks.** Whatever is still missing comes from the imagery provider.
4. **Assemble.** 256 chunks, a 16×16 grid, are combined into one 4096×4096 image.
5. **Encode.** The image is compressed to DDS, BC1 by default, by one of three encoders: software (pure Rust), ISPC SIMD (the default, 5–10× faster), or GPU compute shaders (fastest, and needs a wgpu-compatible GPU).
6. **Cache and serve.** The texture is stored in the memory and DDS disk caches and returned to X-Plane.

Every texture carries a **complete mipmap chain**, 13 levels for a 4096×4096 texture, down to a single pixel. X-Plane clamps its texture sampling at the last level a file declares, so a truncated chain leaves distant terrain undersampled rather than filtered. That shows up as regular banding along terrain contours at shallow viewing angles.

If a texture cannot be made, X-Plane gets a magenta placeholder rather than an error. A failed download shows up as a bright patch instead of stalling the simulator.

| Cache | Default size |
|---|---|
| Memory | 512 MB |
| DDS disk | 60% of the disk cache |
| Chunk disk | 40% of the disk cache |

The disk cache is 20 GB by default. See the [configuration reference](../configuration/) to change any of these.

### Night Lighting

X-Plane lights its terrain at night through the terrain type, and ortho scenery replaces those terrain types with its own. Cities on ortho scenery used to go dark wherever autogen lights did not reach. Packages built for 0.5.0 carry a small night recipe for each tile: which Laminar urban and industrial terrain covers each part of it, and how bright the ground is at night according to NASA's Black Marble night lights.

When X-Plane asks for a `_LIT.dds` texture, the night pipeline produces it:

1. **Memory, then night disk cache.** A finished lit texture is served straight back.
2. **Read the tile's night recipe.** Recipes sit in the package but are hidden from X-Plane. Only XEarthLayer reads them.
3. **Lit art from your X-Plane.** The light patterns come from the lit textures in your own X-Plane installation. That art cannot be redistributed, so no package carries it.
4. **Light texels by ground position.** Each texel is computed from its ground position alone, which is why neighbouring textures and different zoom levels agree at their edges.
5. **Encode with a distance fade.** The most detailed levels are left dark, so close to the aircraft the lit ground fades out and X-Plane's own 3D lights take over.
6. **Cache and serve.** The texture is stored in the night caches and returned to X-Plane.

The night pipeline runs on its own path, with its own small set of permits, so lit textures never queue behind ortho downloads. Its memory cache holds 256 MB, and its disk cache takes 5% of the disk cache budget before the rest is split. Each cached texture records a fingerprint of everything it was built from, so an X-Plane update or a brightness change regenerates it without a cache clear. Anything that goes wrong produces a dark texture, never an error. See [Night Lighting](../night-lighting/) for the settings.

## Prefetching

XEarthLayer reads your aircraft's position and heading directly from X-Plane's built-in Web API, with no configuration. The API is versioned, and XEarthLayer uses v3, which X-Plane added in **12.4.0**. On an earlier sim the connection is never established: scenery still streams when X-Plane asks for it, but nothing is prefetched.

Prefetch runs in its own lane, with its own download, CPU and disk pools, so a prefetch backlog at a boundary crossing can never sit in front of a tile X-Plane is waiting for. While X-Plane waits on a tile, the lane admits no new work and finishes what it had started. It also watches how much memory is pinned by textures X-Plane currently has open and defers a cycle when that is high, so the busiest moment of a flight does not set the memory floor for the rest of it. The lane's capacity is a fraction of what X-Plane's own requests get, `prefetch.capacity_share`, 35% by default.

The prefetch system uses two strategies, selected automatically based on flight phase:

- **Ground** (ground speed < 40 kt): Loads a **ring of tiles** around the perimeter of X-Plane's already-loaded scenery area. Since the aircraft could taxi in any direction, the ring is symmetric — no heading bias.
- **Cruise** (airborne): Maintains a **sliding prefetch box** biased in the direction of travel. The box sizes itself to your speed, growing from 3.5° per axis at 40 kt or below to 7° per axis at 450 kt or above, so a fast jet looks further ahead than a light aircraft on approach. At its full extent it comfortably overlaps X-Plane's scenery window, so tiles are ready before the simulator crosses into the next region. The forward bias slides proportionally with heading — at cardinal headings the primary axis gets up to 80/20 bias, while at diagonals both axes share equal bias.

A brief **transition** phase bridges the two: when a takeoff is detected (ground speed exceeds 40 kt), prefetching is suppressed until the aircraft climbs 1,000 ft above the departure elevation (or a 90-second timeout elapses). This reserves system resources for X-Plane while it loads departure scenery. Once cruise is confirmed, prefetching ramps up gradually from 25% to full rate over 30 seconds to avoid flooding the pipeline.

## Serving a Tile

On Linux, the kernel caps every FUSE read at 1 MiB regardless of how much the application asked for, so X-Plane reading one 11 MB texture arrives at XEarthLayer as a series of smaller ranged requests. On macOS, macFUSE serves generated textures through the kernel page cache instead, so XEarthLayer sees each texture's first read only.

Each request is answered with only the range asked for. Files served straight from an installed package read just that range from disk. A generated tile is resolved once when X-Plane opens the file and sliced for each read after that, and the tile data is shared from the cache to the kernel rather than copied along the way. Across a four-minute scene load this avoids roughly 24 GiB of pointless copying, which is memory bandwidth and CPU time returned to the simulator.
