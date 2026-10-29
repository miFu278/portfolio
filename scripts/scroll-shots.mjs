/**
 * Scroll-pass verification. Walks the page the way a reader does and asserts the
 * invariants the cinematic pass rests on, then captures the review screenshots.
 *
 * No Playwright/Puppeteer: Node's global WebSocket plus --remote-debugging-port
 * is enough, as in scripts/shoot.mjs.
 *
 *   node scripts/scroll-shots.mjs [baseUrl]
 *
 * Exits non-zero when an invariant fails, and names the one that did.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = 'screenshots/scroll';
const PORT = 9223;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('No Chrome or Edge binary found.');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

// The profile must live outside the project: Chrome holds locks on its session
// files and Vite's watcher dies with EBUSY when it finds them in-tree.
const PROFILE = join(tmpdir(), 'portfolio-chrome-scroll');
mkdirSync(PROFILE, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);
const cleanup = () => {
  try {
    chrome.kill();
  } catch {
    /* already gone */
  }
};
process.on('exit', cleanup);

const waitForDevtools = async () => {
  for (let i = 0; i < 100; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(120);
  }
  throw new Error('DevTools endpoint never came up');
};

const connect = async (wsUrl) => {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      listeners.get(msg.method).forEach((fn) => fn(msg.params));
      listeners.delete(msg.method);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const once = (method) =>
    new Promise((resolve) => {
      const set = listeners.get(method) ?? [];
      set.push(resolve);
      listeners.set(method, set);
    });

  const evaluate = async (expression, awaitPromise = false) => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise,
    });
    if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails));
    return result.value;
  };

  return { send, once, evaluate, close: () => ws.close() };
};

const load = async (cdp, width, height) => {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  const loaded = Promise.race([cdp.once('Page.loadEventFired'), sleep(8000)]);
  await cdp.send('Page.navigate', { url: `${BASE}/` });
  await loaded;
  // Fonts, the loader, and the two lazy diagram rasters.
  await sleep(2400);
};

const shot = async (cdp, name) => {
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
  console.log(`  shot ${OUT}/${name}.png`);
};

/**
 * The rail's map, restated outside the app: piecewise-linear between chapter
 * anchors, clamped at both ends. Anchors are re-measured here so the comparison
 * uses the layout as it stands, not as it stood when the page first painted.
 */
const READ_PAGE = `(() => ({
  scrollY: Math.round(window.scrollY),
  docHeight: document.documentElement.scrollHeight,
}))()`;

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`);
};

await waitForDevtools();
const target = await (
  await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
).json();
const cdp = await connect(target.webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');


console.log('desktop 1500x900');
await load(cdp, 1500, 900);

const firstPaint = await cdp.evaluate(`(() => {
  const diagrams = [...document.querySelectorAll('.project__diagram img')];
  return {
    diagrams: diagrams.map((img) => ({
      loaded: img.complete && img.naturalWidth > 0,
      boxHeight: Math.round(img.getBoundingClientRect().height),
    })),
  };
})()`);

for (const [i, img] of firstPaint.diagrams.entries()) {
  check(
    `diagram ${i + 1} reserves its box`,
    img.boxHeight > 0,
    `boxHeight ${img.boxHeight}, raster ${img.loaded ? 'decoded' : 'not decoded yet'}`,
  );
}

await shot(cdp, 'a-hero-rest');

// Caught mid-reveal: the page is already walked later, and the reveal fires once,
// so the moment has to be taken on the way in.
await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const el = document.getElementById('gateway');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55);
})()`, true);
await sleep(170);
await shot(cdp, 'h-title-reveal');

// The seam caught mid-open, before the title has landed.
await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const el = document.getElementById('gateway');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.82);
})()`, true);
await sleep(500);
await shot(cdp, 'i-seam-open');

// A reader scrolls down through the page, so every lazy raster loads. A jump to
// the bottom skips them, which is why the shift this guards against only showed
// up on a walk.
const walk = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const read = () => ${READ_PAGE};
  const out = [];
  const step = 300;
  for (let y = 0; y <= document.documentElement.scrollHeight - window.innerHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    out.push(read());
  }
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  out.push(read());
  return out;
})()`, true);

const heights = walk.map((s) => s.docHeight);
const spread = Math.max(...heights) - Math.min(...heights);
check(
  'the document keeps one height while a reader scrolls it',
  spread <= 1,
  `scrollHeight ${Math.min(...heights)}..${Math.max(...heights)} over ${walk.length} positions`,
);

