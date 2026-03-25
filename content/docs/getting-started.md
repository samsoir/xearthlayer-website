---
title: "Getting Started"
description: "Install XEarthLayer and start flying with photoreal scenery in X-Plane 12."
weight: 20
---

This guide will help you install XEarthLayer and get flying with photoreal scenery in minutes.

## Prerequisites

- **X-Plane 12** installed on your system
- **Linux** (Debian/Ubuntu, Fedora/RHEL, or Arch Linux) with FUSE support
- At least **2GB free RAM** for the memory cache
- **Internet connection** for streaming imagery

{{< callout type="info" >}}
**X-Plane 12.1.1 or later is recommended.** XEarthLayer connects to X-Plane automatically via the Web API (enabled by default since 12.1.1) to read aircraft position, heading, and speed. This powers adaptive prefetching so tiles are ready before you need them. If X-Plane is not running when XEarthLayer starts, it falls back to inferring position from file access patterns.
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

### GPU-Accelerated Build (Optional)

If you have a spare GPU (such as an integrated AMD or Intel GPU) alongside your discrete GPU running X-Plane, you can build XEarthLayer with GPU-accelerated DDS texture compression. This offloads encoding to the GPU via wgpu compute shaders, freeing CPU resources for X-Plane.

{{< code lang="bash" copy="true" >}}
git clone https://github.com/samsoir/xearthlayer.git && cd xearthlayer && make release-gpu && make install-gpu
{{< /code >}}

After installing, run `xearthlayer diagnostics` to verify your GPU is detected. Any modern wgpu-compatible GPU from AMD, NVIDIA, or Intel will work. See the [Configuration guide](../configuration/) for compressor selection.

{{< callout type="tip" >}}
The GPU build is most beneficial when you have an idle integrated GPU handling texture compression while your discrete GPU handles X-Plane rendering. If you only have a single GPU, the standard build with ISPC compression is recommended.
{{< /callout >}}

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
