---
title: "About"
description: "The story behind XEarthLayer and the people who made it possible."
weight: 70
---

## The Project

XEarthLayer was created to solve a fundamental problem in flight simulation: the trade-off between visual fidelity and storage requirements. Traditional ortho photo scenery requires downloading terabytes of satellite imagery before you can fly, and you end up storing data for places you may never visit.

XEarthLayer takes a different approach. It streams satellite imagery on demand, when and where you need it.

## Author

XEarthLayer was created by Sam de Freyssinet in 2025. Sam has been a flight simulator enthusiast for much of his life, ever since his first encounter with Microsoft Flight Simulator 2.0.

Sam returned to flight simulation in 2013 following an extended hiatus, spent a couple of years in the Prepar3D ecosystem, then migrated to X-Plane at the tail end of version 10.

Since rediscovering his passion for flying virtually, Sam started flight training for his real private pilot's license in 2016.

When not piloting virtual or real aircraft, Sam works as a Software Engineering Director at a well-known tech company in the San Francisco Bay Area. He likes to snowboard with his children, cycle, and travel.

## Acknowledgments

XEarthLayer wouldn't be possible without the contributions and support of many people.

### Special Thanks

- [kubilus1](https://github.com/kubilus1/autoortho) for creating AutoOrtho, the original inspiration for this project
- [xjs36uk](https://forums.x-plane.org/profile/1171657-xjs36uk/) for their testing and feedback on low specification systems that significantly improved the performance of XEarthLayer on memory constrained systems
- [mmaechtel](https://github.com/mmaechtel) for sustained testing, for finding and fixing bugs across many releases, and for consistently excellent feedback
- [Duane Licudi](https://github.com/dlicudi) for leading the port of XEarthLayer's FUSE layer to macFUSE, which is what makes the native macOS release possible

### Technology

XEarthLayer is built with:

- [Rust](https://www.rust-lang.org/), the systems programming language it is written in
- [Claude Code](https://claude.com/product/claude-code) for AI assisted pair programming and documentation
- [GitHub](https://github.com) for source code hosting, CI/CD and releases
- [OXO, the Ortho4 XEarthLayer Orchestrator](https://github.com/XEarthLayer/ortho4-xearthlayer-orchestrator), which builds the global scenery and the night lighting recipes each package carries

### Night Lighting Data

Night-time brightness comes from NASA's Black Marble annual night lights, from the VIIRS instrument on NOAA-20:

> NASA VIIRS Land Science Investigator-led Processing System. (2025). *VIIRS/JPSS1 Lunar BRDF-Adjusted Nighttime Lights Yearly L3 Global 15 arc second Linear Lat Lon Grid* [Dataset](https://doi.org/10.5067/VIIRS/VJ146A4.002). NASA Level 1 and Atmosphere Archive and Distribution System Distributed Active Archive Center. Date Accessed: 2026-10-16

### Imagery Providers

Satellite imagery is sourced from various providers including:

- Apple Maps
- ArcGIS
- Bing Maps
- Google Maps
- Google GO2
- MapBox
- USGS

## Contact

- **GitHub**: [samsoir/xearthlayer](https://github.com/samsoir/xearthlayer)
- **Discord**: [Join the community](https://discord.gg/RPEWQZdxm2)

## License

XEarthLayer is released under the [MIT License](https://opensource.org/licenses/MIT).
