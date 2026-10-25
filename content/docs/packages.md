---
title: "Package Management"
description: "Install, update, and manage regional scenery packages."
weight: 40
---

XEarthLayer streams satellite imagery onto terrain supplied by regional scenery packages. A package carries the terrain mesh, the terrain definitions that tell XEarthLayer which imagery to fetch, and, since 0.5.0, the night lighting recipes for its tiles. It carries no imagery of its own, which is why a whole continent fits in a few gigabytes.

Every region comes as an **ortho** package (the terrain) and an **overlay** package (roads, buildings, forests). Install the ortho package at least. With `packages.auto_install_overlays` on, the overlay comes along automatically.

## Available Regions

![Coverage Map](/images/coverage.png)

{{< regions-legend >}}

Sizes are the ortho and overlay packages together. "Download" is what crosses the network; "Installed" is what the package occupies afterwards.

{{< regions-table >}}

Installing a package needs free space for the installed result plus one download's worth of temporary space, because the download sits on disk while it is extracted. The temporary folder defaults to `~/.cache/xearthlayer/tmp` (`~/Library/Caches/XEarthLayer/tmp` on macOS) and can be moved with `packages.temp_dir`.

## The Package Manager

Run `xearthlayer packages` with no subcommand to open the package manager, a full-screen view with four tabs: **Local** (what is installed), **Library** (what is available), **Progress** (the jobs of this session) and **Settings** (the `[packages]` section of your configuration). Mark rows with Space, then press `i` to install, `u` to update or `d` to delete. Press `?` for every key.

{{< code lang="bash" copy="true" >}}
xearthlayer packages
{{< /code >}}

The setup wizard offers to open it when it finishes, so a fresh install can go straight from setup to choosing scenery.

## Installing from the Command Line

Region codes are hierarchical, continent first, so the start of a code selects every package beneath it. Matching ignores case. When a code selects more than one package, the matches are listed and confirmed before anything downloads.

| You type | Selects |
|----------|---------|
| `NA` | every North America package |
| `NA-CANADA` | `NA-CANADA-WEST` and `NA-CANADA-EAST` |
| `AF-SOUTH` | exactly `AF-SOUTH` |

{{< code lang="bash" copy="true" >}}
xearthlayer packages install EU-WEST
{{< /code >}}

{{< code lang="bash" copy="true" >}}
xearthlayer packages install NA-CANADA AF
{{< /code >}}

{{< code lang="bash" copy="true" >}}
xearthlayer packages install --all
{{< /code >}}

See the [CLI Reference](/docs/cli-reference/#package-management) for every package command and option.

## Upgrading from the Continental Packages

XEarthLayer 0.5.0 ships a rebuilt world. The eleven continental packages of earlier releases (`AF1`, `AF2`, `AS1` to `AS4`, `EU`, `EU2`, `NA`, `OC`, `SA`) are replaced by the seventeen regions above, each about a third smaller on disk and each carrying night lighting. The old packages are not in the 0.5.0 library and receive no further updates.

**Remove the old packages first, then install the new regions.** Both generations can sit on disk at once, but a short code such as `EU` is also the start of `EU-WEST` and `EU-EAST`, so while both are installed the old package cannot be addressed on its own. Removing first avoids that.

{{< code lang="bash" copy="true" >}}
xearthlayer packages remove --all
xearthlayer packages remove --all --type overlay
xearthlayer packages install --all
{{< /code >}}

Or open the package manager, mark everything on the Local tab with `a`, press `d`, then choose your regions from the Library tab.

{{< regions-upgrade >}}

Greenland moved continent in the rebuild: anyone who flew it from the old `EU` package will find it under `NA-GREENLAND`.

Releases before 0.5.0 keep reading the old library and cannot install the new regions. Upgrade XEarthLayer first.
