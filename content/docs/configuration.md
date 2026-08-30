---
title: "Configuration"
description: "Configure imagery providers, caching behavior, and performance settings."
weight: 30
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
dds_disk_ratio = 0.6
directory = ~/.cache/xearthlayer
{{< /code >}}

| Parameter | Default | Description |
|-----------|---------|-------------|
| `memory_size` | `512 MB` | RAM for the in-memory tile cache. This is a staging buffer for tiles X-Plane is actively reading, not the retention layer — the DDS disk cache is what saves you re-downloading. The setup wizard recommends RAM ÷ 12, rounded to the nearest whole GB and clamped to between 500 MB and RAM ÷ 4 |
| `disk_size` | `20 GB` | Disk space for the persistent cache, shared between completed DDS tiles and the raw image chunks they are built from. Larger values reduce repeat network requests |
| `dds_disk_ratio` | `0.6` | Fraction of `disk_size` given to the DDS tile cache (0.0–1.0). The remainder goes to the raw chunk cache |
| `directory` | `~/.cache/xearthlayer` | Where cached tiles are stored on disk. Use a drive separate from your system drive if possible, as cache writes are high |

{{< callout type="tip" >}}
For best performance, place the cache directory on a fast NVMe or SSD that is not your primary system volume. XEarthLayer writes heavily to it during flight.
{{< /callout >}}

