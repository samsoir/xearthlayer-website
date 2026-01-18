---
title: "Package Management"
description: "Install, update, and manage regional scenery packages."
weight: 30
---

XEarthLayer uses a package system to manage regional scenery from across the globe. Packages contain tile indices that tell XEarthLayer which areas have satellite imagery and what resources to download.

## Available Regions

![Coverage Map](/images/coverage.png)

*EU in orange, NA in blue, OC in purple, SA in green.*

| Code | Region | Version | Coverage |
|------|--------|---------|----------|
| EU | Europe | 0.1.1 | Western and Central Europe |
| NA | North America | 0.2.3 | United States, Canada, Caribbean |
| OC | Oceania | 0.2.0 | Australia, New Zealand, Fiji, French Polynesia, Papua New Guinea, Vanuatu, Solomon Islands |
| SA | South America | 0.2.0 | Complete continent including Falkland Islands |

## Listing Packages

View installed and available packages:

{{< code lang="bash" copy="true" >}}
xearthlayer packages list
{{< /code >}}

## Installing Packages

Install a regional package by its code:

{{< code lang="bash" copy="true" >}}
xearthlayer packages install EU
{{< /code >}}

{{< code lang="bash" copy="true" >}}
xearthlayer packages install NA
{{< /code >}}

## Updating Packages

Check for updates:

{{< code lang="bash" copy="true" >}}
xearthlayer packages check
{{< /code >}}

Update all packages:

{{< code lang="bash" copy="true" >}}
xearthlayer packages update
{{< /code >}}

Update a specific package:

{{< code lang="bash" copy="true" >}}
xearthlayer packages update EU
{{< /code >}}

## Removing Packages

Remove a package you no longer need:

{{< code lang="bash" copy="true" >}}
xearthlayer packages remove EU
{{< /code >}}

## Package Library

XEarthLayer fetches package information from a library URL. The default library is hosted at:

```
https://xearthlayer.app/packages/xearthlayer_package_library.txt
```

You can configure a custom library URL:

{{< code lang="bash" copy="true" >}}
xearthlayer config set packages.library_url https://example.com/library.txt
{{< /code >}}
