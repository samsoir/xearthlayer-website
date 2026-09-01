+++
title = 'XEarthLayer 0.4.7 released'
description = 'The memory release. Long flights memory usage no longer grows until the system kills it. Plus faster texture serving, cleaner distant terrain, and a round of polish driven largely by community bug reports.'
date = 2026-08-31T12:00:00-07:00
author = 'XEarthLayer Team'
tags = ['release']
draft = false
+++

XEarthLayer 0.4.7 is now available. This is the memory release. If you fly long legs and have watched XEarthLayer's memory footprint climb hour after hour until something gave, this is the build that fixes it.

Grab it from the [downloads page](/#download) or straight from the [GitHub release](https://github.com/samsoir/xearthlayer/releases/tag/v0.4.7).

This release also carries a large amount of polish, much of it driven by community bug reports and pull requests.

## The memory problem. What was actually going wrong?

The symptom was simple to describe and miserable to diagnose. On long flights XEarthLayer's memory grew steadily and never came back down. One twelve-hour flight ended with the operating system killing the process at 64 GB, against a configured memory cache of 4 GB. The reason it was so hard to find is that nothing was leaking. Once telemetry was added to look directly at the C allocator, the bytes actually in use turned out to be flat at 572 to 725 MB across an eighteen-fold increase in work. Every texture, chunk and buffer was being freed correctly. What grew was the allocator's retention of memory it had already been given back.

_glibc_, the C library XEarthLayer runs on under Linux, gives threads separate heap arenas so they are not all contending for one lock. It returns memory to the operating system only by trimming the top of an arena. If anything is still live above a freed block, the space below it stays committed for the life of the process. So an arena grows to cover the worst burst it ever saw and never gives that back, and the process total is the sum of every arena's personal high-water mark. With a default ceiling of eight arenas per CPU core, each new burst of work could recruit fresh arenas that had never seen a peak.

Rare traffic peaks were being converted into permanent floor, one arena at a time. That is why it looked like a leak, why it scaled with flight length, and why nothing in XEarthLayer's own code ever looked wrong.

Three separate mechanisms were feeding it, and all three are fixed:

- A generated texture is 11.17 MiB. glibc decides whether to serve an allocation that size from an arena or by `mmap`, and only the `mmap` path returns memory on free. The threshold that makes that decision adapts *upward* every time a large block is freed, and it passes 11 MiB after a single tile. It is now pinned, at a measured cost of 0.16 ms per tile.
- The thread pool that carries texture encoding and disk writes was accepting the async runtime's default ceiling of 512 threads, and had been observed at 581 threads. Every excursion up ratcheted the high-water mark. It is now sized from the work that actually queues on it.
- The arena count itself is now capped. Once each arena has seen its worst burst, there are no fresh ones left to recruit, and the total converges instead of climbing.

The numbers, measured across two matched eleven-hour flights on the same route between FAOR and EGLL before and after:

| | before | after |
|---|---|---|
| Committed memory | 11,580 MB | **9,687 MB** |
| Allocator retention | 6,091 MB | **4,038 MB** |
| Swap in use | 1,063 MB | **533 MB** |
| Growth steps after initial sizing | 18 | **1** |
| Throughput | 3.06 textures/sec | 3.03 textures/sec |

The last row matters as much as the first: this costs you essentially nothing in throughput. And the single remaining growth step is the point, because the previous behaviour was eighteen steps and still climbing at hour eleven.

If you already tune your allocator by hand, all of this defers to you. Setting `MALLOC_MMAP_THRESHOLD_`, `MALLOC_ARENA_MAX`, or a `GLIBC_TUNABLES` entry in the environment leaves XEarthLayer's own settings out of the way.

These fixes are specific to Linux's GNU C library. macOS uses a different allocator entirely, so it is unaffected by this bug and, for now, not covered by the fix either. Evaluating a cross-platform allocator is on the list for 0.5.0, which is also when the first macOS supported version of XEarthLayer is due to ship.

## What to expect on your first flight after upgrading

There are two changes here that are entirely expected but will look like regressions. Both only affect the first flight or two after you upgrade from 0.4.6.

**Your texture cache will partly rebuild itself.** This release corrected how mipmaps are written into generated textures, which changed their size. Every texture cached by 0.4.6 is the wrong size for this build. Previously those were caught at the last moment and replaced with a magenta placeholder, and because nothing ever deleted them, they came back as magenta on every subsequent request, unless you cleared the cache by hand. They are now detected, discarded and regenerated properly the first time they are read. The cost is one cache rebuild on the first flight in 0.4.7.

**Magenta placeholders may appear a little sooner.** When a texture cannot be produced in time, XEarthLayer serves a magenta placeholder rather than making X-Plane wait. That limit is the `generation.timeout` setting defaulted to 10 seconds. Previously the value never actually reached the code, which instead used a hardcoded 30 seconds. The configuration setting is now honoured. Combined with the cache rebuild above, your first flight after upgrading is where you are most likely to notice.

## Faster texture serving, and cleaner distant terrain

X-Plane reads roughly 4% of each generated texture, in two calls. Delivering it used to copy the entire 11.17 MiB, several times over: out of the memory cache, through two layers of request handling, and once more per reply, even when the bytes were already sitting in memory. Textures are now reference counted from the cache all the way to the kernel, so a read borrows the tile and slices out the part that was asked for. Measured over an eleven and a half hour flight, the read path handled exactly the bytes it delivered at every one of 690 samples, against 25.6 times as many before.

Distant terrain also looks better. Generated textures were being written with only part of their mipmap chain, which produced a moiré or striped pattern on distant tiles that vanished when you flew closer. That was reported and then fixed by a community contributor, and the fix is in this release.

## Prefetch stops writing regions off

Two related defects meant prefetch could permanently give up on scenery it should have kept trying for.

The first was that a region which was merely _slow_ got treated identically to a region that genuinely had no scenery. Both went down the same retirement path, so a region that had not finished loading yet was written off after three attempts and never retried. Those two states are now distinguished. A region is only retired when the scenery index genuinely attributes zero tiles to it. A region that stalls with tiles still outstanding is instead deferred on a short escalating ladder, so its tiles stay retryable, and an on-demand request from the simulator clears the deferral immediately.

The second was subtler. When no scenery index was loaded at all, the check for "does this region have tiles?" returned "no tiles!", which is indistinguishable from having actually looked and found nothing. Regions were being retired on the strength of no evidence whatsoever. If you fly without installed ortho packages, that is why your region counts looked the way they did. Not being able to tell is now distinguished from having checked, and only the latter retires a region.

## Settings that never did anything, removed

Four configuration keys were being parsed, validated and reported back by `xearthlayer config list`, while the value never reached the code they named.

Three of them (`executor.network_concurrent`, `executor.cpu_concurrent` and `executor.disk_io_concurrent`) set resource pool sizes. Those sizes are derived from your processor by a formula tuned through flight testing, and they turned out to be load bearing for the memory work above, so exposing them as settings was a way to undo that work by accident. `config list` had compounded the problem by printing values computed from a second formula that disagreed with the one actually in use.

The fourth (`cache.disk_io_profile`) selected an HDD, SSD or NVMe profile whose result nothing consumed. Storage detection itself is unaffected and still appears in `xearthlayer diagnostics`.

Your configuration file will still load if it contains any of these keys, and `xearthlayer config upgrade` removes them for you.

## Diagnostics you can actually file a bug with

`xearthlayer diagnostics` could hang forever. It measured the cache directory by walking the entire tree, and on a multi terabyte cache that never finished, so the report never printed. Since the bug report template asks you to paste that output, this had the unfortunate effect of blocking people from filing bug reports at all. The measurement is now bounded and reports the size as unmeasured if it runs out of time, rather than the whole report failing to appear.

Also on the reliability side: Arch and CachyOS packages build again. The release pipeline had been rebuilding the package definition from scratch rather than using the one in the repository, and that copy was missing the flag which disables link time optimisation, so the build failed with every symbol undefined. The duplicate is gone, and the package is now compiled in CI with a stock Arch configuration, which means a package definition that cannot build can no longer ship.

## Thank you

This release came together considerably faster and in better shape than it would have alone, and a lot of that is down to people outside the core project.

Particular thanks to [@mmaechtel](https://github.com/mmaechtel), whose contributions to 0.4.7 are all over this release. They reported the moiré artefact on distant tiles and then submitted the fix for it. They found that several configuration settings were reported by `config list` but never reached the runtime, and submitted that fix too. They reported that diagnostics could hang indefinitely on a large cache, and fixed that as well. And they filed the report that led to the resource pool settings being removed, which closed off a way for a configuration file to silently undo the memory work. Three merged pull requests and four issues in a single release cycle is a remarkable contribution, and the pattern of "find it, diagnose it, fix it, send the patch" is about as good as open source collaboration gets.

Thanks also to [@goon818](https://github.com/goon818) for reporting the Arch package build failure, and to everyone who ran the alpha, beta and release candidate builds through long flights and sent logs back. The memory fixes in particular were only verifiable by flying for eleven hours at a stretch and comparing traces, and that is not something that can be done from a desk.

If you are using XEarthLayer and something looks wrong, please do say so. Several of the fixes above started as somebody describing an odd symptom on Discord.

## Upgrading

Binaries are on the [downloads page](/#download). Configuration files remain compatible and nothing needs changing on your end. If your config contains any of the removed keys, `xearthlayer config upgrade` will tidy them up, though leaving them in place is harmless.

Expect one slower flight after upgrading from 0.4.6 while the texture cache rebuilds itself, as described above. After that, long flights should hold a steady memory footprint rather than climbing.

The [Discord](https://discord.gg/RPEWQZdxm2) and [GitHub issues](https://github.com/samsoir/xearthlayer/issues) are the fastest ways to reach us.