{{< callout type="tip" >}}
Size values support `KB`, `MB`, and `GB` suffixes. Since 0.4.7 they also accept decimals and a bare `B` suffix, so `500 MB`, `4 GB`, `2.6GB` and `1500000000B` are all valid. Before 0.4.7 a value such as `1.5 GB` could be written by XEarthLayer but not read back ([#218](https://github.com/samsoir/xearthlayer/issues/218)).
{{< /callout >}}

{{< callout type="warning" >}}
**Changed in 0.4.7.** `dds_disk_ratio` is now actually applied ([#248](https://github.com/samsoir/xearthlayer/issues/248)). Until this release the setting was parsed, validated and displayed on the dashboard, but the disk budget always split 60/40 no matter what you configured. If you had set a non-default ratio, your DDS and chunk cache sizes will change when you upgrade.
{{< /callout >}}

### Texture Format

Controls the DDS compression format used for scenery tiles.

{{< code lang="ini" copy="true" >}}
[texture]
format = bc1
{{< /code >}}

| Parameter | Default | Description |
|-----------|---------|-------------|
| `format` | `bc1` | `bc1` (DXT1) produces smaller tiles at ~11.2 MB per 4096x4096 tile. `bc3` (DXT5) includes an alpha channel at ~22.4 MB per tile. Use `bc1` unless you specifically need transparency |

{{< callout type="info" >}}
**Changed in 0.4.7.** Generated tiles now carry a complete mipmap chain — 13 levels for a 4096x4096 texture, where earlier releases declared only 5 ([#212](https://github.com/samsoir/xearthlayer/issues/212)). X-Plane clamps sampling at the last declared level, so a truncated chain left distant terrain undersampled and produced visible banding along contours at grazing angles. The fix costs about 11 KB per tile, but it does change the tile size, which means every DDS tile written by 0.4.6 or earlier is now stale. See [Getting Started](../getting-started/) for what to expect on your first flight after upgrading.
{{< /callout >}}

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
| `gpu` | Fast | Low | When an idle wgpu-compatible GPU is available for encoding |

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
| `mode` | `auto` | Mode selection: `auto` (recommended), `aggressive`, `opportunistic`, or `disabled` |
| `web_api_port` | `8086` | X-Plane Web API port for telemetry (position, heading, speed, altitude). Requires X-Plane 12.4.0 or later. Change only if X-Plane uses a non-default port |
| `cycle_interval_ms` | `2000` | Interval between prefetch cycles in milliseconds |
| `calibration_aggressive_threshold` | `30.0` | Tiles/sec throughput threshold for aggressive mode |
| `calibration_opportunistic_threshold` | `10.0` | Tiles/sec throughput threshold for opportunistic mode. Below this, prefetch is disabled |
| `calibration_sample_duration` | `60` | How long (seconds) to measure throughput during initial calibration |
| `box_extent` | `7.0` | Maximum prefetch box extent per axis in degrees. The cruise-phase box scales with ground speed, from 3.5° at or below 40 kt up to this value at or above 450 kt |
| `box_max_bias` | `0.8` | Forward bias fraction (0.5-0.9). 0.8 means 80% of the box is ahead of the aircraft |
| `window_buffer` | `1` | Extra DSF tiles kept around the edges of X-Plane's scenery window before a region becomes eligible for eviction |
| `stale_region_timeout` | `120` | Seconds before a region still marked in-progress is treated as stale and re-evaluated |

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

{{< callout type="info" >}}
**Improved in 0.4.7.** Prefetch tracks every 1°x1° region through a lifecycle, and two of its states behaved badly before this release. A region whose tiles were merely slow to arrive shared a retirement path with a region the scenery index says has no tiles at all, so a slow region was permanently written off after three attempts and never retried ([#226](https://github.com/samsoir/xearthlayer/issues/226)). Separately, running with no ortho packages installed marked the entire world as uncovered, because "no index was loaded" was indistinguishable from "the index was consulted and found nothing" ([#228](https://github.com/samsoir/xearthlayer/issues/228)). Both are fixed, and a region that is merely slow is now deferred on a 20/30/40/60 second ladder rather than retired. See [How It Works](../how-it-works/) for the full lifecycle. None of this is configurable — it is noted here because it changes what the log reports.
{{< /callout >}}

{{< code lang="ini" copy="true" >}}
[prefetch]
enabled = true
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

### Generation

Controls parallel tile generation (assembling and encoding downloaded chunks into DDS textures).

| Parameter | Default | Description |
|-----------|---------|-------------|
| `threads` | num_cpus / 2 | Number of worker threads for parallel tile generation. Half your core count by default, which leaves headroom for X-Plane. Do not set this higher than your CPU core count |
| `timeout` | `10` | Timeout in seconds for generating a single tile. If exceeded, a magenta placeholder is returned |

{{< code lang="ini" copy="true" >}}
[generation]
threads = 8
timeout = 10
{{< /code >}}

{{< callout type="warning" >}}
**Changed in 0.4.7.** `generation.timeout` now actually bounds the blocking FUSE read ([#248](https://github.com/samsoir/xearthlayer/issues/248)). Until this release the setting was parsed and reported but a hardcoded 30-second constant won, so the effective ceiling before a magenta placeholder was returned drops from 30 seconds to the documented default of 10. On a system that was already close to the limit this can mean **more** magenta tiles on 0.4.7 than on 0.4.6. If you see that, raise `generation.timeout` — the old behaviour is `timeout = 30`. See the [FAQ](../faq/#help-i-am-seeing-magenta-tiles-on-the-scenery-when-i-fly) for the full diagnosis.
{{< /callout >}}

### Executor

The executor is the core tile processing engine. These settings control how many tiles are processed at once and how chunk downloads are retried.

Each 4096x4096 scenery tile is assembled from 256 chunks — a 16x16 grid of 256x256 source images — so a single stalled chunk is what `max_retries` and `request_timeout_secs` exist to recover from.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_concurrent_jobs` | ceil(num_cpus x 0.75) | Maximum concurrent DDS tile jobs (1-256) |
| `request_timeout_secs` | `10` | HTTP request timeout per chunk in seconds |
| `max_retries` | `3` | Maximum retry attempts per failed chunk download |
| `retry_base_delay_ms` | `100` | Base delay in milliseconds for exponential backoff (100 ms, 200 ms, 400 ms, ...) |

Failed chunk downloads are retried with exponential backoff: the first attempt is immediate, then 100 ms, 200 ms and 400 ms.

{{< code lang="ini" copy="true" >}}
[executor]
max_concurrent_jobs = 12
request_timeout_secs = 10
max_retries = 3
retry_base_delay_ms = 100
{{< /code >}}

{{< callout type="info" >}}
**Resource pool capacities are not configurable.** The network, CPU and disk I/O pool sizes are derived from your host's logical core count using multipliers tuned by flight testing. The `network_concurrent`, `cpu_concurrent` and `disk_io_concurrent` keys were removed in 0.4.7 ([#249](https://github.com/samsoir/xearthlayer/issues/249)) because no value they carried ever reached the executor — `config list` even reported figures computed by a second formula that contradicted the live one. A configuration file that still contains them loads normally, and `xearthlayer config upgrade` removes them.
{{< /callout >}}

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

### Package Manager

Controls where regional scenery packages are downloaded, installed and linked. Most users never need to change these — the setup wizard writes them.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `library_url` | (official library) | URL of the package library index. Override only if you are using a custom package source |
| `install_location` | `~/.xearthlayer/packages` | Where installed packages are stored |
| `custom_scenery_path` | (auto-detect) | X-Plane Custom Scenery directory used for overlay symlinks. Falls back to `xplane.scenery_dir` |
| `auto_install_overlays` | `false` | Automatically install the matching overlay package when installing an ortho package |
| `disable_overlays` | `false` | Suppress XEarthLayer overlays at runtime (see below) |
| `temp_dir` | `~/.xearthlayer/tmp` | Temporary directory for package downloads. The default deliberately avoids the system temp directory, which is often RAM-backed on Linux |
| `concurrent_downloads` | `5` | Number of concurrent part downloads (1-10) |

`disable_overlays` is a runtime control, not an install-time one. When set to `true`, `xearthlayer run` removes the consolidated `yzXEL_overlay/` folder from Custom Scenery on startup so X-Plane does not load XEarthLayer overlays. The overlay packages stay on disk — setting it back to `false` and restarting reinstates them with no re-download. Use this when you are running third-party overlay scenery that conflicts with XEarthLayer's.

{{< code lang="ini" copy="true" >}}
[packages]
install_location = ~/.xearthlayer/packages
auto_install_overlays = true
disable_overlays = false
{{< /code >}}

### Update Check

| Parameter | Default | Description |
|-----------|---------|-------------|
| `update_check` | `true` | Check for a new version on startup. Performs a single HTTP request once per day, cached locally. No telemetry is sent |

{{< code lang="ini" copy="true" >}}
[general]
update_check = true
{{< /code >}}

---

## Settings Removed in 0.4.7

Four settings were removed in this release. Each was parsed, validated and echoed back by `config list`, while a hardcoded constant or a separate policy silently won — so no value you could write in the file described anything XEarthLayer actually did.

| Setting | Replacement |
|---------|-------------|
| `cache.disk_io_profile` | None. Disk I/O concurrency was never derived from this value; the pool took a flat capacity and the profile-aware code path had no callers |
| `executor.network_concurrent` | None. Pool capacities are derived from your logical core count |
| `executor.cpu_concurrent` | None. As above |
| `executor.disk_io_concurrent` | None. As above |

A configuration file that still contains these keys loads normally — they are ignored. To tidy them up, run:

{{< code lang="bash" copy="true" >}}
xearthlayer config upgrade --dry-run   # Preview
xearthlayer config upgrade             # Apply
{{< /code >}}

The setup wizard also dropped its disk I/O profile prompt, so step 3 now asks for the cache directory, disk cache size, DDS-to-chunk ratio and memory cache size only.

Two sections removed in earlier 0.4.x releases are worth mentioning because configuration files written before them are still in circulation:

- **`[download]`** was consolidated into `[executor]`. Use `executor.request_timeout_secs` in place of `download.timeout`.
- **`[control_plane]`** was deprecated. `max_concurrent_jobs` moved to `[executor]`; the stall-detection and health-check settings are no longer configurable. In 0.4.7 the parser was fixed so that `executor.max_concurrent_jobs` can be read back from a file XEarthLayer wrote itself ([#248](https://github.com/samsoir/xearthlayer/issues/248)) — before this, the key had moved section without the parser following.

`xearthlayer config upgrade` removes all of these too.
