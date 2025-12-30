document.addEventListener('DOMContentLoaded', function() {
  // Header scroll behavior - only show after scrolling past hero
  const header = document.querySelector('.site-header');
  if (header) {
    const hero = document.querySelector('.hero');

    // If no hero section (e.g., docs pages), always show header
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

      // Initial check
      updateHeaderVisibility();

      // Update on scroll
      window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    }
  }

  // Download dropdown toggle
  const downloadDropdown = document.querySelector('.download-dropdown');
  const downloadBtn = document.getElementById('download-btn');

  if (downloadDropdown && downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      downloadDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!downloadDropdown.contains(e.target)) {
        downloadDropdown.classList.remove('open');
      }
    });

    // Close dropdown when pressing Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        downloadDropdown.classList.remove('open');
      }
    });
  }
});