// The wheel has to be eased by Lenis, and the velocity layer has to shear with
// it and settle flush. A wheel event is the only honest way to see that: a
// window.scrollTo jump produces no velocity at all.
await cdp.evaluate(`window.scrollTo(0, 0)`, false);
await sleep(400);
// Frame timing during the burst. Informational only: this runs headless with the
// GPU disabled, so the numbers set a floor, not a real-world figure.
await cdp.evaluate(`(() => {
  window.__frames = [];
  window.__sampling = true;
  const tick = (t) => {
    window.__frames.push({ t, y: window.scrollY });
    if (window.__sampling) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})()`);
const wheel = [];
for (let i = 0; i < 6; i += 1) {
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 700,
    y: 450,
    deltaX: 0,
    deltaY: 220,
  });
  await sleep(70);
  wheel.push(
    await cdp.evaluate(`({
      y: Math.round(window.scrollY),
      skew: document.documentElement.style.getPropertyValue('--scroll-skew'),
    })`),
  );
}
await sleep(1400);
const wheelSettled = await cdp.evaluate(`({
  y: Math.round(window.scrollY),
  skew: document.documentElement.style.getPropertyValue('--scroll-skew'),
})`);
const frames = await cdp.evaluate(`(() => {
  window.__sampling = false;
  const rows = window.__frames;
  const gaps = rows.slice(1).map((r, i) => r.t - rows[i].t).sort((a, b) => a - b);
  const steps = rows.slice(1).map((r, i) => Math.abs(r.y - rows[i].y));
  const at = (q) => +gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * q))].toFixed(1);
  return { count: gaps.length, median: at(0.5), p95: at(0.95), maxStep: +Math.max(...steps).toFixed(0) };
})()`);
console.log(
  `  info  while a reader scrolls: frame gap median ${frames.median}ms, p95 ${frames.p95}ms; largest scroll step in one frame ${frames.maxStep}px over ${frames.count} frames (headless, no GPU)`,
);

const shears = wheel.map((s) => Math.abs(Number.parseFloat(s.skew) || 0));
check(
  'the wheel is eased and the velocity layer shears with it',
  shears[0] > 0.05 && shears[0] < 1.6 && Math.max(...shears) <= 2.001 && wheelSettled.y > 800,
  `one tick shears ${shears[0].toFixed(2)}deg, the burst reaches ${Math.max(...shears).toFixed(2)}deg of a 2deg ceiling, scrolled to ${wheelSettled.y}`,
);
check(
  'the shear settles flush when the wheel stops',
  Math.abs(Number.parseFloat(wheelSettled.skew) || 0) < 0.01,
  `--scroll-skew ${wheelSettled.skew || '0deg'}`,
);

