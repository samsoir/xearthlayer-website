---
title: "Getting Started"
description: "Install XEarthLayer and start flying with photoreal scenery in X-Plane 12."
weight: 20
---

This guide will help you install XEarthLayer and get flying with photoreal scenery in minutes.

## Prerequisites

- **X-Plane 12** installed on your system, and **12.4.0 or later** for adaptive prefetching (see below)
- **Linux** (amd64) with FUSE support, on Debian/Ubuntu, Fedora/RHEL or Arch Linux
- **glibc 2.34 or newer** for the prebuilt packages, which covers Ubuntu 22.04 LTS, Debian 12 and RHEL 9 onwards. Check with `ldd --version`. On anything older, build from source
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

X-Plane has shipped the Web API since 12.1.1, but it is versioned, and XEarthLayer uses **v3**, which X-Plane added in **12.4.0**. On an earlier sim the connection is never established and XEarthLayer falls back to inferring your position from file access patterns. It still works, but prefetching is far less effective, so 12.4.0 is the version to be on. The same fallback applies whenever X-Plane simply is not running yet.
{{< /callout >}}

## Installation

Install the package for your distribution. Building from source is only
necessary on a distribution older than the glibc requirement above, or if you
want to run unreleased code.

{{< tabs >}}
<!--tab:Debian/Ubuntu-->
{{< code lang="bash" copy="true" >}}
wget {{< download-url "deb" >}} && sudo dpkg -i {{< download-file "deb" >}}
{{< /code >}}
<!--tab:Fedora/RHEL-->
{{< code lang="bash" copy="true" >}}
wget {{< download-url "rpm" >}} && sudo rpm -i {{< download-file "rpm" >}}
{{< /code >}}
<!--tab:Arch Linux-->
{{< code lang="bash" copy="true" >}}
curl -sL {{< download-url "aur" >}} | bsdtar -xf- -C /tmp && cd /tmp && makepkg -si
{{< /code >}}
<!--tab:Build from Source-->
Building needs **Rust 1.97.1 or newer** and the FUSE 3 development headers.

**1. Install Rust.** Use [rustup](https://rustup.rs) rather than your
distribution's package manager. Several dependencies require a recent
compiler, and most distributions ship one too old to build XEarthLayer at all.
rustup also reads the repository's toolchain file and selects the right
version for you.

{{< code lang="bash" copy="true" >}}
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
{{< /code >}}

Open a new shell once it finishes, so that `cargo` is on your `PATH`.

**2. Install the FUSE 3 headers.** The package is `libfuse3-dev` on Debian and
Ubuntu, or `fuse3-devel` on Fedora and RHEL.

{{< code lang="bash" copy="true" >}}
sudo apt install libfuse3-dev
{{< /code >}}

**3. Build and install** to `~/.local/bin`. No sudo required.

{{< code lang="bash" copy="true" >}}
git clone https://github.com/samsoir/xearthlayer.git && cd xearthlayer && make install
{{< /code >}}

If the build stops with `rustc <version> is not supported by the following
packages`, your Rust is too old. Install rustup as above, then open a new
shell so it takes precedence over the system compiler.
{{< /tabs >}}

## Upgrading from an earlier release

If this is a fresh install, skip ahead to [Initial Setup](#initial-setup).

Run `xearthlayer config upgrade` after upgrading. It removes settings that are no longer used, and writes a timestamped backup of your existing file first. Use `--dry-run` to preview the changes.

Your first flight after upgrading may re-download more scenery than usual while the tile cache refills, and you may see magenta placeholder tiles more readily than before. Both are expected, and both are explained in the [0.4.7 release notes](/news/xearthlayer-0-4-7-released/). There is no need to run `xearthlayer cache clear`.

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
