---
title: "About"
description: "The story behind XEarthLayer and the people who made it possible."
weight: 60
---

## The Project

XEarthLayer was created to solve a fundamental problem in flight simulation: the trade-off between visual fidelity and storage requirements. Traditional ortho photo scenery requires downloading terabytes of satellite imagery before you can fly, and you end up storing data for places you may never visit.

XEarthLayer takes a different approach—streaming satellite imagery on-demand, exactly when and where you need it.

## The Author

XEarthLayer was created by Sam de Freyssinet in 2025. Sam has been a flight simulator enthusiast for much of his life, ever since his first encounter with Microsoft Flight Simulator 2.0.

After an extended hiatus from flight simulation between 2000 and 2013, Sam returned to his passion. After a couple of years in the Prepar3D ecosystem, he migrated to X-Plane at the tail end of version 10.

Since rediscovering his passion for flying virtually, Sam started flight training for his real private pilot's license in 2016.

When not piloting virtual or real aircraft, Sam works as a Software Engineering Director at a well-known tech company in the San Francisco Bay Area. He likes to snowboard with his children, cycle, and travel.

## Motivation

In the summer of 2025, after many years of running his flight simulator on Microsoft Windows, Sam decided to migrate to Linux. Many factors drove this decision, but the catalyst was Windows 11 corrupting his main system NVMe drive after a routine update.

After successfully rebuilding his flight simulator on Linux and installing X-Plane 12, Sam was disappointed to find that the tools he had previously used for streaming orthophoto scenery into X-Plane were not available on the platform. One only supported Windows, while the other, AutoOrtho, was no longer maintained.

Given the situation, Sam decided to try and fix [AutoOrtho](https://kubilus1.github.io/autoortho/latest/) on his own system but did not make much progress. Taking a step back, he asked the fateful question: _how hard would it be to port AutoOrtho to Rust?_ As it turns out, quite hard—but not impossible.

XEarthLayer shares no code with AutoOrtho, and there have been many [design decisions](https://github.com/samsoir/xearthlayer/tree/main/docs/dev) that resulted in significant changes to how scenery tiles are managed internally. With that said, it would be a disservice not to credit AutoOrtho as the inspiration for this project.

After starting work on XEarthLayer, Sam discovered that AutoOrtho had been forked by the community into [AutoOrtho Continued](https://programmingdinosaur.github.io/autoortho4xplane/). Definitely check that out if XEarthLayer is not for you.

Three months later, XEarthLayer was ready for its first public release.

## Acknowledgments

XEarthLayer wouldn't be possible without the contributions and support of many people.

### Special Thanks

- [kubilus1](https://github.com/kubilus1/autoortho) for creating AutoOrtho, the original inspiration for this project
- [xjs36uk](https://forums.x-plane.org/profile/1171657-xjs36uk/) for their testing and feedback on low specification systems that significantly improved the performance of XEarthLayer on memory constrained systems

### Technologies

XEarthLayer is built with:

- [Rust](https://www.rust-lang.org/) — Systems programming language
- [Claude Code](https://claude.com/product/claude-code) — AI assisted pair programming and documentation
- [GitHub](https://github.com) — Source code repository, CI/CD and hosting services
- [Ortho4XP, Shred86](https://github.com/shred86/Ortho4XP) fork used to create regional scenery packages

### Imagery Providers

Satellite imagery is sourced from various providers including:

- Apple Maps
- ArcGIS
- Bing Maps
- Google Maps
- MapBox
- USGS

## Contact

- **GitHub**: [samsoir/xearthlayer](https://github.com/samsoir/xearthlayer)
- **Discord**: [Join the community](https://discord.gg/XVUmMWYS)

## License

XEarthLayer is released under the [MIT License](https://opensource.org/licenses/MIT).
