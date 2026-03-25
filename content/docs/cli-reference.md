---
title: "CLI Reference"
description: "Complete command reference for the XEarthLayer command-line interface."
weight: 35
---

Complete reference for every `xearthlayer` command, grouped by purpose.

Run `xearthlayer --help` or `xearthlayer <command> --help` for built-in usage information.

## Service Management

### `xearthlayer` / `xearthlayer run`

Start XEarthLayer and mount all installed packages. This is the **default command** — running `xearthlayer` with no arguments is equivalent to `xearthlayer run`.

{{< code lang="bash" copy="true" >}}
xearthlayer
xearthlayer run --provider bing --parallel 32
xearthlayer run --airport KJFK
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--provider <TYPE>` | Imagery provider: `apple`, `arcgis`, `bing`, `go2`, `google`, `mapbox`, `usgs` |
| `--google-api-key <KEY>` | Google Maps API key (required when provider is `google`) |
| `--mapbox-token <TOKEN>` | MapBox access token (required when provider is `mapbox`) |
| `--dds-format <FORMAT>` | DDS compression format: `bc1` or `bc3` |
| `--timeout <SECS>` | Download timeout in seconds |
| `--parallel <NUM>` | Maximum parallel downloads (default: 32) |
| `--no-cache` | Disable the disk and memory cache |
| `--debug` | Enable debug logging |
| `--profile` | Enable Chrome Trace profiling output |
| `--no-prefetch` | Disable adaptive predictive prefetching |
| `--airport <ICAO>` | ICAO airport code for cold-start pre-warming (e.g., `LFBO`, `KJFK`) |

{{< callout type="tip" >}}
CLI flags override values from `config.ini`. For example, `--provider google --google-api-key <KEY>` overrides whatever provider is set in the config file.
{{< /callout >}}

To stop the service, press **`q`** in the terminal for a clean shutdown (unmounts FUSE, flushes cache). `Ctrl+C` also works.

## Setup & Configuration

### `xearthlayer init`

Create a default configuration file. Auto-detects your X-Plane installation and writes `config.ini`.

{{< code lang="bash" copy="true" >}}
xearthlayer init
{{< /code >}}

### `xearthlayer setup`

Interactive setup wizard. Detects your X-Plane installation, checks hardware, and recommends settings. Recommended for first-time users.

{{< code lang="bash" copy="true" >}}
xearthlayer setup
{{< /code >}}

### `xearthlayer config get <KEY>`

Read a single configuration value. Keys use `section.key` format.

{{< code lang="bash" copy="true" >}}
xearthlayer config get provider.provider_type
xearthlayer config get cache.disk_size
{{< /code >}}

### `xearthlayer config set <KEY> <VALUE>`

Write a configuration value.

{{< code lang="bash" copy="true" >}}
xearthlayer config set provider.provider_type bing
xearthlayer config set cache.disk_size 10737418240
{{< /code >}}

### `xearthlayer config list`

Display all configuration settings grouped by section.

{{< code lang="bash" copy="true" >}}
xearthlayer config list
{{< /code >}}

### `xearthlayer config path`

Print the full path to the configuration file.

{{< code lang="bash" copy="true" >}}
xearthlayer config path
{{< /code >}}

### `xearthlayer config upgrade`

Upgrade your configuration file to the current version. Adds missing settings with defaults and removes deprecated entries. A timestamped backup is created automatically.

{{< code lang="bash" copy="true" >}}
xearthlayer config upgrade --dry-run   # Preview changes without modifying
xearthlayer config upgrade             # Apply the upgrade
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--dry-run` | Show what would change without modifying the file |

## Package Management

### `xearthlayer packages list`

List all installed packages.

{{< code lang="bash" copy="true" >}}
xearthlayer packages list
xearthlayer packages list --verbose
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--verbose`, `-v` | Show detailed information |
| `--install-dir <PATH>` | Override the installation directory |

### `xearthlayer packages check`

Check the package library for available updates.

{{< code lang="bash" copy="true" >}}
xearthlayer packages check
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--library-url <URL>` | Override the package library URL |
| `--install-dir <PATH>` | Override the installation directory |

### `xearthlayer packages install <REGION>`

