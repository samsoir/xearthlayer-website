# XEarthLayer Website

The official website for [XEarthLayer](https://github.com/samsoir/xearthlayer) - stunning photoreal scenery for X-Plane 12.

**Live site**: https://xearthlayer.app

## Development

This site is built with [Hugo](https://gohugo.io/).

### Prerequisites

- Hugo v0.153+ (extended version)

### Local Development

```bash
# Clone the repository
git clone https://github.com/samsoir/xearthlayer-website.git
cd xearthlayer-website

# Start the development server
hugo server -D

# Open http://localhost:1313
```

### Building

```bash
hugo --gc --minify
```

The built site will be in the `public/` directory.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

## Package Library Sync

The package library and documentation are automatically synced from [xearthlayer-regional-scenery](https://github.com/samsoir/xearthlayer-regional-scenery).

### How It Works

```
Regional Scenery Repo                    Website Repo
─────────────────────                    ────────────
Push to main          ──────────────►    sync-packages.yml
(library updated)     repository_dispatch     │
                                              ▼
                                         Fetch library
                                         Write data/regions.json
                                         Commit changes
                                              │
                                              ▼
                                         deploy.yml
                                              │
                                              ▼
                                         Live at xearthlayer.app
```

### Sync Triggers

| Trigger | Description |
|---------|-------------|
| `repository_dispatch` | Immediate sync when regional-scenery pushes updates |
| `schedule` | Daily at 00:00 UTC (fallback) |
| `workflow_dispatch` | Manual trigger via GitHub Actions |

### Files Updated

| File | Source | Description |
|------|--------|-------------|
| `static/packages/xearthlayer_package_library.txt` | Regional scenery repo | Package index for CLI |
| `static/images/coverage.png` | Regional scenery repo | Coverage map image |
| `data/regions.json` | Regional scenery repo | Region names, coverage, colours, sizes and supersedes; Hugo renders the packages page and homepage storage figures from it |

### Data Files

The sync workflow uses these files from the regional-scenery repo:

- **`xearthlayer_package_library.txt`** - Package index with versions and download URLs
- **`region_metadata.json`** - Region names, coverage descriptions, and colors
- **`coverage.png`** - Coverage map image

The region table, legend and homepage storage figures are rendered by Hugo from `data/regions.json`, so a world rebuild is a data drop, not an edit.

## App Version Sync

Download links on the Getting Started page are automatically updated when new XEarthLayer versions are released.

### How It Works

```
XEarthLayer Main Repo                   Website Repo
─────────────────────                   ────────────
Release v0.x.x        ──────────────►   sync-version.yml
(tag pushed)          repository_dispatch     │
                                              ▼
                                         Fetch version.json
                                         Update getting-started.md
                                         Commit changes
                                              │
                                              ▼
                                         deploy.yml
                                              │
                                              ▼
                                         Live at xearthlayer.app
```

### Files Updated

- `data/release.json` and `hugo.toml` - Version, date and asset filenames the download links are built from

### Data File

The main xearthlayer repo contains `version.json` with current release info:

```json
{
  "version": "0.5.0",
  "tag": "v0.5.0",
  "assets": {
    "deb": { "filename": "xearthlayer_0.5.0-1_amd64.deb" },
    "rpm": { "filename": "xearthlayer-0.5.0-1.fc44.x86_64.rpm" },
    "tarball": { "filename": "xearthlayer-v0.5.0-x86_64-linux.tar.gz" },
    "macos_tarball": { "filename": "xearthlayer-v0.5.0-arm64-macos.tar.gz" },
    "aur": { "filename": "aur-package.zip" }
  }
}
```

## Required Secrets

Both the regional-scenery repo and the main xearthlayer repo need `WEBSITE_DISPATCH_TOKEN` to trigger website updates:

| Secret | Source Repo | Purpose |
|--------|-------------|---------|
| `WEBSITE_DISPATCH_TOKEN` | xearthlayer-regional-scenery | Trigger package sync |
| `WEBSITE_DISPATCH_TOKEN` | xearthlayer | Trigger version sync |

**Token Configuration:**
- Fine-grained PAT with `contents: write` for this repo
- Expires every 90 days (set calendar reminder)

## Custom Domain

The site is configured for the `xearthlayer.app` domain. DNS configuration:

1. Add a CNAME record pointing to `samsoir.github.io`
2. Or add A records pointing to GitHub Pages IPs

## License

MIT License - see [LICENSE](LICENSE)