// Every scrubbed element is measured at both ends of its own transit, because
// a transform reserves no space: what it may not do is travel further than the
// layout gap around it. The gaps are read with every transform cleared.
const scrubbed = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const selector = '.chapter-head__kicker, .chapter-head__title, .project__diagram';
  const shift = (el) => {
    const m = getComputedStyle(el).transform;
    return m === 'none' ? 0 : +m.split(', ').pop().replace(')', '');
  };
  const out = [];
  for (const el of document.querySelectorAll(selector)) {
    const box = el.getBoundingClientRect();
    const top = box.top + window.scrollY;
    const from = Math.max(0, top - window.innerHeight);
    const to = top + box.height;
    // Sampled across the whole transit rather than at its two ends: the last
    // chapters sit close enough to the end of the page that a full transit is
    // not always reachable, and the clamp would read as "does not move".
    const amplitude = [];
    for (const step of [0, 0.25, 0.5, 0.75, 1]) {
      window.scrollTo(0, Math.round(from + (to - from) * step));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      amplitude.push(Math.abs(shift(el)));
    }

    // The velocity layer shears a container with scroll speed, and a skew
    // changes what getBoundingClientRect reports. Clear it with the transforms.
    const skewers = [...document.querySelectorAll('.services__list')];
    const keptSkew = skewers.map((n) => [n, n.style.transform]);
    skewers.forEach((n) => { n.style.transform = 'none'; });

    const neighbours = [el, el.previousElementSibling, el.nextElementSibling].filter(Boolean);
    const kept = neighbours.map((n) => [n, n.style.transform]);
    neighbours.forEach((n) => { n.style.transform = 'none'; });
    const plain = el.getBoundingClientRect();
    const gapAbove = el.previousElementSibling
      ? +(plain.top - el.previousElementSibling.getBoundingClientRect().bottom).toFixed(1)
      : null;
    const gapBelow = el.nextElementSibling
      ? +(el.nextElementSibling.getBoundingClientRect().top - plain.bottom).toFixed(1)
      : null;
    kept.forEach(([n, value]) => { n.style.transform = value; });
    keptSkew.forEach(([n, value]) => { n.style.transform = value; });

    out.push({
      name: el.className.split(' ').pop(),
      chapter: el.closest('section')?.id ?? '?',
      amplitude: +Math.max(...amplitude).toFixed(1),
      gapAbove,
      gapBelow,
      transition: getComputedStyle(el).transitionProperty,
    });
  }
  return out;
})()`, true);

const still = scrubbed.filter((s) => s.amplitude < 1);
check(
  'every scrubbed element actually moves',
  still.length === 0,
  still.length
    ? still.map((s) => `${s.name} in ${s.chapter}`).join(', ')
    : `${scrubbed.length} elements, amplitudes ${[...new Set(scrubbed.map((s) => s.amplitude))].join(', ')}px`,
);

const room = (s) => Math.min(s.gapAbove ?? Number.POSITIVE_INFINITY, s.gapBelow ?? Number.POSITIVE_INFINITY);
const crowded = scrubbed.filter((s) => s.amplitude > room(s));
const tightest = Math.min(...scrubbed.map((s) => room(s) - s.amplitude));
check(
  'every scrubbed element stays inside the space it owns',
  crowded.length === 0,
  crowded.length
    ? crowded.map((s) => `${s.name} in ${s.chapter} travels ${s.amplitude}px into ${room(s)}px`).join(', ')
    : `tightest margin ${tightest.toFixed(1)}px`,
);

const smoothed = scrubbed.filter((s) => s.transition.includes('transform'));
check(
  'no scrub is smoothed by a CSS transform transition',
  smoothed.length === 0,
  smoothed.length
    ? smoothed.map((s) => `${s.name} in ${s.chapter}`).join(', ')
    : `transform untransitioned on all ${scrubbed.length}`,
);

// Past its own entrance, a title must sit in its layout box, not below it.
const rest = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const out = [];
  for (const title of document.querySelectorAll('.chapter-head__title')) {
    const top = title.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.4));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 900));
    out.push({ chapter: title.closest('section')?.id ?? '?', transform: getComputedStyle(title).transform });
  }
  return out;
})()`, true);
const offsetOf = (transform) =>
  transform === 'none' ? 0 : +transform.split(', ').pop().replace(')', '');
const stuck = rest.filter((r) => Math.abs(offsetOf(r.transform)) > 0.5);
check(
  'a title that has arrived sits in its own box',
  stuck.length === 0,
  stuck.length
    ? stuck.map((r) => `${r.chapter} at ${offsetOf(r.transform)}px`).join(', ')
    : 'every title rests at translateY 0',
);

