# Homepage Video Hero & Scrollytelling Features

## Overview

Redesign the homepage to feature a full-motion video hero that transitions into an interactive scrollytelling experience for the features section.

## User Experience Flow

### Phase 1: Video Hero (Initial View)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   [Full-width video]                        │
│                   X-Plane scenery                           │
│                                                             │
│         ┌─────────────────────────────────┐                 │
│         │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │                 │
│         │                                 │                 │
│         │        XEarthLayer              │                 │
│         │                                 │                 │
│         │  Stunning photoreal scenery     │                 │
│         │  for X-Plane 12                 │                 │
│         │                                 │                 │
│         │  [Download v0.2.9] [GitHub]     │                 │
│         │                                 │                 │
│         └─────────────────────────────────┘                 │
│              (semi-transparent card)                        │
│                                                             │
│                         ↓ scroll                            │
└─────────────────────────────────────────────────────────────┘
```

- Full-bleed video background (edge to edge, no margins)
- Video plays automatically, muted, looped
- Floating semi-transparent card (glassmorphism style) centered
- Contains: Logo, title, tagline, CTA buttons
- Scroll indicator at bottom

### Phase 2: Scroll Transition

As the user scrolls past the hero section:

1. The video scales down smoothly
2. A monitor bezel fades in around the video
3. The monitor moves to the right side of the viewport
4. The features section background fades in

```
Scroll Progress: 0% ──────────────────────────── 100%
                 │                                │
                 ▼                                ▼
           [Full video]                    [Monitor on right]
```

### Phase 3: Scrollytelling Features

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────────┐   │
│  │                     │      │  ┌───────────────────┐  │   │
│  │  Multiple Ortho     │      │  │                   │  │   │
│  │  Providers          │      │  │  [Screenshot      │  │   │
│  │                     │      │  │   matching        │  │   │
│  │  Choose from Apple, │      │  │   current         │  │   │
│  │  ArcGIS, Bing...    │      │  │   feature]        │  │   │
│  │                     │      │  │                   │  │   │
│  └─────────────────────┘      │  └───────────────────┘  │   │
│         ▲ active              │         monitor         │   │
│                               └─────────────────────────┘   │
│  ┌─────────────────────┐            (sticky position)       │
│  │  Smart Caching      │                                    │
│  │  ...                │                                    │
│  └─────────────────────┘                                    │
│         ▲ next                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Monitor stays fixed (sticky) on the right side
- Feature cards on the left, one visible at a time
- As user scrolls, features animate in/out
- Monitor screenshot crossfades to match active feature
- After last feature, monitor unsticks and scrolls away

## Technical Implementation

### HTML Structure

```html
<section class="hero-video">
  <video class="hero-video__bg" autoplay muted loop playsinline>
    <source src="/video/hero.webm" type="video/webm">
    <source src="/video/hero.mp4" type="video/mp4">
  </video>
  <div class="hero-video__overlay">
    <div class="hero-video__card">
      <!-- Title, tagline, CTAs -->
    </div>
  </div>
  <div class="hero-video__monitor-frame">
    <!-- Bezel that fades in during transition -->
  </div>
</section>

<section class="features-scroll">
  <div class="features-scroll__monitor">
    <!-- Sticky monitor with changing screenshots -->
    <img class="features-scroll__screen" data-feature="providers" src="...">
    <img class="features-scroll__screen" data-feature="caching" src="...">
    <!-- etc -->
  </div>
  <div class="features-scroll__content">
    <article class="feature-panel" data-feature="providers">...</article>
    <article class="feature-panel" data-feature="caching">...</article>
    <!-- etc -->
  </div>
