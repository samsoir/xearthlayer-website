---
title: "Configuration"
description: "Configure imagery providers, caching behaviour, and performance settings."
weight: 30
---

XEarthLayer is configured through an INI file, `config.ini`, in its configuration directory: `~/.config/xearthlayer/` on Linux (`~/Library/Application Support/XEarthLayer/` on macOS). `xearthlayer config path` prints the file in use. This page covers the essential settings to get flying, followed by advanced tuning sections for users who want more control.

## Getting Started with Configuration

{{< callout type="tip" >}}
The easiest way to configure XEarthLayer is with the **setup wizard**: run `xearthlayer setup` and it will auto-detect your X-Plane installation, system hardware, and recommend optimal settings. See [Getting Started](../getting-started/) for a walkthrough.
{{< /callout >}}

If you prefer manual configuration, create the default config file with:

{{< code lang="bash" copy="true" >}}
xearthlayer init
{{< /code >}}

XEarthLayer keeps its files in four places. Every one of them is a default that a setting below can override.

{{< paths >}}

See [Where XEarthLayer Keeps Its Files](../directory-layout/) for what moved in 0.5.0 and what the migration does.

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
directory = /mnt/nvme/xearthlayer-cache
{{< /code >}}

| Parameter | Default | Description |
|-----------|---------|-------------|
| `memory_size` | `512 MB` | RAM for the in-memory tile cache. This is a staging buffer for tiles X-Plane is actively reading, not the retention layer — the DDS disk cache is what saves you re-downloading. The setup wizard recommends RAM ÷ 12, rounded to the nearest whole GB and clamped to between 500 MB and RAM ÷ 4 |
| `disk_size` | `20 GB` | Disk space for the persistent cache, shared between completed DDS tiles and the raw image chunks they are built from. Larger values reduce repeat network requests. With night lighting enabled, 5% of this budget goes to the night texture cache first; the rest is split as below |
| `dds_disk_ratio` | `0.6` | Fraction of `disk_size` given to the DDS tile cache (0.0–1.0). The remainder goes to the raw chunk cache |
| `directory` | `~/.cache/xearthlayer` (`~/Library/Caches/XEarthLayer` on macOS) | Where cached tiles are stored on disk. Use a drive separate from your system drive if possible, as cache writes are high |

{{< callout type="tip" >}}
For best performance, place the cache directory on a fast NVMe or SSD that is not your primary system volume. XEarthLayer writes heavily to it during flight.
{{< /callout >}}

{{< callout type="tip" >}}
Size values support `KB`, `MB` and `GB` suffixes, decimals, and a bare `B` suffix, so `500 MB`, `4 GB`, `2.6GB` and `1500000000B` are all valid.
{{< /callout >}}

{{< callout type="info" >}}
`dds_disk_ratio` divides the disk budget between encoded DDS tiles and the raw image chunks they are built from. The default of `0.6` gives 60% to DDS tiles, which are the more expensive of the two to reproduce.
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
Generated tiles carry a complete mipmap chain, 13 levels for a 4096x4096 texture. X-Plane clamps its sampling at the last declared level, so a full chain is what keeps distant terrain from banding along contours at grazing angles. See [How It Works](../how-it-works/).
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

XEarthLayer picks the encoder by one policy. With no preference set it uses `ispc` and never a GPU. If you set `compressor = gpu`, it honours the choice, but on a machine whose only GPU is the one X-Plane renders with (every Apple Silicon Mac, any single-GPU PC) it logs a warning at startup and the dashboard's Status pane marks the Tile Processing Engine line with an amber `!`, because encoding then competes with the simulator. The setup wizard offers GPU encoding only when it finds at least two.

{{< callout type="tip" >}}
GPU encoding is for systems with an integrated GPU sitting idle while a discrete card runs X-Plane. Set `gpu_device = integrated` so the iGPU encodes and the dGPU renders. On one GPU, stay on `ispc`.
{{< /callout >}}

Run `xearthlayer diagnostics` to see the GPU adapters XEarthLayer can use. Only Vulkan, Metal and DX12 adapters are listed; OpenGL is never probed.

{{< code lang="ini" copy="true" >}}
[texture]
format = bc1
compressor = gpu
gpu_device = integrated
{{< /code >}}

### Prefetch Tuning

