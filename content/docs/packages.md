---
title: "Package Management"
description: "Install, update, and manage regional scenery packages."
weight: 40
---

XEarthLayer uses a package system to manage regional scenery from across the globe. Packages contain tile indices that tell XEarthLayer which areas have satellite imagery and what resources to download.

## Available Regions

![Coverage Map](/images/coverage.png)

*AF1 in cyan, AF2 in yellowgreen, AS3 in red, EU in orange, EU2 in tangerine, NA in blue, OC in purple, SA in green.*

| Code | Region | Version | Coverage |
|------|--------|---------|----------|
| AF1 | Africa - Part 1 | 0.1.0 | North Africa including Morocco, Algeria, Tunisia, Libya, Egypt, Sudan, South Sudan, Ethiopia, Somalia, Djibouti, Chad, Niger, Nigeria, Cameroon, Central African Republic, Mali, Senegal, Gambia, Guinea, Sierra Leone, Liberia, Ivory Coast, Ghana, Benin, Mauritania, Western Sahara |
| AF2 | Africa - Part 2 | 0.1.0 | Southern Africa including South Africa, Namibia, Botswana, Zimbabwe, Zambia, Mozambique, Madagascar, Tanzania, Kenya, DRC |
| AS3 | Asia - Part 3 | 0.1.0 | Indonesia, Malaysia, Philippines, Vietnam, Thailand, Japan, South Korea, Taiwan, Eastern Russia |
| EU | Europe | 0.1.1 | Western and Central Europe |
| EU2 | Europe - Part 2 | 0.1.0 | Eastern Europe, Scandinavia, Caucasus, and European Russia including Greece, Bulgaria, Romania, Moldova, Ukraine, Belarus, Baltic States, Finland, Sweden, Norway, Turkey, Cyprus, Georgia, Armenia, Azerbaijan, and European Russia extending to the Ural Mountains |
| NA | North America | 0.2.3 | United States, Canada, Caribbean |
| OC | Oceania | 0.2.0 | Australia, New Zealand, Fiji, French Polynesia, Papua New Guinea, Vanuatu, Solomon Islands |
| SA | South America | 0.2.0 | Complete continent including Falkland Islands |

## Managing Packages

Use the `xearthlayer packages` command to list, install, update, and remove regional packages. For example, to install the Europe region:

{{< code lang="bash" copy="true" >}}
xearthlayer packages install EU
{{< /code >}}

See the [CLI Reference](/docs/cli-reference/) for all package commands and options.
