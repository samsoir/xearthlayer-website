import { initScrolly } from './scrolly.js';

document.addEventListener('DOMContentLoaded', function() {
  // Enable JS-enhanced features
  document.documentElement.classList.add('js-enabled');

  // ==========================================
  // HEADER SCROLL BEHAVIOR
  // ==========================================
  const header = document.querySelector('.site-header');
  if (header) {
    const hero = document.querySelector('.hero-video') || document.querySelector('.hero');

    if (!hero) {
      header.classList.add('visible');
    } else {
      function updateHeaderVisibility() {
        const scrollThreshold = hero.offsetHeight - 100;
        if (window.scrollY > scrollThreshold) {
          header.classList.add('visible');
        } else {
          header.classList.remove('visible');
        }
      }
      updateHeaderVisibility();
      window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    }
  }

  // ==========================================
  // MOUSE PARALLAX EFFECT ON HERO CARD
  // ==========================================
  const heroCard = document.getElementById('hero-card');
  if (heroCard) {
    // Only enable on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
      document.addEventListener('mousemove', function(e) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate rotation (-3 to +3 degrees)
        const rotateY = ((e.clientX - centerX) / centerX) * 3;
        const rotateX = ((centerY - e.clientY) / centerY) * 3;

        heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      // Reset on mouse leave
      document.addEventListener('mouseleave', function() {
        heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    }
  }

  // ==========================================
  // FEATURES SCROLLYTELLING
  // ==========================================
  const featuresSection = document.querySelector('.features-scroll');
  const progressNav = document.getElementById('features-progress');
  const progressDots = document.querySelectorAll('.features-progress__dot');
  const scrollyRoot = document.getElementById('scrolly');
  const terminalClips = document.querySelectorAll('.terminal-window__clip');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (featuresSection && scrollyRoot) {
    // Show the progress dots while any part of the section is on screen.
    // The section is many viewports tall, so a fractional threshold
    // could never be met and the dots would stay hidden.
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (progressNav) {
          if (entry.isIntersecting) {
            progressNav.classList.add('visible');
          } else {
            progressNav.classList.remove('visible');
          }
        }
      });
    }, { threshold: 0 });

    progressObserver.observe(featuresSection);

    function pauseClips() {
      terminalClips.forEach(clip => { if (!clip.paused) clip.pause(); });
    }

    // A feature's card has appeared: tint the section, light its dot and,
    // for the terminal features, show its clip and play it from the start.
    // Clips hold on their last frame; reduced motion shows the poster only.
    function activateFeature(featureName) {
      featuresSection.dataset.activeFeature = featureName;

      progressDots.forEach(dot => {
        dot.classList.toggle('active', dot.dataset.feature === featureName);
      });

      terminalClips.forEach(clip => {
        const active = clip.dataset.feature === featureName;
        clip.classList.toggle('is-active', active);
        if (!active) {
          if (!clip.paused) clip.pause();
          return;
        }
        if (reduceMotion) return;
        try { clip.currentTime = 0; } catch (e) { /* not loaded yet: starts at 0 anyway */ }
        const playing = clip.play();
        if (playing && playing.catch) playing.catch(() => {});
      });
    }

    // Set initial active feature (before the module, which may report another)
    activateFeature('streaming');

    // Scroll-driven story; it reports the active feature and scene changes.
    const scrolly = initScrolly(scrollyRoot, {
      onActivate: activateFeature,
      onScene: (scene) => { if (scene !== 'terminal') pauseClips(); },
    });

    // Progress dot click handlers
    progressDots.forEach(dot => {
      dot.addEventListener('click', function() {
        const feature = this.dataset.feature;
        if (scrolly && scrolly.scrollToHold(feature)) return;
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ==========================================
  // DOWNLOAD DROPDOWN
  // ==========================================
  const downloadDropdowns = Array.from(document.querySelectorAll('.download-dropdown'));

  function setDropdownOpen(dropdown, open) {
    dropdown.classList.toggle('open', open);
    const btn = dropdown.querySelector('.download-btn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAllDropdowns(except) {
    downloadDropdowns.forEach(function(d) {
      if (d !== except) setDropdownOpen(d, false);
    });
  }

  if (downloadDropdowns.length) {
    downloadDropdowns.forEach(function(dropdown) {
      const btn = dropdown.querySelector('.download-btn');
      if (!btn) return;
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const willOpen = !dropdown.classList.contains('open');
        closeAllDropdowns(dropdown);
        setDropdownOpen(dropdown, willOpen);
      });
    });

    document.addEventListener('click', function(e) {
      if (!downloadDropdowns.some(function(d) { return d.contains(e.target); })) {
        closeAllDropdowns(null);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllDropdowns(null);
      }
    });
  }

  // ==========================================
  // DOWNLOAD PLATFORM SWITCH
  // ==========================================
  const platformSegments = Array.from(document.querySelectorAll('.platform-switch__segment'));
  const platformPanels = document.querySelectorAll('.platform-panel');

  function selectPlatform(platform, focus) {
    platformSegments.forEach(function(segment) {
      const selected = segment.dataset.platform === platform;
      segment.classList.toggle('active', selected);
      segment.setAttribute('aria-selected', selected ? 'true' : 'false');
      segment.tabIndex = selected ? 0 : -1;
      if (selected && focus) segment.focus();
    });
    platformPanels.forEach(function(panel) {
      panel.hidden = panel.dataset.platform !== platform;
    });
    closeAllDropdowns(null);
  }

  // Apple devices get macOS; everything else gets Linux, the default in the markup
  function detectPlatform() {
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    return /mac|iphone|ipad|ipod/i.test(platform) || /Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent)
      ? 'macos'
      : 'linux';
  }

  if (platformSegments.length) {
    selectPlatform(detectPlatform(), false);

    platformSegments.forEach(function(segment, index) {
      segment.addEventListener('click', function() {
        selectPlatform(segment.dataset.platform, false);
      });
      segment.addEventListener('keydown', function(e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const step = e.key === 'ArrowRight' ? 1 : -1;
        const next = platformSegments[(index + step + platformSegments.length) % platformSegments.length];
        selectPlatform(next.dataset.platform, true);
      });
    });
  }

  // ==========================================
  // MOBILE HAMBURGER MENU
  // ==========================================
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  const mobileBackdrop = document.querySelector('.nav-mobile__backdrop');
  const mobileLinks = document.querySelectorAll('.nav-mobile__links a');

  if (hamburger && mobileMenu) {
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function() {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on backdrop click
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', function() {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    }

    // Close menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================
  // TABS COMPONENT
  // ==========================================
  const tabContainers = document.querySelectorAll('.tabs');

  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tabs__button');
    const panels = container.querySelectorAll('.tabs__panel');

    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const tabIndex = this.dataset.tab;

        // Update buttons
        buttons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        // Update panels
        panels.forEach(panel => {
          if (panel.dataset.tab === tabIndex) {
            panel.classList.add('active');
            panel.removeAttribute('hidden');
          } else {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
          }
        });
      });
    });
  });
});
