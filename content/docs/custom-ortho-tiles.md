---
title: "Custom Ortho Tiles"
description: "Use your own pre-built ortho tiles alongside XEarthLayer's streamed scenery."
weight: 55
---

If you already have pre-generated Ortho4XP tiles for your favourite airports or regions, you do not have to give them up. XEarthLayer's **patches** system lets you drop those tiles into a directory so they are served directly to X-Plane instead of streaming imagery for those areas.

This is ideal when you want to keep specific zoom levels, custom imagery sources, or hand-tuned scenery for regions you fly most often, while still getting XEarthLayer's streamed coverage everywhere else.

## How Patches Work

A patch is a folder containing standard Ortho4XP output — DSF meshes, terrain definitions, and DDS textures — placed inside the XEarthLayer patches directory. When XEarthLayer starts, it scans the patches directory for valid tile data and registers which 1 degree by 1 degree regions are covered. Any request from X-Plane that falls within a patched region is served directly from your local files rather than being streamed.

Patched regions completely replace package files for those 1 degree by 1 degree areas. There is no blending or mixing — your custom tiles take full priority.

## Directory Structure

Place your Ortho4XP output folders inside the patches directory:

{{< code lang="text" copy="false" >}}
~/.xearthlayer/patches/
├── A_MyRegion/
│   ├── Earth nav data/
│   │   └── +40-080/
│   │       └── +41-074.dsf
│   ├── terrain/
│   │   └── *.ter
│   └── textures/
│       └── *.dds
└── B_AnotherRegion/
    └── ...
{{< /code >}}

Each subfolder inside `patches/` is one patch. The required contents are:

| Directory | Contents | Required |
|-----------|----------|----------|
| `Earth nav data/` | At least one `.dsf` file in the standard `+NN-NNN/` subfolder layout | Yes — this is how XEarthLayer detects which regions the patch covers |
| `terrain/` | `.ter` terrain definition files | Yes |
| `textures/` | `.dds` texture files | Yes |

{{< callout type="info" >}}
Alphabetical naming controls priority when patches overlap. A folder named `A_HighRes` takes precedence over `B_LowRes` for the same region. Use letter prefixes to set the order you prefer.
{{< /callout >}}

## Configuration

Patches are enabled by default. The relevant settings live in the `[patches]` section of `~/.xearthlayer/config.ini`:

{{< code lang="ini" copy="true" >}}
[patches]
enabled = true
directory = ~/.xearthlayer/patches
{{< /code >}}

| Parameter | Default | Description |
|-----------|---------|-------------|
| `enabled` | `true` | Enable or disable the patches system |
| `directory` | `~/.xearthlayer/patches` | Path to the directory containing your patch folders |

You can also manage patches from the command line. See the [CLI Reference](/docs/cli-reference/) for available `xearthlayer patches` commands.

## Prefetch Integration

XEarthLayer automatically detects which 1 degree by 1 degree regions are covered by your patches and excludes them from streaming and prefetching. This means:

- No bandwidth is spent downloading tiles you already have locally
- Prefetch cycles skip patched regions entirely
- No configuration is needed — detection is automatic based on the DSF files in your patches

{{< callout type="tip" >}}
If you have ortho tiles for a large area like the US east coast, patching those regions can significantly reduce your network usage since XEarthLayer will not attempt to stream or prefetch any tiles that your patches already cover.
{{< /callout >}}

## Verification

Use the CLI to confirm your patches are correctly set up:

{{< code lang="bash" copy="true" >}}
# List all patches and their validation status
xearthlayer patches list

# Validate directory structure and file integrity
xearthlayer patches validate
{{< /code >}}

The `list` command shows each patch folder, the 1 degree by 1 degree regions it covers, and whether the required files are present. The `validate` command performs a deeper check on directory structure and file integrity.

**In flight**, patched areas are easy to spot — your custom tiles appear immediately with no download delay, while streamed areas may take a moment to load on a cold cache.

{{< callout type="warning" >}}
If a patch folder is missing its `Earth nav data/` directory or contains no `.dsf` files, XEarthLayer will skip it and log a warning. Run `xearthlayer patches validate` to diagnose any issues.
{{< /callout >}}