// Text entrances and the figure wipe. Both are measured after scrolling the
// element into its reading position and letting the transition finish, so a
// mask that never opens, or a wipe that never completes, fails here.
const arrivals = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const settle = async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 1500));
  };
  const masks = [];
  const figures = [];

  for (const el of document.querySelectorAll('.chapter-head__title, .chapter-head .lead')) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.45));
    await settle();
    const lines = [...el.querySelectorAll('.line')];
    const words = [...el.querySelectorAll('.line__w')];
    const glyphs = [...el.querySelectorAll('.line__c')].filter((c) => !c.classList.contains('type-caret'));
    const caret = el.querySelector('.type-caret');
    masks.push({
      chapter: el.closest('section')?.id ?? '?',
      split: el.dataset.split ?? 'none',
      lineCount: lines.length,
      words: words.length,
      glyphs: glyphs.length,
      caret: caret ? getComputedStyle(caret).animationName : 'none',
      caretAtEnd: caret ? !caret.nextElementSibling && !!caret.previousElementSibling : false,
      label: el.getAttribute('aria-label') ?? 'none',
      clipped: lines.every((l) => getComputedStyle(l).overflow === 'hidden'),
      settled: [...el.querySelectorAll('.line__in')].every((i) => getComputedStyle(i).transform === 'none'),
      wordSettled: words.every((w) => {
        const cs = getComputedStyle(w);
        return cs.transform === 'none' && cs.opacity === '1';
      }),
      glyphSettled: glyphs.every((g) => getComputedStyle(g).opacity === '1'),
    });
  }

  for (const fig of document.querySelectorAll('.project__diagram')) {
    const top = fig.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.5));
    await settle();
    const wipe = fig.querySelector('.figure');
    const img = fig.querySelector('img');
    figures.push({
      shown: fig.dataset.shown,
      clip: wipe ? getComputedStyle(wipe).clipPath : 'missing',
      imageScale: img ? getComputedStyle(img).transform : 'missing',
    });
  }

  return { masks, figures };
})()`, true);

const unopened = arrivals.masks.filter(
  (m) =>
    m.lineCount < 1 ||
    m.words + m.glyphs < 2 ||
    !m.clipped ||
    !m.settled ||
    (m.split === 'type' ? !m.glyphSettled : !m.wordSettled),
);
check(
  'every chapter line arrives through its own mask',
  unopened.length === 0 && arrivals.masks.length >= 6,
  unopened.length
    ? unopened.map((m) => `${m.chapter}: ${m.lineCount} lines, clipped ${m.clipped}, settled ${m.settled}`).join(', ')
    : `${arrivals.masks.length} blocks, ${arrivals.masks.reduce((n, m) => n + m.lineCount, 0)} masked lines`,
);

const typed = arrivals.masks.filter((m) => m.split === 'type');
const untyped = typed.filter(
  (m) =>
    m.glyphs < 3 ||
    !m.glyphSettled ||
    !m.caret.includes('caretRetire') ||
    !m.caretAtEnd ||
    m.label === 'none',
);
check(
  'every chapter title types itself in, with a caret that follows and retires',
  typed.length >= 5 && untyped.length === 0,
  untyped.length
    ? untyped
        .map(
          (m) =>
            `${m.chapter}: ${m.glyphs} glyphs, settled ${m.glyphSettled}, caret ${m.caret}, at end ${m.caretAtEnd}, label ${m.label}`,
        )
        .join(', ')
    : `${typed.length} titles, ${typed.reduce((n, m) => n + m.glyphs, 0)} glyphs, all settled and labelled`,
);

const unwiped = arrivals.figures.filter(
  (f) => f.shown !== 'true' || f.clip !== 'inset(0px)' || f.imageScale !== 'none',
);
check(
  'every project figure wipes in and settles',
  unwiped.length === 0 && arrivals.figures.length > 0,
  unwiped.length
    ? unwiped.map((f) => `shown ${f.shown}, clip ${f.clip}, image ${f.imageScale}`).join(' | ')
    : `${arrivals.figures.length} figures, wiped open and settled`,
);

// The services beat: the stage must hold still while the projects travel, the
// slides must fit the viewport, and the registry must follow whichever slide is
// on screen. All three are read from the page as it stands.
const beat = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const stage = document.querySelector('.services__stage');
  const hold = stage?.parentElement;
  const track = document.querySelector('.services__list');
  if (!stage || !hold || !track) return null;

  const top = hold.getBoundingClientRect().top + window.scrollY;
  const spread = Math.round((track.children.length - 1) * stage.clientWidth);
  const room = Math.round(hold.getBoundingClientRect().height - window.innerHeight);

  // Eleven positions across the hold: the shape of the beat (hold, travel,
  // dwell) is read from behaviour rather than from constants the page never
  // exposes.
  const samples = [];
  for (let i = 0; i <= 10; i += 1) {
    window.scrollTo(0, Math.round(top + (room * i) / 10));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    samples.push({
      at: i / 10,
      x: Number.parseFloat(track.style.getPropertyValue('--services-x')) || 0,
      stageTop: Math.round(stage.getBoundingClientRect().top),
      opacity: Number.parseFloat(stage.style.opacity || '1'),
      lifted: (stage.style.transform || '').includes('translate3d'),
    });
  }

  const tech = [];
  for (const at of [0, 0.5, 1]) {
    window.scrollTo(0, Math.round(top + room * at));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // The active project comes from an IntersectionObserver, which reports a
    // frame or two after the scroll that moved the slide.
    await new Promise((r) => setTimeout(r, 220));
    tech.push(
      [...document.querySelectorAll('.registry .tech[data-active="true"]')]
        .map((t) => t.textContent)
        .join('|'),
    );
  }

  const slides = [...document.querySelectorAll('.services__list .project')].map(
    (c) => c.offsetHeight,
  );
  return { spread, room, samples, tech, slides, vh: window.innerHeight };
})()`, true);

const moving = beat === null ? null : beat.samples.find((s) => Math.abs(s.x) > 1);
const parked = beat === null ? null : [...beat.samples].reverse().find((s) => s.x > -beat.spread + 1);

check(
  'the first project holds before the track moves',
  beat !== null && beat.samples[0].x === 0 && beat.samples[1].x === 0 && moving !== null && moving.at > 0.1,
  beat === null
    ? 'stage missing'
    : `still at ${beat.samples[1].at * 100}% of the hold, first movement at ${moving ? moving.at * 100 : 'none'}%`,
);

