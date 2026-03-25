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
3. **Two Tier Caching**: Downloaded tiles are cached to memory as X-Plane can request the same tile multiple times in succession. The map image chunks that are used to construct tiles are cached to disk, saving time when revisiting the same location multiple times.

You only download the scenery you actually fly over. No wasted bandwidth or disk space on areas you'll never visit.

## Architecture

![XEarthLayer Architecture](/images/docs/architecture-stack.svg)

### Scenery Request Pipeline Stages

1. **Request**: X-Plane requests a DSF from XEarthLayer
2. **Image Resource**: X-Plane decodes DSF and creates requests for textures
2. **Cache Check**: XEarthLayer first checks memory cache for completed tile DDS image, then disk cache for image chunks required to create DDS image. If either is found they are returned to X-Plane
3. **Download**: If not cached, XEarthLayer downloads requires tile chunks from the provider to prepare for assembly
4. **Assembly**: Combine 256 small image chunks into a 4096×4096 DDS image
5. **Encode**: Compress 4096×4096 image into DDS format (BC1/BC3) using one of three backends — Software (pure Rust), ISPC SIMD (default, 5–10× faster), or GPU compute shaders (fastest, requires a separate GPU build)
6. **Cache**: Store completed DDS image in memory and cache image chunks to disk
7. **Serve**: Return the DDS texture to X-Plane

### Adaptive Prefetching

XEarthLayer reads your aircraft's position and heading directly from X-Plane's built-in Web API — no configuration required. On X-Plane 12.1.1 and later, the Web API is enabled by default, so prefetching works out of the box.

Using this telemetry, XEarthLayer maintains a **sliding prefetch box** around your aircraft. The box biases toward your heading — up to 80% of the prefetch area is loaded ahead of you, so tiles are ready before X-Plane needs them. This virtually eliminates scenery loading stutters during flight.

The prefetch system is also **flight-phase aware**. On the ground, it loads a ring of tiles around your position. During cruise, the sliding box tracks your heading and speed. Transitions between phases (such as after takeoff) ramp up gradually to avoid overloading the pipeline.

![Predictive Prefetch Zones](/images/docs/prefetch-zones.svg)

### Consolidated Mounting

XEarthLayer uses a single FUSE mount point (`zzXEL_ortho`) for all of your installed scenery packages. Whether you have one region or a dozen, they are all merged into one virtual folder that X-Plane reads from. Custom tile patches (for airport add-ons, for example) are included in the same mount and automatically take priority over regional package tiles. This means your `scenery_packs.ini` only needs one ortho entry, and resource usage stays low regardless of how many regions you have installed.

## Performance

- **Scene load**: 1-2 minutes with cached data (down from 5+ minutes when downloading chunks)
- **Cache hits**: <10ms response time
- **Cold download**: 1-2 seconds per tile with 1 Gig+ internet connection

## Technical Details

XEarthLayer is written in Rust for performance and memory safety. Key technologies:

- **fuse3**: Async FUSE filesystem implementation
- **tokio**: Async runtime for concurrent I/O
- **reqwest**: HTTP client with connection pooling
- **image**: JPEG decoding and manipulation
