---
title: "Configuration"
description: "Configure imagery providers, caching behavior, and performance settings."
weight: 20
---

XEarthLayer is configured through an INI file located at `~/.xearthlayer/config.ini`. This page covers the essential settings to get flying, followed by advanced tuning sections for users who want more control.

## Getting Started with Configuration

{{< callout type="tip" >}}
The easiest way to configure XEarthLayer is with the **setup wizard**: run `xearthlayer setup` and it will auto-detect your X-Plane installation, system hardware, and recommend optimal settings. See [Getting Started](../getting-started/) for a walkthrough.
{{< /callout >}}

If you prefer manual configuration, create the default config file with:

{{< code lang="bash" copy="true" >}}
xearthlayer init
{{< /code >}}

The config file lives at:

| Path | Purpose |
|------|---------|
| `~/.xearthlayer/config.ini` | Main configuration file |
| `~/.xearthlayer/xearthlayer.log` | Log file (default) |
| `~/.cache/xearthlayer/` | Tile cache (default) |

See [CLI Reference](/docs/cli-reference/) for commands to view and modify configuration settings from the terminal.

## Minimum Settings

These four sections are all you need to configure before your first flight.

### X-Plane Scenery Directory

Tell XEarthLayer where your X-Plane Custom Scenery folder is. If left empty, it auto-detects from `~/.x-plane/x-plane_install_12.txt`.

{{< code lang="ini" copy="true" >}}
[xplane]
scenery_dir = /home/user/X-Plane 12/Custom Scenery
{{< /code >}}

### Imagery Provider

Choose which satellite imagery source to use.

{{< code lang="ini" copy="true" >}}
[provider]
type = bing
{{< /code >}}

| Provider | Config Value | API Key Required | Notes |
|----------|-------------|------------------|-------|
| Bing Maps | `bing` | No | Recommended, same source as MSFS 2020/2024. Good global coverage |
| Google GO2 | `go2` | No | Free, Google Maps via public tile servers |
| Apple Maps | `apple` | No | High quality imagery, tokens auto-acquired |
| ArcGIS | `arcgis` | No | ESRI World Imagery, good global coverage |
| MapBox | `mapbox` | Yes (freemium) | Requires free account at mapbox.com |
| Google Maps | `google` | Yes (paid) | Official API, strict rate limits (15,000 requests/day) |
| USGS | `usgs` | No | US coverage only, excellent quality orthoimagery |

For providers that need an API key, add the key in the same section:

{{< code lang="ini" copy="true" >}}
[provider]
type = mapbox
mapbox_access_token = pk.eyJ1...your-token-here
{{< /code >}}

{{< code lang="ini" copy="true" >}}
[provider]
type = google
google_api_key = AIzaSy...your-key-here
{{< /code >}}

### Cache

Controls how much memory and disk space XEarthLayer uses for caching tiles. Larger caches mean fewer repeat downloads.

{{< code lang="ini" copy="true" >}}
[cache]
memory_size = 2 GB
disk_size = 20 GB
directory = ~/.cache/xearthlayer
{{< /code >}}

| Parameter | Default | Description |
|-----------|---------|-------------|
| `memory_size` | `2 GB` | RAM for in-memory tile cache. If you have 32 GB of system memory, 15 GB or more is recommended |
| `disk_size` | `20 GB` | Disk space for persistent tile cache. Larger values reduce repeat network requests |
| `directory` | `~/.cache/xearthlayer` | Where cached tiles are stored on disk. Use a drive separate from your system drive if possible, as cache writes are high |

{{< callout type="tip" >}}
Size values support `KB`, `MB`, and `GB` suffixes (e.g., `500 MB`, `4 GB`, `100 GB`).
{{< /callout >}}

### Texture Format

Controls the DDS compression format used for scenery tiles.

{{< code lang="ini" copy="true" >}}
[texture]
format = bc1
{{< /code >}}

