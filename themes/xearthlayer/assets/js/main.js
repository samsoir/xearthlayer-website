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
  const featurePanels = document.querySelectorAll('.feature-panel');
  const progressNav = document.getElementById('features-progress');
  const progressDots = document.querySelectorAll('.features-progress__dot');
  const monitorScreens = document.querySelectorAll('.monitor-screen');

  if (featuresSection && featurePanels.length > 0) {
    // Show/hide progress dots based on section visibility
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
    }, { threshold: 0.1 });

    progressObserver.observe(featuresSection);

    // Feature panel activation
    const panelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const feature = entry.target.dataset.feature;
          activateFeature(feature);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px'
    });

    featurePanels.forEach(panel => {
      panelObserver.observe(panel);
    });

    // Activate feature function
    function activateFeature(featureName) {
      // Update section background color
      featuresSection.dataset.activeFeature = featureName;

      // Update panels
      featurePanels.forEach(panel => {
        if (panel.dataset.feature === featureName) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Update progress dots
      progressDots.forEach(dot => {
        if (dot.dataset.feature === featureName) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Update monitor screens
      monitorScreens.forEach(screen => {
        if (screen.dataset.feature === featureName) {
          screen.classList.add('active');
        } else {
          screen.classList.remove('active');
        }
      });
    }

    // Set initial active feature
    activateFeature('streaming');

    // Progress dot click handlers
    progressDots.forEach(dot => {
      dot.addEventListener('click', function() {
        const feature = this.dataset.feature;
        const targetPanel = document.querySelector(`.feature-panel[data-feature="${feature}"]`);
        if (targetPanel) {
          targetPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  // ==========================================
  // DOWNLOAD DROPDOWN
  // ==========================================
  const downloadDropdown = document.querySelector('.download-dropdown');
  const downloadBtn = document.getElementById('download-btn');

  if (downloadDropdown && downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      downloadDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!downloadDropdown.contains(e.target)) {
        downloadDropdown.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        downloadDropdown.classList.remove('open');
      }
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
});