Controls the Adaptive Prefetch System, which pre-loads tiles ahead of the aircraft to reduce scenery pop-in during flight. Prefetch runs in its own lane with its own download, CPU and disk pools, so its backlog never sits in front of a request from X-Plane. While X-Plane is waiting on a tile, the lane admits no new work. It still shares the CPU with the simulator, which is what `capacity_share` sizes.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `enabled` | `true` | Enable or disable predictive tile prefetching |
| `web_api_port` | `8086` | X-Plane Web API port for telemetry (position, heading, speed, altitude). Requires X-Plane 12.4.0 or later. Change only if X-Plane uses a non-default port |
| `cycle_interval_ms` | `2000` | Has no effect in 0.5.0: cycles run at a fixed 2 second interval |
| `box_extent` | `7.0` | Maximum prefetch box extent per axis in degrees. The cruise-phase box scales with ground speed, from 3.5° at or below 40 kt up to this value at or above 450 kt |
| `box_max_bias` | `0.8` | Forward bias fraction (0.5-0.9). 0.8 means 80% of the box is ahead of the aircraft |
| `capacity_share` | `0.35` | Prefetch capacity as a fraction of the capacity X-Plane's own tile requests get (0.05–0.50). Lower it if prefetch costs frame rate |
| `window_buffer` | `1` | Extra DSF tiles kept around the edges of X-Plane's scenery window before a region becomes eligible for eviction |
| `stale_region_timeout` | `120` | Seconds before a region still marked in-progress is treated as stale and re-evaluated |

**Flight phase transitions:**

The prefetch system detects three flight phases and adjusts behaviour automatically:

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

`enabled` is the only switch. `xearthlayer run --no-prefetch` turns prefetch off for one run without touching the file. `prefetch.mode` was removed in 0.5.0: `mode = disabled` in an old file is read as `enabled = false`, any other value is ignored, and `xearthlayer config upgrade` rewrites it.

{{< callout type="info" >}}
Telemetry is automatic. XEarthLayer connects to X-Plane's built-in Web API (port 8086 by default) for position, heading, speed and altitude. X-Plane 12.4.0 or later is required; without the Web API, prefetch does not run. If X-Plane uses a non-default port, set `web_api_port` to match.
{{< /callout >}}

{{< callout type="info" >}}
Prefetch tracks every 1°x1° region through a lifecycle. A region is marked as having no coverage only when the scenery index genuinely attributes zero tiles to it. A region whose tiles are merely slow to arrive is deferred on a 20/30/40/60 second ladder instead, so its tiles stay retryable. None of this is configurable; it is noted here because it shapes what the log reports. See [How It Works](../how-it-works/) for the full lifecycle.
{{< /callout >}}

