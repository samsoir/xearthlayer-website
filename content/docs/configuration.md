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
name = bing
```

## Cache Settings

Control memory and disk cache behavior:

```ini
[cache]
# Memory cache size (in bytes, default 2GB)
memory_size = 2147483648

# Disk cache size (in bytes, default 20GB)
disk_size = 21474836480

# Disk cache directory
directory = ~/.xearthlayer/cache

# Disk I/O profile: auto, hdd, ssd, nvme
disk_io_profile = auto
```

## Texture Settings

Configure DDS texture compression:

```ini
[texture]
# Compression format: bc1 (smaller, no alpha) or bc3 (larger, with alpha)
format = bc1
```

## Performance Tuning

For systems with different hardware profiles:

- **HDD**: Use `disk_io_profile = hdd` for conservative I/O
- **SSD**: Default `auto` detection usually works well
- **NVMe**: Use `disk_io_profile = nvme` for aggressive concurrency
- **Low RAM**: Reduce `memory_size` to 1GB or less
