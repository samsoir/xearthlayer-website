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
│         │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │                 │
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
- **Mouse parallax effect** on card (see below)
- Scroll indicator at bottom

#### Mouse Parallax Effect

The glassmorphism card responds to cursor position, creating a subtle 3D floating effect:

```
          Mouse at top-left              Mouse at center              Mouse at bottom-right
         ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
        ╱              ╱│             │              │              │╲              ╲
       ╱──────────────╱ │             │  XEarthLayer │              │ ╲──────────────╲
       │  XEarthLayer │ │             │              │              │ │  XEarthLayer │
       │              │╱              └──────────────┘              ╲│              │
       └──────────────┘                   (flat)                     └──────────────┘
         (tilted right)                                               (tilted left)
```

**Implementation:**
- Track mouse position relative to viewport center
- Apply CSS `transform: perspective(1000px) rotateX(Xdeg) rotateY(Ydeg)`
- Maximum rotation: ±3 degrees on each axis
- Smooth transition with `transition: transform 0.1s ease-out`
- Disable on touch devices (no hover state)

```javascript
const card = document.querySelector('.hero-video__card');

document.addEventListener('mousemove', (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Calculate rotation (-3 to +3 degrees)
  const rotateY = ((e.clientX - centerX) / centerX) * 3;
  const rotateX = ((centerY - e.clientY) / centerY) * 3;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
```

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

- Wall-mounted monitor (no stand), with glowing edges matching current theme
- Monitor stays fixed (sticky) on the right side
- Feature cards on the left with **SVG icon + title + description**
- As user scrolls, features animate in/out
- Monitor screenshot crossfades to match active feature
- **Interactive progress dots** below features allow jumping between sections
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
  <div class="features-scroll__content">
    <!-- Progress indicator -->
    <nav class="features-progress" aria-label="Feature navigation">
      <button class="features-progress__dot active" data-feature="providers" aria-label="Multiple Providers"></button>
      <button class="features-progress__dot" data-feature="loading" aria-label="Optimized Loading"></button>
      <button class="features-progress__dot" data-feature="caching" aria-label="Smart Caching"></button>
      <button class="features-progress__dot" data-feature="prefetch" aria-label="Predictive Prefetch"></button>
      <button class="features-progress__dot" data-feature="dashboard" aria-label="Real-Time Dashboard"></button>
      <button class="features-progress__dot" data-feature="packages" aria-label="Package Management"></button>
    </nav>

    <!-- Feature panels with SVG icons -->
    <article class="feature-panel" data-feature="providers">
      <div class="feature-panel__icon">
        <svg><!-- Globe icon --></svg>
      </div>
      <h3>Multiple Ortho Providers</h3>
      <p>Choose from Apple, ArcGIS, Bing, Google, MapBox, or USGS...</p>
    </article>
    <article class="feature-panel" data-feature="caching">
      <div class="feature-panel__icon">
        <svg><!-- Box/cube icon --></svg>
      </div>
      <h3>Smart Caching</h3>
      <p>Two-tier cache system stores scenery in memory...</p>
    </article>
    <!-- etc -->
  </div>

  <div class="features-scroll__monitor">
    <!-- Wall-mounted monitor with glow effect -->
    <div class="monitor-glow"></div>
    <div class="monitor-frame">
      <img class="monitor-screen" data-feature="providers" src="/images/features/providers.jpg">
      <img class="monitor-screen" data-feature="caching" src="/images/features/caching.jpg">
      <!-- etc - stacked, opacity controlled by JS -->
    </div>
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
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
}

.feature-panel__icon {
  width: 48px;
  height: 48px;
  color: var(--ctp-mauve);
  margin-bottom: 1rem;
}

/* Progress indicator dots */
.features-progress {
  position: fixed;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
}

.features-progress__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ctp-surface1);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.features-progress__dot:hover {
  background: var(--ctp-overlay1);
  transform: scale(1.2);
}

.features-progress__dot.active {
  background: var(--ctp-mauve);
  box-shadow: 0 0 10px var(--ctp-mauve);
}

/* Wall-mounted monitor with glow */
.features-scroll__monitor {
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
}

.monitor-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse at center, rgba(203, 166, 247, 0.3) 0%, transparent 70%);
  filter: blur(20px);
  z-index: -1;
}

.monitor-frame {
  background: var(--ctp-crust);
  border-radius: 8px;
  padding: 8px;
  box-shadow:
    0 0 40px rgba(203, 166, 247, 0.2),
    inset 0 0 1px rgba(255, 255, 255, 0.1);
}

.monitor-screen {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.monitor-screen.active {
  opacity: 1;
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

## Graceful Degradation (No JavaScript)

The page must remain fully functional without JavaScript. All content is accessible; JS only enhances the experience.

### No-JS Behavior

| Feature | With JS | Without JS |
|---------|---------|------------|
| Hero video | Autoplays, transitions to monitor | Static poster image displayed |
| Glassmorphism card | Mouse parallax effect | Static card, no tilt |
| Video-to-monitor transition | Smooth scroll-based animation | Hero ends, features section starts normally |
| Scrollytelling monitor | Sticky with image crossfade | Hidden; features show as standard grid |
| Progress dots | Interactive, scroll-synced | Hidden (no utility without scroll sync) |
| Feature panels | One at a time with animation | All visible as standard feature cards |

### CSS-Only Fallback

```css
/* Default: show fallback layout */
.features-scroll__monitor {
  display: none;
}

.features-progress {
  display: none;
}

.feature-panel {
  min-height: auto; /* Don't require full viewport height */
}

/* JS adds this class to <html> when loaded */
.js-enabled .features-scroll__monitor {
  display: block;
}

.js-enabled .features-progress {
  display: flex;
}

.js-enabled .feature-panel {
  min-height: 100vh;
}
```

```javascript
// First line of JS - enables enhanced features
document.documentElement.classList.add('js-enabled');
```

### No-JS HTML Structure

Without JS, the features section renders as a standard grid (similar to current site):

```html
<noscript>
  <style>
    .features-scroll { display: block; }
    .features-scroll__content { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
    .feature-panel { min-height: auto; }
  </style>
</noscript>
```

## Design Decisions

| Question | Decision |
|----------|----------|
| Monitor style | Wall-mounted (no stand), with glowing edges |
| Parallax effect | Yes - mouse-based 3D tilt on glassmorphism card |
| Progress indicator | Interactive dots, vertically aligned on left side |
| JS fallback | Graceful degradation to static grid layout |
| Feature cards | SVG icon + title + description on left; screenshot on monitor |

---

*Last updated: 2024-12-30*
