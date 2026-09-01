---
title: "How It Works"
description: "Understand the technology behind XEarthLayer's on-demand satellite imagery streaming."
weight: 10
---

XEarthLayer uses a combination of technologies to stream satellite imagery directly into X-Plane, downloading only what you need, when you need it.

## The Problem

Traditional orthophoto scenery for X-Plane requires downloading entire regions upfront:

- **Hundreds of gigabytes** per continent, even if you only fly a few routes
- **Hours** of download and installation time before you can fly
- **Large disk space** requirements for scenery you may never use

## The Solution

XEarthLayer takes a just-in-time streaming approach:

1. **Virtual Filesystem**: Creates a FUSE file system that X-Plane uses to read scenery tiles
2. **Just-In-Time Fetching**: When X-Plane requests tile resources, XEarthLayer fetches it from satellite providers in real-time and then returns the tile dependencies
3. **Layered Caching**: Three cache layers work together. Completed tiles are held in a small **memory cache**, because X-Plane requests the same tile several times in quick succession. Those completed tiles are also written to the **DDS disk cache**, which is the retention layer — it is what makes a second visit to the same place load from disk instead of the network. Underneath both, the **raw chunk disk cache** keeps the source image chunks that tiles are built from, so an interrupted tile only has to re-fetch the chunks that actually failed.

You only download the scenery you actually fly over. No wasted bandwidth or disk space on areas you'll never visit.

## Architecture

![XEarthLayer Architecture](/images/docs/architecture-stack.svg)

### Scenery Request Pipeline Stages

1. **Request**: X-Plane requests a DSF from XEarthLayer
2. **Image Resource**: X-Plane decodes DSF and creates requests for textures
3. **Cache Check**: XEarthLayer first checks the memory cache for the completed tile, then the DDS disk cache. A hit in either is served straight back to X-Plane. Failing both, it checks the raw chunk disk cache for the source chunks the tile is built from
4. **Download**: Any chunks still missing are downloaded from the imagery provider
5. **Assembly**: Combine 256 small image chunks into a 4096×4096 image
6. **Encode**: Compress the 4096×4096 image into DDS format (BC1/BC3) using one of three backends — Software (pure Rust), ISPC SIMD (default, 5–10× faster), or GPU compute shaders (fastest, requires a wgpu-compatible GPU)
7. **Cache**: Store the completed DDS tile in the memory cache and the DDS disk cache, and keep the source chunks in the chunk disk cache
8. **Serve**: Return the DDS texture to X-Plane

Every generated tile carries a **complete mipmap chain** — 13 levels for a 4096×4096 texture, down to a single pixel. X-Plane clamps its texture sampling at the last level a file declares, so a truncated chain leaves distant terrain undersampled rather than filtered, which shows up as regular banding along terrain contours at shallow viewing angles.

### Prefetching

XEarthLayer reads your aircraft's position and heading directly from X-Plane's built-in Web API — no configuration required. The API is versioned, and XEarthLayer uses v3, which X-Plane added in **12.4.0**; on that release or later, prefetching works out of the box. Against an earlier sim the connection is never established and XEarthLayer falls back to inferring position from the pattern of scenery files X-Plane reads, which is workable but much less able to stay ahead of the aircraft.

The prefetch system uses two strategies, selected automatically based on flight phase:

- **Ground** (ground speed < 40 kt): Loads a **ring of tiles** around the perimeter of X-Plane's already-loaded scenery area. Since the aircraft could taxi in any direction, the ring is symmetric — no heading bias.
- **Cruise** (airborne): Maintains a **sliding prefetch box** biased in the direction of travel. The box sizes itself to your speed, growing from 3.5° per axis at 40 kt or below to 7° per axis at 450 kt or above, so a fast jet looks further ahead than a light aircraft on approach. At its full extent it comfortably overlaps X-Plane's scenery window, so tiles are ready before the simulator crosses into the next region. The forward bias slides proportionally with heading — at cardinal headings the primary axis gets up to 80/20 bias, while at diagonals both axes share equal bias.

