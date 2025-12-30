---
title: "Package Management"
description: "Install, update, and manage regional scenery packages."
weight: 30
---

XEarthLayer uses a package system to manage regional scenery. Packages contain tile indices that tell XEarthLayer which areas have satellite imagery available.

## Listing Packages

View installed and available packages:

```bash
xearthlayer packages list
```

## Installing Packages

Install a regional package by its code:

```bash
# Europe
xearthlayer packages install EU

# North America
xearthlayer packages install NA

# Or install multiple
xearthlayer packages install EU NA
```

## Updating Packages

Check for and install updates:

```bash
# Check for updates
xearthlayer packages check

# Update all packages
xearthlayer packages update

# Update specific package
xearthlayer packages update EU
```

## Removing Packages

Remove a package you no longer need:

```bash
xearthlayer packages remove EU
```

## Available Regions

| Code | Region | Coverage |
|------|--------|----------|
| EU | Europe | Western and Central Europe |
| NA | North America | United States and Canada |
| *More coming* | | |

## Package Library

XEarthLayer fetches package information from a library URL. The default library is hosted at:

```
https://xearthlayer.app/packages/xearthlayer_package_library.txt
```

You can configure a custom library URL:

```bash
xearthlayer config set packages.library_url https://example.com/library.txt
```
