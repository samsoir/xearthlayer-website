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
xearthlayer run --provider bing --no-prefetch
xearthlayer run --airport KJFK
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--provider <TYPE>` | Imagery provider: `apple`, `arcgis`, `bing`, `go2`, `google`, `mapbox`, `usgs` |
| `--google-api-key <KEY>` | Google Maps API key (required when provider is `google`) |
| `--mapbox-token <TOKEN>` | MapBox access token (required when provider is `mapbox`) |
| `--dds-format <FORMAT>` | DDS compression format: `bc1` or `bc3` |
| `--timeout <SECS>` | Per-chunk download timeout in seconds (overrides `executor.request_timeout_secs`) |
| `--no-cache` | Disable the disk and memory cache |
| `--debug` | Enable debug logging |
| `--profile` | Enable Chrome Trace profiling output |
| `--no-prefetch` | Disable adaptive predictive prefetching |
| `--airport <ICAO>` | ICAO airport code for cold-start pre-warming (e.g., `LFBO`, `KJFK`) |

{{< callout type="tip" >}}
CLI flags override values from `config.ini`. For example, `--provider google --google-api-key <KEY>` overrides whatever provider is set in the config file.
{{< /callout >}}

To stop the service, press **`q`** in the terminal for a clean shutdown (unmounts FUSE, flushes caches). `Ctrl+C`, SIGTERM and SIGHUP shut down the same way, and the exit status names the signal (130, 143 and 129). Stop X-Plane first: it reads scenery from the mount.

Only `run` writes `xearthlayer.log`, in `~/.local/state/xearthlayer/` (`~/Library/Logs/XEarthLayer/` on macOS). `--debug` and `--profile` apply to `run` and the `packages` commands; every other command writes no log.

## Setup & Configuration

### `xearthlayer init`

Create a default configuration file in the configuration directory, `~/.config/xearthlayer/config.ini` (`~/Library/Application Support/XEarthLayer/config.ini` on macOS). Auto-detects your X-Plane installation. `xearthlayer config path` prints the path in use.

{{< code lang="bash" copy="true" >}}
xearthlayer init
{{< /code >}}

### `xearthlayer setup`

Interactive setup wizard, recommended for first-time users. Six steps: X-Plane Custom Scenery, package location, imagery provider (a key or token is asked for only with Google Maps or Mapbox), cache location and sizes, DDS encoding (GPU selection only when two GPUs are found), and third-party scenery (detects SimHeaven X-World Pro and asks whether to give it priority). It offers to open the package manager when it finishes.

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

{{< callout type="info" >}}
Run this after upgrading. It removes settings XEarthLayer no longer uses and writes a timestamped backup of your existing file first. A configuration containing obsolete keys loads normally, so this is tidying rather than a requirement. See [Obsolete Settings](../configuration/#obsolete-settings).
{{< /callout >}}

### `xearthlayer migrate`

Review where XEarthLayer keeps its files, and move configuration between layouts. The layout migration runs by itself on the first start after upgrading to 0.5.0; run it here to revisit the choices, which is also what happens when the automatic run had no terminal to ask in.

{{< code lang="bash" copy="true" >}}
xearthlayer migrate            # Review and change locations
xearthlayer migrate --dry-run  # Show what would change, change nothing
xearthlayer migrate status     # What has run, what is pending
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--dry-run` | Show what would change without changing anything |
| `status` | List migrations that have run and those pending, and where each resource resolves |

Only `config.ini` is relocated, by copying. Nothing else is moved: anything at an old location with data in it has that path written into the new configuration. See [Where XEarthLayer Keeps Its Files](../directory-layout/).

## Package Management

### `xearthlayer packages`

With no subcommand, in a terminal, opens the package manager: a full-screen view of the library, your installed packages and the jobs of this session, with a Settings tab for the `[packages]` section of your configuration.

{{< code lang="bash" copy="true" >}}
xearthlayer packages
{{< /code >}}

| Keys | Where | Action |
|------|-------|--------|
| `1` `2` `3` `4`, Tab, Shift+Tab | everywhere | Switch between Local, Library, Progress and Settings |
| Space | Local, Library | Mark or unmark the selected row |
| `a` | Local, Library | Mark every row shown, or clear the marks |
| `i` | Library | Install the marked rows (or the selected one) |
| `u` | Local | Update |
| `d` | Local | Delete |
| `t` | Library | Cycle the type filter: all, ortho, overlay |
| `c` / `C` | Progress | Cancel the selected job / every unfinished job |
| Enter | Settings | Edit the selected setting; Enter again saves, Esc cancels |
| `r` | everywhere | Refresh |
| `?` | everywhere | Help |
| `q`, Esc, Ctrl+C | everywhere | Quit (cancels running jobs first) |

Installs and deletes ask for confirmation. With `packages.auto_install_overlays` on, an ortho install brings its overlay. Without a terminal, `xearthlayer packages` prints the command help instead.

### Selecting packages by region code

Region codes are hierarchical, continent first. `install`, `update`, `remove` and `info` accept the start of a code and act on every package it selects, ignoring case. When a code selects several packages, the matches are listed and confirmed before anything downloads. A code that selects nothing lists the codes that would have worked.

| You type | Selects |
|----------|---------|
| `NA` | every North America package |
| `NA-CANADA` | `NA-CANADA-WEST` and `NA-CANADA-EAST` |
| `AS-RUSSIA` | `AS-RUSSIA-CENTRAL` and `AS-RUSSIA-EAST` |
| `AF-SOUTH` | exactly `AF-SOUTH` |

