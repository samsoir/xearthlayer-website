/**
 * Scroll-driven frame sequence for the homepage features story.
 *
 * The track (#scrolly) holds a sticky stage with a canvas and a series of
 * steps. Each step scrubs the picture from the previous hold frame to its
 * own hold frame over the first part of its height, then holds while its
 * card is active. The manifest in data-scrolly comes from
 * scripts/extract-scrolly-frames.py.
 *
 * Debug: append ?scrolly-debug=<fraction> to force progress through the
 * track and show a badge with the frame index and active feature. Frames
 * are then marked on load rather than decode so headless screenshots catch
 * the drawn canvas.
 */
export function initScrolly(root, options = {}) {
  if (!root) return null;
  let manifest;
  try {
    manifest = JSON.parse(root.dataset.scrolly || '');
  } catch (e) {
    return null;
  }
  const stage = root.querySelector('.scrolly__stage');
  const canvas = root.querySelector('.scrolly__canvas');
  const steps = Array.from(root.querySelectorAll('.scrolly__step'));
  if (!stage || !canvas || steps.length === 0 || !Array.isArray(manifest.widths)) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const onActivate = typeof options.onActivate === 'function' ? options.onActivate : () => {};
  const debugMatch = /[?&]scrolly-debug=([0-9.]+)/.exec(window.location.search);
  const debug = debugMatch ? Math.min(Math.max(parseFloat(debugMatch[1]) || 0, 0), 1) : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const total = manifest.frames;
  const end = manifest.end;
  const holds = manifest.holds || {};
  const pad = manifest.pad || 3;
  const width = (window.innerWidth <= 960 && manifest.widths.includes(960)) ? 960 : manifest.widths[0];

  // ---- Step plan: frame range and scrub fraction per step
  let from = 0;
  const plan = steps.map((el) => {
    const feature = el.dataset.feature;
    const isTail = el.classList.contains('scrolly__step--tail');
    const to = isTail ? end : (feature in holds ? holds[feature] : end);
    const scrub = reduceMotion ? 0 : (isTail ? 1 : 0.6);
    const entry = { el, feature, from, to, scrub, isTail, start: 0, end: 0 };
    from = to;
    return entry;
  });
  const last = plan[plan.length - 1];

  // ---- Geometry
  let trackTop = 0;
  let trackHeight = 0;
  let vh = 0;
  let cw = 0;
  let ch = 0;
  let dirty = true;

  function measure() {
    const rect = root.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    trackHeight = root.offsetHeight;
    vh = window.innerHeight;
    plan.forEach((p, i) => {
      p.start = p.el.offsetTop;
      p.end = p.start + p.el.offsetHeight;
      if (i === plan.length - 1) p.end = Math.min(p.end, trackHeight - vh);
      if (p.end <= p.start) p.end = p.start + 1;
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(stage.clientWidth * dpr);
    const h = Math.round(stage.clientHeight * dpr);
    if (w !== cw || h !== ch) {
      cw = w;
      ch = h;
      canvas.width = cw;
      canvas.height = ch;
      dirty = true;
    }
  }

  // ---- Frames
  const frames = new Array(total).fill(null);
  const failed = new Set();
  let wanted = 0;
  let drawnIndex = -1;
  let ready = false;
  let loadingStarted = false;

  const src = (i) => `/images/scrolly/${width}/${String(i).padStart(pad, '0')}.webp`;

  function loadOrder() {
    const seen = new Set();
    const order = [];
    const push = (i) => {
      if (i >= 0 && i < total && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    push(0);
    Object.keys(holds).forEach((k) => push(holds[k]));
    push(end);
    [8, 4, 2, 1].forEach((d) => {
      for (let i = 0; i < total; i += d) push(i);
    });
    return order;
  }

  function loadAll() {
    if (loadingStarted) return;
    loadingStarted = true;
    const queue = loadOrder();
    let inFlight = 0;
    const next = () => {
      while (inFlight < 6 && queue.length) {
        const i = queue.shift();
        inFlight += 1;
        const img = new Image();
        img.decoding = 'async';
        const settle = debug !== null
          ? new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; })
          : null;
        img.src = src(i);
        (settle || img.decode()).then(
          () => { frames[i] = img; if (drawnIndex !== wanted) draw(); },
          () => { failed.add(i); },
        ).then(() => {
          inFlight -= 1;
          next();
        });
      }
    };
    next();
  }

  function nearest(i) {
    if (frames[i]) return i;
    for (let d = 1; d < total; d += 1) {
      if (i - d >= 0 && frames[i - d]) return i - d;
      if (i + d < total && frames[i + d]) return i + d;
    }
    return -1;
  }

  function draw() {
    const i = nearest(wanted);
    if (i < 0) return;
    if (i === drawnIndex && !dirty) return;
    const img = frames[i];
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    drawnIndex = i;
    dirty = false;
    if (!ready) {
      ready = true;
      root.classList.add('is-ready');
    }
    updateBadge();
  }

  // ---- Progress
  let activeStep = null;
  let rafPending = false;

  function progressPosition() {
    if (debug !== null) return debug * (trackHeight - vh);
    return window.scrollY - trackTop;
  }

  function update() {
    rafPending = false;
    const s = progressPosition();
    let p = plan[0];
    let q = 0;
    if (s >= last.end) {
      p = last;
      q = 1;
    } else if (s > 0) {
      p = plan.find((x) => s < x.end) || last;
      q = Math.min(Math.max((s - p.start) / (p.end - p.start), 0), 1);
    }
    const t = p.scrub > 0 ? Math.min(q / p.scrub, 1) : 1;
    wanted = Math.round(p.from + (p.to - p.from) * t);

    const inTrack = s >= 0 && s < last.end;
    const next = (inTrack && !p.isTail && q >= p.scrub) ? p : null;
    if (next !== activeStep) {
      plan.forEach((x) => x.el.classList.toggle('is-active', x === next));
      activeStep = next;
      if (next) onActivate(next.feature);
      updateBadge();
    }
    if (wanted !== drawnIndex || dirty) draw();
  }

  function schedule() {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(update);
  }

  // ---- Debug badge
  let badge = null;
  if (debug !== null) {
    root.classList.add('is-debug');
    badge = document.createElement('div');
    badge.className = 'scrolly__badge';
    stage.appendChild(badge);
  }
  function updateBadge() {
    if (!badge) return;
    badge.textContent = `frame ${drawnIndex < 0 ? '-' : drawnIndex} · ${activeStep ? activeStep.feature : 'none'}`;
  }

  // ---- Public helpers
  function hasFeature(feature) {
    return plan.some((x) => x.feature === feature && !x.isTail);
  }

  function scrollToHold(feature) {
    const p = plan.find((x) => x.feature === feature && !x.isTail);
    if (!p) return false;
    measure();
    const y = trackTop + p.start + p.scrub * (p.end - p.start) + 1;
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    return true;
  }

  // ---- Wire up
  measure();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { measure(); schedule(); });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { measure(); schedule(); }).observe(root);
  }

  if (debug !== null || !('IntersectionObserver' in window)) {
    loadAll();
  } else {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        loadAll();
        io.disconnect();
      }
    }, { rootMargin: '100% 0px' });
    io.observe(root);
  }
  update();

  return { scrollToHold, hasFeature };
}
