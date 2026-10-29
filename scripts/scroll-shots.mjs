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
const READ_RAIL = `(() => {
  const rail = document.querySelector('.rail');
  const links = [...rail.querySelectorAll(':scope > a')];
  const ids = links.map((a) => a.getAttribute('href').slice(1));
  const mid = window.innerHeight * 0.5;
  const anchors = ids.map((id) => {
    const el = document.getElementById(id);
    return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - mid) : Number.POSITIVE_INFINITY;
  });
  return {
    scrollY: Math.round(window.scrollY),
    docHeight: document.documentElement.scrollHeight,
    railY: Number.parseFloat(rail.style.getPropertyValue('--rail-y')),
    marks: links.map((l) => l.offsetTop + l.offsetHeight / 2),
    anchors,
  };
})()`;

const expected = (marks, anchors, y) => {
  const count = Math.min(marks.length, anchors.length);
  if (y >= anchors[count - 1]) return marks[count - 1];
  for (let i = 0; i < count - 1; i += 1) {
    if (y < anchors[i]) break;
    if (y < anchors[i + 1]) {
      const span = anchors[i + 1] - anchors[i];
      return marks[i] + (marks[i + 1] - marks[i]) * (span > 0 ? (y - anchors[i]) / span : 1);
    }
  }
  return marks[0];
};

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

// A reader scrolls down through the page, so every lazy raster loads. A jump to
// the bottom skips them, which is why the shift this guards against only showed
// up on a walk.
const walk = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const read = () => ${READ_RAIL};
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
  `scrollHeight ${Math.min(...heights)}..${Math.max(...heights)}`,
);

const last = walk[walk.length - 1];
let worst = { delta: 0, y: 0 };
for (const row of walk) {
  const want = expected(row.marks, row.anchors, row.scrollY);
  const delta = Math.abs(row.railY - want);
  if (!Number.isFinite(row.railY) || delta > worst.delta) worst = { delta, y: row.scrollY };
}
check(
  'the packet sits where the chapter anchors say it should',
  worst.delta <= 0.6,
  `worst ${worst.delta.toFixed(2)}px at scrollY ${worst.y}`,
);
check(
  'the packet reaches the last marker and stays there',
  Math.abs(last.railY - last.marks[last.marks.length - 1]) <= 0.6,
  `--rail-y ${last.railY} vs mark ${last.marks[last.marks.length - 1]} at scrollY ${last.scrollY}`,
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
    const amplitude = [];
    for (const y of [Math.max(0, top - window.innerHeight + 2), top + box.height + 2]) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      amplitude.push(Math.abs(shift(el)));
    }

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
  'the hero foreground recedes instead of fading out',
  heroStops.end.scale <= 0.94 && heroStops.end.lift <= -50 && heroStops.end.opacity >= 0.3,
  `scale ${heroStops.top.scale} -> ${heroStops.end.scale}, lift ${heroStops.end.lift}px, opacity ${heroStops.top.opacity} -> ${heroStops.end.opacity}`,
);
check(
  'the hero backdrop moves against the foreground',
  separation <= -20 && heroStops.mid.backdropScale > 1,
  `foreground ${separation.toFixed(1)}px further up than the backdrop at mid, backdrop scale ${heroStops.top.backdropScale} -> ${heroStops.end.backdropScale}`,
);
check(
  'the hero dims as the first chapter arrives',
  heroStops.end.opacity < heroStops.top.opacity - 0.2,
  `opacity ${heroStops.top.opacity} -> ${heroStops.mid.opacity} -> ${heroStops.end.opacity}`,
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

for (const [name, id] of [
  ['c-chapter-02', 'gateway'],
  ['d-mid-services', 'services'],
  ['e-chapter-05', 'observability'],
]) {
  await cdp.evaluate(`(async () => {
    const el = document.getElementById(${JSON.stringify(id)});
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 120));
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


cdp.close();
cleanup();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.error(`FAILED: ${failed.map((r) => r.name).join('; ')}`);
  process.exit(1);
}