</section>
```

### CSS Approach

```css
/* Video hero - full bleed */
.hero-video {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-video__bg {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Glassmorphism card */
.hero-video__card {
  background: rgba(30, 30, 46, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
}

/* Sticky monitor for scrollytelling */
.features-scroll {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.features-scroll__monitor {
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
}

/* Feature panels - tall to enable scroll */
.feature-panel {
  min-height: 100vh;
  display: flex;
  align-items: center;
}
```

### JavaScript Requirements

1. **Scroll progress tracking** - Calculate scroll position relative to sections
2. **Video-to-monitor transition** - Animate scale, position, opacity of elements
3. **Feature activation** - Detect which feature is in viewport
4. **Screenshot crossfade** - Swap monitor content based on active feature

Consider using:
- **Intersection Observer API** - For detecting feature visibility
- **CSS scroll-driven animations** (if browser support is acceptable)
- **GSAP ScrollTrigger** - For complex timeline animations (optional dependency)

### Vanilla JS Approach (No Dependencies)

```javascript
// Scroll progress for hero transition
function getScrollProgress(element) {
  const rect = element.getBoundingClientRect();
  const progress = 1 - (rect.bottom / (rect.height + window.innerHeight));
  return Math.max(0, Math.min(1, progress));
}

// Feature visibility detection
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const feature = entry.target.dataset.feature;
      activateFeature(feature);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.feature-panel').forEach(panel => {
  observer.observe(panel);
});
```

## Asset Requirements

### Video

| Asset | Format | Resolution | Duration | Target Size |
|-------|--------|------------|----------|-------------|
| hero.webm | VP9 | 1920x1080 | 20-30s | 5-8 MB |
| hero.mp4 | H.264 | 1920x1080 | 20-30s | 8-12 MB |
| hero-poster.jpg | JPEG | 1920x1080 | - | 200-400 KB |

**Video content suggestions:**
- Smooth flyover of photorealistic scenery
- Multiple biomes/locations (mountains, coastline, cities)
- Golden hour lighting for visual appeal
- Subtle camera movement, not jarring

### Feature Screenshots

| Feature | Filename | Content |
|---------|----------|---------|
| Multiple Providers | providers.jpg | Split view showing different provider outputs |
| Optimized Loading | loading.jpg | Dashboard showing cache warming progress |
| Smart Caching | caching.jpg | Dashboard with cache stats, or comparison |
| Predictive Prefetch | prefetch.jpg | Map view showing prefetch radius |
| Real-Time Dashboard | dashboard.jpg | Full TUI dashboard screenshot |
| Package Management | packages.jpg | Terminal showing package commands |

**Screenshot specifications:**
- Resolution: 1920x1080 (will be scaled down)
- Format: JPEG, quality 80-85%
- Target size: 100-200 KB each

## Mobile Experience

### Strategy: Static Poster Image

On mobile devices (< 768px width):

1. **No video autoplay** - Show poster image instead
2. **Simplified hero** - Standard card layout, no glassmorphism
3. **No scrollytelling** - Features display as standard grid/list
4. **Reduced assets** - Don't load desktop video at all

```css
@media (max-width: 768px) {
  .hero-video__bg {
    display: none;
  }

  .hero-video {
    background: url('/images/hero-poster-mobile.jpg') center/cover;
  }

  .features-scroll {
    display: block; /* Stack instead of side-by-side */
  }

  .features-scroll__monitor {
    display: none; /* Hide sticky monitor */
  }
}
```

### Accessibility Considerations

- `prefers-reduced-motion`: Disable video, show static image
- Video has no audio, so no captions needed
- Ensure sufficient contrast on glassmorphism card
- All content accessible without JavaScript (progressive enhancement)

```css
@media (prefers-reduced-motion: reduce) {
  .hero-video__bg {
    display: none;
  }

  .hero-video {
    background: url('/images/hero-poster.jpg') center/cover;
  }
}
```

## Implementation Phases

### Phase 1: Foundation
- [ ] Create video placeholder (solid color or static image)
- [ ] Build hero section with glassmorphism card
- [ ] Implement basic scroll transition (video to monitor)
- [ ] Test on desktop browsers

### Phase 2: Scrollytelling
- [ ] Create placeholder screenshots for each feature
- [ ] Build sticky monitor layout
- [ ] Implement feature activation on scroll
- [ ] Add screenshot crossfade transitions

### Phase 3: Polish
- [ ] Record actual X-Plane video footage
- [ ] Capture real feature screenshots
- [ ] Fine-tune animation timing/easing
- [ ] Performance optimization (lazy loading, etc.)

### Phase 4: Mobile & Accessibility
- [ ] Implement mobile fallback layout
- [ ] Add reduced-motion support
- [ ] Test on various devices
- [ ] Optimize asset loading

## Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total page weight (desktop) | < 15 MB |
| Total page weight (mobile) | < 2 MB |
| Video start time | < 3s on broadband |

## Open Questions

1. Should the monitor include the stand, or just the screen portion?
2. Do we want subtle parallax on the glassmorphism card?
3. Should features have a progress indicator (dots, line, etc.)?
4. What's the fallback if JavaScript fails to load?

---

*Last updated: 2024-12-30*
