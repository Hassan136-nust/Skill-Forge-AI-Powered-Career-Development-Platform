/* ============================================================================
   lets-scroll — portable scroll-scrubbed camera-flight engine
   ----------------------------------------------------------------------------
   Scrub engine adapted from lets-scroll skill reference with React cleanup,
   optimized blob buffering, lerp smoothing, and responsive touch controls.
   ============================================================================ */

export function mountLetsScroll(container, config) {
  if (!container) return () => {};

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallMQ = window.matchMedia('(max-width: 860px)');
  const isMobile = () => coarse || smallMQ.matches;
  
  const SECTIONS = config.sections || [];
  const CONNECTORS = config.connectors || [];
  const CONNECTORS_M = config.connectorsMobile || [];
  const DIVE_W = config.diveScroll || 1.8;
  const CONN_W = config.connScroll || 1.0;
  const CROSSFADE = (config.crossfade != null) ? config.crossfade : 0.15;
  const N = SECTIONS.length;
  if (!N) return () => {};

  injectCSS();
  container.classList.add('sw-root');

  // Track blob URLs for cleanup
  const createdBlobUrls = [];

  // Build the interleaved segment chain
  const SEGMENTS = [];
  SECTIONS.forEach((s, i) => {
    const dive = {
      kind: 'dive',
      si: i,
      clip: s.clip,
      clipM: s.clipMobile,
      still: s.still,
      stillM: s.stillMobile,
      accent: s.accent,
      w: s.scroll || DIVE_W,
      linger: s.linger || 0
    };
    SEGMENTS.push(dive);
    s._seg = dive;

    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push({
        kind: 'conn',
        si: i,
        clip: CONNECTORS[i],
        clipM: CONNECTORS_M[i],
        still: SECTIONS[i + 1].still,
        stillM: SECTIONS[i + 1].stillMobile,
        accent: SECTIONS[i + 1].accent,
        w: CONN_W
      });
    }
  });
  const NSEG = SEGMENTS.length;

  // DOM Elements
  const sky = el('div', 'sw-sky');
  if (config.atmosphere !== false) {
    sky.appendChild(el('div', 'sw-sky__grad'));
    sky.appendChild(el('div', 'sw-sky__glow'));
  }
  const particles = el('div', 'sw-particles');
  sky.appendChild(particles);

  const scrollbar = el('div', 'sw-scrollbar');
  const scrollbarFill = el('span');
  scrollbar.appendChild(scrollbarFill);

  const topbar = el('div', 'sw-topbar');
  if (config.brand) {
    const brand = el('a', 'sw-brand');
    brand.href = config.brand.href || '#top';
    brand.appendChild(el('span', 'sw-brand__mark'));
    const nm = el('span', 'sw-brand__name');
    nm.textContent = config.brand.name || '';
    brand.appendChild(nm);
    topbar.appendChild(brand);
  }
  
  const nav = el('nav', 'sw-nav');
  if (config.nav !== false) topbar.appendChild(nav);
  
  if (config.cta && config.cta.label) {
    const c = el('a', 'sw-topcta');
    c.href = config.cta.href || '#';
    c.textContent = config.cta.label;
    topbar.appendChild(c);
  }

  const stage = el('div', 'sw-stage');
  const copylayer = el('div', 'sw-copylayer');
  const route = el('div', 'sw-route');
  const hint = el('div', 'sw-hint');
  const hintText = el('span');
  hintText.textContent = config.hint || 'scroll to scrub';
  hint.appendChild(hintText);
  hint.appendChild(el('i'));
  const track = el('div', 'sw-track');

  [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach(n => container.appendChild(n));

  // Segment scenes
  SEGMENTS.forEach(s => {
    const scene = el('div', 'sw-scene');
    scene.style.setProperty('--sw-accent', s.accent || '');
    const img = el('img', 'sw-scene__still');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    const poster = (isMobile() && s.stillM) ? s.stillM : s.still;
    if (poster) {
      img.src = poster;
    } else {
      img.style.display = 'none';
    }
    scene.appendChild(img);
    stage.appendChild(scene);
    s.el = scene;
    s.img = img;
    s.video = null;
    s.hasClip = false;
    s.loading = false;
    s.ready = false;
    s.cur = 0;
    s.target = 0;
    s.visible = false;
  });

  // Per-section copy / route / nav
  const copies = [];
  const dots = [];
  SECTIONS.forEach((s, i) => {
    const c = el('article', 'sw-copy');
    c.style.setProperty('--sw-accent', s.accent || '');
    c.innerHTML =
      `<span class="sw-copy__num">${pad(i + 1)} / ${pad(N)}</span>` +
      (s.eyebrow ? `<span class="sw-copy__eyebrow">${esc(s.eyebrow)}</span>` : '') +
      (s.title ? `<h2 class="sw-copy__title">${esc(s.title)}</h2>` : '') +
      (s.body ? `<p class="sw-copy__body">${esc(s.body)}</p>` : '') +
      (s.tags && s.tags.length ? `<ul class="sw-copy__tags">${s.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '') +
      (s.cta ? `<div class="sw-copy__cta">${ctaBtns(s.cta)}</div>` : '');
    copylayer.appendChild(c);
    copies.push(c);

    const dot = el('button', 'sw-route__dot');
    dot.style.setProperty('--sw-accent', s.accent || '');
    dot.innerHTML = `<span class="sw-route__label">${esc(s.label || '')}</span><i></i>`;
    dot.addEventListener('click', () => jumpTo(i));
    route.appendChild(dot);
    dots.push(dot);

    if (config.nav !== false) {
      const b = el('button', 'sw-nav__item');
      b.textContent = s.label || `Scene ${i + 1}`;
      b.addEventListener('click', () => jumpTo(i));
      nav.appendChild(b);
    }
  });

  // Math functions
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const lingerEase = (x, L) => {
    L = clamp(L);
    const c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  };

  let vh = window.innerHeight;
  let stageX = 0;
  let totalW = 0;
  let activeIndex = -1;
  let ticking = false;
  let laidOutW = window.innerWidth;
  let userReady = false;
  let isDisposed = false;
  let rafId = null;

  function layout() {
    if (isDisposed) return;
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    let off = 0;
    SEGMENTS.forEach(s => {
      s.start = off * vh;
      off += s.w;
      s.end = off * vh;
    });
    totalW = off;
    track.style.height = (totalW * vh + vh) + 'px';
    read();
  }

  function jumpTo(i) {
    if (!SECTIONS[i] || !SECTIONS[i]._seg) return;
    const seg = SECTIONS[i]._seg;
    window.scrollTo({
      top: seg.start + (seg.end - seg.start) * 0.5,
      behavior: reduce ? 'auto' : 'smooth'
    });
  }

  function primeVideo(v) {
    if (!v) return;
    try {
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          try { v.pause(); } catch (e) {}
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function loadClip(s) {
    if (reduce || s.loading || !s.clip || isDisposed) return;
    s.loading = true;
    const url = (isMobile() && s.clipM) ? s.clipM : s.clip;
    
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error ${r.status}`);
        return r.blob();
      })
      .then(blob => {
        if (isDisposed) return;
        const blobUrl = URL.createObjectURL(blob);
        createdBlobUrls.push(blobUrl);

        const v = document.createElement('video');
        v.className = 'sw-scene__video';
        v.muted = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.src = blobUrl;

        v.addEventListener('loadedmetadata', () => {
          if (isDisposed) return;
          s.ready = true;
          read();
        });

        v.addEventListener('seeked', () => {
          if (isDisposed) return;
          s.el.classList.add('has-clip');
        }, { once: true });

        v.addEventListener('loadeddata', () => {
          if (isDisposed) return;
          try { v.pause(); } catch (e) {}
          if (userReady || !isMobile()) primeVideo(v);
        });

        s.el.appendChild(v);
        s.video = v;
        s.hasClip = true;
      })
      .catch((err) => {
        console.warn('Failed to load video blob:', url, err);
        s.loading = false;
      });
  }

  function read() {
    if (isDisposed) return;
    const y = window.scrollY || window.pageYOffset;
    const fade = CROSSFADE * vh;
    let ci = 0;
    for (let i = 0; i < NSEG; i++) {
      if (y >= SEGMENTS[i].start) ci = i;
    }

    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      // Pre-load clips slightly before they enter the viewport
      if (y > s.start - 2.0 * vh && y < s.end + 2.0 * vh) loadClip(s);
      
      const local = clamp((y - s.start) / Math.max(1, s.end - s.start), 0, 1);
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      
      let outside = 0;
      if (y < s.start) outside = s.start - y;
      else if (y > s.end) outside = y - s.end;
      
      const op = smooth(1 - outside / fade);
      s.el.style.opacity = op;
      s.visible = op > 0.001;
      s.el.style.zIndex = (i === ci) ? '120' : String(100 + Math.round(op * 10));
      
      if ((!s.hasClip || !s.ready) && s.img) {
        const sc = reduce ? 1 : 1.03 + local * 0.14;
        s.img.style.transform = `translateX(${stageX - 2}vw) scale(${sc.toFixed(3)})`;
      }
    }

    for (let i = 0; i < N; i++) {
      const seg = SECTIONS[i]._seg;
      const segLen = Math.max(1, seg.end - seg.start);
      const pr = clamp((y - seg.start) / segLen, 0, 1);
      const before = y < seg.start;
      const after = y > seg.end;
      let cop;
      if (i === 0) {
        cop = after ? 0 : smooth(1 - pr / 0.62);
      } else if (i === N - 1) {
        cop = before ? 0 : smooth(pr / 0.4);
      } else {
        cop = (before || after) ? 0 : smooth(1 - Math.abs(pr - 0.5) / 0.5);
      }
      const c = copies[i];
      c.style.opacity = cop;
      c.style.transform = reduce ? 'none' : `translateY(${(0.5 - pr) * 4}vh)`;
      c.style.pointerEvents = cop > 0.5 ? 'auto' : 'none';
    }

    const cur = SEGMENTS[ci];
    const near = clamp(cur.kind === 'dive' ? cur.si
      : (((y - cur.start) / (cur.end - cur.start)) > 0.5 ? cur.si + 1 : cur.si), 0, N - 1);
    
    if (near !== activeIndex) {
      activeIndex = near;
      dots.forEach((d, k) => d.classList.toggle('is-active', k === near));
      nav.querySelectorAll('.sw-nav__item').forEach((n, k) => n.classList.toggle('is-active', k === near));
      if (SECTIONS[near] && SECTIONS[near].accent) {
        container.style.setProperty('--sw-accent', SECTIONS[near].accent);
      }
    }

    scrollbarFill.style.transform = `scaleX(${clamp(y / Math.max(1, totalW * vh))})`;
    hint.style.opacity = clamp(1 - y / (0.5 * vh));
    if (particles) particles.style.transform = `translate3d(0, ${-y * 0.05}px, 0)`;
    ticking = false;
  }

  function raf() {
    if (isDisposed) return;
    const eps = isMobile() ? 0.015 : 0.005;
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (!s.hasClip || !s.ready || !s.video) continue;
      if (s.video.seeking) continue;
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;

      s.cur += (s.target - s.cur) * (reduce ? 1 : 0.22);
      const dur = s.video.duration || 1;
      const t = clamp(s.cur, 0, 0.999) * dur;
      if (Math.abs(s.video.currentTime - t) > eps) {
        try {
          s.video.currentTime = t;
        } catch (e) {}
      }
    }
    rafId = requestAnimationFrame(raf);
  }

  function onFirstGesture() {
    if (userReady) return;
    userReady = true;
    SEGMENTS.forEach(s => primeVideo(s.video));
  }

  function onScroll() {
    if (!ticking && !isDisposed) {
      ticking = true;
      requestAnimationFrame(read);
    }
  }

  function onResize() {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  }

  window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
  window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', layout);
  window.addEventListener('load', layout);

  seedParticles(particles, reduce || coarse);
  layout();
  rafId = requestAnimationFrame(raf);

  // Return cleanup function for React useEffect unmount
  return function unmount() {
    isDisposed = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('pointerdown', onFirstGesture);
    window.removeEventListener('touchstart', onFirstGesture);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', layout);
    window.removeEventListener('load', layout);
    
    // Revoke all blob URLs
    createdBlobUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  };
}

