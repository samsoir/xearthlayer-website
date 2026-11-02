/**
 * Scroll-driven frame sequence for the homepage features story.
 *
 * The track (#scrolly) holds a sticky stage with a canvas and a series of
 * steps. Each step scrubs the picture from the previous hold frame to its
 * own hold frame over the first part of its height, then holds while its
 * card is active. A step's hold is manifest.holds[data-hold || data-feature],
 * so several steps can share one hold; a step with no such hold keeps showing
 * the previous frame. A `scrolly__step--tail` scrubs to the last frame. The
 * first step's range begins one viewport before the track top, so the
 * opening frames advance while the stage slides into view instead of
 * waiting for it to pin. The manifest in data-scrolly comes from
 * scripts/extract-scrolly-frames.py.
 *
 * options.onTrack(inTrack) reports when the stage pins and unpins, so the
 * page can show things, such as the progress dots, only while the story
 * is running.
 *
 * A step may name a scene with `data-scene`; while such a step is current
 * the root carries `is-<scene>` and options.onScene(scene) is called, which
 * the terminal steps use to show the terminal layer over the picture. A
 * step that moves no frames activates after a quarter of its height
 * rather than after the scrub.
 *
 * A `.scrolly__hint` inside the stage is shown when the reader has not
 * moved for a while with the stage pinned, so a pause on a card does not
 * read as the end of the page. It hides as soon as the scroll position
 * changes or the track is left.
 *
 * Debug: append ?scrolly-debug=<fraction> to force progress through the
 * track and show a badge with the frame index and active feature. Frames
 * are then marked on load rather than decode so headless screenshots catch
 * the drawn canvas, and the hint shows without its idle delay.
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
  const onScene = typeof options.onScene === 'function' ? options.onScene : () => {};
  const onTrack = typeof options.onTrack === 'function' ? options.onTrack : () => {};
  const debugMatch = /[?&]scrolly-debug=([0-9.]+)/.exec(window.location.search);
  const debug = debugMatch ? Math.min(Math.max(parseFloat(debugMatch[1]) || 0, 0), 1) : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const total = manifest.frames;
  const end = manifest.end;
  const holds = manifest.holds || {};
  const pad = manifest.pad || 3;
  // The frame set is chosen by what the stage actually draws: the picture
  // covers the stage, so a tall phone screen needs frames as wide as its
  // height times the aspect, at device pixels. Smallest set that covers it,
  // else the largest.
  const sourceAspect = manifest.source.width / manifest.source.height;
  const coverPx = Math.max(stage.clientWidth, stage.clientHeight * sourceAspect)
    * Math.min(window.devicePixelRatio || 1, 2);
  const widths = manifest.widths.slice().sort((a, b) => a - b);
  const width = widths.find((w) => w >= coverPx) || widths[widths.length - 1];

  // ---- Step plan: frame range and scrub fraction per step
  let from = 0;
  const plan = steps.map((el) => {
    const feature = el.dataset.feature;
    const isTail = el.classList.contains('scrolly__step--tail');
    const key = el.dataset.hold || feature;
    const to = isTail ? end : (key in holds ? holds[key] : from);
    const scrub = reduceMotion ? 0 : (isTail ? 1 : (to === from ? 0.25 : 0.6));
    const scene = el.dataset.scene || null;
    const entry = { el, feature, from, to, scrub, isTail, scene, start: 0, end: 0 };
    from = to;
    return entry;
  });
  const last = plan[plan.length - 1];
  const maxTo = Math.max(...plan.map((p) => p.to));
  const hasTail = plan.some((p) => p.isTail);

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
      p.start = i === 0 ? -vh : p.el.offsetTop;
      p.end = p.el.offsetTop + p.el.offsetHeight;
      if (i === plan.length - 1) p.end = Math.min(p.end, trackHeight - vh);
      if (p.end <= p.start) p.end = p.start + 1;
    });
    const coverW = Math.max(stage.clientWidth, stage.clientHeight * sourceAspect);
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, width / coverW));
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
      if (i >= 0 && i <= maxTo && i < total && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    push(0);
    Object.keys(holds).forEach((k) => push(holds[k]));
    if (hasTail) push(end);
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
          () => { frames[i] = img; if (drawnIndex !== wanted) schedule(); },
          () => { failed.add(i); },
        ).finally(() => {
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
  let activeScene = null;
  let wasInTrack = null;
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
    } else if (s > plan[0].start) {
      p = plan.find((x) => s < x.end) || last;
      q = Math.min(Math.max((s - p.start) / (p.end - p.start), 0), 1);
    }
    const t = p.scrub > 0 ? Math.min(q / p.scrub, 1) : 1;
    wanted = Math.round(p.from + (p.to - p.from) * t);

    const inTrack = s >= 0 && s < last.end;
    if (inTrack !== wasInTrack) {
      wasInTrack = inTrack;
      onTrack(inTrack);
    }
    trackIdle(s, inTrack);
    const scene = s > plan[0].start ? p.scene : null;
    if (scene !== activeScene) {
      if (activeScene) root.classList.remove(`is-${activeScene}`);
      if (scene) root.classList.add(`is-${scene}`);
      activeScene = scene;
      onScene(scene);
    }
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

  // ---- Scroll hint
  const hint = root.querySelector('.scrolly__hint');
  // A scene (the terminal clips) is worth watching for a while, so the hint
  // waits longer there than on a held picture.
  const hintDelay = () => (debug !== null ? 0 : (activeScene ? 8000 : 2500));
  let hintTimer = 0;
  let lastPosition = null;

  function trackIdle(s, inTrack) {
    if (!hint || s === lastPosition) return;
    lastPosition = s;
    hint.classList.remove('is-visible');
    window.clearTimeout(hintTimer);
    if (inTrack) {
      hintTimer = window.setTimeout(() => hint.classList.add('is-visible'), hintDelay());
    }
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
    badge.textContent = `frame ${drawnIndex < 0 ? '-' : drawnIndex} · ${activeStep ? activeStep.feature : 'none'} · ${width}w`;
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

  // Start loading once the page has loaded (so the first requests do not
  // compete with the hero video) and the track is near the viewport. Debug
  // mode starts immediately.
  let pageLoaded = document.readyState === 'complete';
  let nearViewport = !('IntersectionObserver' in window);
  const maybeLoad = () => { if (pageLoaded && nearViewport) loadAll(); };
  if (debug !== null) {
    loadAll();
  } else {
    if (!pageLoaded) {
      window.addEventListener('load', () => { pageLoaded = true; maybeLoad(); }, { once: true });
    }
    if (nearViewport) {
      maybeLoad();
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          nearViewport = true;
          maybeLoad();
          io.disconnect();
        }
      }, { rootMargin: '100% 0px' });
      io.observe(root);
    }
  }
  update();

  return { scrollToHold, hasFeature };
}