// The arrival: while the card is still scrolling into view the track must not
// have moved at all. A sliver of the next project at this point is the shape of
// the bug this check exists for.
const arrival = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const stage = document.querySelector('.services__stage');
  const hold = stage.parentElement;
  const track = document.querySelector('.services__list');
  const pinTop = Math.round(hold.getBoundingClientRect().top + window.scrollY);
  const rows = [];
  for (let back = 480; back >= 0; back -= 40) {
    window.scrollTo(0, pinTop - back);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    rows.push({
      back,
      stageTop: Math.round(stage.getBoundingClientRect().top),
      x: Math.round(Number.parseFloat(track.style.getPropertyValue('--services-x')) || 0),
    });
  }
  return rows;
})()`, true);

const early = arrival.filter((r) => r.stageTop > 1 && r.x !== 0);
check(
  'the track has not moved while the card is still arriving',
  early.length === 0,
  early.length
    ? early.map((r) => `${-r.back}px short of the pin, stage ${r.stageTop}px down, track already at ${r.x}px`).join('; ')
    : `${arrival.length} positions from 480px out, track at 0 until the stage sticks`,
);

check(
  'the projects travel one stage width, then park',
  beat !== null && Math.abs(beat.samples[10].x + beat.spread) <= 2 && parked !== null && parked.at < 0.95,
  beat === null
    ? 'stage missing'
    : `last movement at ${parked ? parked.at * 100 : 'never'}% of the hold, parked on ${-beat.spread}px`,
);

check(
  'the stage holds still before it releases',
  beat !== null &&
    beat.samples.every((s) => s.lifted || Math.abs(s.stageTop) <= 1) &&
    beat.samples[0].stageTop === 0,
  beat === null ? 'stage missing' : `stage top ${beat.samples.map((s) => s.stageTop).join('/')}`,
);

check(
  'the stage releases during the dwell',
  beat !== null && beat.samples[0].opacity === 1 && beat.samples[10].opacity < 0.7 && beat.samples[10].lifted,
  beat === null
    ? 'stage missing'
    : `opacity ${beat.samples[0].opacity.toFixed(2)} -> ${beat.samples[10].opacity.toFixed(2)}, lifted ${beat.samples[10].lifted}`,
);

check(
  'the registry follows whichever project is on the stage',
  beat !== null && beat.tech[0] !== beat.tech[2] && beat.tech[0].length > 0,
  beat === null ? 'stage missing' : `${beat.tech[0]} -> ${beat.tech[2]}`,
);

check(
  'every project slide fits the viewport',
  beat !== null && beat.slides.every((h) => h <= beat.vh),
  beat === null ? 'stage missing' : `slides ${beat.slides.join('/')}px in ${beat.vh}px`,
);

// The pointer layer: the ring, the magnetic pull, the link wipe, and the figure
// that opens into the viewer. All four are driven through real pointer events,
// because element.click() and a JS-set class would pass without the input path
// actually working.
const pointer = (x, y) =>
  cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });

await cdp.evaluate(`window.scrollTo(0, 0)`);
await sleep(500);
await pointer(600, 420);
await sleep(300);

const layer = await cdp.evaluate(`(() => {
  const ring = document.querySelector('.cursor');
  const root = document.documentElement;
  return {
    loaded: root.dataset.loaded,
    flag: root.dataset.cursor,
    opacity: ring ? getComputedStyle(ring).opacity : 'missing',
    body: getComputedStyle(document.body).cursor,
    placed: ring ? ring.style.transform : 'missing',
  };
})()`);
check(
  'the pointer layer takes over once the page has loaded',
  layer.loaded === 'true' &&
    layer.flag === 'on' &&
    Number.parseFloat(layer.opacity) > 0.9 &&
    layer.body === 'none' &&
    layer.placed.includes('translate3d'),
  `loaded ${layer.loaded}, flag ${layer.flag}, ring opacity ${layer.opacity}, body cursor ${layer.body}, ${layer.placed}`,
);

const cta = await cdp.evaluate(`(() => {
  const b = document.querySelector('[data-magnetic]').getBoundingClientRect();
  return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
})()`);
await pointer(cta.x + 4, cta.y + 2);
await sleep(250);
const pulled = await cdp.evaluate(`(() => ({
  transform: document.querySelector('[data-magnetic]').style.transform,
  shape: document.querySelector('.cursor').dataset.shape,
}))()`);
check(
  'the marked calls to action lean toward the pointer',
  pulled.transform.includes('translate3d'),
  `transform ${pulled.transform || 'none'}`,
);
check('the ring names what it is over', pulled.shape === 'link', `shape ${pulled.shape || 'unset'}`);
await pointer(cta.x + 4, cta.y + 2);
await sleep(300);
await shot(cdp, 'g-cursor-link');

// The ring has to replace the pointer on every interactive element, not just on
// plain text: links and buttons carry their own cursor rule from the reset, so an
// inherited none is not enough.
const cursors = await cdp.evaluate(`(() => {
  const read = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).cursor : 'missing';
  };
  return {
    flag: document.documentElement.dataset.cursor,
    body: getComputedStyle(document.body).cursor,
    nav: read('.header__nav a'),
    brand: read('.header__brand'),
    button: read('[data-magnetic]'),
    figure: read('.figure'),
    field: read('input'),
    stage: read('.lightbox__stage'),
  };
})()`);
check(
  'the ring replaces the pointer on links and buttons too',
  cursors.flag === 'on' &&
    cursors.body === 'none' &&
    cursors.nav === 'none' &&
    cursors.brand === 'none' &&
    cursors.button === 'none' &&
    cursors.figure === 'none' &&
    cursors.field === 'auto' &&
    cursors.stage === 'grab',
  `body ${cursors.body}, nav ${cursors.nav}, brand ${cursors.brand}, cta ${cursors.button}, figure ${cursors.figure}, field ${cursors.field}, viewer ${cursors.stage}`,
);

await pointer(30, 300);
await sleep(250);
const released = await cdp.evaluate(
  `document.querySelector('[data-magnetic]').style.transform === ''`,
);
check('the pull releases when the pointer leaves', released, 'transform cleared');

// The repo link on the first slide, at the start of the beat, where it is fully
// on screen and a real pointer can reach it.
await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const hold = document.querySelector('.services__pin');
  window.scrollTo(0, hold.getBoundingClientRect().top + window.scrollY);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
})()`, true);
await sleep(700);
const linkBox = await cdp.evaluate(`(() => {
  const link = [...document.querySelectorAll('.project__link')].find((l) => {
    const r = l.getBoundingClientRect();
    return r.top > 0 && r.bottom < window.innerHeight && r.left > 0 && r.right < window.innerWidth;
  });
  if (!link) return null;
  const r = link.getBoundingClientRect();
  return {
    x: Math.round(r.left + r.width / 2),
    y: Math.round(r.top + r.height / 2),
    image: getComputedStyle(link).backgroundImage.slice(0, 24),
    size: getComputedStyle(link).backgroundSize,
  };
})()`);
if (linkBox) {
  await pointer(linkBox.x, linkBox.y);
  await sleep(450);
}
const wipe = await cdp.evaluate(`(() => {
  const link = [...document.querySelectorAll('.project__link')].find((l) => {
    const r = l.getBoundingClientRect();
    return r.top > 0 && r.bottom < window.innerHeight && r.left > 0 && r.right < window.innerWidth;
  });
  const under = document.elementFromPoint(${linkBox ? linkBox.x : 0}, ${linkBox ? linkBox.y : 0});
  return {
    size: getComputedStyle(link).backgroundSize,
    hover: link.matches(':hover'),
    under: under ? under.tagName.toLowerCase() + '.' + String(under.className) : 'none',
  };
})()`);
check(
  'the repo link wipes an underline in from the left',
  linkBox !== null &&
    linkBox.image.includes('linear-gradient') &&
    linkBox.size === '0% 1px' &&
    wipe.size === '100% 1px',
  linkBox === null
    ? 'no link on screen'
    : `${linkBox.size} -> ${wipe.size}, hover ${wipe.hover}, under ${wipe.under}`,
);

