+++
title = 'XEarthLayer 0.4.5 released'
description = 'A small patch release that stops failed chunk downloads from poisoning the tile cache with magenta-filled DDS tiles.'
date = 2026-05-05T12:00:00-07:00
author = 'XEarthLayer Team'
tags = ['release']
draft = false
+++

XEarthLayer 0.4.5 is now available. This is a small patch release that fixes a caching bug ([#180](https://github.com/samsoir/xearthlayer/issues/180)) where a network failure during tile generation could produce magenta-filled DDS tiles that were structurally valid and got written into both the memory and DDS disk caches, surviving even an X-Plane "Reload Scenery". On reconnect, re-requests short-circuited to the poisoned entry instead of re-fetching. Cache writes are now gated on every chunk completing successfully: incomplete tiles are still served to X-Plane so the sim does not stall during an outage, but they are no longer persisted. The chunk-disk tier was already correct, so it now acts as a natural retry-resume buffer, with only the previously failed chunks being re-fetched on re-request. If you saw magenta tiles persist across an outage on 0.4.4 or earlier, run `xearthlayer cache clear` to purge any poisoned tiles. Grab the build from the [downloads page](/#download) or the [GitHub release](https://github.com/samsoir/xearthlayer/releases/tag/v0.4.5).
