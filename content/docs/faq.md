---
title: "Frequently Asked Questions"
linkTitle: "FAQ / Troubleshooting"
description: "Find answers to common questions about XEarthLayer."
weight: 60
toc: true
---

## General

### What is XEarthLayer?

XEarthLayer is a just-in-time satellite imagery streaming system for X-Plane 12. Instead of downloading hundreds of gigabytes of ortho scenery upfront, XEarthLayer streams satellite imagery on-demand as you fly.

### Which operating systems are supported?

Linux (amd64) and macOS 12 or later on Apple Silicon. Both ship as prebuilt binaries; see [Getting Started](/docs/getting-started/) and [XEarthLayer on macOS](/docs/macos/).

Windows is well supported by alternative products and likely will never be supported.

### Does XEarthLayer run on an Intel Mac?

No. Intel Macs are not supported, and no build is published for them.

### Is XEarthLayer free?

Yes, XEarthLayer is free and open source software released under the MIT license.

### Can XEarthLayer be used with Microsoft Flight Simulator?

No.

---

## Installation

### Why won't XEarthLayer run?

XEarthLayer prints to the terminal when something stops it starting. If you see nothing, check the system log.

**Linux**

```bash
# Check kernel log for OOM kills or process terminations
journalctl -k --since "1 hour ago" | grep -iE "oom|killed process|out of memory"

# Check for xearthlayer specific entries
journalctl --since "1 hour ago" | grep -i xearthlayer
```

**macOS**

```bash
log show --last 1h --predicate 'process == "xearthlayer" OR eventMessage CONTAINS "macfuse"'
```

