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
                                         Write data/regions.json and
                                         static/data/regions.geojson
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
| `static/data/regions.geojson` | Derived from the scenery repo's `coverage.geojson` by `scripts/dissolve-regions.py` | One shape per region for the packages page map |

### Data Files

The sync workflow uses these files from the regional-scenery repo:

- **`xearthlayer_package_library.txt`** - Package index with versions and download URLs
- **`region_metadata.json`** - Region names, coverage descriptions, and colors
- **`coverage.png`** - Coverage map image
- **`coverage.geojson`** - One polygon per 1°×1° tile, tagged with its region. Not committed; the workflow dissolves it into `static/data/regions.geojson`

The region table, legend, map and homepage storage figures are rendered by Hugo from `data/regions.json` and `static/data/regions.geojson`, so a world rebuild is a data drop, not an edit.

## Homepage Scroll Story

The features section of the homepage scrubs through frames of a rendered flight as the visitor scrolls. The frames live in `static/images/scrolly/<width>/NNN.webp` and the manifest Hugo reads is `data/scrolly.json`. Both are generated from the ProRes master with:

    python3 scripts/extract-scrolly-frames.py /path/to/Scrollytale.mov --holds streaming=99,night=377

The script keeps every third frame, writes 1440 and 960 pixel wide WebP sets, and records each hold (a source frame the picture pauses on for a feature) as an index into the kept frames. Hold names must match the `data-feature` values of the steps in `themes/xearthlayer/layouts/home.html`. Re-run it whenever the master changes and commit the frames and the manifest together. Tests: `python3 -m unittest scripts/test_extract_scrolly_frames.py`.

The last four features play short terminal clips inside a Ptyxis window frame (`static/images/ptyxis.webp`). The clips in `static/video/terminal-<feature>.{mp4,webm}` and their posters in `static/images/terminal/` are cut from the terminal master, `Scrollytale-terminal.mov`, at these times:

| Feature | From | To |
|---|---|---|
| packages | 0:00.000 | 0:28.000 |
| dashboard | 0:28.000 | 0:46.458 |
| prefetch | 0:46.458 | 1:25.625 |
| encoding | 1:25.625 | end |

For each clip, with `FROM` and `TO` in seconds:

    ffmpeg -ss FROM -to TO -i Scrollytale-terminal.mov -an -vf "scale=1920:-2,format=yuv420p" -c:v libx264 -preset slow -crf 22 -movflags +faststart static/video/terminal-NAME.mp4
    ffmpeg -ss FROM -to TO -i Scrollytale-terminal.mov -an -vf "scale=1920:-2,format=yuv420p" -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 static/video/terminal-NAME.webm
    ffmpeg -ss FROM -i Scrollytale-terminal.mov -frames:v 1 -vf scale=1920:-2 -c:v libwebp -quality 70 static/images/terminal/NAME.webp

## Social Preview Card

Link previews (Open Graph and Twitter cards) use `static/images/social-card.png`, a 1200×630 card built from a frame of the hero video with the logo, wordmark and tagline over it. The head partial points every page at it unless the page names its own picture in front matter, for example `images = ['/images/news/ff777-sunset.jpg']` on a news article. News articles are tagged as `article` with their published time; everything else is `website`.

The card's layout is `scripts/social-card.svg`. It expects `frame.jpg` (the cropped background) and `logo.svg` beside it, so rebuild it in a scratch directory with the Inter font installed:

    ffmpeg -ss 70.5 -i static/video/hero.mp4 -frames:v 1 frame-src.png
    magick frame-src.png -crop 2560x1344+0+64 +repage -resize 1200x630! -brightness-contrast 3x8 -modulate 100,112 -quality 92 frame.jpg
    cp static/logo.svg scripts/social-card.svg .
    rsvg-convert -w 1200 -h 630 social-card.svg -o static/images/social-card.png

Change the wordmark or tagline in the SVG, not in the PNG. If the picture changes, update the `og:image:alt` text in `themes/xearthlayer/layouts/_partials/head.html` to match.

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