Install a regional scenery package. Region codes are short identifiers like `eu`, `na`, `sa`.

{{< code lang="bash" copy="true" >}}
xearthlayer packages install eu
xearthlayer packages install na --type overlay
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--type <TYPE>` | Package type: `ortho` (default) or `overlay` |
| `--library-url <URL>` | Override the package library URL |
| `--install-dir <PATH>` | Override the installation directory |
| `--temp-dir <PATH>` | Override the temporary download directory |

### `xearthlayer packages update [REGION]`

Update installed packages. If no region is specified, checks all installed packages for updates.

{{< code lang="bash" copy="true" >}}
xearthlayer packages update eu
xearthlayer packages update --all
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--all` | Update all packages without prompting |
| `--type <TYPE>` | Filter by package type: `ortho` or `overlay` |
| `--library-url <URL>` | Override the package library URL |
| `--install-dir <PATH>` | Override the installation directory |
| `--temp-dir <PATH>` | Override the temporary download directory |

### `xearthlayer packages remove <REGION>`

Remove an installed package.

{{< code lang="bash" copy="true" >}}
xearthlayer packages remove eu
xearthlayer packages remove na --type overlay --force
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--type <TYPE>` | Package type: `ortho` (default) or `overlay` |
| `--force`, `-f` | Remove without confirmation prompt |
| `--install-dir <PATH>` | Override the installation directory |

### `xearthlayer packages info <REGION>`

Show detailed information about an installed package.

{{< code lang="bash" copy="true" >}}
xearthlayer packages info eu
xearthlayer packages info na --type overlay
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--type <TYPE>` | Package type: `ortho` (default) or `overlay` |
| `--install-dir <PATH>` | Override the installation directory |

## Cache Management

### `xearthlayer cache stats`

Show disk cache location, file count, and total size.

{{< code lang="bash" copy="true" >}}
xearthlayer cache stats
{{< /code >}}

### `xearthlayer cache clear`

Delete all cached tiles from the disk cache.

{{< code lang="bash" copy="true" >}}
xearthlayer cache clear
{{< /code >}}

{{< callout type="warning" >}}
Clearing the cache means all textures will need to be re-downloaded on the next flight. This is safe but may cause longer initial load times.
{{< /callout >}}

## Scenery Index

The scenery index maps installed packages to tile coordinates, enabling adaptive prefetching. It is built automatically on startup, but you can manage it manually.

### `xearthlayer scenery-index status`

Show index cache status including version, package count, and tile counts.

{{< code lang="bash" copy="true" >}}
xearthlayer scenery-index status
{{< /code >}}

### `xearthlayer scenery-index update`

Rebuild the scenery index from installed packages. Useful after manually adding or removing package files.

{{< code lang="bash" copy="true" >}}
xearthlayer scenery-index update
{{< /code >}}

### `xearthlayer scenery-index clear`

Delete the scenery index cache file. It will be rebuilt automatically on the next `xearthlayer run`.

{{< code lang="bash" copy="true" >}}
xearthlayer scenery-index clear
{{< /code >}}

## Patches

Patches are pre-built Ortho4XP tiles with custom mesh or elevation data. XEarthLayer overlays them with dynamically generated textures at runtime.

### `xearthlayer patches list`

List installed patches with validation status, priority order, and file counts.

{{< code lang="bash" copy="true" >}}
xearthlayer patches list
{{< /code >}}

### `xearthlayer patches validate`

Validate patch directory structure and required files.

{{< code lang="bash" copy="true" >}}
xearthlayer patches validate
xearthlayer patches validate --name my-patch
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--name <PATCH_NAME>` | Validate a specific patch by name |

### `xearthlayer patches path`

Print the configured patches directory path.

{{< code lang="bash" copy="true" >}}
xearthlayer patches path
{{< /code >}}

## Diagnostics

### `xearthlayer diagnostics`

Output system diagnostics including GPU detection, system information, and configuration details. Useful for bug reports.

{{< code lang="bash" copy="true" >}}
xearthlayer diagnostics
{{< /code >}}

{{< callout type="tip" >}}
When filing a bug report, include the output of `xearthlayer diagnostics` to help with troubleshooting.
{{< /callout >}}
