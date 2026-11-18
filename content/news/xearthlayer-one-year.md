+++
title = 'XEarthLayer turns one'
description = "A look back at XEarthLayer's first year of streaming ortho scenery for X-Plane 12, and a peek at what's coming next."
date = 2026-11-18T00:00:00-08:00
author = 'XEarthLayer Team'
tags = ['anniversary','dev diary']
images = ['/images/news/xearthlayer-one-year-card.jpg']
draft = false
+++

![XEarthLayer Birthday Cake with a single candle on a plate with a fork](/images/news/xearthlayer-cake.webp)

{{< lead >}}
Today marks the first anniversary of XEarthLayer's development. Over the last year, the project has gone from strength to strength through five significant versions, steadily improving a Rust-based solution for streaming ortho scenery in X-Plane 12.
{{< /lead >}}

XEarthLayer is a project born from frustration: frustration with the experience of flight simulation on Windows 11. In the spring of 2025, after a failed Windows update, my main simulator PC decided to brick itself, taking its NVMe drive with it. It was time to do something different. I bought a new SSD, downloaded CachyOS and started to build a simulator on Linux. To my surprise, not only was it quick and easy to get set up, it was actually better. CachyOS felt modern, fast and responsive in every way Windows 11 does not. X-Plane 12 seemed to run more smoothly. It just worked.

What did not "just work" were the streaming ortho scenery solutions I had relied on in Windows. One very popular option was not available on Linux, and AutoOrtho, which I was also a fan of, just did not work without a lot of messing around. Given that everything else was so easy, getting a working streaming ortho solution was frustratingly hard. So I started to sketch out a design for a Rust-based system that would do the same job as AutoOrtho, but as a Linux-friendly command-line tool optimized for modern CPUs and GPUs, with modern memory management.

On November 18, 2025, the [first commit](https://github.com/samsoir/xearthlayer/commit/66a713b2bb27bc8b222fafa1848e0cc0ba10f802) that set up the scaffold for XEarthLayer was pushed to GitHub. The following week, I took time off work for Thanksgiving, drove to Palm Springs and sat by the pool with my laptop, building the first prototype of XEarthLayer. By November 25, a week after that first commit, the [first working proof of concept](https://github.com/samsoir/xearthlayer/commit/ccfd437dde632bb029e8d4ad1147d417fe45108e) was running in X-Plane 12.

![Plane flying over Oakland, CA at night with the Bay and Berkeley and Richmond in the distance](/images/news/night-lighting-0.5.1.webp)

In the year since that trip to Palm Springs, XEarthLayer has continued to improve. It has become faster and more efficient, and it has gained a number of new features along the way:

- Cache pre-warming to speed up initial load times in the simulator
- Many iterations of the [prefetching system](https://github.com/samsoir/xearthlayer/blob/main/docs/dev/adaptive-prefetch-design.md), which loads tiles [ahead of the simulator](https://github.com/samsoir/xearthlayer/blob/main/docs/dev/xplane-scenery-loading-whitepaper.md)
- [GPU acceleration](https://github.com/samsoir/xearthlayer/blob/main/docs/dev/gpu-encoding-design.md) for image encoding
- More recently, [macOS support](https://github.com/samsoir/xearthlayer/blob/main/docs/macos.md) and [native night lighting](https://github.com/samsoir/xearthlayer/blob/main/docs/dev/night-lighting-design.md) that uses X-Plane's own lighting engine

The biggest change to XEarthLayer over the last year, however, is you, the community. What started as a simple project to solve my own particular problem found an audience, both as users and as contributors to the project. XEarthLayer now has multiple community members contributing features, reporting bugs and helping test builds. Collaborating with others on XEarthLayer has been the most delightful part of the development process over the last six months. As we pass the first anniversary, I want to extend my biggest thanks to everyone who has contributed to this project over the past year.

Looking ahead, I find myself in familiar territory. In a couple of days, I am driving back to Palm Springs to sit by the same pool and start thinking about the future of XEarthLayer.

New features on my to-do list include native Windows 11 support, a system service wrapper for the core, an optional graphical user interface for controlling XEarthLayer, more improvements to night lighting and much more, all to think about while enjoying the festivities in Southern California.

![Ortho4 XEarthLayer Orchestrator (OXO) web interface, presenting the Earth with colored regions for each XEarthLayer regional scenery package, which are listed in a table view on the right hand side](/images/news/oxo-interface.webp)

Finally, some of you may know that XEarthLayer now has a companion tool called OXO, which is rapidly approaching the point where I am happy to release it. OXO will let anyone produce night-lit tiles for XEarthLayer and quickly build world-scale scenery packages using highly distributed compute running on Kubernetes or Podman. With OXO's release, the specification for the night-lighting recipe will be published, allowing any third party to use this feature in their own projects.

What a first year this has been. A bricked PC, a week by the pool, five versions and a community I never anticipated.

If you haven't tried XEarthLayer yet, grab the [latest release](https://github.com/samsoir/xearthlayer/releases/latest) and take it for a spin. If you have, I'd love to hear what you want to see in year two, so [open an issue](https://github.com/samsoir/xearthlayer/issues) and tell me.

Now, time for a slice of cake and a beer by the pool in Palm Springs. Here's to an equally active second year, and blue skies!

— Sam
