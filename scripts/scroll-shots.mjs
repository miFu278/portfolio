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

// Every title is still below its own entrance at scroll 0, so the composed
// translateY there is the rise the scrub applies at full displacement. The box
// measurement clears transforms first: a transform reserves no space, so the
// layout gap is all the displacement has to fit in.
const titles = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const shift = (el) => {
    const m = getComputedStyle(el).transform;
    return m === 'none' ? 0 : +m.split(', ').pop().replace(')', '');
  };
  const out = [];
  for (const head of document.querySelectorAll('.chapter-head')) {
    const title = head.querySelector('.chapter-head__title');
    const lead = head.querySelector('.lead');
    if (!title) continue;
    const rise = shift(title);

    const keptTitle = title.style.transform;
    const keptLead = lead ? lead.style.transform : '';
    title.style.transform = 'none';
    if (lead) lead.style.transform = 'none';
    const titleBox = title.getBoundingClientRect();
    const leadTop = lead ? lead.getBoundingClientRect().top : null;
    title.style.transform = keptTitle;
    if (lead) lead.style.transform = keptLead;

    out.push({
      chapter: head.closest('section')?.id ?? '?',
      gap: leadTop === null ? null : +(leadTop - titleBox.bottom).toFixed(2),
      rise: +rise.toFixed(2),
      transition: getComputedStyle(title).transitionProperty,
    });
  }
  return out;
})()`, true);

const gapFloor = Math.min(...titles.filter((t) => t.gap !== null).map((t) => t.gap));
const riseCeiling = Math.max(...titles.map((t) => t.rise));
check(
  'the scrub actually moves the title',
  riseCeiling > 6,
  `full displacement ${riseCeiling}px`,
);
check(
  'the title has room for its own rise above the lead',
  gapFloor >= riseCeiling,
  `smallest gap ${gapFloor}px against a ${riseCeiling}px rise`,
);

const transitions = titles.filter((t) => t.transition.includes('transform'));
check(
  'the scrub is not smoothed by a CSS transform transition',
  transitions.length === 0,
  transitions.length
    ? transitions.map((t) => t.chapter).join(', ')
    : 'transform untransitioned on every title',
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

// The hero exits with the scroll instead of cutting to chapter 02.
const heroStops = await cdp.evaluate(`(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const shell = document.querySelector('#ingress .shell');
  const cue = document.querySelector('#ingress .hero__scroll');
  const out = {};
  for (const [name, y] of [['top', 0], ['mid', 380], ['end', Math.round(window.innerHeight * 0.9)]]) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 250));
    out[name] = {
      opacity: +Number.parseFloat(getComputedStyle(shell).opacity).toFixed(3),
      cue: cue ? +Number.parseFloat(getComputedStyle(cue).opacity).toFixed(3) : null,
    };
  }
  return out;
})()`, true);
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