// Snapping: a stop with a chapter boundary in the bottom band of the viewport
// finishes the move onto that boundary after the idle window. A stop well inside
// a chapter is left alone. Both cases approach from above, so the page counts as
// travelling down, which is the direction the rule asks about.
const gatewayTop = await cdp.evaluate(
  `Math.round(document.getElementById('gateway').getBoundingClientRect().top + window.scrollY)`,
);

const place = async (y) => {
  await cdp.evaluate(`window.scrollTo(0, 0)`);
  await sleep(150);
  await cdp.evaluate(`window.scrollTo(0, ${Math.round(y)})`);
  await sleep(150);
};

await place(gatewayTop - (await cdp.evaluate('window.innerHeight')) * 0.78);
await sleep(4200);
const snapped = await cdp.evaluate(`Math.round(window.scrollY)`);

await place(gatewayTop - (await cdp.evaluate('window.innerHeight')) * 0.3);
const beforeHold = await cdp.evaluate(`Math.round(window.scrollY)`);
await sleep(4200);
const held = await cdp.evaluate(`Math.round(window.scrollY)`);

check(
  'a touched chapter boundary snaps onto itself after the idle window',
  Math.abs(snapped - gatewayTop) <= 3 && Math.abs(held - beforeHold) <= 3,
  `stopped with the boundary in the bottom band and landed at ${snapped} (boundary ${gatewayTop}); stopped inside the chapter and held at ${held}`,
);

