+++
title = 'Upstream patch to Rust fuse3 crate'
description = "How a kernel default crushed XEarthLayer's throughput, what was patched, and why it was pushed upstream."
date = 2026-04-07T12:00:00-07:00
author = 'XEarthLayer Team'
tags = ['dev diary']
draft = false
+++

A few weeks before 0.4.4 shipped, we pushed upstream a patch back into [`fuse3`](https://github.com/Sherlock-Holo/fuse3), the Rust crate that XEarthLayer uses to talk to the Linux kernel's FUSE layer. The patch adds two small controls that, for workloads like ours, make a large difference to overall performance. The change will be part of a future fuse3 crate release, and XEarthLayer 0.4.4 is the first release built against the upstream version rather than our own fork.

The change itself is tiny. The story is more interesting than the diff.

## A small kernel default with large consequences

Linux FUSE has two settings that govern how many background read requests the kernel will keep in flight for a given file system at once:

- `max_background`; the ceiling for concurrent background requests. The kernel default is **12**.
- `congestion_threshold`; the point at which the kernel starts reporting the file system as "congested" and stops sending new requests until the queue drains. The kernel default is **9**.

For the kinds of file systems FUSE is most often used for, those defaults are generous. A typical FUSE file system might be serving a handful of file metadata requests, or backing a cloud drive that sees _bursty_ but modest I/O. Twelve simultaneous reads is plenty.

XEarthLayer is not a typical FUSE filesystem. When you fly over a scenery boundary, X-Plane 12 asks for multiple DDS texture tiles all at once, fifty or more is normal in X-Plane 12.4, sometimes higher. Every one of those requests arrives through our FUSE mount. With the kernel capped at twelve concurrent in-flight requests, the remaining forty get queued. The kernel flags the file system as congested, everything stalls until the queue drains. You see it as a frame drop or a sim freeze, exactly the kind of thing scenery streaming is supposed to prevent.

The patch we provided ensures that we can unlock the full potential of the FUSE I/O throughput to handle the huge data requests X-Plane 12 can make. This will also support other FUSE use-cases that require support for a high volume of concurrent requests.

## What the patch actually does

`fuse3` exposes a `ReplyInit` struct that a file system sends back to the kernel during initialization. Before this patch, it only had one control, `max_write`, and the two background-related fields were hard coded to the kernel defaults.

The patch adds two optional fields:

```rust
pub max_background: Option<u16>,
pub congestion_threshold: Option<u16>,
```

Leave them `None` and nothing changes, the kernel defaults still apply. Set them, and the kernel uses your values instead. XEarthLayer now runs with `max_background = 256` and `congestion_threshold = 192`, which is enough headroom for the worst scene transitions we have been able to produce.

This change also marks `ReplyInit` as `#[non_exhaustive]` and added a `ReplyInit::new(max_write)` constructor. That is a small, one-time migration for existing users, struct literals have to become constructor calls, but it means future additions to `ReplyInit` will not be semver-breaking. For a crate that sits underneath everyone's file system, that future-proofing felt worth the one-line migration.


## What this means for you

If you are running XEarthLayer, nothing changes, you already had these limits applied, because our fork was doing this since v0.3.1. The 0.4.4 release is the first version that gets the same behavior from a dependency you could install yourself rather than one we maintained out-of-tree.

If you are building something else with `fuse3` and your filesystem serves a lot of concurrent reads, it's worth a look at `ReplyInit::max_background` and `ReplyInit::congestion_threshold`. The defaults are good for ordinary workloads and actively harmful for throughput-heavy ones. You will know immediately whether it matters to you.

Thanks to [Sherlock-Holo](https://github.com/Sherlock-Holo) for maintaining `fuse3` and for merging the patch quickly. One of the quiet privileges of building on open source is that when you hit a sharp edge, the fix can go back into the thing everyone uses; and the people who run into the same problem next year will never know there was a sharp edge there at all. Another win for Open Source.