| Parameter | Default | Description |
|-----------|---------|-------------|
| `format` | `bc1` | `bc1` (DXT1) produces smaller tiles at ~11 MB per 4096x4096 tile. `bc3` (DXT5) includes alpha channel at ~22 MB per tile. Use `bc1` unless you specifically need transparency |

---

## Advanced Settings

The sections below cover advanced tuning. Each is self-contained with sensible defaults that work for most systems. Only change these if you have a specific reason to.

### DDS Encoding

Controls the compression backend used to encode satellite imagery into DDS textures.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `compressor` | `ispc` | Compression backend: `software`, `ispc` (SIMD), or `gpu` (compute shader) |
| `gpu_device` | `integrated` | GPU adapter when using `gpu` compressor: `integrated`, `discrete`, or an adapter name substring (e.g., `Radeon`, `RTX 5090`) |

| Backend | Speed | CPU Usage | When to Use |
|---------|-------|-----------|-------------|
| `software` | Slowest | High | Fallback when ISPC or GPU are unavailable |
| `ispc` | Fast (5-10x) | High | Default. Best overall performance for most users |
| `gpu` | Fast | Low | When an idle GPU is available for encoding (requires `gpu-encode` build) |

The `gpu` backend is ideal for systems with both an integrated and discrete GPU. Set `gpu_device = integrated` to use the iGPU for encoding while the discrete GPU handles X-Plane rendering. This eliminates CPU contention between encoding and the simulator.

{{< callout type="warning" >}}
Using `gpu_device = discrete` sends encoding work to the same GPU running X-Plane, which creates memory pressure and may cause frame drops. Only use `discrete` if you do not have an integrated GPU.
{{< /callout >}}

Run `xearthlayer diagnostics` to see available GPU adapters on your system.

{{< code lang="ini" copy="true" >}}
[texture]
format = bc1
compressor = gpu
gpu_device = integrated
{{< /code >}}

### Prefetch Tuning

Controls the Adaptive Prefetch System, which pre-loads tiles ahead of the aircraft to reduce scenery pop-in during flight. The system self-calibrates based on your network and hardware performance.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `enabled` | `true` | Enable or disable predictive tile prefetching |
| `strategy` | `adaptive` | Strategy selection: `auto` or `adaptive` (both use adaptive prefetch) |
| `mode` | `auto` | Mode selection: `auto` (recommended), `aggressive`, `opportunistic`, or `disabled` |
| `web_api_port` | `8086` | X-Plane Web API port for telemetry (position, heading, speed, altitude). Change only if X-Plane uses a non-default port |
| `max_tiles_per_cycle` | `200` | Maximum tiles to submit per prefetch cycle. Lower values reduce bandwidth competition with on-demand requests |
| `cycle_interval_ms` | `2000` | Interval between prefetch cycles in milliseconds |
| `calibration_aggressive_threshold` | `30.0` | Tiles/sec throughput threshold for aggressive mode |
| `calibration_opportunistic_threshold` | `10.0` | Tiles/sec throughput threshold for opportunistic mode. Below this, prefetch is disabled |
| `calibration_sample_duration` | `60` | How long (seconds) to measure throughput during initial calibration |
| `box_extent` | `6.5` | Prefetch box extent per axis in degrees (7.0-15.0). X-Plane loads ~6x6 DSF tiles around the aircraft |
| `box_max_bias` | `0.8` | Forward bias fraction (0.5-0.9). 0.8 means 80% of the box is ahead of the aircraft |

**Mode selection** is based on calibration throughput:

| Mode | Trigger | When Used |
|------|---------|-----------|
| `auto` | Based on calibration (recommended) | Most users |
| `aggressive` | Position-based (>30 tiles/sec throughput) | Fast connections |
| `opportunistic` | Executor backpressure-based (10-30 tiles/sec) | Moderate connections |
| `disabled` | Never prefetches | Slow connections or debugging |

