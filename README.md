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

## Package Library

The package library file at `/packages/xearthlayer_package_library.txt` is synced daily from the [xearthlayer-regional-scenery](https://github.com/samsoir/xearthlayer-regional-scenery) repository.

## Custom Domain

The site is configured for the `xearthlayer.app` domain. DNS configuration:

1. Add a CNAME record pointing to `samsoir.github.io`
2. Or add A records pointing to GitHub Pages IPs

## License

MIT License - see [LICENSE](LICENSE)
