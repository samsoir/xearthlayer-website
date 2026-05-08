+++
date = '2026-05-08T08:00:00-07:00'
draft = false
title = "XEarthLayer and X-Plane's Raster Scenery Future"
description = "Laminar are rebuilding X-Plane's scenery around Raster Data Tiles. Here is what is coming, and why XEarthLayer is well-placed for the transition."
author = 'XEarthLayer Team'
tags = ['xplane','scenery','future']
+++

{{< lead >}}
Laminar Research are rebuilding X-Plane's scenery system around _Raster Data Tiles_, a major departure from the twenty-year-old DSF format. We do not yet know when it lands or what hooks third parties will get, but based on what has been shared publicly we are confident in four things: orthophoto scenery will still be supported, scenery will be streamed on demand rather than loaded in blocks, third-party airports will finally blend cleanly with global imagery, and there is a real possibility of a first-party API for developers. All of these are good news for XEarthLayer, and the architectural work we are already doing, splitting the app into composable modules and exposing third-party hooks, is preparing us for the transition. XEarthLayer and X-Plane will remain compatible long into the next generation of the simulator.
{{< /lead >}}

## Scenery System: State of the Union in X-Plane 12.4

The present scenery system used by X-Plane today has been with us for around twenty years. The resolution and fidelity of the system assets have improved significantly over that time as computers have become more capable. At the core however, the [DSF](https://developer.x-plane.com/article/dsf-file-format-specification/) framework X-Plane uses today is fundamentally no different from what has come before.

The foundation is simple. X-Plane scenery is packaged in one by one degree tiles, projected using the Web Mercator method to populate the Earth with cities, rivers, mountains, oceans, trees, roads, railways and very importantly, airports. The base DSF file for each tile provides the description of all of the pieces needed to build this slice of the world, from the base mesh which describes the triangles needed to represent the ground in 3D space, to the textures, land-class type and objects that exist on the tile.

Readers familiar with this project will know that [XEarthLayer intercepts](/docs/how-it-works) the references of textures as they are requested from disk in order to inject the orthophoto scenery at runtime within the world X-Plane is painting.

![Diagram of X-Plane's sliding-window scenery loader. A four-by-three grid of one-degree DSF tiles is loaded around the aircraft's current position. As the aircraft crosses an invisible boundary roughly one degree from the loaded edge, X-Plane loads the next three rows or columns of tiles ahead of it, dropping the tiles furthest behind.](/images/news/sliding-window.jpg)

X-Plane loads these tiles into the simulator using a relatively simple sliding window model. When the sim loads into a location in the world for the first time, X-Plane loads a large area around the starting position for the aircraft, usually around four by three tiles in size. Once the current twelve tile area is loaded, the simulator then waits until the aircraft reaches an invisible boundary that is approximately one degree from the edge of the loaded area in either latitude or longitude. 

{{< callout type="info" >}}
**Fun side note:** X-Plane currently does not always position the aircraft into a centrally located one by one DSF tile for reasons that remain a mystery.
{{< /callout >}}

Once that boundary has been crossed X-Plane begins loading in the next set of rows (latitude) or columns (longitude), consisting of one degree square tiles. X-Plane usually loads three of the next rows or columns of tiles ahead of the aircraft. 

As part of the development of XEarthLayer, we were able to understand this loading method in depth thanks to the visibility the FUSE mount provides into what X-Plane requests from the file system at any given time. A [white paper](https://github.com/samsoir/xearthlayer/blob/main/docs/dev/xplane-scenery-loading-whitepaper.md) describing this in detail is published in this project's GitHub repository.

## Streaming Orthophoto Scenery Challenges

The current system X-Plane uses to load scenery in blocks of rows or columns (or both in some edge cases) was not designed with streaming orthophoto scenery in mind. It clearly assumes that the resources it needs are going to be on a local disk, and of moderate size.

Orthophoto scenery, even at modest zoom levels, requires a lot of data. At zoom level 16, X-Plane will load in the order of 12-15 gigabytes of image data in DDS BCS1 encoding to populate the world. That is a lot of data to load from disk into VRAM in a short amount of time, while flying. If the streaming orthophoto provider is slow to provide the data, or stalls then X-Plane will start to stutter and can even freeze until the data necessary to paint the scene ahead of the aircraft is available.

This is something I have experienced in the sim when using AutoOrtho and Map Enhancer. XEarthLayer has received a lot of engineering focus on eliminating these stutters and freezes, and even we experience them on occasion when the cache has not been able to warm itself fully in time.

The problem is purely the volumes of data required by orthophotos and the ability to deliver that to the sim quickly. The way X-Plane loads tiles today makes this a significant challenge to avoid stutters at the loaded area boundary. Even with the recent improvements to X-Plane's scenery loading system in 12.4 to introduce multi-threaded scenery loading, stutters can still be experienced on occasion.

The X-Plane team are also aware of this and have already signalled a significant change is coming.

## Enter Raster Data Tiles

![Raster Data Tiles image that illustrates how Raster tile layers combine together to produce scenery in a flight simulator environment. The image describes how multiple raster data layers combine, with vegetation density data at the lowest level, land/water class data in the middle and elevation data at the top. The second segment illustrates how raster data tiles are able to scale level of detail and exclude oceans.](/images/news/raster-data-tile.jpg)

> We are all raster-farians now - _Ben Supnik_

In an official X-Plane [developer blog post](https://developer.x-plane.com/2024/03/we-are-all-raster-farians-now/) published in 2024, Ben Supnik from Laminar Research clearly stated the new direction the base scenery system in X-Plane is heading in: enter _Raster Data Tiles_.

A Raster Data tile can be thought of as a two-dimensional array, like an image, that contains information about the area it represents. These can be layered on top of each other, so one layer can represent elevation, another vegetation, land class, water, networks (roads, rail, power), object class and anything else developers can think of. A Raster Data tile can include a layer that is purely a color map, albedo, specular and so on to create complex layers of color information that can be rendered in real time. Those maps can contain ortho-photos if desired.

This is a major departure from the current system, where all of the scenery information other than textures is described in the DSF and supporting files as vectors. Vectors have some advantages, especially when it comes to the amount of data required to describe a shape when compared to raster data.

Vectors have been historically good for flight sim scenery description because the trade-off made was to keep the scenery description as small as possible at the expense of overall visual fidelity. This indexed on keeping the simulator performance good while running on systems with restrictive hardware constraints &mdash; smaller disk drives and less memory. For many years this was fine as the rendered world that X-Plane produced was as good as it needed to be and certainly held its own against the competition.

This approach does have challenges when you want to change the level of detail in flight. Any change in the rendered fidelity of vectors in DSF tiles usually result in very noticeable visual artifacts like tears in the scenery. In reality this means the 3D mesh is locked at the level of detail provided by the tile regardless of any optimizations available due to distance from the camera. All level of detail savings are found in scenery objects and textures.

With the progression of PC hardware, fast internet connections and graphics cards with main-computer levels of memory, the landscape has changed significantly in the last decade. Modern PC hardware is capable of storing gigabytes of data in memory to describe scenes. The speed of internet connections has also significantly increased, allowing for more data to be downloaded quickly. The advancement of PC hardware means that the Laminar team can re-evaluate the trade-offs they want to make when rebuilding the scenery system.

If you have used Google Earth or Apple Maps to view the 3D world with photo scenery, you have experienced Raster Data Tiles in action. You will also understand how performant they are even when presented on a mobile phone. The entire Earth can be shown in a single frame, and then seconds later you can be 1000ft above the streets of San Francisco. The transitions are seamless, rendered at 60 frames per second or better. This is what X-Plane is aspiring to deliver in the future state. As Ben so eloquently wrote in his blog post, for the base mesh, X-Plane is aiming to use _all raster tiles, all the time_.

## Implications for XEarthLayer in a Raster Data Tile World

The information shared so far by Ben and the Laminar team on the direction of travel for the future state of X-Plane scenery is fascinating. I can foresee many interesting features and functions that will help scenery content creators paint a far more convincing world in the simulator. At the same time this is a huge amount of work for the team. It will require a complete reimplementation of the foundational scenery system, as well as updating or rewriting the supporting tooling such as [WED](https://developer.x-plane.com/docs/scenery/#World_Editor_WED). It is therefore no surprise the team have been largely quiet on this subject since the 2024 announcement.

With the information shared so far it is impossible to predict the precise nature of the new scenery system, or what hooks or apis will be provided to third parties to further enhance the environment. Therefore everything presented here is pure conjecture and subject to change in the future. Given the information shared so far we can make a few assumptions and predictions about the future state of X-Plane scenery.

### Assumption 1: Orthophoto Scenery will be supported in the future

The most important assumption is that orthophoto scenery will be supported in this new system. Ben called it out specifically in his blog post, and we are assuming that the ability to provide photoscenery tiles to this system will remain. That bodes well for the future of XEarthLayer.

### Assumption 2: Scenery will be streamed into the simulator as needed

The second assumption we will make, which is unconfirmed but we are reasonably confident about, is that scenery will be streamed into the simulator on demand at a given level of detail rather than loaded in blocks of columns and rows as it is today. The specific function of how that works based on the view point is unknown, but we are confident X-Plane will adopt a loading method that more closely aligns with Google Earth and Apple Maps. 

This also bodes well for XEarthLayer as the system is already designed to support this dynamic loading model today.

### Assumption 3: First-party Scenery API for developers

A third assumption we are less confident about but will put out there is that there will be some form of API provided by X-Plane to developers to interact with scenery. We can imagine that hooks will be provided so that third-parties can provide Raster Tile data at any layer during runtime. 

If this turns out to materialize it will have some impact on XEarthLayer. For the most part it will simplify our system by negating the need for the FUSE interception layer in our architecture. We would **very warmly welcome** this change, should anyone from Laminar Research be reading this! Removing the FUSE layer would also increase performance of the entire system considerably by removing the repetitive transit from user space to kernel space and back again for system IO calls.

Should this not materialize however, we are reasonably confident we will be able to use the existing approach based on what we know today.

### Assumption 4: Better interoperability between third party airports and global scenery

The final assumption that we are very confident about because Ben provided this as an example in his post, is that using Raster Tile data will eliminate a major issue that has plagued orthophoto scenery providers since the beginning &mdash; that is, third party airports overriding the orthophoto tiles.

To the simulator pilot, this results in loading into an airport provided by a third party scenery developer and discovering that the area covered by the one by one tile around the airport does not have any photo scenery. Only when you fly away from the airport do you discover the photo scenery again, presented with a very hard and immersion destroying boundary between the two. The current scenery implementation makes this almost impossible to mitigate against, unless the third party designer provides their own complete orthophoto tile.

In the new system presented by Ben it will be relatively simple to blend the elevation data and any other provided layers with the global scenery using many existing methods for combining data of this kind. After all, we have been blending images successfully for many decades with Lanczos, Gaussian and many more mathematical models for resampling and combining image data. They can all be used for this use case as well. This removes the need to try and do complex 3D geometry merging and smoothing operations that seldom work out well. 

This will enable all third party scenery and airports to coexist with everything else present in world without them having to ship their own complete orthophoto tiles, providing a seamless and invisible transition when rendered in the simulator environment.

For XEarthLayer this change will probably require zero effort on our part to support, but will be a nice free enhancement for all users of X-Plane regardless of whether they use orthophoto scenery.

---

There is real work ahead for us when Laminar reveal more, but we are not waiting. We are already laying the groundwork for whatever the new scenery system looks like by splitting the monolithic XEarthLayer application into smaller composable modules, building strong contracts between the layers, and exposing third-party API hooks so others can plug additional behaviour into the processing pipeline. Whichever of the assumptions above turn out to be reality, that work will let us move quickly when the picture sharpens. When Laminar share more, we will follow up with concrete details on how XEarthLayer will support the new scenery environment.

It is safe to assume that XEarthLayer and X-Plane will remain compatible long into the next generation of the simulator.
