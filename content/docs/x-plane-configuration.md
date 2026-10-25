---
title: "X-Plane 12 Configuration"
description: "How to configure X-Plane 12 for the best results"
weight: 50
---

Ensure your X-Plane configuration is setup correctly for XEarthLayer to operate optimally. For most users with an existing well tuned X-Plane system, XEarthLayer should not impact framerates significantly.

## Scenery Ordering

Setting the scenery pack order in your `X-Plane 12/Custom Scenery/scenery_packs.ini` file is essential to ensure all of your scenery loads with the correct priority relative all others.

### Scenery Pack Order

![Scenery pack order](/images/docs/scenery-layers.svg)

X-Plane gives priority to the packs listed first. Sort the file from small, local scenery at the top to progressively larger areas below: airports and landmarks, then X-Plane's global airports, then continent-wide overlays such as SimHeaven X-World Pro, then meshes and libraries. XEarthLayer's two entries come last.

XEarthLayer installs exactly two entries, and their names are chosen to sort to the end of the file:

- `yzXEL_overlay` holds the overlays from every installed package: roads, forests and buildings.
- `zzXEL_ortho` holds the satellite imagery for every installed package, and must be the very last entry.

When X-Plane starts after any change to the Custom Scenery folder, it adds the new packs to `scenery_packs.ini`, and the order it picks is often wrong. Start X-Plane once, quit before flying, then check the file against the example below and fix the order by hand.

{{< scenery-packs >}}
I
1000 Version
SCENERY

SCENERY_PACK Custom Scenery/{Your airports, landmarks and regional scenery}/
SCENERY_PACK Custom Scenery/X-Plane Airports - {Airport}/
SCENERY_PACK Custom Scenery/X-Plane Landmarks - {City}/
SCENERY_PACK *GLOBAL_AIRPORTS*

SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-01-bridges_O4XP-Mesh/
SCENERY_PACK_DISABLED Custom Scenery/simHeaven_X-WORLD-Pro_Europe-01-bridges_XP12-Mesh/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-02-fountains/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-03-vfr/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-04-regions/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-05-details/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-06-extras1/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-07-extras2/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-08-footprints/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-09-scenery/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-10-forests/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-11-net1-aerials/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-12-net2-ships/
SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Europe-13-net3-roads/

SCENERY_PACK Custom Scenery/{Regional and airport meshes}/

SCENERY_PACK Custom Scenery/simHeaven_X-WORLD-Pro_Library/
SCENERY_PACK Custom Scenery/{Other libraries}/

SCENERY_PACK Custom Scenery/yzXEL_overlay/
SCENERY_PACK Custom Scenery/zzXEL_ortho/
{{< /scenery-packs >}}

The X-World Pro lines follow the order in the X-World Pro manual, using Europe as the example. Other continents have up to thirteen layers, named the same way. In X-World Pro 1.1, only Europe's bridges layer comes in two versions: enable the `_O4XP-Mesh` one, because XEarthLayer packages use Ortho4XP meshes, and disable its `_XP12-Mesh` twin. Leave the X-World Pro lines out if you do not use it.

XEarthLayer never edits `scenery_packs.ini`. With `packages.xworld_pro` on, it checks the order on every start, and when its own entries load before any X-World Pro layer it names the two lines and offers to stop or continue. See [SimHeaven X-World Pro](../x-world-pro/) for the details.

The file lives in your X-Plane Custom Scenery folder, wherever you installed the simulator: for example `~/X-Plane 12/Custom Scenery/scenery_packs.ini`, or `/Applications/X-Plane 12/Custom Scenery/scenery_packs.ini` on a Mac that installed it there.

## X-Plane Graphics Settings

X-Plane 12 offers extensive graphics customization, but pushing every slider to maximum will overwhelm even high-end systems. Finding the right balance ensures smooth framerates while still enjoying XEarthLayer's satellite imagery.

### Settings That Matter Most

**Texture Resolution** — This directly correlates with your GPU's VRAM capacity. If you exceed your available VRAM, X-Plane will constantly swap textures in and out of memory, causing stutters. As a general guide:
- 8GB VRAM: Medium. This is the minimum for XEarthLayer
- 16GB VRAM: High. Needed if you also run SimHeaven X-World Pro
- 24GB+ VRAM: Maximum, with everything on at 4K

**Antialiasing** — X-Plane offers FSAA and MSAA options. MSAA above 2× will noticeably impact performance even on high-end graphics cards. For most systems, 2× MSAA provides a good balance between image quality and framerate.

**FSR (FidelityFX Super Resolution)** — AMD's upscaling technology renders at a lower resolution then upscales the image. This can dramatically improve performance with a modest reduction in image sharpness. If you're struggling with framerates, try FSR in Quality or Balanced mode before reducing other settings.

**World Objects** — Controls the density of autogen buildings, vegetation, and other scenery objects. This setting primarily affects CPU performance. Reducing it can help if you experience stutters in densely populated areas.

**Rendering Distance** — Determines how far X-Plane renders detailed scenery. Higher values increase the visible scenery range but require the system to process more data. XEarthLayer streams tiles based on your position, so moderate draw distances (Medium to High) work well without overwhelming the tile generation pipeline.

