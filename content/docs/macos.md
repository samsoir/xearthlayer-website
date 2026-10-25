---
title: "XEarthLayer on macOS"
description: "Install macFUSE, approve it once, then install XEarthLayer with Homebrew or from the Apple Silicon tarball."
weight: 25
---

XEarthLayer runs natively on Apple Silicon Macs. It presents scenery to X-Plane through a virtual filesystem, which on macOS is provided by [macFUSE](https://macfuse.io). Installing macFUSE involves a one-time security approval, after which XEarthLayer installs and runs like any other command-line tool.

## Requirements

- macOS 12 or later on an Apple Silicon Mac
- [macFUSE](https://macfuse.io) 5.x or later
- X-Plane 12.4.0 or later

## Installing macFUSE

macFUSE ships as a kernel extension, so macOS asks you to approve it. On Apple Silicon that takes two steps: first allow third-party kernel extensions at all, then approve macFUSE.

### 1. Install the package

{{< code lang="bash" copy="true" >}}
brew install --cask macfuse
{{< /code >}}

Or download the installer from [macfuse.io](https://macfuse.io) and run it.

### 2. Allow kernel extensions (Apple Silicon)

1. Shut the Mac down completely.
2. Press and **hold** the power button until "Loading startup options" appears, then choose **Options** to boot into Recovery.
3. Open **Utilities → Startup Security Utility**, select your startup disk, and choose **Reduced Security** with **"Allow user management of kernel extensions from identified developers"** checked.
4. Restart into macOS.

### 3. Approve macFUSE

1. Open **System Settings → Privacy & Security**.
2. Under Security, a message says system software from developer **"Benjamin Fleischer"** (the macFUSE developer) was blocked. Click **Allow**. macOS may ask you to **Enable System Extensions** and restart.
3. Restart when prompted.

If the approval prompt never appears, re-run the macFUSE installer after the Recovery steps. XEarthLayer checks for macFUSE every time it starts and points back here if it is missing or unapproved.

## Install with Homebrew

{{< code lang="bash" copy="true" >}}
brew install --cask xearthlayer/tap/xearthlayer
{{< /code >}}

That installs the latest stable release, and `brew upgrade` keeps it current. To follow pre-releases (dev, alpha, beta and rc builds) install `xearthlayer/tap/xearthlayer@prerelease` instead. The two casks conflict, so a Mac is on one channel at a time.

The cask depends on the `macfuse` cask. If macFUSE is already installed from its own installer, add `--skip-cask-deps`. The approval steps above still apply.

{{< callout type="info" >}}
Naming the cask in full, `xearthlayer/tap/xearthlayer`, trusts that one cask and nothing else in the tap. Homebrew applies its download quarantine to every cask, which is why XEarthLayer's binaries are signed and notarized.
{{< /callout >}}

The package publishing tool has its own casks, `xearthlayer/tap/xearthlayer-publish` and `xearthlayer/tap/xearthlayer-publish@prerelease`. It does not need macFUSE and installs alongside either XEarthLayer cask.

## Install from the tarball

Each release carries an Apple Silicon tarball. The binary is signed with the project's Apple Developer ID and notarized by Apple, so macOS runs it as downloaded. The first run of a browser download needs a network connection, because a bare executable cannot carry its notarization ticket and Gatekeeper fetches it once.

Safari unpacks the tarball into a folder of the same name. In that case go straight to that folder:

{{< code lang="bash" copy="true" >}}
cd ~/Downloads/$(basename {{< download-file "macos_tarball" >}} .tar.gz)
{{< /code >}}

With any other browser, unpack it first:

{{< code lang="bash" copy="true" >}}
cd ~/Downloads && tar xzf {{< download-file "macos_tarball" >}}
{{< /code >}}

Then, in either case, move the binary onto your path:

{{< code lang="bash" copy="true" >}}
mkdir -p ~/.local/bin && mv xearthlayer ~/.local/bin/ && xearthlayer --version
{{< /code >}}

If `xearthlayer` is not found, `~/.local/bin` is not on your `PATH`. Add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc` and open a new terminal.

## Then

{{< code lang="bash" copy="true" >}}
xearthlayer setup
{{< /code >}}

The setup wizard detects your X-Plane installation, your memory and your storage type, and offers to open the package manager when it finishes. From there, [Getting Started](../getting-started/#initial-setup) is the same on every platform.

## How macOS differs

### Textures go through the kernel page cache

On Linux, XEarthLayer serves generated textures with direct I/O so every read from X-Plane is visible to it. On macOS, direct I/O interacts badly with X-Plane's memory-mapped texture loading and can crash the simulator, so generated textures are served through the normal kernel page cache instead. It is safe and transparent, with one side effect: repeat reads never reach XEarthLayer, so the FUSE read counters on the dashboard count each texture's first read only. Aircraft position comes from X-Plane's Web API on every platform, so prefetching is unaffected.

### Texture encoding stays on the CPU

Apple Silicon has one GPU, shared with X-Plane's Metal renderer. XEarthLayer therefore encodes textures with the ISPC backend by default, which ships prebuilt Apple Silicon kernels. Setting `texture.compressor = gpu` is honoured, but XEarthLayer warns at startup and on the dashboard, because encoding would compete with the simulator for the GPU. The setup wizard never selects `gpu` on a Mac.

### The mount's name in Finder

Finder shows a mounted volume's name in place of the folder it is mounted on. XEarthLayer names its volume after the mount point, so the ortho mount appears in Custom Scenery as `zzXEL_ortho`, the same name X-Plane and the terminal see.

### Stale mount recovery

If XEarthLayer is killed without unmounting (a crash, a force-quit), macFUSE leaves a stale mount behind and the next run would fail with "Device not configured (os error 6)". XEarthLayer detects this at startup and force-unmounts the stale mount point itself. To do it by hand:

{{< code lang="bash" copy="true" >}}
umount "/path/to/X-Plane 12/Custom Scenery/zzXEL_ortho"
{{< /code >}}

### Reading a mount over SSH

macOS applies its privacy controls per responsible process. Over SSH your commands belong to `sshd`, which has no Full Disk Access by default, and a FUSE mount counts as an external volume. The symptom is misleading: the mount succeeds, then reads fail with `Operation not permitted`. XEarthLayer never returns that error itself, so it always comes from the OS.

Either run XEarthLayer from a Terminal on the Mac (Screen Sharing counts), or grant `sshd` Full Disk Access: System Settings → Privacy & Security → Full Disk Access → **+**, press `Cmd+Shift+G`, enter `/usr/sbin/sshd` (on some versions `/usr/libexec/sshd-keygen-wrapper`), then disconnect and reconnect.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `mount_macfuse: the file system is not available (255)` | macFUSE is not approved. Redo [Installing macFUSE](#installing-macfuse) |
| "System extension blocked" notification | System Settings → Privacy & Security → Allow, then restart |
| No approval option appears | Boot into Recovery and enable Reduced Security with kernel extension management first |
| "Device not configured (os error 6)" on mount | A stale mount from a previous run. Recovered automatically at startup; see [Stale mount recovery](#stale-mount-recovery) |
| macFUSE stops working after a macOS upgrade | Re-run the macFUSE installer and approve the extension again |
| Mount succeeds but reads fail with `Operation not permitted` | You are probably over SSH. See [Reading a mount over SSH](#reading-a-mount-over-ssh) |