A brief **transition** phase bridges the two: when a takeoff is detected (ground speed exceeds 40 kt), prefetching is suppressed until the aircraft climbs 1,000 ft above the departure elevation (or a 90-second timeout elapses). This reserves system resources for X-Plane while it loads departure scenery. Once cruise is confirmed, prefetching ramps up gradually from 25% to full rate over 30 seconds to avoid flooding the pipeline.

#### Region Tracking

Prefetching works a 1°×1° DSF region at a time, and remembers what it has already done with each one so it does not repeat work. A region is in one of four states, or in none of them at all — a region XEarthLayer has never evaluated is simply eligible for prefetch:

| State | Meaning |
|-------|---------|
| **InProgress** | Tiles for this region have been submitted and are being fetched |
| **Prefetched** | Every tile the region needs is present |
| **Deferred** | The region has scenery coverage but has not finished yet — retry shortly |
| **NoCoverage** | The scenery index attributes no tiles to this region, so there is nothing to fetch |

The distinction between the last two matters. "This region has no scenery" and "this region's tiles have not arrived yet" are opposite conclusions, and only the first is grounds for giving up.

**NoCoverage** is therefore reachable only when the scenery index genuinely attributes zero tiles to a region. A region that stalls with tiles still outstanding is **Deferred** instead — a temporary state that expires on its own after 20 seconds, then 30, 40 and 60 on repeated stalls, so its tiles stay retryable. If X-Plane asks for a tile in a deferred region, the deferral is cleared immediately and prefetch picks it up again.

"The index found nothing here" is also kept separate from "there was no index to consult". Only a genuine, answered lookup can retire a region, so running without installed ortho packages does not mark the world as uncovered.

Tiles that ship inside an installed scenery package also count toward a region's coverage. Prefetch deliberately never downloads those, since they are already on your disk, but it does count them, so a region supplied entirely by a package is correctly confirmed as complete.

#### Divergence Detection

If X-Plane asks XEarthLayer to generate a tile on demand inside a region that prefetch has already marked complete, then the "complete" claim was wrong. XEarthLayer notices that contradiction and clears the region's state so it is prefetched again.

Ordinary cache eviction can produce the same signal — a tile that was fetched hours ago may simply have aged out — so a region is demoted at most once every 120 seconds. That keeps a long flight from churning between demotion and re-prefetching.

### Consolidated Mounting

XEarthLayer uses a single FUSE mount point (`zzXEL_ortho`) for all of your installed scenery packages. Whether you have one region or a dozen, they are all merged into one virtual folder that X-Plane reads from. Custom tile patches (for airport add-ons, for example) are included in the same mount and automatically take priority over regional package tiles. This means your `scenery_packs.ini` only needs one ortho entry, and resource usage stays low regardless of how many regions you have installed.

## Performance

- **Scene load**: 1-2 minutes with cached data (down from 5+ minutes when downloading chunks)
- **Cache hits**: <10ms response time
- **Cold download**: 1-2 seconds per tile with 1 Gig+ internet connection

### Serving a Tile

The Linux kernel caps every FUSE read at 1 MiB regardless of how much the application asked for, so X-Plane reading one 11 MB texture arrives at XEarthLayer as a series of smaller ranged requests.

Each request is answered with only the range asked for. Files served straight from an installed package read just that range from disk. A generated tile is resolved once when X-Plane opens the file and sliced for each read after that, and the tile data is shared from the cache to the kernel rather than copied along the way. Across a four-minute scene load this avoids roughly 24 GiB of pointless copying, which is memory bandwidth and CPU time returned to the simulator.

## Technical Details

XEarthLayer is written in Rust for performance and memory safety. Key technologies:

- **fuse3**: Async FUSE filesystem implementation
- **tokio**: Async runtime for concurrent I/O
- **reqwest**: HTTP client with connection pooling
- **image**: JPEG decoding and manipulation
