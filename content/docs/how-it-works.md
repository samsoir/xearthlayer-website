---
title: "How It Works"
description: "Understand the technology behind XEarthLayer's on-demand satellite imagery streaming."
weight: 40
---

XEarthLayer uses a clever combination of technologies to stream satellite imagery directly into X-Plane, downloading only what you need, when you need it.

## The Problem

Traditional orthophoto scenery for X-Plane requires downloading entire regions upfront:

- **Hundreds of gigabytes** per region, even if you only fly a few routes
- **Hours** of download and installation time before you can fly
- **Large disk space** requirements for scenery you may never use

## The Solution

XEarthLayer takes a just-in-time approach:

1. **Virtual Filesystem**: Creates a FUSE virtual filesystem that X-Plane sees as normal scenery files
2. **Just-In-Time Fetching**: When X-Plane requests a texture, XEarthLayer fetches it from satellite providers in real-time
3. **Intelligent Caching**: Downloaded tiles are cached to disk, so revisiting areas is instant

You only download the scenery you actually fly over. No wasted bandwidth or disk space on areas you'll never visit.

## Architecture

```
X-Plane → FUSE VFS → XEarthLayer → Satellite Provider
                          ↓
                    Memory Cache
                          ↓
                    Disk Cache
```

### Pipeline Stages

1. **Request**: X-Plane requests a DDS texture file
2. **Cache Check**: Check memory cache, then disk cache
3. **Download**: If not cached, download tile chunks from the provider
4. **Assembly**: Combine 256 small chunks into a 4096×4096 image
5. **Encode**: Compress to DDS format (BC1/BC3)
6. **Cache**: Store in memory and disk cache
7. **Serve**: Return the texture to X-Plane

### Predictive Prefetching

XEarthLayer can receive telemetry from X-Plane via the ForeFlight protocol. Using your aircraft's position and heading, it prefetches tiles ahead of you, reducing pop-in during flight.

## Performance

- **Scene load**: ~30 seconds (down from 4-5 minutes with traditional scenery)
- **Cache hits**: <10ms response time
- **Cold download**: 1-2 seconds per tile with good network

## Technical Details

XEarthLayer is written in Rust for performance and memory safety. Key technologies:

- **fuse3**: Async FUSE filesystem implementation
- **tokio**: Async runtime for concurrent I/O
- **reqwest**: HTTP client with connection pooling
- **image**: JPEG decoding and manipulation
