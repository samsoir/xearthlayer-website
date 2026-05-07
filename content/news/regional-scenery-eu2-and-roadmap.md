+++
title = 'Regional scenery update: EU-2 ships, and what is next'
description = 'EU-2 reaches into eastern Europe and European Russia, the rest of Asia and Antarctica are in production, and a roadmap toward smaller packages, new zoom-level tiers, and SimHeaven X-World Pro support.'
date = 2026-05-06T12:00:00-07:00
author = 'XEarthLayer Team'
tags = ['update','scenery','roadmap']
draft = false
+++

The **EU-2** package is live. It picks up where EU left off and extends coverage across Greece, Bulgaria, Romania, Moldova, Ukraine, Belarus, the Baltic states, Finland, Sweden, Norway, Turkey, Cyprus, Georgia, Armenia, Azerbaijan, and European Russia out to the Ural Mountains. Between EU and EU-2, the European side of the map is now contiguous from the Atlantic to the Urals.

## What is in production now

With Europe filled in, focus shifts to the rest of Asia. That covers a long list of countries currently in production: Russia (the asian portion), China, Mongolia, the Central Asian "-stans", Iran, Iraq, Kuwait, the UAE, Qatar, Saudi Arabia, Jordan, Syria, Israel, Palestine and the West Bank, and India, among others. Once Asia is wrapped, **Antarctica** comes in as the seventh and final continent, closing the global coverage loop.

Russia is, predictably, the hardest piece of this. It is just enormous, and even chopping it into producible chunks is a non-trivial planning exercise on its own, the splits have to make sense as downloads, render reasonably in X-Plane, and not leave ugly seams across regions that real flights routinely cross.

That production work also fed back upstream. While chasing stability problems with very large area generation, we landed [a fix in Ortho4XP](https://github.com/shred86/Ortho4XP/pull/90) that improves reliability when producing the kind of huge regions Russia forces on us. It is a small contribution, but it makes the rest of the Asia work materially less painful, and anyone else producing scenery at that scale benefits too.

## Smaller packages

One of the biggest pieces of feedback from EU and the larger regional packages has been disk pressure. The current shape of things asks users to keep up to ~250 GB free just to install. That is a non-starter for a lot of laptop pilots and even some desktop setups, and it discourages people from trying packages outside their primary flying area.

The plan is to cap individual downloadable packages at **~20 GB** going forward. North America, Asia, Europe, Africa, and Antarctica will all be reshaped into smaller collections under that cap. Users should land closer to **~50 GB free** required to install, picking up only the slices they actually fly. The existing large packages will be reworked to match.

## 7z compression

Future packages will ship with 7z (LZMA2) compression instead of the current format. The realistic savings depend on what is inside any given package. Already-compressed imagery does not give up much regardless of algorithm, but the metadata and uncompressed payloads should see meaningful gains. The working estimate is roughly another **third off** typical package size, which we will firm up once the first 7z-built packages go through the pipeline.

## A clearer zoom-level story

Today, most packages mix ZL16 and ZL18. Broad ZL16 coverage with ZL18 patches around airports. Anyone who has flown a few hours over a covered region knows the visible side effect: a striping seam where the two zoom levels meet, usually visible on approach into a covered field. That artifact is not a bug in any single package; it is a consequence of mixing two zoom levels in one footprint. The striping deserves its own focused write-up later, with screenshots and the geometry behind it.

The fix is to commit to a single zoom level per package and build out three tiers:

- **ZL14 — SD.** Aimed at pilots running 4–8 GB VRAM GPUs and anyone on a metered or slower connection. Lower bandwidth, lower VRAM pressure, still a meaningful step up from default scenery.
- **ZL16 — HD.** The mainline tier. Comfortable on anything with 12 GB of VRAM or more. This becomes the default global option.
- **ZL18 — UHD.** Future-proofing for high-end setups, likely a later-in-2026 effort once the rest of the optimisations are in place. Expect very high data usage; the working guidance is a 5 Gbps+ connection and a 32 GB VRAM GPU.

Single-zoom packages also remove the striping artifact as a side effect, because a package can no longer disagree with itself about how detailed a given area should be.

## SimHeaven X-World Pro

Finally, [SimHeaven X-World Pro](https://simheaven.com/x-world-pro/) is on the way, and XEarthLayer is getting first-class support for it. Concretely, that means a configuration option to suppress XEarthLayer's own overlays in scenarios where X-World Pro is providing them — cities, landmarks, national parks, monuments — so the two products complement rather than fight each other.

That is the day-one shape of the integration. Once X-World Pro actually ships and we have hands on it, the goal is tighter coordination beyond just "stay out of each other's way", but it is hard to predict what that looks like in detail until it is in front of us. The headline is that XEarthLayer and X-World Pro are designed to be **complementary** upgrades to X-Plane, not competing ones, and the configuration plumbing will be there from the moment X-World Pro is available.

More to come as each of these lands.