### General Advice

Start with X-Plane's default settings for your hardware tier, then adjust individual options based on what you observe. Monitor your framerate in different scenarios—cold and dark at a busy airport, cruise over varied terrain, approach into a detailed city—and tune settings accordingly.

<div class="callout callout--info">
  <svg class="callout__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
  <div class="callout__content">
    <p>When traversing large distances, X-Plane will begin swapping out and in large areas of scenery. This operation will reduce the framerate of the sim while it happens. Using lower texture resolution and fewer world objects reduces the amount of video memory that needs to be managed in and out when these loading events occur, reducing the impact to your flight experience.</p>
  </div>
</div>

{{< callout type="info" >}}
XEarthLayer reads aircraft telemetry from X-Plane 12.4.0 or later via the Web API. No configuration is required. On earlier releases the connection is never made and prefetch does not run; scenery still streams on demand. See [Getting Started](/docs/getting-started/).
{{< /callout >}}

## Recommended Add-ons

XEarthLayer provides satellite imagery, but pairing it with quality scenery add-ons enhances the overall visual experience. These add-ons complement XEarthLayer well:

### SimHeaven X-World (Recommended)

[SimHeaven X-World](https://simheaven.com/x-world-for-xp12/) is a comprehensive scenery enhancement that uses OpenStreetMap data combined with Microsoft building footprints to place objects realistically across the globe. It comes in a free edition and a paid edition, **X-World Pro**, sold per continent or as a world bundle.

**X-World includes:**
- Accurately placed buildings based on real-world footprints
- Road networks and infrastructure
- Vegetation and forest coverage
- Continental packages for Europe, North America, South America, Asia, Africa, Australia, and Antarctica

If you're only going to install one scenery add-on alongside XEarthLayer, we recommend X-World for its comprehensive coverage and seamless integration with satellite imagery.

**With X-World Pro**, set `packages.xworld_pro = true` (or say yes when `xearthlayer setup` finds it). XEarthLayer then leaves its own overlays out on the continents X-World Pro covers, keeps them everywhere else, and checks your scenery order and X-World Pro setup on every start. See [SimHeaven X-World Pro](/docs/x-world-pro/) for the install order and the ortho library.

{{< callout type="warning" >}}
Only X-World Pro is detected. With the free X-World, avoid duplicate roads by disabling XEarthLayer's overlays worldwide with `packages.disable_overlays = true`, or by disabling X-World's road layer. Do not run both.
{{< /callout >}}

### GeoReality Global Forests V2

[Global Forests V2](https://orbxdirect.com/product/georeality-forests-xp12) from Orbx provides scientifically accurate forest coverage worldwide. Real-world forest data has been analyzed to recreate authentic ecosystems with correct tree types, density, and height variations.

**Global Forests includes:**
- Over 400 unique forest files based on real-world analysis
- Accurate tree species placement by region
- Coverage for Europe, North America, South America, Asia, Oceania, and Africa
- Seamless integration with ortho scenery

This is a paid add-on available through Orbx Central.

{{< callout type="warning" >}}
If using both X-World and Global Forests V2, disable X-World's forest layer to avoid conflicts. Running both forest systems simultaneously may impact performance.
{{< /callout >}}

### X-Codr Airport Enhancement Package (AEP)

[Airport Enhancement Package](https://www.x-codrdesigns.com/xp-aepa) from X-Codr Designs dramatically improves the visual quality of default airports worldwide. Rather than adding new airports, AEP replaces existing textures and objects with high-quality alternatives featuring PBR materials and regional variations.

**AEP includes:**
- High-quality replacement models for airport buildings, hangars, and facades
- Ultra high-resolution pavement and marking textures
- New 3D vegetation matched to X-Plane 12's forest system
- Detailed static ground vehicles, runway lights, beacons, and navaids
- Weather-reactive ground textures using X-Plane 12's weather effects
- Regional variations giving airports a unique local character

AEP is compatible with other airport enhancement libraries and works seamlessly with ortho scenery. This is a paid add-on available from [X-Plane.org](https://store.x-plane.org/Airport-Enhancement-Package_p_1250.html).

### Short Final Design SFD Global

[SFD Global](https://store.x-plane.org/SFD-Global_p_1060.html) from Short Final Design enhances autogen buildings and landmarks across the globe with regionally appropriate variations. The package uses PBR materials and baked ambient occlusion for realistic rendering.

**SFD Global includes:**
- Eight distinct regional autogen styles: Africa & Middle East, Australia, East Asia, Mediterranean, New England, Scandinavia, South America, and US West Coast
- Unique 3D buildings with PBR materials for each region
- Detailed world-famous landmarks
- 4K photorealistic terrain and forest textures
- Seamless compatibility with ortho scenery overlays

This is a paid add-on available from [X-Plane.org](https://store.x-plane.org/SFD-Global_p_1060.html).

{{< callout type="info" >}}
When using SFD Global with XEarthLayer, we recommend installing only the Autogen and Landmarks components. The terrain textures and forests are unnecessary when using satellite imagery in combination with X-World or Global Forests.
{{< /callout >}}