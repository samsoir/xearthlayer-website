+++
title = 'XEarthLayer 0.4.6 released'
description = 'A friendlier setup wizard, hardened package installs, and an under-the-hood SSOT consolidation of GPU enumeration.'
date = 2026-05-10T12:00:00-07:00
author = 'XEarthLayer Team'
tags = ['release']
draft = false
+++

XEarthLayer 0.4.6 is now available. This one is mostly a polish and reliability release: the setup wizard does a better job of getting you to a tuned configuration on first run, the package installer is harder to wedge when something goes wrong on the network, and a chunk of internal duplication around GPU detection has been collapsed into a single source of truth that the wizard, the encoder, and the diagnostics report all share.

Grab the latest build from the [downloads page](/#download) or straight from the [GitHub release](https://github.com/samsoir/xearthlayer/releases/tag/v0.4.6).

## A more useful setup wizard

`xearthlayer setup` has been the recommended onboarding path for a while, but it left a lot on the table. It asked you for a cache directory and then handed you a fixed 40 GB recommendation regardless of how much disk you actually had, and it never mentioned that you could offload DDS encoding to a secondary GPU. New users were unlikely to discover those settings on their own, and a few wizard runs ended with people manually editing `config.ini` afterwards anyway.

This release reworks the wizard around what your hardware actually looks like. The cache step ([#154](https://github.com/samsoir/xearthlayer/issues/154)) now asks for the disk budget with a default that is 25% of free space at your chosen cache directory, floored to the nearest 10 GB. The DDS-to-chunks ratio and the memory cache size are prompted in the same step, with the memory default sized as `RAM ÷ 12` clamped to a 500 MB to `RAM ÷ 4` band. That formula is intentional: the memory cache is a small request absorber, not a working set holder, because the DDS disk cache is what actually holds the working set of tiles. The previous tiered defaults handed out memory cache sizes that were several times larger than the absorber actually needs.

There is also a new step for DDS encoding ([#153](https://github.com/samsoir/xearthlayer/issues/153)). When two or more GPU adapters are detected, the wizard offers to offload encoding to a secondary GPU and warns explicitly against picking the GPU that X-Plane uses for rendering, since that path causes frame drops rather than buying you anything. Single-GPU systems silently keep the safe ISPC default. Adapter enumeration runs behind a spinner because wgpu can take 10 to 30 seconds probing drivers on multi-GPU hosts, and silence there used to look like a freeze.

If you are using a third-party overlay scenery package such as SimHeaven or Prefab Objects and have been fighting with overlay collisions, there is also a new `packages.disable_overlays` runtime control ([#152](https://github.com/samsoir/xearthlayer/issues/152)). When set to `true`, `xearthlayer run` removes XEL's consolidated overlay symlink folder from Custom Scenery on startup. Your overlay packages stay downloaded and cached locally; only the symlink that X-Plane reads is suppressed. Flip the flag back to `false` and restart, and the overlays come back without re-downloading anything. It is deliberately a runtime control rather than a download-time one, so you can A/B between XEL overlays and a third-party set without paying the bandwidth cost each time.

## Package installs you can actually trust

A few related defects on the install path got cleaned up at the same time.

The big one was that a single failed part download could quietly hang an install ([#187](https://github.com/samsoir/xearthlayer/issues/187)). Previously, when a part exhausted its retries, the rest of the workers would keep running and the user got a process that needed Ctrl-C to recover, often with no clear explanation of what had gone wrong. The orchestrator now sets a shared abort flag on the first hard failure and other workers exit at their next abort check. The temp directory holding partial downloads is wrapped in a guard that wipes it on every exit path, including panics, so you no longer end up with leaked partial files in `/tmp`. The user-facing error names the part that failed, the underlying error message, and a count of any other parts that failed before the abort cascade finished. Same goes for `concurrent_downloads = 1` users, who used to hit a separate code path with no per-part retry and no progress reporting; that path is gone now and everyone goes through the same single semaphore-bounded implementation.

The installer also now does a pre-flight disk space check ([#188](https://github.com/samsoir/xearthlayer/issues/188)). After the package metadata comes back from HEAD requests but before any bytes hit the network, the installer asks "is there enough space at `packages.install_location` for this?" and either proceeds or fails fast with an actionable error message. This particularly matters for atomic distros like Bazzite, Silverblue, Kinoite, and SteamOS, where `df /` reports `100%` as the steady state because the rootfs is intentionally sized to its content. Diagnostics now annotates that line as "normal on atomic distro" when it detects an ostree-deployed root, and it reports cache and packages locations with available bytes alongside used so you see the number that actually matters.

And finally, file-level logging now initialises for every CLI subcommand instead of just `run` ([#194](https://github.com/samsoir/xearthlayer/issues/194)). If a `packages install` failed in the past, `xearthlayer.log` was empty. It is no longer empty. Structured tracing across the install pipeline emits INFO events at every stage transition (metadata, download, reassembly, extraction, completion) and DEBUG/WARN/ERROR around per-part attempts and retries. The next time something goes wrong on someone's install, the log file is the first place to look.

## A single source of truth for GPU detection

While building the wizard's GPU step, three places in the codebase turned out to be doing the same `wgpu::Instance::new + enumerate_adapters` dance with their own slight format differences: the encoder, the diagnostics report, and (newly) the wizard. They have been collapsed into a single `system::gpu` module ([#198](https://github.com/samsoir/xearthlayer/pull/198)) that everyone now calls. The wizard's adapter-to-config-string mapping (`config_value`) and the encoder's config-string-to-adapter mapping (`find_adapter`) are mathematical inverses, and they are now locked together by a round-trip property test that catches any drift if either side changes.

This is mostly invisible to users, but it is the kind of consolidation that matters for the next person who has to add a new GPU device type or change the keyword the encoder accepts. The selector keyword (`integrated` or `discrete`) is preferred when the GPU type is unique within the detected set, and the adapter name substring is used otherwise. Dual-discrete render farms get a config value that names the specific card.

A handful of smaller cleanups went in alongside: sensitive credentials in `provider.google_api_key` and `provider.mapbox_access_token` are now masked as `xxxxxxxx` in `xearthlayer config list` so the command output is safe to paste into bug reports ([#162](https://github.com/samsoir/xearthlayer/issues/162)), with the diagnostics report's redaction sharing the same predicate so the two surfaces stay in lockstep. The Google provider tile session parser was also rewritten on `serde` ([#163](https://github.com/samsoir/xearthlayer/issues/163)), which correctly rejects malformed responses that the previous string-search parser would silently misinterpret.

## Upgrading

Binaries are on the [downloads page](/#download). Configuration files remain compatible; there is nothing you need to change on your end to upgrade. If you do want to take advantage of the new wizard prompts on a host you have already configured, `xearthlayer setup` will offer to back up your existing `config.ini` and reconfigure from scratch. Existing config keys are preserved when compatible.

If you hit anything unexpected, the [Discord](https://discord.gg/RPEWQZdxm2) and [GitHub issues](https://github.com/samsoir/xearthlayer/issues) are the fastest way to reach us. Thanks as always to everyone running pre-release builds and sending logs back.
