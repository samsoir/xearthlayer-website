---
title: "X-Plane 12 Configuration"
description: "How to configure X-Plane 12 for the best results"
weight: 30
---

Ensure your X-Plane configuration is setup correctly for XEarthLayer to operate optimally. For most users with an existing well tuned X-Plane system, XEarthLayer should not impact framerates significantly.

## Scenery Ordering

Setting the scenery pack order in your `X-Plane 12/Custom Scenery/scenery-packs.ini` file is essential to ensure all of your scenery loads with the correct priority relative all others.

### Scenery Pack Loading Order

![Scenery pack loading order](/images/docs/scenery-layers.svg)

XEarthLayer uses a best effort attempt by using a specific naming convention to ensure scenery is ordered correctly in X-Plane's scenery pack file. XEarthLayer scenery files are all prefixed `zzXEL_<ortho>` or `zyXEL_<overlay>`.

When X-Plane launches for the first time after any change to the Custom Scenery folder, it rebuilds the scenery-packs.ini file based on the scenery packs available. It is likely that this process will result in incorrect ordering of the scenery packs installed. 

Ensure you exit from X-Plane before starting a flight, then use the reference below to order your scenery correctly in the scenery pack file.

```ini
I
1000 Version
SCENERY

SCENERY_PACK Custom Scenery/{Airports, landmarks, other object based scenery}
SCENERY_PACK Custom Scenery/{Airport Overlays}
SCENERY_PACK Custom Scenery/{Airport Mesh}
SCENERY_PACK Custom Scenery/{Sim Heaven X-World, other layers (SFP Global etc)}
SCENERY_PACK Custom Scenery/X-Plane Airports
SCENERY_PACK *GLOBAL_AIRPORTS*
SCENERY_PACK Custom Scenery/X-Plane Landmarks

# XEarthLayer Start
SCENERY_PACK Custom Scenery/zyXEL_<region>_<overlay>
{...}
SCENERY_PACK Custom Scenery/zzXEL_<region>_<ortho>
{...}
# XEarthLayer End

SCENERY_PACK Custom Scenery/{Libraries}
```

## X-Plane Graphics Settings

X-Plane 12 offers extensive graphics customization, but pushing every slider to maximum will overwhelm even high-end systems. Finding the right balance ensures smooth framerates while still enjoying XEarthLayer's satellite imagery.

### Settings That Matter Most

**Texture Resolution** — This directly correlates with your GPU's VRAM capacity. If you exceed your available VRAM, X-Plane will constantly swap textures in and out of memory, causing stutters. As a general guide:
- 8GB VRAM: Medium to High
- 12GB+ VRAM: High to Maximum

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

## Recommended Add-ons