**Flight phase transitions:**

The prefetch system detects three flight phases and adjusts behavior automatically:

- **Ground** (GS < 40 kt): Full-rate prefetch using ring strategy around current position
- **Transition** (takeoff detected): Prefetch suppressed while X-Plane loads takeoff scenery
- **Cruise** (climb confirmed): Prefetch ramps up from 25% to full rate over 30 seconds

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `takeoff_climb_ft` | `1000` | 200-5000 | Feet above takeoff altitude to release transition hold |
| `takeoff_timeout_secs` | `90` | 30-300 | Maximum seconds before timeout release |
| `landing_hysteresis_secs` | `15` | 5-60 | Sustained seconds at GS < 40 kt before landing detection |
| `ramp_duration_secs` | `30` | 10-120 | Duration of linear ramp to full prefetch rate |
| `ramp_start_fraction` | `0.25` | 0.1-0.5 | Starting prefetch fraction when ramp begins |

{{< callout type="info" >}}
Telemetry is automatic. XEarthLayer connects to X-Plane's built-in Web API (port 8086 by default) for position, heading, speed, and altitude data. No plugin or manual setup is required. If X-Plane uses a non-default port, set `web_api_port` to match.
{{< /callout >}}

{{< code lang="ini" copy="true" >}}
[prefetch]
enabled = true
strategy = adaptive
mode = auto
{{< /code >}}

### Cache Warming (Prewarm)

Pre-loads tiles around a departure airport before X-Plane starts, reducing initial scenery load times on a cold cache.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `grid_rows` | `3` | Latitude extent in DSF tiles around the airport |
| `grid_cols` | `4` | Longitude extent in DSF tiles around the airport |

The default 3x4 grid (12 tiles) matches X-Plane's typical scenery window of ~3 degrees latitude by ~4 degrees longitude at mid-latitudes.

| Rows x Cols | Tiles | Approximate Coverage |
|-------------|-------|---------------------|
| 3 x 4 (default) | 12 | ~180 nm x 240 nm |
| 4 x 6 | 24 | ~240 nm x 360 nm |
| 6 x 8 | 48 | ~360 nm x 480 nm |

Use the `--airport` flag when launching to activate prewarming:

{{< code lang="bash" copy="true" >}}
xearthlayer run --airport KJFK
{{< /code >}}

{{< code lang="ini" copy="true" >}}
[prewarm]
grid_rows = 3
grid_cols = 4
{{< /code >}}

### Download Settings

Controls the network timeout for downloading imagery tiles.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `timeout` | `30` | Download timeout in seconds for a single chunk |