On a Mac the most common cause is macFUSE not yet approved: `mount_macfuse: the file system is not available (255)`. See [XEarthLayer on macOS](/docs/macos/#installing-macfuse).

These are some factors that could prevent XEarthLayer from launching:

- Incorrect system architecture for the binary
- System killing the process due to out of memory (OOM)
- Failure to initialize `fuse` mounts

Check XEarthLayer's own logs for messages that may not be printed to `stdout` or `stderr`.

```bash
tail -f ~/.local/state/xearthlayer/xearthlayer.log
```

On macOS the log is `~/Library/Logs/XEarthLayer/xearthlayer.log`. Only `xearthlayer run` writes it; the package commands write `xearthlayer-packages.log` beside it.

### How do I update to the latest version?

Linux: download the latest package for your distribution from the [GitHub releases](https://github.com/samsoir/xearthlayer/releases) and install it over your existing installation. macOS: `brew upgrade`, or download the new tarball. Then read the next three answers.

### My first flight after upgrading was slow. Is something wrong?

No, this is expected once and then it is over.

An upgrade can change the size of a generated tile, which makes every tile already in your cache stale. Stale tiles are detected and replaced the first time they are used, so your first flight afterwards re-downloads more than usual while the cache refills. It repairs itself as you fly.

{{< callout type="warning" >}}
You do **not** need to run `xearthlayer cache clear`. It discards the raw image chunks as well, which are still perfectly good and are what save the re-download, so it makes the refill considerably larger for no benefit.
{{< /callout >}}

### Do I have to reinstall my scenery packages for 0.5.0?

Yes. The world was rebuilt: seventeen regional packages, each about a third smaller on disk and each carrying night lighting, replace the eleven continental ones, which are not in the 0.5.0 library. Remove the old packages first, then install the new regions. Removing first matters because a short code such as `EU` is also the start of `EU-WEST` and `EU-EAST`, so while both generations are installed the old package cannot be addressed on its own.

```bash
xearthlayer packages remove --all
xearthlayer packages remove --all --type overlay
xearthlayer packages install --all
```

Or use the package manager: `xearthlayer packages`, `a` then `d` on the Local tab, then pick regions from the Library tab. See [Package Management](/docs/packages/#upgrading-from-the-continental-packages).

### Where did `~/.xearthlayer` go?

0.5.0 keeps its files where the system expects them: configuration in `~/.config/xearthlayer/`, the tile cache in `~/.cache/xearthlayer/`, packages and patches in `~/.local/share/xearthlayer/`, logs in `~/.local/state/xearthlayer/` (and the `Library` equivalents on macOS). The first start copied `config.ini` across and moved nothing else, so anything still in `~/.xearthlayer` is pinned there in your configuration and keeps working. `xearthlayer migrate status` shows where everything resolves, and [Where XEarthLayer Keeps Its Files](/docs/directory-layout/) says what is safe to delete.

### Why is terrain in the distance banded or striped?

Generated tiles carry a complete mipmap chain, 13 levels for a 4096x4096 texture. X-Plane clamps its texture sampling at the last declared level, so a truncated chain leaves distant terrain undersampled and produces visible banding along contours at grazing angles.

If you are seeing banding, the tiles in your cache were written by an older version and still declare a short chain. They are replaced as they are used, so the banding clears as you fly over the area again.

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
![Magenta placeholder tiles ahead of the aircraft](/images/bugs/magenta-tiles.jpg)

Magenta tiles are returned when XEarthLayer cannot deliver a tile within the configured timeout. The placeholder exists to keep the simulator moving. X-Plane blocks on the read until XEarthLayer answers, so without a deadline a slow tile would stall the sim rather than blur it.

`generation.timeout` bounds the whole round trip, from the moment X-Plane asks for a texture to the moment XEarthLayer hands one back. That includes time the request spends queued behind other work, not only the time spent building the tile. On a modest system the queue is usually the larger of the two, which is why placeholders often appear in bursts while individual tiles are still being built quickly.

#### Confirm it in the log

A timeout writes an error, and the job it cancelled writes its own duration:

```
ERROR TIMEOUT: DDS generation exceeded 10s ... tile_row=1456 tile_col=2184 tile_zoom=12
 WARN Task cancelled job_id=dds-1456_2184_ZL12 task_name=BuildAndCacheDds duration_ms=1918
```

Compare `duration_ms` against the timeout. Here the tile took under two seconds to build and spent the remaining eight waiting its turn, so the pipeline is saturated rather than incapable, and raising the timeout is the right fix. If `duration_ms` is close to the timeout instead, the tile genuinely is slow to build, and the load reductions below matter more than the deadline.

#### Raise the timeout

Start at 20 seconds and increase in steps of 10 until the placeholders stop. Do not go beyond 60.

```ini
[generation]
timeout = 20           ; Default is 10
```

{{< callout type="warning" >}}
**A longer deadline is not free.** If X-Plane reaches an area before XEarthLayer has returned the texture, the simulator will slow or freeze until that read completes. Protecting the sim from exactly that is why the timeout exists. A brief pause for a real texture is usually worth it, but an excessive value trades a visible problem for a felt one.
{{< /callout >}}

#### Use one GPU for one job

If your machine has one GPU, encode on the CPU with `texture.compressor = ispc`, which is also what XEarthLayer chooses when nothing is set. GPU encoding is for systems with two physical GPUs, one driving X-Plane and one free to encode. On a single card XEarthLayer honours `gpu` but warns at startup and on the dashboard, because rendering and encoding then compete for the same silicon.

```ini
[texture]
compressor = ispc
```

Several adapters in `xearthlayer diagnostics` do not mean several GPUs. One card can appear more than once. Count physical cards, not entries.

#### Reduce the load on your system

Placeholders that persist after the above are usually a configuration that exceeds what the machine can sustain, made worse by whatever else competes for it: slow or throttled downloads from the mapping service, operating system overhead, or disk I/O bottlenecks. Reduce the concurrency figures, test again, then raise them one at a time.

```ini
[generation]
threads = 4            ; Default is num_cpus / 2, try half of that

[prefetch]
capacity_share = 0.2   ; Default 0.35 (range 0.05-0.50): how much CPU prefetch may use

[texture]
format = bc1           ; bc1 encodes faster and writes half as much as bc3
```

{{< callout type="info" >}}
Prefetch cannot delay X-Plane's own tile requests in 0.5.0: it runs in its own lane and admits no new work while X-Plane is waiting on a tile. It still shares the CPU with the simulator, which is what `capacity_share` limits. Resource pool capacities are not configurable, and `executor.max_concurrent_jobs` no longer exists: it named no limit even when it was there. Run `xearthlayer config upgrade` to strip retired keys from your file.
{{< /callout >}}

#### Prewarm your departure airport

A handful of placeholders in the first minutes of a flight is a cold cache rather than a misconfiguration. Build the tiles around your departure airport before the sim needs them:

```bash
xearthlayer run --airport LSGG
```

See the [CLI Reference](/docs/cli-reference/) for details, and `prewarm.grid_rows` and `prewarm.grid_cols` in [Configuration](/docs/configuration/) to widen the area that is warmed.

### Help! I am seeing white tiles on the scenery when I fly.
![White tiles on landscape](/images/bugs/white-tiles.jpg)

This is usually caused by a FUSE mount issue, most commonly the result of the operating system killing the FUSE process due to out of memory (OOM) conditions. On macOS the equivalent is a stale macFUSE mount after a crash, which XEarthLayer clears at startup; see [XEarthLayer on macOS](/docs/macos/#stale-mount-recovery).

If the operating system did kill the process, it will have added a journal entry of this event.

**Linux**

```bash
# Check for OOM killer activity
journalctl -k --since "1 hour ago" | grep -iE "oom|killed process|out of memory"

# Check for fuse-related errors
journalctl --since "1 hour ago" | grep -iE "fuse|xearthlayer"
```

If your system memory is less than 16GB, the minimum, consider increasing swap space or upgrading RAM. See the [Performance](#performance) section for cache tuning recommendations.

**macOS**: look in Console.app, or run `log show --last 1h --predicate 'eventMessage CONTAINS "xearthlayer"'`.

{{< callout type="info" >}}
XEarthLayer pins two glibc allocator parameters at startup and sizes its thread pool from the work that actually queues on it. Without those, a generated tile is large enough that the C library serves it from arenas it never returns to the operating system, and the process footprint climbs for the life of the session regardless of how small a memory cache you configure. If you set them yourself via `MALLOC_MMAP_THRESHOLD_`, `MALLOC_ARENA_MAX` or `GLIBC_TUNABLES`, your values are left alone. This applies on Linux; macOS does not use glibc.
{{< /callout >}}

Memory behaviour is visible without running the whole session at `--debug`. A `Memory sample` line is written to the log every 60 seconds at normal log level, reporting resident and committed memory, swap, thread count, per-tier cache sizes and in-flight writes, alongside a `Prefetch sample` line covering region states and promotion counts. Quote `anon_mb + swap_mb` when reporting a memory problem: that is the committed footprint the OOM killer scores. Do not quote `vm_mb`, which also counts address space that is mapped but never touched, and carries a sawtooth of roughly a gigabyte from thread stacks that is not memory at all.

### GPU encoding is not working or the wrong GPU is selected

If you have configured `texture.compressor = gpu` and are experiencing issues, here are some common causes and solutions.

**Check that you have two physical GPUs first.** XEarthLayer picks `ispc` when nothing is set and never picks a GPU on its own. If you set `texture.compressor = gpu` on a machine whose only GPU is the one X-Plane renders with (every Apple Silicon Mac, any single-GPU PC), it honours the setting but logs a warning at startup and marks the Tile Processing Engine line on the dashboard's Status pane with an amber `!`. That warning is the answer: switch to `ispc`. Several adapters listed by `xearthlayer diagnostics` do not mean several GPUs.

**GPU not detected:** Run `xearthlayer diagnostics` to list the adapters XEarthLayer can use. Only Vulkan, Metal and DX12 adapters are listed, because GPU encoding needs compute shaders. If none is listed, check your drivers and that Vulkan is available.

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

### My cities are dark at night. Is night lighting working?

Night lighting needs three things: a 0.5.0 scenery package (the old continental packages carry no night recipes), an X-Plane installation behind your Custom Scenery path (the lit art comes from your own X-Plane, it is never redistributed), and `night.enabled = true`, which is the default. The dashboard's Status pane says which of these is missing: it reads enabled, disabled, or warns that the X-Plane installation could not be found.

Close to the aircraft the lit layer fades out on purpose and X-Plane's own 3D lights take over, so look at the middle distance. Rural ground is dark because it is dark: brightness comes from NASA's Black Marble night lights. See [Night Lighting](/docs/night-lighting/).

### Why does night lighting need my X-Plane installation?

The textures that make city ground glow are built from Laminar's own lit art, which cannot be redistributed. Packages carry a recipe for each tile, and XEarthLayer bakes the lit texture on your machine from your X-Plane install.

### How do I turn night lighting off, and what does it cost?

Set `night.enabled = false`. Lit textures are then served as a tiny dark texture and no disk cache is reserved. While it is on, night lighting takes 5% of `cache.disk_size`, about 150 ms of CPU per lit texture it generates, and 256 MB of memory. `night.brightness` (0.5 to 1.5) scales the light if the default is too much or too little for your monitor.

### macOS asks me to approve a kernel extension. Is that right?

Yes. macFUSE, which XEarthLayer uses to present scenery to X-Plane, is a kernel extension. On Apple Silicon you first allow third-party kernel extensions from Recovery, then approve macFUSE in System Settings → Privacy & Security, and restart. It is a one-time step, repeated only after some macOS upgrades. The full walk-through is in [XEarthLayer on macOS](/docs/macos/#installing-macfuse).

### Finder shows `zzXEL_ortho` in Custom Scenery. Is that XEarthLayer?

Yes. It is the one mount XEarthLayer presents every installed package through, named after its folder. Versions before 0.5.0 showed macFUSE's default name instead, `macFUSE Volume 0 (xearthlayer)`; the folder was always `zzXEL_ortho`.

### On my Mac the mount works but reading it over SSH fails with "Operation not permitted"

macOS grants Full Disk Access per responsible process, and over SSH that process is `sshd`, which has none by default. Run XEarthLayer from a Terminal on the Mac itself, or grant `sshd` Full Disk Access in System Settings → Privacy & Security → Full Disk Access (add `/usr/sbin/sshd` with Cmd+Shift+G) and reconnect. XEarthLayer never returns `EPERM` itself, so that error always comes from the OS.

### I found a bug! How do I report it?

First, check the [XEarthLayer GitHub issues](https://github.com/samsoir/xearthlayer/issues) to see if the bug has already been reported. If so, add your details to the existing issue. If it's a new issue, follow the issue template to create a new report.

{{< callout type="info" >}}
Issues submitted without the required logs and system diagnostics will be closed automatically.
{{< /callout >}}

The issue template asks for the output of `xearthlayer diagnostics`. Measuring the cache directory is bounded at five seconds, so the command completes even on a multi-terabyte cache. If the size cannot be measured in that time it is reported as unmeasured and the rest of the report still prints, which is not itself a fault.

Attaching the `Memory sample` and `Prefetch sample` lines from `~/.local/state/xearthlayer/xearthlayer.log` (`~/Library/Logs/XEarthLayer/` on macOS) is also useful for anything performance or memory related — both are written at normal log level, so you do not need to reproduce the problem under `--debug`.

### Where can I get help?

The XEarthLayer community is active and happy to help with questions, troubleshooting, and general discussion:

- **Discord** — Join the [XEarthLayer Discord server](https://discord.gg/RPEWQZdxm2) for real-time chat with other users and the developer
- **GitHub Discussions** — Post questions and share ideas on [GitHub Discussions](https://github.com/samsoir/xearthlayer/discussions)
- **GitHub Issues** — Report bugs or request features via [GitHub Issues](https://github.com/samsoir/xearthlayer/issues)

---

## Performance

### X-Plane runs at a lower frame rate with XEarthLayer than without it

Two different things produce this symptom, and they need different fixes. Check the log first, because it tells them apart.

#### Tiles are arriving late

X-Plane asks XEarthLayer for a texture and waits for the answer. If tiles take longer to produce than the sim can absorb, frames are lost while the sim waits, and the frame rate sags for as long as the aircraft keeps moving into new scenery. The log records every tile that misses its deadline:

```
ERROR TIMEOUT: DDS generation exceeded 10s ... tile_row=1456 tile_col=2184 tile_zoom=12
 WARN Task cancelled job_id=dds-1456_2184_ZL12 task_name=BuildAndCacheDds duration_ms=1918
```

Open `~/.local/state/xearthlayer/xearthlayer.log` (`~/Library/Logs/XEarthLayer/xearthlayer.log` on macOS) after a flight with low frame rates. If these lines appear in bursts, tile production is the bottleneck. The usual causes, in the order worth checking:

- **Underpowered system.** Tile generation is CPU work that runs beside the simulator. A CPU that is already saturated by X-Plane has little left to build tiles with. Lower `generation.threads` and `prefetch.capacity_share` so the two stop fighting, then test again.
- **Encoding on the GPU X-Plane renders with.** If `texture.compressor = gpu` on a single-GPU machine, every tile encoded steals time from the frame being drawn. Switch to `ispc`. XEarthLayer warns about this at startup and on the dashboard.
- **Slow or lossy internet.** Each tile is assembled from 256 downloaded chunks, so a slow connection stretches every tile. Raise `executor.request_timeout_secs` on a lossy line, and prewarm your departure area before the flight.
- **Thread count set wrong in either direction.** Too few threads and tiles queue up behind each other. More threads than cores and they fight the simulator for CPU. The default of half your core count is the right starting point. Do not exceed your core count.

The [magenta tiles](#help-i-am-seeing-magenta-tiles-on-the-scenery-when-i-fly) answer walks through these settings in detail. Low frame rate and magenta placeholders are the same problem at different severities: a tile that is slow costs frames, a tile that is slower than `generation.timeout` becomes a placeholder.

#### Video memory is exhausted

If the log is quiet, the frame rate is being lost on the GPU. Photoreal scenery is texture heavy, and a GPU that runs out of video memory falls back to shuffling textures over the bus every frame, which is far slower. On a card with less than 8 GB of VRAM this is severe. Cut the amount of texture memory X-Plane needs, in this order:

- **Texture quality** down one notch at a time until the frame rate recovers
- **Number of world objects** reduced
- **Shadow quality** reduced or off
- **Visual effects and draw distance** reduced

See the [requirements on the homepage](/#requirements) for VRAM guidance: 8 GB is the minimum, 16 GB with SimHeaven X-World Pro, 24 GB or more with everything on at 4K.

### X-Plane stutters or freezes briefly in flight

A stutter is one late tile: X-Plane blocks on the read until XEarthLayer answers, and the frame it was drawing waits with it. A freeze of a second or more is a tile that was very late, or several late at once. The causes and fixes are the same as for low frame rate above, and the log tells you which tiles were late.

Two settings move the trade-off. A longer `generation.timeout` turns placeholders into pauses, because the sim waits longer for a real texture. A shorter one turns pauses into placeholders. If you raised the timeout to get rid of magenta tiles and now feel the sim hitch, you have found the point where your system cannot keep up, and the load reductions above are the fix rather than the deadline.

### X-Plane crashes to desktop while XEarthLayer is running

X-Plane expects scenery textures to arrive in time. When XEarthLayer cannot deliver them, the simulator tolerates a certain amount of waiting and placeholders before it gives up. Sustained slow delivery is therefore a crash risk, not only a visual one. Two situations account for nearly every crash report:

- **XEarthLayer was stopped while X-Plane was running.** Terminating the process pulls the scenery out from under the simulator, and X-Plane crashes. Always leave XEarthLayer running until you have quit X-Plane. On macOS, see [stale mount recovery](/docs/macos/#stale-mount-recovery) if XEarthLayer itself crashed.
- **Tiles were consistently late.** The fixes are the ones for low frame rate above. A slow internet connection or an underpowered system is the common thread: both stretch tile delivery past what the simulator will wait for. Lower the concurrency settings, keep encoding off the rendering GPU, and prewarm your departure airport so the first minutes of the flight are served from cache.

Magenta tiles are the early warning. If you see them regularly and ignore them, the same conditions that produce them will eventually produce a crash. Check the log for `TIMEOUT` lines before reaching for X-Plane's own settings.

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
- If running on limited hardware, lower `generation.threads` and `prefetch.capacity_share`. Resource pool capacities are not configurable, and `executor.max_concurrent_jobs` was removed in 0.5.0 because it never limited anything
- Move DDS encoding onto an idle integrated GPU with `texture.compressor = gpu` and `texture.gpu_device = integrated`, but only if a discrete GPU runs X-Plane. On one GPU, stay on `ispc`

For detailed configuration guidance, see the [Configuration](/docs/configuration/) page.

### What are the recommended cache settings?

**Disk cache:** Use as much space as you can reasonably allocate. Larger disk caches reduce network traffic and improve load times for previously visited areas. The default is 20GB; a minimum of 50GB is recommended, with 100GB+ being ideal for frequent flyers. For best results, place the cache on a fast NVMe or SSD that is not the primary system volume.

**Memory cache:** The default is 512MB, and the setup wizard recommends your system RAM divided by 12, rounded to the nearest whole GB. Bigger is not automatically better here — the memory cache is a staging buffer for tiles X-Plane is actively reading, not the retention layer, so 2-4GB is ample on a 32GB machine and the DDS disk cache is what actually saves you re-downloading. Keep in mind that X-Plane itself wants around 15GB during initial scene loading, and that the two are competing for the same RAM.

```ini
[cache]
memory_size = 4GB
disk_size = 50GB
```

**Low memory systems:** If system memory is limited (less than 32GB total), consider creating swap space to provide additional virtual memory for both XEarthLayer and X-Plane. A GPU with 8GB of video memory is the minimum; 16GB if you also run SimHeaven X-World Pro.

{{< callout type="warning" >}}
Heavy swap usage on SSDs or NVMe drives can significantly reduce drive lifespan due to the high volume of write operations. If possible, place swap on a separate, less critical drive or consider upgrading system RAM instead.
{{< /callout >}}
