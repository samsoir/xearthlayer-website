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
<!--tab:Arch Linux-->
```bash
# Using yay
yay -S xearthlayer-bin

# Or using paru
paru -S xearthlayer-bin
```
<!--tab:Fedora/RHEL-->
```bash
# Download the latest .rpm package
wget https://github.com/samsoir/xearthlayer/releases/latest/download/xearthlayer-0.2.9.x86_64.rpm

# Install with rpm
sudo rpm -i xearthlayer-0.2.9.x86_64.rpm
```
<!--tab:Debian/Ubuntu-->
```bash
# Download the latest .deb package from GitHub releases
wget https://github.com/samsoir/xearthlayer/releases/latest/download/xearthlayer_0.2.9_amd64.deb

# Install with dpkg
sudo dpkg -i xearthlayer_0.2.9_amd64.deb
```
<!--tab:Build from Source-->
```bash
# Clone the repository
git clone https://github.com/samsoir/xearthlayer.git
cd xearthlayer

# Build with cargo
cargo build --release

# Install the binary
sudo cp target/release/xearthlayer /usr/local/bin/
```
{{< /tabs >}}

## Initial Setup

1. **Initialize configuration**:

   ```bash
   xearthlayer init
   ```

   This creates a configuration file at `~/.xearthlayer/config.ini`.

2. **Install a regional scenery package**:

   ```bash
   xearthlayer packages install EU  # Europe
   # or
   xearthlayer packages install NA  # North America
   ```

3. **Start XEarthLayer**:

   ```bash
   xearthlayer run
   ```

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

- [Configure providers and caching](../configuration/)
- [Install more regional packages](../packages/)
- [Learn how XEarthLayer works](../how-it-works/)