Each 4096x4096 scenery tile requires downloading 256 chunks (a 16x16 grid of 256x256 source tiles). HTTP concurrency is automatically tuned based on your CPU count. Retry behavior is configured in the [Resource Pools (Executor)](#resource-pools-executor) section.

{{< code lang="ini" copy="true" >}}
[download]
timeout = 30
{{< /code >}}

### Generation

Controls parallel tile generation (assembling and encoding downloaded chunks into DDS textures).

| Parameter | Default | Description |
|-----------|---------|-------------|
| `threads` | (number of CPU cores) | Number of worker threads for parallel tile generation. Do not set higher than your CPU core count |
| `timeout` | `10` | Timeout in seconds for generating a single tile. If exceeded, a magenta placeholder is returned |

{{< code lang="ini" copy="true" >}}
[generation]
threads = 8
timeout = 10
{{< /code >}}

### Control Plane

Manages concurrent tile processing jobs and provides health monitoring with stall detection.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_concurrent_jobs` | num_cpus x 2 | Maximum concurrent tile processing jobs |
| `stall_threshold_secs` | `60` | Time in seconds before a job is considered stalled and recovered |
| `health_check_interval_secs` | `5` | Interval between health monitoring checks (seconds) |
| `semaphore_timeout_secs` | `30` | Timeout for on-demand requests waiting for a job slot (seconds) |

On-demand requests from X-Plane block up to `semaphore_timeout_secs` waiting for a slot, while prefetch jobs are silently skipped if no slots are available.

{{< code lang="ini" copy="true" >}}
[control_plane]
max_concurrent_jobs = 16
stall_threshold_secs = 60
{{< /code >}}

### Resource Pools (Executor)

The executor is the core tile processing engine. These settings control concurrency limits for network, CPU, and disk I/O operations.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `network_concurrent` | `128` | Concurrent HTTP connections. Clamped to 64-256 to prevent provider rate limiting |
| `cpu_concurrent` | num_cpus x 1.25 | Concurrent CPU-bound operations (assemble + encode). Minimum: num_cpus + 2 |
| `disk_io_concurrent` | `64` | Concurrent disk I/O operations. Auto-detected from storage type (HDD: 4, SSD: 64, NVMe: 256) |
| `max_concurrent_tasks` | `128` | Maximum concurrent tasks the executor can run |
| `job_channel_capacity` | `256` | Internal job queue size |
| `request_channel_capacity` | `1000` | External request queue from FUSE and prefetch |
| `request_timeout_secs` | `10` | HTTP request timeout per chunk in seconds |
| `max_retries` | `3` | Maximum retry attempts per failed chunk download |
| `retry_base_delay_ms` | `100` | Base delay in milliseconds for exponential backoff (100 ms, 200 ms, 400 ms, ...) |

{{< code lang="ini" copy="true" >}}
[executor]
network_concurrent = 128
cpu_concurrent = 10
disk_io_concurrent = 64
{{< /code >}}

### Disk I/O Profile

Tunes disk I/O concurrency based on your storage type. This is set in the `[cache]` section.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `disk_io_profile` | `auto` | Storage type profile: `auto`, `hdd`, `ssd`, or `nvme` |

| Profile | Description | Concurrent Ops | Best For |
|---------|-------------|----------------|----------|
| `auto` | Auto-detect storage type (recommended) | Varies | Most users |
| `hdd` | Spinning disk, seek-bound | 1-4 | Traditional hard drives |
| `ssd` | SATA/AHCI SSD | 32-64 | Most SSDs |
| `nvme` | NVMe SSD, multiple queues | 128-256 | NVMe drives |

When set to `auto` on Linux, XEarthLayer detects the storage type by checking `/sys/block/<device>/queue/rotational`. If detection fails, it defaults to the `ssd` profile as a safe middle-ground.

{{< callout type="tip" >}}
For best performance, place your cache directory on a fast NVMe or SSD that is not your primary system volume.
{{< /callout >}}

{{< code lang="ini" copy="true" >}}
[cache]
disk_io_profile = auto
{{< /code >}}

### FUSE Kernel Parameters

Controls Linux FUSE kernel limits for concurrent background requests. The Linux kernel's default limits (12 max background / 9 congestion threshold) are far too low for X-Plane's concurrent scenery reads.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_background` | `256` | Maximum pending background FUSE requests before the kernel queues them |
| `congestion_threshold` | `192` | Kernel starts throttling when pending requests exceed this. Convention: 75% of `max_background` |

{{< callout type="warning" >}}
These are advanced kernel-level parameters. The defaults are tuned to prevent sim freezes at DSF tile boundaries. Only increase these if you experience boundary freezes. The `congestion_threshold` should always be less than `max_background`.
{{< /callout >}}

{{< code lang="ini" copy="true" >}}
[fuse]
max_background = 256
congestion_threshold = 192
{{< /code >}}

### Logging

Controls where XEarthLayer writes its log file.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `file` | `~/.xearthlayer/xearthlayer.log` | Log file location. Supports `~` expansion |

{{< code lang="ini" copy="true" >}}
[logging]
file = ~/.xearthlayer/xearthlayer.log
{{< /code >}}
