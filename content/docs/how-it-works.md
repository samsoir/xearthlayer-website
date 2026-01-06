---
title: "How It Works"
description: "Understand the technology behind XEarthLayer's on-demand satellite imagery streaming."
weight: 40
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
5. **Encode**: Compress 4096*4096 image into to DDS format (BC1/BC3)
6. **Cache**: Store completed DDS image in memory and cache image chunks to disk
7. **Serve**: Return the DDS texture to X-Plane

### Predictive Prefetching

XEarthLayer can receive telemetry from X-Plane via the XGPS2 protocol. Using your aircraft's position and heading, it prefetches tiles ahead of you, reducing rendering performance issues and stuttering during flight.

When X-Plane is not configured to broadcast the aircraft position over XGPS2, XEarthLayer uses an inferred radial perimeter to prefetch tiles in every direction from from the loaded area. The inference algorithm uses the recent requested tiles from X-Plane to execute a best-guess (dead-reckoning) position of the aircraft. This enables XEarthLayer to pre-cache tiles that X-Plane will request, but is less efficient than the heading aware system as it preloads more resources than required.

![Predictive Prefetch Zones](/images/docs/prefetch-zones.svg)

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
