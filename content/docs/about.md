---
title: "About"
description: "The story behind XEarthLayer and the people who made it possible."
weight: 60
---

## The Project

XEarthLayer was created to solve a fundamental problem in flight simulation: the trade-off between visual fidelity and storage requirements. Traditional ortho photo scenery requires downloading terabytes of satellite imagery before you can fly, and you end up storing data for places you may never visit.

XEarthLayer takes a different approach—streaming satellite imagery on-demand, exactly when and where you need it.

## The Author

XEarthLayer was created by Sam de Freyssinet in 2025. Sam has been a flight simulator enthusiast for much of his life, following his first encounter with Microsoft Flight Simulator 2.0.

After a small hiatus from flight sim between 2000 and 2013, Sam returned to his passion. After a couple of years in the Prepar3d ecosystem, he migrated to X-Plane at the tail end of version 10.

Since rediscovering his passion for flying virtually, Sam started flight training for his real private pilots license in 2016.

When not piloting virtual or real aircraft, Sam spends his time as a Software Engineering Director at a well known tech company in the San Francisco Bay Area. He likes to snowboard with his children, cycle and travel.

## Motivation

In the summer of 2025 after many years of running his flight simulator on Microsoft Windows, Sam decided to migrate to Linux. There are many factors that drove this decision, but the biggest influence was due to Windows 11 killing the main system NVMe drive after a system update.

After successfully rebuilding his flight simulator on Linux and installing X-Plane 12, Sam was horrified to find that both tools he had used previously for streaming orthophoto scenery into X-Plane were not available; one only supports Windows; the other, AutoOrtho, was no longer maintained.

Given the situation, Sam decided to try and fix [AuthOrtho](https://kubilus1.github.io/autoortho/latest/) on his own system but did not make much progress. Taking a step back, Sam asked the fatal question; _how hard would it be to port AutoOrtho to Rust?_ Turns out it is quite hard, but not impossible.

XEarthLayer shares no code with AutoOrtho and there have been many [design decisions](https://github.com/samsoir/xearthlayer/tree/main/docs/dev) that resulted in significant changes to how scenery tiles are managed internally by the system. With that being said it would be a disservice to not credit AutoOrtho as the inspiration for this project.

After starting work on XEarthLayer, Sam discovered that AutoOrtho has been forked by the community into [AutoOrtho Continued](https://programmingdinosaur.github.io/autoortho4xplane/). Definitely check that out if XEarthLayer is not for you.

## Acknowledgments

XEarthLayer wouldn't be possible without the contributions and support of many people.

### Contributors

<!-- List key contributors and their contributions -->

### Special Thanks

<!-- Acknowledge people who helped, inspired, or supported the project -->

### Technologies

XEarthLayer is built with:

- [Rust](https://www.rust-lang.org/) — Systems programming language
- [X-Plane SDK](https://developer.x-plane.com/) — X-Plane plugin development
<!-- Add other key technologies/libraries -->

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
