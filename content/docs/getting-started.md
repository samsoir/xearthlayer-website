---
title: "Getting Started"
description: "Install XEarthLayer and start flying with photoreal scenery in X-Plane 12."
weight: 10
---

This guide will help you install XEarthLayer and get flying with photoreal scenery in minutes.

## Prerequisites

- **X-Plane 12** installed on your system
- **Linux** (Debian/Ubuntu, Fedora/RHEL, or Arch Linux)
- At least **2GB free RAM** for the memory cache
- **Internet connection** for streaming imagery

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
Using yay:
{{< code lang="bash" copy="true" >}}
yay -S xearthlayer-bin
{{< /code >}}

Or using paru:
{{< code lang="bash" copy="true" >}}
paru -S xearthlayer-bin
{{< /code >}}
{{< /tabs >}}

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

   Leave this terminal running while you fly in X-Plane.

4. **Launch X-Plane** and fly! You should see satellite imagery streaming in as you move around.

## Verifying It Works

When XEarthLayer is running, you'll see a real-time dashboard showing:

- **Cache statistics** (memory and disk usage)
- **Download activity** (tiles being fetched)
- **GPS position** (if telemetry is available)
- **Pipeline health** (download, assembly, encode stages)

If you see tiles being downloaded and cache hits increasing, XEarthLayer is working correctly.

## Next Steps

- [Configure X-Plane 12 for optimal performance](../x-plane-configuration/)
- [Configure providers and caching](../configuration/)
- [Install more regional packages](../packages/)
- [Learn how XEarthLayer works](../how-it-works/)