// The figure opens into the viewer from the card's own rect.
await cdp.evaluate(`(async () => {
  const hold = document.querySelector('.services__pin');
  window.scrollTo(0, hold.getBoundingClientRect().top + window.scrollY + 40);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  document.querySelector('.services__list .figure').click();
})()`, true);
let flip = null;
for (let i = 0; i < 12; i += 1) {
  await sleep(40);
  flip = await cdp.evaluate(`(() => {
    const dialog = document.querySelector('.lightbox');
    const img = dialog?.querySelector('img');
    return {
      open: !!(dialog && dialog.open),
      flip: img ? img.dataset.flip === 'true' : false,
      src: img ? img.currentSrc.split('/').pop() : '',
    };
  })()`);
  if (flip.flip) break;
}
check(
  'the figure opens into the viewer from the card',
  flip !== null && flip.open && flip.flip,
  flip === null ? 'no reading' : `dialog open ${flip.open}, flip ${flip.flip}, ${flip.src}`,
);
await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', windowsVirtualKeyCode: 27 });
await sleep(400);
const closed = await cdp.evaluate(`!document.querySelector('.lightbox').open`);
check('the viewer closes on Escape', closed, closed ? 'closed' : 'still open');

// The hero recedes with the scroll instead of cutting to chapter 02. Three
// numbers carry that: the foreground shrinks, it lifts further than the
// backdrop does, and it dims without vanishing.
const heroStops = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const shell = document.querySelector('#ingress .shell');
  const backdrop = document.querySelector('#ingress .hero__canvas');
  const cue = document.querySelector('#ingress .hero__scroll');
  const matrix = (el) => {
    const t = el ? getComputedStyle(el).transform : 'none';
    if (t === 'none') return [1, 0, 0, 1, 0, 0];
    return t.slice(t.indexOf('(') + 1, -1).split(',').map(Number);
  };
  const out = {};
  const vh = window.innerHeight;
  for (const [name, y] of [['top', 0], ['mid', Math.round(vh * 0.5)], ['end', vh]]) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 250));
    const fg = matrix(shell);
    const bg = matrix(backdrop);
    out[name] = {
      scale: +fg[0].toFixed(3),
      lift: +fg[5].toFixed(1),
      opacity: +Number.parseFloat(getComputedStyle(shell).opacity).toFixed(3),
      backdropScale: +bg[0].toFixed(3),
      backdropLift: +bg[5].toFixed(1),
      cue: cue ? +Number.parseFloat(getComputedStyle(cue).opacity).toFixed(3) : null,
    };
  }
  return out;
})()`, true);

const separation = heroStops.mid.lift - heroStops.mid.backdropLift;
check(
  'the hero recedes without dimming',
  heroStops.end.scale <= 0.94 && heroStops.end.lift <= -50 && heroStops.end.opacity === 1,
  `scale ${heroStops.top.scale} -> ${heroStops.end.scale}, lift ${heroStops.end.lift}px, opacity ${heroStops.end.opacity}`,
);
check(
  'the hero backdrop moves against the foreground',
  separation <= -20 && heroStops.mid.backdropScale > 1,
  `foreground ${separation.toFixed(1)}px further up than the backdrop at mid, backdrop scale ${heroStops.top.backdropScale} -> ${heroStops.end.backdropScale}`,
);

// The seam: the gateway widens out of a vertical slit as it rises. Read as the
// clip Chrome computes, at three points of its transit.
const seam = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const gateway = document.getElementById('gateway');
  const top = gateway.getBoundingClientRect().top + window.scrollY;
  const vh = window.innerHeight;
  const out = {};
  for (const [name, at] of [['entering', vh - 40], ['half', vh * 0.675], ['open', vh * 0.35 - 10]]) {
    window.scrollTo(0, Math.round(top - at));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    out[name] = getComputedStyle(gateway).clipPath;
  }
  return out;
})()`, true);

