---
title: "Getting Started"
description: "Install XEarthLayer and start flying with photoreal scenery in X-Plane 12."
weight: 20
---

This guide will help you install XEarthLayer and get flying with photoreal scenery in minutes.

## Prerequisites

- **X-Plane 12.4.0 or later**. XEarthLayer reads your position from X-Plane's Web API, which reached the version it needs in 12.4.0
- **Linux** (amd64) with FUSE 3 and **glibc 2.34 or newer** for the prebuilt packages (Ubuntu 22.04 LTS, Debian 12 and RHEL 9 onwards; check with `ldd --version`), **or macOS 12 or later on Apple Silicon** with [macFUSE](https://macfuse.io) 5.x
- An **8 core CPU** and **16GB of system memory** (12 cores and 32GB recommended)
- A **GPU with 8GB of video memory**. 16GB if you also run SimHeaven X-World Pro, and 24GB or more with everything on at 4K
- **100GB of free disk space** for the tile cache and scenery packages. Night lighting takes 5% of the cache budget
- A **100Mbit internet connection** for streaming imagery

These are the minimum figures. See [System Requirements](/#requirements) for the recommended and ultimate tiers.

{{< callout type="warning" >}}
XEarthLayer and X-Plane compete for the same system memory, and X-Plane alone wants around 15GB while it loads a scene. On a 16GB machine you will need swap space and a small memory cache. If you are choosing hardware rather than working with what you have, treat 32GB as the real target.
{{< /callout >}}

{{< callout type="info" >}}
XEarthLayer reads aircraft position, heading and speed from X-Plane's built-in Web API, which powers adaptive prefetching so tiles are ready before you need them. No plugin or manual setup is required.

X-Plane has shipped the Web API since 12.1.1, but it is versioned, and XEarthLayer uses **v3**, which X-Plane added in **12.4.0**. On an earlier sim the connection is never established: scenery still streams when X-Plane asks for it, but nothing is fetched ahead of the aircraft, so 12.4.0 is the version to be on.
{{< /callout >}}

## Installation

Install the package for your system. Building from source is only necessary on a Linux distribution older than the glibc requirement above, or if you want to run unreleased code.

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
<!--tab:macOS-->
XEarthLayer needs macFUSE, which ships as a kernel extension that macOS asks you to approve once. Follow [XEarthLayer on macOS](../macos/) for that step first, then install XEarthLayer with Homebrew:

{{< code lang="bash" copy="true" >}}
brew install --cask xearthlayer/tap/xearthlayer
{{< /code >}}

`brew upgrade` keeps it current. To follow pre-releases instead, install `xearthlayer/tap/xearthlayer@prerelease`; the two casks conflict, so a Mac is on one channel at a time.

Or download the Apple Silicon tarball. The binary is signed and notarized, so it runs as downloaded:

{{< code lang="bash" copy="true" >}}
curl -LO {{< download-url "macos_tarball" >}} && tar xzf {{< download-file "macos_tarball" >}} && mkdir -p ~/.local/bin && mv xearthlayer ~/.local/bin/
{{< /code >}}

If `xearthlayer` is then not found, add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc` and open a new terminal.
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
Ubuntu, `fuse3-devel` on Fedora and RHEL, and `fuse3` on Arch, which ships the
headers alongside the library rather than splitting them into a separate
package.

**Debian/Ubuntu**
{{< code lang="bash" copy="true" >}}
sudo apt install libfuse3-dev
{{< /code >}}

**RHEL/Fedora**
{{< code lang="bash" copy="true" >}}
sudo dnf install fuse3-devel
{{< /code >}}

**Arch**
{{< code lang="bash" copy="true" >}}
sudo pacman -S fuse3
{{< /code >}}

**macOS**: install macFUSE instead of the headers (see [XEarthLayer on macOS](../macos/)). The build itself is the same.

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

**Your files move.** 0.5.0 keeps configuration, cache, packages and logs where the system expects them instead of in `~/.xearthlayer`. The first start after upgrading copies `config.ini` to its new home and moves nothing else: anything still at an old location is pinned there in the new configuration, so a working installation keeps working. Run `xearthlayer migrate` to review the choices, or `xearthlayer migrate status` to see where everything resolves. See [Where XEarthLayer Keeps Its Files](../directory-layout/).

**Your scenery packages are replaced.** The world was rebuilt for 0.5.0: seventeen regional packages, each about a third smaller and each carrying night lighting, replace the old continental ones, which are not in the 0.5.0 library. Remove the old packages first, then install the new regions:

{{< code lang="bash" copy="true" >}}
xearthlayer packages remove --all
xearthlayer packages remove --all --type overlay
xearthlayer packages install --all
{{< /code >}}

Or install only the regions you fly, from the package manager (`xearthlayer packages`) or by code (`xearthlayer packages install NA`). See [Package Management](../packages/#upgrading-from-the-continental-packages).

**Your configuration is tidied.** Some settings were removed in 0.5.0. The first start says how many your file still holds; `xearthlayer config upgrade` removes them, after writing a timestamped backup. Use `--dry-run` to preview.

Your first flight afterwards refills the tile cache for the new packages, so it downloads more than usual. There is no need to run `xearthlayer cache clear`.

## Initial Setup

1. **Run the setup wizard** (recommended for first-time users):

   {{< code lang="bash" copy="true" >}}
xearthlayer setup
{{< /code >}}

   The wizard walks through six steps:
   1. Your X-Plane Custom Scenery folder, auto-detected where it can be
   2. Where to keep scenery packages
   3. Which imagery provider to stream. The five that need no account are offered first; a key or token is asked for only with Google Maps or Mapbox
   4. Where to keep the tile cache, and how much memory and disk to give it, sized from your hardware
   5. How to encode textures. GPU encoding is offered only when there are at least two GPUs
   6. Whether to give SimHeaven X-World Pro priority over XEarthLayer's overlays, if it is installed

   It offers to open the package manager when it finishes.

2. **Install a regional scenery package**:

   Open the package manager, choose a region on the Library tab, and press `i`:

   {{< code lang="bash" copy="true" >}}
xearthlayer packages
{{< /code >}}

   Or install by code. The start of a code selects every package beneath it, so `NA` is all of North America and `NA-CANADA` both halves of Canada:

   {{< code lang="bash" copy="true" >}}
xearthlayer packages install EU-WEST
{{< /code >}}

   {{< code lang="bash" copy="true" >}}
xearthlayer packages install NA-CANADA
{{< /code >}}

   The [Package Management](../packages/) page lists every region with its size.

3. **Start XEarthLayer**:

   {{< code lang="bash" copy="true" >}}
xearthlayer
{{< /code >}}

   This defaults to the `run` command. You can also use `xearthlayer run` explicitly. Leave this terminal running while you fly in X-Plane.

4. **Launch X-Plane** and fly! You should see satellite imagery streaming in as you move around.

## Stopping the Service

When you are done flying, close X-Plane first. Then stop XEarthLayer cleanly by pressing the **`q`** key in the terminal and following the prompt to confirm.

{{< callout type="warning" >}}
Stop X-Plane before XEarthLayer. X-Plane reads scenery from XEarthLayer's mount, and taking that away while the simulator is running crashes it to the desktop. `q`, `Ctrl+C`, a `kill` or closing the terminal all shut XEarthLayer down cleanly; the order is what matters.
{{< /callout >}}

## Verifying It Works

When XEarthLayer is running, you'll see a real-time dashboard showing:

- **Cache statistics** (memory and disk usage)
- **Download activity** (tiles being fetched)
- **Aircraft position and prefetch state** (when connected to X-Plane via the Web API)
- **Pipeline health** (download, assembly, encode stages, and how long X-Plane waited for tiles)
- **Status** (X-Plane's frame rate, which engine is encoding textures, whether night lighting is working, and whether X-World Pro was detected)

If you see tiles being downloaded and cache hits increasing, XEarthLayer is working correctly.

## Next Steps

- [Configure X-Plane 12 for optimal performance](../x-plane-configuration/)
- [Set up a Mac](../macos/)
- [See what night lighting needs](../night-lighting/)
- [Configure providers and caching](../configuration/)
- [Install more regional packages](../packages/)
- [Learn how XEarthLayer works](../how-it-works/)