{{< code lang="ini" copy="true" >}}
[prefetch]
enabled = true
capacity_share = 0.35
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
`generation.timeout` bounds how long a blocking FUSE read waits for a tile before a magenta placeholder is returned, so X-Plane is never left stalling. If you see placeholders on scenery that should be available, raise this value. See the [FAQ](../faq/#help-i-am-seeing-magenta-tiles-on-the-scenery-when-i-fly) for the full diagnosis.
{{< /callout >}}

### Executor

The executor is the core tile processing engine. Only its per-chunk download behaviour is configurable; concurrency is derived from your host's logical core count.

Each 4096x4096 scenery tile is assembled from 256 chunks — a 16x16 grid of 256x256 source images — so a single stalled chunk is what `max_retries` and `request_timeout_secs` exist to recover from.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `request_timeout_secs` | `10` | HTTP request timeout per chunk in seconds. Raise it on a slow or lossy connection: a tile with any failed chunk is served but never cached, so the same tiles are regenerated on every flight |
| `max_retries` | `3` | Retry attempts per failed chunk. An HTTP 404 (no imagery at that position) fails on the first attempt and is never retried |

Failed chunk downloads are retried with exponential backoff: immediately, then after 100 ms, 200 ms and 400 ms. The base delay is a constant, not a setting.

{{< code lang="ini" copy="true" >}}
[executor]
request_timeout_secs = 10
max_retries = 3
{{< /code >}}

{{< callout type="info" >}}
**Resource pool capacities are not configurable.** The network, CPU and disk I/O pool sizes are derived from your host's logical core count using multipliers tuned by flight testing.
{{< /callout >}}

### FUSE Kernel Parameters (Linux)

Controls Linux FUSE kernel limits for concurrent background requests. The kernel's default limits (12 max background / 9 congestion threshold) are far too low for X-Plane's concurrent scenery reads. These settings have no effect on macOS, where macFUSE serves generated textures through the kernel page cache instead.

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

Controls where `xearthlayer run` writes its log.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `file` | `~/.local/state/xearthlayer/xearthlayer.log` (`~/Library/Logs/XEarthLayer/xearthlayer.log` on macOS) | The log `xearthlayer run` writes. Emptied at every start, so copy a flight's log aside before the next run if you may need it. Supports `~` expansion |

{{< code lang="ini" copy="true" >}}
[logging]
file = ~/.local/state/xearthlayer/xearthlayer.log
{{< /code >}}

Only `xearthlayer run` writes this file. The package manager and the `packages` commands write their own log, `xearthlayer-packages.log`, beside it, appended to with a "Session started" line per command. Every other command writes no log.

### Package Manager

Controls where regional scenery packages are downloaded, installed and linked. Most users never need to change these — the setup wizard writes them.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `library_url` | `https://xearthlayer.app/packages/v2/xearthlayer_package_library.txt` | URL of the package library index. Override only if you are using a custom package source. A file still naming the pre-0.5.0 library is rewritten to v2 on first start |
| `install_location` | `~/.local/share/xearthlayer/packages` | Where installed packages are stored (`~/Library/Application Support/XEarthLayer/packages` on macOS) |
| `custom_scenery_path` | (auto-detect) | X-Plane Custom Scenery directory used for overlay symlinks. Falls back to `xplane.scenery_dir` |
| `auto_install_overlays` | `false` | Automatically install the matching overlay package when installing an ortho package |
| `disable_overlays` | `false` | Suppress every XEarthLayer overlay at runtime (see below) |
| `xworld_pro` | `false` | Give SimHeaven X-World Pro priority: leave XEarthLayer overlays out on the continents it covers. See [X-World Pro](../x-world-pro/) |
| `temp_dir` | `~/.cache/xearthlayer/tmp` | Temporary directory for package downloads (`~/Library/Caches/XEarthLayer/tmp` on macOS). Needs room for about one download at a time. The default avoids the system temp directory, which is often RAM-backed on Linux |
| `concurrent_downloads` | `5` | Number of concurrent part downloads (1–10) |

`disable_overlays` is a runtime control, not an install-time one. When set to `true`, `xearthlayer run` removes the consolidated `yzXEL_overlay/` folder from Custom Scenery on startup so X-Plane does not load XEarthLayer overlays. The overlay packages stay on disk, and setting it back to `false` reinstates them with no re-download. It is worldwide. If the conflict is SimHeaven X-World Pro, use `xworld_pro` instead: it turns overlays off only on the continents X-World Pro covers and leaves them on everywhere else.

{{< code lang="ini" copy="true" >}}
[packages]
install_location = ~/.local/share/xearthlayer/packages
auto_install_overlays = true
disable_overlays = false
xworld_pro = false
{{< /code >}}

### Night Lighting

Controls the lit textures XEarthLayer generates for cities at night. See [Night Lighting](../night-lighting/) for how it works.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `enabled` | `true` | Serve generated lit textures. `false` serves a minimal dark texture instead and reserves no disk cache |
| `brightness` | `1.0` | Overall brightness of the lit ground, 0.5 to 1.5 |

Lit textures are built on your machine from the lit art in the X-Plane installation behind your Custom Scenery path. No package carries that art. If the installation cannot be found, lit textures stay dark whatever `enabled` says, and the dashboard's Status pane says so.

While `enabled` is `true`, 5% of `cache.disk_size` is reserved for generated lit textures, whether or not any installed package carries night lighting recipes. A brightness change, an X-Plane update or a package update regenerates the affected textures without a cache clear.

{{< code lang="ini" copy="true" >}}
[night]
enabled = true
brightness = 1.0
{{< /code >}}

### Terminal Dashboard

| Parameter | Default | Description |
|-----------|---------|-------------|
| `symbols` | `auto` | Symbols on the dashboard's Status pane: `auto`, `emoji` or `plain` |

The Status pane leads each feature line with an emoji. A terminal without a colour emoji font draws empty boxes instead, so `plain` substitutes check, cross and warning marks. `auto` picks emoji only when the terminal type, locale, SSH status and font all say they will draw, and logs its choice at startup. Over SSH the fonts that matter are on the machine you type at, which XEarthLayer cannot see, so set `emoji` there if your terminal draws them.

{{< code lang="ini" copy="true" >}}
[tui]
symbols = auto
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

## Obsolete Settings

Configuration files written by older versions may contain settings that XEarthLayer no longer uses. They are ignored rather than rejected, so an old file still loads, but they describe nothing the software does.

| Setting | Replacement |
|---------|-------------|
| `prefetch.mode` | `prefetch.enabled`. `mode = disabled` is read as `enabled = false`; other values are ignored |
| `prefetch.calibration_aggressive_threshold` | None. Automatic mode selection was removed in 0.5.0; it never ran |
| `prefetch.calibration_opportunistic_threshold` | None. As above |
| `prefetch.calibration_sample_duration` | None. As above |
| `executor.max_concurrent_jobs` | None. It named no limit; job admission is bounded by the resource pools |
| `executor.retry_base_delay_ms` | None. The backoff base is a constant |
| `cache.disk_io_profile` | None. Disk I/O concurrency is not derived from a storage profile |
| `executor.network_concurrent` | None. Pool capacities are derived from your logical core count |
| `executor.cpu_concurrent` | None. As above |
| `executor.disk_io_concurrent` | None. As above |
| `download.timeout` | `executor.request_timeout_secs` |
| `control_plane.max_concurrent_jobs` | None |
| `control_plane.stall_threshold_secs` | None. Stall detection is not configurable |
| `control_plane.health_check_interval_secs` | None. As above |

To remove them:

{{< code lang="bash" copy="true" >}}
xearthlayer config upgrade --dry-run   # Preview
xearthlayer config upgrade             # Apply
{{< /code >}}

A timestamped backup of your existing file is written before anything is changed.

The first start after upgrading reports how many obsolete settings the file still holds, and `xearthlayer config upgrade` can rewrite a retired value as well as remove a retired key.
