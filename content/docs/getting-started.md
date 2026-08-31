---
title: "Getting Started"
description: "Install XEarthLayer and start flying with photoreal scenery in X-Plane 12."
weight: 20
---

This guide will help you install XEarthLayer and get flying with photoreal scenery in minutes.

## Prerequisites

- **X-Plane 12** installed on your system, and **12.4.0 or later** for adaptive prefetching (see below)
- **Linux** (amd64) with FUSE support — Debian/Ubuntu, Fedora/RHEL, or Arch Linux
- An **8 core CPU** and **8GB of system memory** (12 cores and 32GB recommended)
- A **GPU with 4GB of video memory**
- **100GB of free disk space** for the tile cache and scenery packages
- A **100Mbit internet connection** for streaming imagery

These are the minimum figures. See [System Requirements](/#requirements) for the recommended and ultimate tiers.

{{< callout type="warning" >}}
XEarthLayer and X-Plane compete for the same system memory, and X-Plane alone wants around 15GB while it loads a scene. On an 8GB machine you will need swap space and a small memory cache. If you are choosing hardware rather than working with what you have, treat 32GB as the real target.
{{< /callout >}}

{{< callout type="info" >}}
XEarthLayer reads aircraft position, heading and speed from X-Plane's built-in Web API, which powers adaptive prefetching so tiles are ready before you need them. No plugin or manual setup is required.

X-Plane has shipped the Web API since 12.1.1, but it is versioned, and XEarthLayer uses **v3** — which X-Plane added in **12.4.0**. On an earlier sim the connection is never established and XEarthLayer falls back to inferring your position from file access patterns. It still works, but prefetching is far less effective, so 12.4.0 is the version to be on. The same fallback applies whenever X-Plane simply is not running yet.
{{< /callout >}}

## Installation

{{< tabs >}}
<!--tab:Build from Source-->
{{< code lang="bash" copy="true" >}}
git clone https://github.com/samsoir/xearthlayer.git && cd xearthlayer && make install
{{< /code >}}
<!--tab:Fedora/RHEL-->
{{< code lang="bash" copy="true" >}}
wget {{< download-url "rpm" >}} && sudo rpm -i {{< download-file "rpm" >}}
{{< /code >}}
<!--tab:Debian/Ubuntu-->
{{< code lang="bash" copy="true" >}}
wget {{< download-url "deb" >}} && sudo dpkg -i {{< download-file "deb" >}}
{{< /code >}}
<!--tab:Arch Linux-->
{{< code lang="bash" copy="true" >}}
curl -sL {{< download-url "aur" >}} | bsdtar -xf- -C /tmp && cd /tmp && makepkg -si
{{< /code >}}
{{< /tabs >}}

## Upgrading from 0.4.6

If this is a fresh install, skip ahead to [Initial Setup](#initial-setup). If you are coming from 0.4.6, there are three things to know.

### Run the config upgrade

{{< code lang="bash" copy="true" >}}
xearthlayer config upgrade
{{< /code >}}

0.4.7 removes four settings that were parsed, validated and echoed back by `config list` but never reached the runtime: `cache.disk_io_profile` ([#227](https://github.com/samsoir/xearthlayer/issues/227)), and `executor.network_concurrent`, `executor.cpu_concurrent` and `executor.disk_io_concurrent` ([#249](https://github.com/samsoir/xearthlayer/issues/249)). Pool capacities have always been sized from your CPU count by a separate, flight-tuned policy, so no value you had written for these described anything the software did.

A configuration file that still contains them loads normally, so this is not urgent — but the upgrade strips them, and writes a timestamped backup of your existing file first. Use `--dry-run` to preview.

### Expect one slower flight

0.4.7 emits complete DDS mipmap chains ([#212](https://github.com/samsoir/xearthlayer/issues/212)), which fixes terrain banding at distance but makes every tile written by 0.4.6 the wrong size. Those tiles are now detected and replaced the first time they are used ([#253](https://github.com/samsoir/xearthlayer/issues/253)), so your first flight after upgrading will re-download more than usual while the cache refills. This is a one-off, and it repairs itself as you fly.

{{< callout type="warning" >}}
You do **not** need to run `xearthlayer cache clear`. That was the remedy for the unrelated magenta-tile issue in 0.4.5. Here it only throws away the chunk cache as well, making the refill considerably larger for no benefit — 0.4.7 replaces the stale tiles on its own.
{{< /callout >}}

### Two settings now do what they say

Both were reported correctly but silently overridden before 0.4.7 ([#248](https://github.com/samsoir/xearthlayer/issues/248)):

- **`generation.timeout`** now bounds a blocking FUSE read. The effective ceiling drops from 30 seconds to the documented default of 10 before a magenta placeholder is returned. On a marginal system you may see more placeholders than you did on 0.4.6 — raise this value if so.
- **`cache.dds_disk_ratio`** now sizes the DDS and chunk disk budgets, which had always split 60/40 regardless of what you set. If you configured a non-default ratio, your disk cache will re-divide accordingly.

See [Configuration](../configuration/) for both settings in full.

## Initial Setup

1. **Run the setup wizard** (recommended for first-time users):

   {{< code lang="bash" copy="true" >}}
xearthlayer setup
{{< /code >}}

   The wizard will guide you through:
   - Detecting your X-Plane 12 installation
   - Choosing package and cache locations
   - Configuring optimal settings for your hardware

2. **Install a regional scenery package**:

   List available regional scenery packages:

   {{< code lang="bash" copy="true" >}}
xearthlayer packages check
{{< /code >}}

   Install a package (e.g., Europe):

   {{< code lang="bash" copy="true" >}}
xearthlayer packages install EU
{{< /code >}}

   Or North America:

   {{< code lang="bash" copy="true" >}}
xearthlayer packages install NA
{{< /code >}}

3. **Start XEarthLayer**:

   {{< code lang="bash" copy="true" >}}
xearthlayer
{{< /code >}}

   This defaults to the `run` command. You can also use `xearthlayer run` explicitly. Leave this terminal running while you fly in X-Plane.

4. **Launch X-Plane** and fly! You should see satellite imagery streaming in as you move around.

## Stopping the Service

When you are done flying, close X-Plane first. Then stop XEarthLayer cleanly by pressing the **`q`** key in the terminal and following the prompt to confirm.

{{< callout type="warning" >}}
Always stop XEarthLayer cleanly before shutting down. Terminating the process while X-Plane is still running will cause X-Plane to crash to desktop.
{{< /callout >}}

## Verifying It Works

When XEarthLayer is running, you'll see a real-time dashboard showing:

- **Cache statistics** (memory and disk usage)
- **Download activity** (tiles being fetched)
- **Aircraft position** (when connected to X-Plane via the Web API)
- **Pipeline health** (download, assembly, encode stages)

If you see tiles being downloaded and cache hits increasing, XEarthLayer is working correctly.

## Next Steps

- [Configure X-Plane 12 for optimal performance](../x-plane-configuration/)
- [Configure providers and caching](../configuration/)
- [Install more regional packages](../packages/)
- [Learn how XEarthLayer works](../how-it-works/)
