+++
title = 'XEarthLayer 0.4.8 released'
description = 'Prebuilt packages install again on Ubuntu, Debian and RHEL. Building from source now says what it actually needs. Nothing in the running program changed.'
date = 2026-09-01T14:00:00-07:00
author = 'XEarthLayer Team'
tags = ['release']
draft = false
+++

XEarthLayer 0.4.8 is available from the [downloads page](/#download) or the
[GitHub release](https://github.com/samsoir/xearthlayer/releases/tag/v0.4.8).

Nothing about how XEarthLayer runs has changed in this release. It exists
because installing it was broken for anyone not on a recent distribution of
their Linux system.

## Packages install again on older distributions

The Debian package and the Linux tarball required glibc 2.39, so they would not
start on anything older than Ubuntu 24.04. Ubuntu 22.04 LTS, Debian 12 and
RHEL 9 were all affected, and the failure was an unhelpful message about libc6
being out of date.

Our release binary is built on a machine image supplied by GitHub, and when that 
image moved from Ubuntu 22.04 to 24.04, the requirement changed unexpectedly. 
Both packages are now built in a pinned environment, which lowers the
requirement to glibc 2.34 and covers those distributions again. A check now
fails the release outright if that requirement ever creeps up, so this cannot
happen quietly again.

## Building from source with improved feedback

XEarthLayer needs a recent Rust compiler, more recent than most distributions
package. Building with an older one stopped at a code formatting error about an
unrelated function, which read as though something was wrong with our source
rather than with the toolchain. Building now stops immediately and names the
version it requires.

Installing from source also ran the full contributor test suite first, which
meant a formatting detail in code you did not write could block your install.
It no longer does.

The [getting started guide](/docs/getting-started/) now covers what building
actually requires, and leads with the packaged installs for everyone who does
not need to build at all.

Thanks to the user who reported this by email, and for the patience to keep
going through several failed attempts before writing in.
