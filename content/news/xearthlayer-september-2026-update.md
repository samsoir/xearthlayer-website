+++
date = '2026-09-26T00:00:00-07:00'
draft = false
title = "September 2026 Update"
description = "XEarthLayer 0.5.0 in active development while the entire globe is currently being rebuilt, all powered by the Sun."
author = 'XEarthLayer Team'
tags = ['dev diary','xplane','scenery','roadmap','apple']
+++

{{< lead >}}
After a long summer break, XEarthLayer is now under active development once again. The next version will be 0.5.0, expected in mid-November if nothing unexpected comes up. This new version will deliver multiple improvements and new features; some that will be very visible and others that you should not see at all.
{{< /lead >}}

![Screenshot from X-Plane showing a clear daytime view of Pacifica, CA coastline and Pacific Ocean from 2000ft above sea level, looking south towards Half Moon Bay](/images/news/0.5.0-scenery-coastline.jpg)

## Apple Mac (with Apple Silicon) support is arriving

XEarthLayer will now provide native Apple Mac (with Apple Silicon) pre-built binaries in version 0.5.0. This has been made possible by the very generous contributions of [Duane Licudi](https://github.com/dlicudi) who graciously did the hard work of porting the existing FUSE implementation to MacFUSE.

XEarthLayer on the Mac will require users to install MacFUSE and enable the kernel extension in macOS in order to use this software. A [useful guide](https://github.com/samsoir/xearthlayer/blob/develop/0.5.0/docs/macos.md) to help users get up and running has been provided.

There is an active effort to explore whether we are able to use Apple's own FSKit to provide a virtual filesystem in userspace in place of MacFUSE. If this is successful, the kernel extension workflow will no longer be required. This will likely not materialize until a version after 0.6.0.

## Smaller scenery packages

One major complaint that we have received from you is that the scenery packages are too large, take too long to download and occupy too much space on your disk. Unfortunately we have been unable to shrink the entire Earth down to make it smaller, but we have been able to use better compression for the packaged DSF files.

Since version 10, X-Plane has had native support for DSF files that are compressed with the LZMA (7z) compression algorithm. This means that XEarthLayer can significantly reduce the total package size for each regional scenery package by roughly **32%**. If you have the entire globe installed on your system, this change will reduce the hard disk space needed by over **120GB**. Hopefully a welcome optimization for all of us in these component shortage times we find ourselves in.

The entire world will get new regional scenery packages alongside the 0.5.0 release once they are available. The best news is that these compressed DSFs are backwards compatible with all prior versions of XEarthLayer, ensuring that even if you do not upgrade you can still take advantage.

## More scenery improvements

![Screenshot from X-Plane showing a clear daytime view of the San Francisco Bay shoreline near SFO airport.](/images/news/0.5.0-scenery-shoreline.jpg)

In addition to better compression, we have also added improved support for [X-World Pro](https://simheaven.com/x-world-pro/), ensuring XEarthLayer plays nicely with this spectacular paid add-on for X-Plane 12. XEarthLayer will now defer to X-World Pro for overlays, and provide the option for you to disable certain layers in X-World Pro, such as agriculture, in order to improve the visual fidelity of the scene.

Additionally, we have been working hard to fix a number of the water masking issues that you have reported, and can confidently say that coastlines and archipelagos look spectacular in the new scenery packages.

## Behind the scenes

Beyond the visual enhancements and Apple Mac support, 0.5.0 also changes much of the structural foundation of the system in order to set us up for some exciting new features down the road. The net result of this work is that the monolithic binary that is XEarthLayer is being split up into a number of sub-components. This work will separate the user interface (whether TUI or GUI) from the core service that is providing the scenery to X-Plane. In the future this will make it easier to build a native GUI for common Linux Desktop Environments as well as a native Apple Mac GUI implemented in Swift. As these changes were being developed, we realized that this will also unlock support for remote processing of imagery on a separate computer from the simulator.

More on this to come in the future.

Outside of major architecture changes, we have also implemented the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/latest/) for all of our resources, ensuring that XEarthLayer remains a good neighbor on Linux and Mac systems. If you are coming from a prior version, the first time you run the application after upgrading to 0.5.0 it will offer to migrate all of the relevant configuration and assets to the new locations for you. Of course, if you want to leave them right where they are, we support that too. For all new installs, the XDG Base Directory Specification will be the standard, but as always configurable by you to use any location you want.

There are many other smaller optimizations and enhancements planned for 0.5.0. More information will be provided closer to release time.

## Powered by the Sun

![Two rows of solar panels in a grassy plain, surrounded by California native trees. The sky is clear and the sun is setting out of the frame to the left.](/images/news/solar-panels.jpg)

Did you know that XEarthLayer development is powered by the Sun? The home of the lead developer has 14kW of photovoltaic generating capacity, providing the house with up to 100kWh of energy per day. Supporting these panels are 44kWh of battery storage, ensuring that even after the sun sets, development is still powered by clean, renewable electricity. Naturally, this solar array was not created to support XEarthLayer development, as it also charges two electric vehicles, powers the house and provides cooling or heating through the heat pumps. However, every hour spent developing XEarthLayer at this location has been powered by 100% clean renewable solar energy, regardless of the time of day the work has been completed.

![XEarthLayer California based servers that run on solar energy day and night](/images/news/homelab.jpg)

This includes the creation of all of the regional scenery packages that are compiled and packaged right here on site in California. There are two dedicated Framework servers (the two 1U servers at the top of the image) working tirelessly day and night to produce the new packages for 0.5.0. 100% of their power is provided by the solar array and connected batteries; they have no direct grid connection.

We cannot account for the electricity our ISP, the data networks, Anthropic, GitHub, Google, Apple and so on use. Therefore this is not in any way claiming that XEarthLayer is completely carbon-neutral. But we are doing our part as best we can.

---

Screenshots shown were captured in X-Plane 12.4.4-beta.1 running on CachyOS Linux Kernel 7.2.6-1. XEarthLayer version used was 0.5.0-dev, with additional scenery provided by X-World Pro. They have not been altered in any way.