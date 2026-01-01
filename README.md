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
                                         Update packages.md
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

- `static/packages/xearthlayer_package_library.txt` - Package index
- `content/docs/packages.md` - Available Regions table auto-generated

### Required Secrets

The regional-scenery repo requires a `WEBSITE_DISPATCH_TOKEN` (fine-grained PAT with `contents: write` for this repo) to trigger syncs. Token expires every 90 days.

## Custom Domain

The site is configured for the `xearthlayer.app` domain. DNS configuration:

1. Add a CNAME record pointing to `samsoir.github.io`
2. Or add A records pointing to GitHub Pages IPs

## License

MIT License - see [LICENSE](LICENSE)