const sides = (clip) => (clip.match(/-?[\d.]+%?/g) ?? []).slice(1, 2).map((v) => Number.parseFloat(v));
const entering = sides(seam.entering)[0] ?? 0;
const half = sides(seam.half)[0] ?? 0;
const open = sides(seam.open)[0] ?? 0;
check(
  'the gateway opens out of a seam as it rises',
  entering > 35 && half > 10 && half < 38 && open < 1,
  `side inset ${entering}% -> ${half}% -> ${open}%`, // ${seam.entering} / ${seam.open}
);
check(
  'the scroll cue leaves before the hero does',
  heroStops.mid.cue === null || heroStops.mid.cue < 0.4,
  `cue opacity ${heroStops.top.cue} -> ${heroStops.mid.cue}`,
);

const desktopReadout = await cdp.evaluate(
  `getComputedStyle(document.querySelector('.header__now')).display`,
);
check('the desktop header hides the chapter readout', desktopReadout === 'none', `display ${desktopReadout}`);

await cdp.evaluate(`(async () => {
  window.scrollTo(0, 380);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 300));
})()`, true);
await shot(cdp, 'b-hero-exit');

const STOPS = [
  ['c-chapter-02', `document.getElementById('gateway')`, -120],
  ['d-services-01', `document.querySelector('.services__pin')`, 40],
  ['d-services-02', `document.querySelector('.services__pin')`, 640],
  ['e-chapter-05', `document.getElementById('observability')`, -120],
];

for (const [name, getter, offset] of STOPS) {
  await cdp.evaluate(`(async () => {
    const el = ${getter};
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY + ${offset}));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 700));
  })()`, true);
  await shot(cdp, name);
}


console.log('mobile 390x844');
await load(cdp, 390, 844);

const mobile = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const ids = [...document.querySelectorAll('.rail > a')].map((a) => a.getAttribute('href').slice(1));
  const seen = [];
  for (const id of ids) {
    const el = document.getElementById(id);
    window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY + 200));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 250));
    // Re-queried every time, because the readout is keyed by chapter and React
    // replaces the node on a boundary. A held reference would keep reporting
    // the first chapter.
    const readout = document.querySelector('.header__now');
    seen.push({ id, text: readout.textContent.trim(), display: getComputedStyle(readout).display });
  }
  return { rail: getComputedStyle(document.querySelector('.rail')).display, seen };
})()`, true);

check('the mobile header shows the chapter readout', mobile.seen.every((s) => s.display !== 'none'), `display ${mobile.seen[0].display}`);
check(
  'the readout follows the chapter under it',
  new Set(mobile.seen.map((s) => s.text)).size === mobile.seen.length,
  mobile.seen.map((s) => `${s.id}="${s.text}"`).join(' '),
);
check('the rail stays out of a narrow viewport', mobile.rail === 'none', `display ${mobile.rail}`);

await cdp.evaluate(`(async () => {
  const el = document.getElementById('anomaly');
  window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 120));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 600));
})()`, true);
await shot(cdp, 'f-mobile-head');

/* ---------------------------------------------------------- reduced motion */

console.log('reduced motion 1500x900');
await cdp.send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await load(cdp, 1500, 900);

const calm = await cdp.evaluate(`(async () => {
  const shell = document.querySelector('#ingress .shell');
  const title = document.querySelector('#gateway .chapter-head__title');
  const gateway = document.getElementById('gateway');
  window.scrollTo(0, 380);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 400));
  return {
    matches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    y: Math.round(window.scrollY),
    shellOpacity: shell ? getComputedStyle(shell).opacity : null,
    shellTransform: shell ? getComputedStyle(shell).transform : null,
    titleTransform: title ? getComputedStyle(title).transform : null,
    seam: getComputedStyle(gateway).clipPath,
    skew: document.documentElement.style.getPropertyValue('--scroll-skew'),
  };
})()`, true);

check(
  'reduced motion renders a static page that still scrolls',
  calm.matches &&
    calm.y === 380 &&
    calm.shellTransform === 'none' &&
    calm.titleTransform === 'none' &&
    calm.shellOpacity === '1' &&
    (sides(calm.seam)[0] ?? 0) < 1 &&
    (calm.skew === '' || calm.skew === '0deg'),
  `hero opacity ${calm.shellOpacity}, hero transform ${calm.shellTransform}, title transform ${calm.titleTransform}, seam ${calm.seam}, skew ${calm.skew || 'unset'}, scrolled to ${calm.y}`,
);

await cdp.send('Emulation.setEmulatedMedia', { features: [] });

cdp.close();
cleanup();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.error(`FAILED: ${failed.map((r) => r.name).join('; ')}`);
  process.exit(1);
}
