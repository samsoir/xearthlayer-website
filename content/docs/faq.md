---
title: "Frequently Asked Questions"
description: "Find answers to common questions about XEarthLayer."
weight: 60
toc: true
---

## General

### What is XEarthLayer?

XEarthLayer is a just-in-time satellite imagery streaming system for X-Plane 12. Instead of downloading hundreds of gigabytes of ortho scenery upfront, XEarthLayer streams satellite imagery on-demand as you fly.

### Which operating systems are supported?

Currently, XEarthLayer supports Linux only. macOS support may be added in the future if there is enough community interest.

Please add a feature request/up vote on Github if you would like to see XEarthLayer on macOS.

Windows is well supported by alternative products and likely will never be supported.

### Is XEarthLayer free?

Yes, XEarthLayer is free and open source software released under the MIT license.

### How is XEarthLayer different from other software, like AutoOrtho for example?

XEarthLayer, AutoOrtho, X-Plane Map Enhancement and similar tools all achieve the same objective: streaming satellite orthographic photo scenery into the X-Plane simulator. They all work in largely the same way.

XEarthLayer was designed to be as lightweight and fast as possible, using minimal memory and CPU time to deliver scenery to X-Plane efficiently.

For this reason, [Rust](https://rust-lang.org/) was chosen as the implementation language, given its core principles of Performance, Reliability and Productivity. AutoOrtho was implemented in Python, which is popular but not ideally suited for high-throughput runtime environments.

The author of XEarthLayer had been using both AutoOrtho and X-Plane Map Enhancement on a Windows setup previously. When the simulator was migrated to Linux in 2025, the original AutoOrtho was unable to maintain a stable simulator session. XEarthLayer was created in response to not being able to use the alternatives.

Ultimately, all of these systems provide the same in-simulator experience, so which one you use is completely up to you.

| Photo Scenery System | Open Source | X-Plane Interface | Programming Language | OS | Maintained |
|----------------------|-------------|-------------------|--------------------|---|------------|
| XEarthLayer | Yes | Fuse / Web API | Rust | Linux | Yes |
| AutoOrtho | Yes | Fuse | Python | Windows, macOS, Linux | No |
| AutoOrtho Continued | Yes | Fuse | Python | Windows, macOS, Linux | Yes |
| X-Plane Map Enhancement | No | Fuse | Unknown | Windows, macOS | Yes |

_As of March 2026_

### Can XEarthLayer be used with Microsoft Flight Simulator?

No.

---

## Installation

### Why won't XEarthLayer run?

XEarthLayer should provide messages to the command line if there is an issue executing any part of the program. If you are not seeing any output, check your system journal for issues that would prevent XEarthLayer from starting.

```bash
# Check kernel log for OOM kills or process terminations
journalctl -k --since "1 hour ago" | grep -iE "oom|killed process|out of memory"

# Check for xearthlayer specific entries
journalctl --since "1 hour ago" | grep -i xearthlayer
```

These are some factors that could prevent XEarthLayer from launching:

- Incorrect system architecture for the binary
- System killing the process due to out of memory (OOM)
- Failure to initialize `fuse` mounts

{{< callout type="info" >}}
**Fixed in 0.4.7.** If XEarthLayer aborted part-way through startup on an earlier release with no error message you could act on, a damaged index cache file was the likely cause ([#253](https://github.com/samsoir/xearthlayer/issues/253)). A single corrupt byte could be read as a field length of several exabytes; the allocation failed and terminated the process outright, and the only remedy was deleting a file most people do not know exists. Every cache now bounds what it reads by the size of the file it is reading, writes durably so a partial file is never promoted, and deletes any entry it cannot trust so the next read simply regenerates it. A corrupt cache now costs you a rebuild, not a startup failure.
{{< /callout >}}

Check XEarthLayer's own logs for messages that may not be printed to `stdout` or `stderr`.

```bash
tail -f ~/.xearthlayer/xearthlayer.log
```

### How do I update to the latest version?

Download the latest package for your distribution from the [GitHub releases](https://github.com/samsoir/xearthlayer/releases) and install it over your existing installation.

### I upgraded to 0.4.7 and my first flight was slow. Is something wrong?

No — this is expected once, and then it is over.

0.4.7 emits complete DDS mipmap chains ([#212](https://github.com/samsoir/xearthlayer/issues/212)), which changes the size of a generated tile. Every DDS tile written by 0.4.6 or earlier is therefore the wrong size for this release. Those tiles are detected and replaced the first time each is needed ([#253](https://github.com/samsoir/xearthlayer/issues/253)), so expect one slower flight while the DDS cache refills over ground you have already covered.

{{< callout type="warning" >}}
You do **not** need to run `xearthlayer cache clear`. That was the remedy for the unrelated magenta-tile problem in 0.4.5, and running it here only makes the refill larger — it would discard the raw image chunks as well, which are still perfectly good and are what save the re-download. Let the tiles be replaced as they are used.
{{< /callout >}}

On earlier releases a stale tile of the wrong size was served to X-Plane as a magenta placeholder indefinitely, because nothing removed it. If you upgraded from 0.4.6 and are seeing persistent magenta in areas you have flown before, that is the same issue, and it now resolves itself.

### Why is terrain in the distance banded or striped?

Fixed in 0.4.7. Generated tiles declared a 5-level mipmap chain where a 4096x4096 texture supports 13 ([#212](https://github.com/samsoir/xearthlayer/issues/212)). X-Plane clamps sampling at the last declared level, so beyond that distance the texture was undersampled rather than filtered, which showed up as regular banding along terrain contours at grazing angles. It appeared regardless of imagery provider or zoom level, so it was easy to mistake for a provider problem.

Complete chains are now emitted. Tiles already in your cache were written with the old chain and are replaced as they are used — see the question above.

---

## Usage

### How much bandwidth does XEarthLayer use?

Bandwidth usage depends on many factors: the detail level of the scenery you're flying over, how much scenery is already cached locally, and your cache size.

Starting from a cold cache, expect to download about 6-10GB of data to initialize the simulator. During flight, you can expect to use 3-5GB per degree of traversal, depending on scenery type.

If you have an internet connection with data limits or caps, increase your disk cache size as much as possible to minimize repeated downloads. However, for metered connections, XEarthLayer's value diminishes significantly—you may want to consider storing Ortho tiles locally instead.

### Can I use XEarthLayer offline?

XEarthLayer requires an internet connection to stream imagery. However, previously downloaded tiles are cached locally, so areas you've flown before will load from cache even without connectivity.

---

## Troubleshooting

### X-Plane does not load XEarthLayer scenery into the simulator

This is usually because XEarthLayer's FUSE mounts are not listed in X-Plane's `Custom Scenery/scenery_packs.ini` file.

**Checklist:**
1. Ensure XEarthLayer is fully started and running *before* launching X-Plane. X-Plane indexes scenery at startup, so starting XEarthLayer afterward means its scenery won't be detected.
2. Verify that the `zzXEL_ortho/` and `yzXEL_overlay/` packs are listed in your `scenery_packs.ini` file. XEarthLayer uses a single consolidated mount for all installed regions, so there is one ortho entry and one overlay entry regardless of how many packages you have. They typically appear at the bottom but can be anywhere in the file:

```ini
SCENERY_PACK Custom Scenery/yzXEL_overlay/
SCENERY_PACK Custom Scenery/zzXEL_ortho/
```

See [X-Plane 12 Configuration](/docs/x-plane-configuration/) for the full recommended ordering.

If the above doesn't resolve the issue, ask for help on [Discord](https://discord.gg/RPEWQZdxm2), the X-Plane.org forums, or [create a GitHub issue](https://github.com/samsoir/xearthlayer/issues).

### Tiles are downloading but not appearing in X-Plane

This can happen for several valid reasons:

1. You are flying in a region outside of XEarthLayer scenery coverage, but within the X-Plane or XEarthLayer loading range. X-Plane loads a large area around the aircraft to ensure scenery tiles are available before you can see them. XEarthLayer loads an even bigger radius to stay ahead of X-Plane.
2. You have a scenery package installed that provides its own mesh. Some third-party scenery providers include custom mesh that overrides XEarthLayer scenery for that specific area.

### Help! I am seeing magenta tiles on the scenery when I fly.

Magenta tiles are returned when XEarthLayer is unable to construct a tile within the configured timeout period.

This can be caused by several factors:
- Slow or throttled downloads from the mapping service
- Operating system overhead reducing available CPU and memory
- Configuration that is too aggressive for your system's capabilities
- Network or disk I/O bottlenecks

The XEarthLayer log outputs information about failed tile construction jobs and chunk downloads, so review it before posting in community channels.

{{< callout type="warning" >}}
**If you started seeing magenta tiles after upgrading to 0.4.7, read this first.** Before 0.4.7 the `generation.timeout` setting was parsed and reported but never reached the code that enforces it — a hardcoded 30-second constant won instead. That is fixed in 0.4.7 ([#248](https://github.com/samsoir/xearthlayer/issues/248)), which means the effective ceiling has dropped from 30 seconds to the documented default of **10**. A system that was quietly taking 12 to 25 seconds per tile on 0.4.6 was never showing you a placeholder; on 0.4.7 it will. Nothing has got slower — the limit you configured is simply being applied now. Set `generation.timeout = 30` to restore the previous behaviour, then work down from there.
{{< /callout >}}

If the situation persists, it is likely caused by configuration that exceeds your system's capabilities. The settings below are the ones actually worth tuning. Reduce the concurrency figures and testing again; if things stabilise, increase them one at a time.

```ini
[generation]
threads = 4            ; Default is num_cpus / 2 — try half of that
timeout = 30           ; Default 10; raise before you conclude your system is too slow

[executor]
max_concurrent_jobs = 6   ; Default is ceil(num_cpus * 0.75) — try half
request_timeout_secs = 10 ; Per-chunk HTTP timeout
max_retries = 3           ; Retry attempts per failed chunk

[texture]
format = bc1           ; bc1 encodes faster and writes half as much as bc3
compressor = ispc      ; Or `gpu` to move encoding off the CPU entirely
```

{{< callout type="info" >}}
Resource pool capacities are no longer configurable as of 0.4.7. If you are working from older advice that told you to reduce `executor.network_concurrent`, `executor.cpu_concurrent`, `executor.disk_io_concurrent` or `cache.disk_io_profile`, those keys have been removed — none of them ever reached the executor ([#249](https://github.com/samsoir/xearthlayer/issues/249)). Run `xearthlayer config upgrade` to strip them from your file.
{{< /callout >}}

### Help! I am seeing white tiles on the scenery when I fly.
![White tiles on landscape](/images/bugs/white-tiles.jpg)

This is usually caused by a FUSE mount issue, most commonly the result of the operating system killing the FUSE process due to out of memory (OOM) conditions.

If the operating system did kill the process, it will have added a journal entry of this event.

```bash
# Check for OOM killer activity
journalctl -k --since "1 hour ago" | grep -iE "oom|killed process|out of memory"

# Check for fuse-related errors
journalctl --since "1 hour ago" | grep -iE "fuse|xearthlayer"
```

If your system memory is less than 8GB, consider increasing swap space or upgrading RAM. See the [Performance](#performance) section for cache tuning recommendations.

{{< callout type="info" >}}
**Substantially improved in 0.4.7.** If you were killed by the OOM killer on a long flight, this release is worth upgrading for. A generated tile is about 11 MB, and glibc was serving allocations that size from arenas it never returns to the operating system, so the process footprint climbed for the life of the session regardless of how small a memory cache you had configured ([#227](https://github.com/samsoir/xearthlayer/issues/227)). Over a 4.3-hour flight against an identical build on default settings, committed memory at matched work fell 35% — 8,970 MB against 13,721 MB at the same 39,157 tiles. Separately, serving a tile used to copy all 11 MB of it several times over to deliver the roughly 4% X-Plane actually reads; the payload is now borrowed from the cache rather than copied ([#237](https://github.com/samsoir/xearthlayer/issues/237)).

This bounds the steep early growth. It does not prove growth is bounded on a very long haul, and [#227](https://github.com/samsoir/xearthlayer/issues/227) remains open for the tail — if you still hit an OOM kill, the report is welcome.
{{< /callout >}}

0.4.7 also makes memory behaviour visible without running the whole session at `--debug`. A `Memory sample` line is written to the log every 60 seconds at normal log level, reporting resident and committed memory, swap, thread count, per-tier cache sizes and in-flight writes, alongside a `Prefetch sample` line covering region states and promotion counts ([#209](https://github.com/samsoir/xearthlayer/issues/209)). Quote `anon_mb + swap_mb` when reporting a memory problem: that is the committed footprint the OOM killer scores. Do not quote `vm_mb`, which also counts address space that is mapped but never touched, and carries a sawtooth of roughly a gigabyte from thread stacks that is not memory at all.

### GPU encoding is not working or the wrong GPU is selected

If you have configured `texture.compressor = gpu` and are experiencing issues, here are some common causes and solutions.

**GPU not detected:** Run `xearthlayer diagnostics` to list available GPU adapters on your system. If no GPUs are listed, ensure your GPU drivers are installed correctly and that Vulkan support is available. See the [CLI Reference](/docs/cli-reference/) for more on the `diagnostics` command.

**Wrong GPU selected (integrated vs discrete):** On systems with both an integrated GPU (iGPU) and a discrete GPU (dGPU), XEarthLayer may select the wrong adapter. Configure the `texture.gpu_device` setting to target the correct GPU:

```ini
[texture]
compressor = gpu
gpu_device = integrated  ; Use iGPU for encoding while dGPU runs X-Plane
```

Valid values are `integrated`, `discrete`, or an adapter name substring (e.g., `Radeon`, `RTX 5090`). Run `xearthlayer diagnostics` to see available adapters.

{{< callout type="warning" >}}
When using the same GPU for both X-Plane rendering and XEarthLayer texture encoding, GPU memory pressure can cause instability or performance degradation. For best results, use the integrated GPU for encoding and leave the discrete GPU dedicated to X-Plane.
{{< /callout >}}

**Fallback options:** If GPU encoding is not available or causes issues, you can always fall back to CPU-based compression. Set `texture.compressor = ispc` for SIMD-accelerated encoding, or `texture.compressor = software` for a portable fallback that works on any system.

### I found a bug! How do I report it?

First, check the [XEarthLayer GitHub issues](https://github.com/samsoir/xearthlayer/issues) to see if the bug has already been reported. If so, add your details to the existing issue. If it's a new issue, follow the issue template to create a new report.

{{< callout type="info" >}}
Issues submitted without the required logs and system diagnostics will be closed automatically.
{{< /callout >}}

The issue template asks for the output of `xearthlayer diagnostics`. On releases before 0.4.7 that command could hang indefinitely while measuring a large cache directory, which on a multi-terabyte cache meant the report never printed at all — blocking the bug report it was needed for ([#251](https://github.com/samsoir/xearthlayer/issues/251)). The measurement is now bounded at five seconds and reports the cache size as unmeasured if it does not finish, so the rest of the report always prints. If you see the size listed as unmeasured, that is not itself a fault.

Attaching the `Memory sample` and `Prefetch sample` lines from `~/.xearthlayer/xearthlayer.log` is also useful for anything performance or memory related — both are written at normal log level, so you do not need to reproduce the problem under `--debug`.

### Where can I get help?

The XEarthLayer community is active and happy to help with questions, troubleshooting, and general discussion:

- **Discord** — Join the [XEarthLayer Discord server](https://discord.gg/RPEWQZdxm2) for real-time chat with other users and the developer
- **GitHub Discussions** — Post questions and share ideas on [GitHub Discussions](https://github.com/samsoir/xearthlayer/discussions)
- **GitHub Issues** — Report bugs or request features via [GitHub Issues](https://github.com/samsoir/xearthlayer/issues)

---

## Performance

### How can I improve performance?

Performance optimization is a broad topic that extends well beyond XEarthLayer itself. If you're experiencing performance issues in X-Plane, they are most likely related to X-Plane's rendering settings rather than XEarthLayer.

#### X-Plane settings to review
- **Visual effects** - Reduce reflection and shadow quality
- **Draw distance** - Lower the number of objects rendered at distance
- **Anti-aliasing** - Reduce MSAA or switch to FXAA
- **Texture quality** - Ensure this matches your VRAM capacity

#### XEarthLayer-specific tips:
- Ensure adequate disk cache to minimize network downloads during flight
- Use `bc1` texture format instead of `bc3` if you don't need alpha transparency (smaller files, faster encoding)
- Monitor the XEarthLayer log for timeout warnings that may indicate bottlenecks
- If running on limited hardware, reduce `executor.max_concurrent_jobs` and `generation.threads`. Resource pool capacities are no longer configurable as of 0.4.7 — `executor.network_concurrent`, `executor.cpu_concurrent`, `executor.disk_io_concurrent` and `cache.disk_io_profile` have been removed because they never reached the executor
- Move DDS encoding off the CPU with `texture.compressor = gpu` and `texture.gpu_device = integrated` if you have an integrated GPU sitting idle while the discrete GPU runs X-Plane

For detailed configuration guidance, see the [Configuration](/docs/configuration/) page.

### What are the recommended cache settings?

**Disk cache:** Use as much space as you can reasonably allocate. Larger disk caches reduce network traffic and improve load times for previously visited areas. The default is 20GB; a minimum of 50GB is recommended, with 100GB+ being ideal for frequent flyers. For best results, place the cache on a fast NVMe or SSD that is not the primary system volume.

**Memory cache:** The default is 512MB, and the setup wizard recommends your system RAM divided by 12, rounded to the nearest whole GB. Bigger is not automatically better here — the memory cache is a staging buffer for tiles X-Plane is actively reading, not the retention layer, so 2-4GB is ample on a 32GB machine and the DDS disk cache is what actually saves you re-downloading. Keep in mind that X-Plane itself wants around 15GB during initial scene loading, and that the two are competing for the same RAM.

```ini
[cache]
memory_size = 8GB
disk_size = 50GB
```

**Low memory systems:** If system memory is limited (less than 32GB total), consider creating swap space to provide additional virtual memory for both XEarthLayer and X-Plane. This is particularly important if your GPU has less than 8GB of VRAM, as the system may need to accommodate texture overflow.

{{< callout type="warning" >}}
Heavy swap usage on SSDs or NVMe drives can significantly reduce drive lifespan due to the high volume of write operations. If possible, place swap on a separate, less critical drive or consider upgrading system RAM instead.
{{< /callout >}}
