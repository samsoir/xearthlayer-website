+++
title = 'XEarthLayer 0.4.4 released'
description = 'A rewrite of prefetch, clearer cache metrics in the TUI, and a long-haul flight fix that took a nine-hour flight log to chase down.'
date = 2026-04-16T12:00:00-07:00
author = 'XEarthLayer Team'
tags = ['release']
draft = false
+++

XEarthLayer 0.4.4 is now available. This release started life follwing a bug report regarding prefetch behaving strangely on very long flights, and ended up reshaping a chunk of the plugin's internals. The headline changes are a rewritten prefetch engine, terminal UI improvements to cache usage reporting, and a set of fixes that only surface after you have been airborne for a few hours.

Grab the latest build from the [downloads page](/#download) or straight from the [GitHub release](https://github.com/samsoir/xearthlayer/releases/tag/v0.4.4).

## The long-haul story

The work that drove this release came out of a flight log from a long-haul out of Vienna. Somewhere past the second hour, prefetched regions started slipping into a state the system could never recover from, marked as in-progress forever, never flipping to prefetched, and serving stale data back to X-Plane.

Digging in turned up three interacting defects at once:

- Regions were being marked `InProgress` before the tile submission even came back. Anything that failed silently was invisible to the scheduler.
- The `cached_tiles` shadow set, the in-memory guess of what was on disk, was drifting badly, tracking only about 6% of the tiles that were actually cached.
- DDS disk cache look-ups were being performed with chunk coordinates instead of tile coordinates. The lookup returned `false` every single time, silently.

On a long flight they compounded into permanent dead regions. The fix ([#172](https://github.com/samsoir/xearthlayer/issues/172)) defers the in-progress mark until the submission is confirmed, replaces the shadow set with authoritative DDS disk cache queries, and corrects the coordinate mismatch.

## Prefetch, unified

Tracking down the long-haul bug meant pulling the prefetch code apart, once in there it was clear the ground and cruise paths had drifted into two different shapes of the same problem, providing two code paths to solve the same problem.

The old ring-based `GroundStrategy` is now gone. In its place is a symmetric `PrefetchBox` that both on the ground and in flight phases share. Ground prefetch uses a fixed extent with symmetric bias (0.5); cruise prefetch uses a speed-proportional extent with a heading bias (0.8).

The debug map now reads from the same source of truth. The coordinator computes prefetch bounds once per cycle and publishes a `BoxBoundsSnapshot`; the map renders that snapshot verbatim. No re-computation, no drift between what you see on the map and what is actually being requested.

Region colors in the debug view are also cleaner: yellow (`InProgress`) until every tile in a region is verified on disk, green (`Prefetched`) once it is, and a new orange (`Mixed`) state when FUSE has started serving tiles from a prefetched region.

## Clearer cache metrics in the Terminal UI

The combined "Disk" line in the cache widget was hiding the thing you actually care about: how often X-Plane's requests were being served from local disk. The TUI now splits that into three tiers; Memory, DDS Disk, and Chunks; each with its own progress bar and hit/miss counts ([#166](https://github.com/samsoir/xearthlayer/issues/166)). Flight testing consistently shows DDS disk hit rates over 93%, which had been lost in the noise of chunk-level traffic.

While in there, we also fixed how the Memory and DDS Disk tiers count hits ([#171](https://github.com/samsoir/xearthlayer/issues/171)). They used to aggregate every cache read, including prefetch and prewarm. On a long flight with a full memory cache, hit rate could read around 47% because prefetch misses were overly influencing the denominator. The fix tags events by `RequestOrigin` and renders FUSE-only rates for the tiers where it matters. The Chunks tier still uses aggregate because there is only one code path reading chunks anyway.

Another small interface fix; the queue column in the TUI now shows oldest jobs at the top and new ones at the bottom, matching how you'd naturally read a processing pipeline ([#165](https://github.com/samsoir/xearthlayer/issues/165)).

## A gentler default for executor concurrency

`executor.max_concurrent_jobs` now defaults to `num_cpus / 2`, down from `ceil(num_cpus × 0.75)`. This halves the CPU pressure prefetch puts on X-Plane during heavy activity. Flight testing settled on this as the sweet spot between prefetch throughput and keeping your frame rate intact. If you have been running a custom value, this change will not override it.

## Upgrading

Binaries are on the [downloads page](/#download). Configuration files remain compatible; there is nothing you need to change on your end. If you hit anything unexpected, the [Discord](https://discord.gg/XVUmMWYS) and [GitHub issues](https://github.com/samsoir/xearthlayer/issues) are the fastest way to reach us.

Thanks to everyone who flew the pre-release builds and shared logs.