function seedParticles(host, reduce) {
  if (!host || reduce) return;
  const kinds = ['dot', 'dot', 'ring'];
  const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
  for (let k = 0; k < 20; k++) {
    const s = document.createElement('span');
    s.className = 'sw-pt sw-pt--' + kinds[k % kinds.length];
    s.style.left = seeds[k % seeds.length] + 'vw';
    s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + 'vh';
    s.style.setProperty('--sw-sc', (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
    const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = (-(seeds[(k * 2) % seeds.length] % dur)) + 's';
    host.appendChild(s);
  }
}

function el(tag, cls) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function ctaBtns(cta) {
  let h = '';
  if (cta.primary) h += `<a class="sw-btn sw-btn--primary" href="${esc(cta.primary.href || '#')}">${esc(cta.primary.label)}</a>`;
  if (cta.secondary) h += `<a class="sw-btn sw-btn--ghost" href="${esc(cta.secondary.href || '#')}">${esc(cta.secondary.label)}</a>`;
  return h;
}

function injectCSS() {
  if (document.getElementById('sw-css')) return;
  const css = `
  .sw-root {
    --sw-bg: #090a0f;
    --sw-ink: #f3f4f8;
    --sw-ink-soft: #9499ab;
    --sw-accent: #00e5ff;
    --sw-font-display: "Outfit", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --sw-font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
    color: var(--sw-ink);
    font-family: var(--sw-font-body);
    width: 100%;
    min-height: 100vh;
    position: relative;
    background: var(--sw-bg);
  }
  
  html, body {
    margin: 0;
    padding: 0;
    background: var(--sw-bg, #090a0f);
    overflow-x: hidden;
  }
  
  .sw-sky {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background: var(--sw-bg);
  }
  
  .sw-sky__grad {
    position: absolute;
    inset: -10%;
    background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--sw-accent) 15%, transparent) 0%, transparent 70%),
                linear-gradient(180deg, #090a0f 0%, #06070a 100%);
  }
  
  .sw-sky__glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(55% 40% at 75% 20%, color-mix(in srgb, var(--sw-accent) 20%, transparent), transparent 75%),
                radial-gradient(40% 30% at 25% 70%, color-mix(in srgb, #a855f7 16%, transparent), transparent 70%);
  }
  
  .sw-particles {
    position: absolute;
    inset: -6% -2%;
    will-change: transform;
  }
  
  .sw-pt {
    position: absolute;
    width: 12px;
    height: 12px;
    transform: scale(var(--sw-sc, 1));
    opacity: 0;
    animation: sw-drift linear infinite;
  }
  
  .sw-pt::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }
  
  .sw-pt--dot::before {
    background: radial-gradient(circle at 34% 30%, var(--sw-accent), color-mix(in srgb, var(--sw-accent) 20%, transparent) 85%);
    box-shadow: 0 0 10px var(--sw-accent);
  }
  
  .sw-pt--ring::before {
    background: transparent;
    border: 1.5px solid color-mix(in srgb, var(--sw-accent) 60%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--sw-accent) 30%, transparent);
  }
  
  @keyframes sw-drift {
    0% { opacity: 0; transform: scale(var(--sw-sc)) translate(0, 12vh) rotate(0); }
    15% { opacity: .6; }
    85% { opacity: .5; }
    100% { opacity: 0; transform: scale(var(--sw-sc)) translate(4vw, -22vh) rotate(210deg); }
  }
  
  .sw-scrollbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 60;
    background: rgba(255, 255, 255, 0.08);
  }
  
  .sw-scrollbar span {
    display: block;
    height: 100%;
    width: 100%;
    transform-origin: 0 50%;
    transform: scaleX(0);
    background: linear-gradient(90deg, var(--sw-accent), #a855f7);
    box-shadow: 0 0 12px var(--sw-accent);
  }
  
  .sw-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: clamp(14px, 2.4vw, 24px) clamp(18px, 5vw, 64px);
  }
  
  .sw-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--sw-ink);
  }
  
  .sw-brand__mark {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--sw-accent), #a855f7);
    box-shadow: 0 0 18px color-mix(in srgb, var(--sw-accent) 60%, transparent);
    display: inline-block;
  }
  
  .sw-brand__name {
    font-family: var(--sw-font-display);
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    background: linear-gradient(180deg, #fff 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .sw-nav {
    display: flex;
    gap: 6px;
    padding: 6px;
    background: rgba(15, 17, 26, 0.65);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  
  .sw-nav__item {
    font: inherit;
    font-size: 0.84rem;
    font-weight: 500;
    color: var(--sw-ink-soft);
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 8px 18px;
    border-radius: 999px;
    transition: color 0.25s, background 0.25s, transform 0.2s;
  }
  
  .sw-nav__item:hover {
    color: #fff;
  }
  
  .sw-nav__item.is-active {
    color: #090a0f;
    background: var(--sw-accent);
    font-weight: 600;
    box-shadow: 0 0 16px color-mix(in srgb, var(--sw-accent) 50%, transparent);
  }
  
  .sw-topcta {
    text-decoration: none;
    font-weight: 600;
    font-size: 0.88rem;
    color: #090a0f;
    background: var(--sw-accent);
    padding: 10px 22px;
    border-radius: 999px;
    white-space: nowrap;
    box-shadow: 0 0 20px color-mix(in srgb, var(--sw-accent) 40%, transparent);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .sw-topcta:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 28px color-mix(in srgb, var(--sw-accent) 60%, transparent);
  }
  
  .sw-stage {
    position: fixed;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }
  
  .sw-scene {
    position: absolute;
    inset: 0;
    opacity: 0;
    overflow: hidden;
    will-change: opacity;
  }
  
  .sw-scene__video, .sw-scene__still {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }
  
  .sw-scene__still {
    will-change: transform;
  }
  
  .sw-scene.has-clip .sw-scene__still {
    opacity: 0;
  }
  
  .sw-scene__video {
    z-index: 1;
    filter: brightness(0.95) contrast(1.05);
  }
  
  .sw-copylayer {
    position: fixed;
    inset: 0;
    z-index: 20;
    pointer-events: none;
  }
  
  .sw-copylayer::before {
    content: "";
    position: absolute;
    inset: 0;
    width: min(56vw, 760px);
    background: linear-gradient(90deg, rgba(9, 10, 15, 0.85) 0%, rgba(9, 10, 15, 0.6) 45%, transparent 100%);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  
  .sw-copy {
    position: absolute;
    left: clamp(20px, 6vw, 80px);
    top: 50%;
    transform: translateY(-50%);
    width: min(44vw, 520px);
    opacity: 0;
    will-change: opacity, transform;
  }
  
  .sw-copy__num {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: var(--sw-accent);
    display: inline-block;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }
  
  .sw-copy__eyebrow {
    display: block;
    margin-top: 18px;
    font-family: var(--sw-font-display);
    font-weight: 700;
    font-size: 0.86rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sw-accent);
  }
  
  .sw-copy__title {
    font-family: var(--sw-font-display);
    font-weight: 800;
    color: #fff;
    font-size: clamp(2.2rem, 4.8vw, 3.8rem);
    line-height: 1.05;
    margin: 12px 0 0;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8);
  }
  
  .sw-copy__body {
    margin-top: 18px;
    font-size: clamp(1.05rem, 1.3vw, 1.2rem);
    line-height: 1.6;
    color: var(--sw-ink-soft);
    max-width: 44ch;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.9);
  }
  
  .sw-copy__tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 26px 0 0;
    padding: 0;
  }
  
  .sw-copy__tags li {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--sw-accent);
    padding: 6px 14px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--sw-accent) 12%, rgba(255, 255, 255, 0.04));
    border: 1px solid color-mix(in srgb, var(--sw-accent) 35%, transparent);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .sw-copy__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 30px;
    pointer-events: auto;
  }
  
  .sw-btn {
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 13px 26px;
    border-radius: 999px;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .sw-btn--primary {
    color: #090a0f;
    background: var(--sw-accent);
    box-shadow: 0 0 24px color-mix(in srgb, var(--sw-accent) 45%, transparent);
  }
  
  .sw-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 32px color-mix(in srgb, var(--sw-accent) 70%, transparent);
  }
  
  .sw-btn--ghost {
    color: #fff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
  }
  
  .sw-btn--ghost:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.35);
  }
  
  .sw-route {
    position: fixed;
    right: clamp(16px, 3vw, 36px);
    top: 50%;
    z-index: 40;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 20px 10px;
  }
  
  .sw-route::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 22px;
    bottom: 22px;
    width: 2px;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .sw-route__dot {
    position: relative;
    border: 0;
    background: transparent;
    cursor: pointer;
    width: 16px;
    height: 16px;
    display: grid;
    place-items: center;
    padding: 0;
  }
  
  .sw-route__dot i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.35);
    transition: transform 0.3s, background 0.3s, box-shadow 0.3s;
  }
  
  .sw-route__dot:hover i {
    transform: scale(1.3);
    background: var(--sw-accent);
  }
  
  .sw-route__dot.is-active i {
    background: var(--sw-accent);
    transform: scale(1.5);
    box-shadow: 0 0 12px var(--sw-accent), 0 0 0 4px color-mix(in srgb, var(--sw-accent) 25%, transparent);
  }
  
  .sw-route__label {
    position: absolute;
    right: 28px;
    top: 50%;
    transform: translateY(-50%) translateX(6px);
    white-space: nowrap;
    font-size: 0.8rem;
    font-weight: 600;
    color: #fff;
    background: rgba(15, 17, 26, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 6px 14px;
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s, transform 0.25s;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  
  .sw-route__dot:hover .sw-route__label,
  .sw-route__dot.is-active .sw-route__label {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
  
  .sw-hint {
    position: fixed;
    left: 50%;
    bottom: 28px;
    z-index: 30;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--sw-ink-soft);
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
  .sw-hint i {
    width: 22px;
    height: 36px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
  
  .sw-hint i::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 7px;
    width: 4px;
    height: 7px;
    border-radius: 2px;
    background: var(--sw-accent);
    transform: translateX(-50%);
    box-shadow: 0 0 8px var(--sw-accent);
    animation: sw-wheel 1.8s ease-in-out infinite;
  }
  
  @keyframes sw-wheel {
    0% { opacity: 0; top: 6px; }
    35% { opacity: 1; }
    100% { opacity: 0; top: 18px; }
  }
  
  .sw-track {
    position: relative;
    z-index: 1;
    width: 100%;
    pointer-events: none;
  }
  
  @media (max-width: 860px) {
    .sw-nav { display: none; }
    .sw-copylayer::before {
      width: 100%;
      height: 65%;
      top: auto;
      bottom: 0;
      background: linear-gradient(0deg, rgba(9, 10, 15, 0.95) 15%, rgba(9, 10, 15, 0.7) 60%, transparent 100%);
    }
    .sw-copy {
      left: clamp(20px, 6vw, 64px);
      right: clamp(20px, 6vw, 64px);
      top: auto;
      bottom: clamp(60px, 14vh, 120px);
      transform: none;
      width: auto;
      max-width: 560px;
    }
    .sw-copy__title {
      font-size: clamp(2rem, 7.8vw, 2.8rem);
    }
    .sw-copy__body {
      max-width: none;
      font-size: clamp(1rem, 3.8vw, 1.12rem);
    }
    .sw-route {
      gap: 16px;
      right: 8px;
    }
    .sw-route__label {
      display: none;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .sw-hint i::after { animation: none; }
    .sw-pt { display: none; }
  }
  `;

  const style = document.createElement('style');
  style.id = 'sw-css';
  style.textContent = '@layer sw {\n' + css + '\n}';
  document.head.appendChild(style);
}
