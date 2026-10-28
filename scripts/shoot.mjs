/**
 * Full-page screenshots via the Chrome DevTools Protocol.
 * No Playwright/Puppeteer: Node's global WebSocket plus the --remote-debugging-port
 * is enough, and it keeps the dev dependency list at zero.
 *
 *   node scripts/shoot.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = 'screenshots';
const PORT = 9222;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('No Chrome or Edge binary found.');
  process.exit(1);
}

const SHOTS = [
  { name: 'final-desktop', url: `${BASE}/`, width: 1500, height: 900 },
  { name: 'final-hero', url: `${BASE}/`, width: 1500, height: 900, viewportOnly: true },
  { name: 'final-services', url: `${BASE}/`, width: 1500, height: 900, viewportOnly: true, scrollTo: '#services' },
  { name: 'final-mobile', url: `${BASE}/`, width: 390, height: 844 },
  { name: 'final-mobile-hero', url: `${BASE}/`, width: 390, height: 844, viewportOnly: true },
];

mkdirSync(OUT, { recursive: true });

// The Chrome profile must live OUTSIDE the project. Chrome holds locks on its
// session files, and Vite's watcher dies with EBUSY if it finds them in-tree.
const PROFILE = join(tmpdir(), 'portfolio-chrome-shots');
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
    '--user-data-dir=' + PROFILE,
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

const openTarget = async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
  const target = await res.json();
  return target.webSocketDebuggerUrl;
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

  return { send, once, close: () => ws.close() };
};

await waitForDevtools();
const wsUrl = await openTarget();
const cdp = await connect(wsUrl);

await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

for (const shot of SHOTS) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: shot.width,
    height: shot.height,
    deviceScaleFactor: 1,
    mobile: shot.width < 600,
  });

  const loaded = Promise.race([cdp.once('Page.loadEventFired'), sleep(8000)]);
  await cdp.send('Page.navigate', { url: shot.url });
  await loaded;

  // Let fonts settle and the loader finish.
  await sleep(1400);

  // A hash-only navigation never fires a load event, so section shots scroll
  // explicitly instead of relying on the URL fragment.
  if (shot.scrollTo) {
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(shot.scrollTo)});
        if (!el) return 'missing';
        document.documentElement.style.scrollBehavior = 'auto';
        el.scrollIntoView({ block: 'start' });
        return el.id;
      })()`,
      returnByValue: true,
    });
    await sleep(700);
  }

  // Walk the page so every IntersectionObserver reveal fires, then return to top.
  if (!shot.viewportOnly) {
    await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 110));
        }
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 250));
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 400));
        root.style.scrollBehavior = prev;
      })()`,
      awaitPromise: true,
    });
  }

  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: !shot.viewportOnly,
    fromSurface: true,
  });

  const file = `${OUT}/${shot.name}.png`;
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`✓ ${file}`);
}

cdp.close();
cleanup();
