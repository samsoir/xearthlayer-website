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

Check XEarthLayer's own logs for messages that may not be printed to `stdout` or `stderr`.

```bash
tail -f ~/.xearthlayer/xearthlayer.log
```

### How do I update to the latest version?

Download the latest package for your distribution from the [GitHub releases](https://github.com/samsoir/xearthlayer/releases) and install it over your existing installation.

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
2. Verify that `zz_XEL_*_Ortho` and `zy_XEL_*_Overlay` packs are listed in your `scenery_packs.ini` file. They typically appear at the bottom but can be anywhere in the file.

If the above doesn't resolve the issue, ask for help on [Discord](https://discord.gg/XVUmMWYS), the X-Plane.org forums, or [create a GitHub issue](https://github.com/samsoir/xearthlayer/issues).

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

If the situation persists, it is likely caused by configuration that exceeds your system's capabilities. XEarthLayer deadlocks are rare but can occur if network or disk I/O is exhausted.

Try reducing the following settings by 50% and testing again. If things stabilize, you can slowly increase them one by one:

```ini
[cache]
disk_io_profile = auto

[texture]
format = bc1

[download]
timeout = 30
retries = 3

[executor]
network_concurrent = 64       # Default 128, reduce by 50%
cpu_concurrent = 4            # Default is ~num_cpus * 1.25, try half
disk_io_concurrent = 32       # Default 64, reduce by 50%
request_timeout_secs = 10
max_retries = 3
```

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

If your system memory is less than 4GB, consider increasing swap space or upgrading RAM. See the [Performance](#performance) section for cache tuning recommendations.

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

### Where can I get help?

The XEarthLayer community is active and happy to help with questions, troubleshooting, and general discussion:

- **Discord** — Join the [XEarthLayer Discord server](https://discord.gg/XVUmMWYS) for real-time chat with other users and the developer
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
- If running on limited hardware, reduce `executor.network_concurrent` and `executor.cpu_concurrent` settings

For detailed configuration guidance, see the [Configuration](/docs/configuration/) page.

### What are the recommended cache settings?

**Disk cache:** Use as much space as you can reasonably allocate. Larger disk caches reduce network traffic and improve load times for previously visited areas. The default is 20GB; a minimum of 50GB is recommended, with 100GB+ being ideal for frequent flyers. For best results, place the cache on a fast NVMe or SSD that is not the primary system volume.

**Memory cache:** The default is 2GB. A value of 4-8GB works well for most systems. Adjust based on your available system memory, keeping in mind that X-Plane itself requires around 15GB during initial scene loading.

```ini
[cache]
memory_size = 8GB
disk_size = 50GB
```

**Low memory systems:** If system memory is limited (less than 32GB total), consider creating swap space to provide additional virtual memory for both XEarthLayer and X-Plane. This is particularly important if your GPU has less than 8GB of VRAM, as the system may need to accommodate texture overflow.

{{< callout type="warning" >}}
Heavy swap usage on SSDs or NVMe drives can significantly reduce drive lifespan due to the high volume of write operations. If possible, place swap on a separate, less critical drive or consider upgrading system RAM instead.
{{< /callout >}}
