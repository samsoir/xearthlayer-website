---
title: "Configuration"
description: "Configure imagery providers, caching behavior, and performance settings."
weight: 20
---

XEarthLayer is configured through an INI file located at `~/.xearthlayer/config.ini`. This page covers all available settings.

## Configuration File

Run `xearthlayer init` to create the default configuration file. You can view and modify settings using the CLI:

```bash
# Show config file path
xearthlayer config path

# List all settings
xearthlayer config list

# Get a specific setting
xearthlayer config get provider.name

# Set a setting
xearthlayer config set provider.name bing
```

## Imagery Providers

XEarthLayer supports multiple satellite imagery providers:

| Provider | Config Name | API Key Required | Notes |
|----------|-------------|------------------|-------|
| Bing Maps | `bing` | No | Recommended, good global coverage |
| Google GO2 | `go2` | No | Free, no API key needed |
| Apple Maps | `apple` | No | High quality, auto-acquires tokens |
| ArcGIS | `arcgis` | No | Free tier available |
| MapBox | `mapbox` | Yes (freemium) | Good quality, free tier |
| USGS | `usgs` | No | US only, government imagery |

```ini
[provider]
name = apple
```

## Cache Settings

Control memory and disk cache behavior:

```ini
[cache]
# Memory cache size (in bytes, default 2 GB)
# Depending on system, recommend 15+ GB if 32 GB of system memory is available
memory_size = 15 GB

# Disk cache size (in bytes, default 20 GB)
# Having disk cache greater than 20 GB will reduce amount of repeat network requests
disk_size = 20 GB

# Disk cache directory
# Recommend using a drive separate from your main system, cache writes are high
directory = ~/.xearthlayer/cache

# Disk I/O profile: auto, hdd, ssd, nvme
disk_io_profile = auto
```

## Performance Tuning

For systems with different hardware profiles:

| Disk type | Config Name | Description |
|----------|-------------|------------------|
| Automatic detection | `auto` | On linux, uses device queue to detect whether to use `hdd` or `ssd` |
| Hard Disk Drive | `hdd` | Use for spinning platter hard disk drives |
| Solid State Drive | `ssd` | Use for SATA connected solid state drives |
| Non-Volatile Memory Express | `nvme` | Use for PCIe attached NVMe SSD storage. Only use if you are confident in your decision as performance will be impacted if drive cannot keep up with the requests |

```ini
[cache]
# Unless you know what you are doing, leave this as auto
disk_io_profile = auto
```

**Auto-detection (Linux):** When set to `auto`, XEarthLayer detects the storage type by checking `/sys/block/<device>/queue/` rotational. If detection fails, it defaults to the ssd profile as a safe middle-ground

## Texture Settings

DDS texture compression setting. Unless you know what you are doing, do not change this to bc3.

```ini
[texture]
# Compression format: bc1 (smaller, no alpha)
format = bc1
```