`install` and `remove` take several codes at once, or `--all` for every package of the chosen type. See the [Package Management](../packages/) page for the full list of codes.

### `xearthlayer packages list`

List installed packages with their versions and sizes. Sizes are recorded at install time, so this is fast even with the whole world installed.

{{< code lang="bash" copy="true" >}}
xearthlayer packages list
xearthlayer packages list --verbose
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--verbose`, `-v` | Show the install path of each package |
| `--install-dir <PATH>` | Override the installation directory |

### `xearthlayer packages check`

Compare installed packages with the library and report what is new or has an update.

{{< code lang="bash" copy="true" >}}
xearthlayer packages check
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--library-url <URL>` | Override the package library URL |
| `--install-dir <PATH>` | Override the installation directory |

### `xearthlayer packages install <REGION>...`

Install one or more regional scenery packages. Downloads run ahead of installs, so a batch takes about as long as its downloads.

{{< code lang="bash" copy="true" >}}
xearthlayer packages install EU-WEST
xearthlayer packages install NA-CANADA AF
xearthlayer packages install --all
xearthlayer packages install SA --type overlay
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--all` | Install every package of the type in the library |
| `--type <TYPE>` | Package type: `ortho` (default) or `overlay` |
| `--library-url <URL>` | Override the package library URL |
| `--install-dir <PATH>` | Override the installation directory |
| `--temp-dir <PATH>` | Override the temporary download directory |

While `xearthlayer run` is active, a package that is already installed is refused (installing over it is an update); new packages install and are used from the next start.

### `xearthlayer packages update [REGION]`

Update installed packages. With no region, every installed package is checked.

{{< code lang="bash" copy="true" >}}
xearthlayer packages update EU
xearthlayer packages update --all
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--all` | Update all packages without prompting |
| `--type <TYPE>` | Filter by package type: `ortho` or `overlay` |
| `--library-url <URL>` | Override the package library URL |
| `--install-dir <PATH>` | Override the installation directory |
| `--temp-dir <PATH>` | Override the temporary download directory |

Refused while `xearthlayer run` is active.

### `xearthlayer packages remove <REGION>...`

Remove installed packages. The whole selection is validated before anything is deleted, and one confirmation covers the set.

{{< code lang="bash" copy="true" >}}
xearthlayer packages remove EU-EAST
xearthlayer packages remove NA --type overlay --force
xearthlayer packages remove --all
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--all` | Remove every installed package of the type |
| `--type <TYPE>` | Package type: `ortho` (default) or `overlay` |
| `--force`, `-f` | Skip the confirmation prompt (validation still runs) |
| `--install-dir <PATH>` | Override the installation directory |

Refused while `xearthlayer run` is active. A full code is also the start of every longer one, so while both `EU` and `EU-WEST` are installed, `EU` selects both.

### `xearthlayer packages info <REGION>`

Show detailed information about an installed package.

{{< code lang="bash" copy="true" >}}
xearthlayer packages info AS-CHINA-MONGOLIA
{{< /code >}}

| Flag | Description |
|------|-------------|
| `--type <TYPE>` | Package type: `ortho` (default) or `overlay` |
| `--install-dir <PATH>` | Override the installation directory |

{{< callout type="info" >}}
Package commands write their own log, `xearthlayer-packages.log`, beside `xearthlayer.log`, so a failed install's diagnostics survive the next flight.
{{< /callout >}}

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

The report ends with a completeness line comparing the number of indexed tiles against the number of `.ter` files found across your installed packages:

{{< code lang="text" copy="false" >}}
  Indexed:   184320 of 184320 .ter files (100.0%)
{{< /code >}}

If fewer tiles were indexed than there are `.ter` files, a warning follows:

{{< code lang="text" copy="false" >}}
  Indexed:   184102 of 184320 .ter files (99.9%)
  WARNING:   218 .ter files did not produce a tile
{{< /code >}}

A shortfall means those `.ter` files could not be parsed, so their tiles are absent from the index. Prefetch cannot see tiles it has no index entry for, and will not fetch them ahead of the aircraft — they are still generated on demand when X-Plane asks for them. Rebuild with `scenery-index update` to see which packages the failures came from; if the count persists, the package files themselves are likely damaged and worth reinstalling.

### `xearthlayer scenery-index update`

Rebuild the scenery index from installed packages. Useful after manually adding or removing package files.

{{< code lang="bash" copy="true" >}}
xearthlayer scenery-index update
{{< /code >}}

Each package reports its tile count as it is indexed. Packages containing `.ter` files that failed to parse report the failure count alongside the tiles that succeeded, so a problem package can be identified by name:

{{< code lang="text" copy="false" >}}
  Indexing EU-WEST... 42196 tiles
  Indexing NA-USA-BERMUDA-BAHAMAS... 61840 tiles (218 .ter files failed to parse)
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

Output system diagnostics for bug reports: the platform and its version, CPU, memory, the GPU adapters XEarthLayer can use (Vulkan, Metal and DX12 only), where each of its directories resolves, the configuration in use, and the cache size.

{{< code lang="bash" copy="true" >}}
xearthlayer diagnostics
{{< /code >}}

The report includes the size of your cache directory. That measurement is bounded at five seconds: on a very large cache it stops and reports the size as unmeasured rather than delaying the rest of the report.

{{< callout type="tip" >}}
When filing a bug report, include the output of `xearthlayer diagnostics` to help with troubleshooting.
{{< /callout >}}
