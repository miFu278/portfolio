/**
 * Frame budget while a reader scrolls, and how long the page keeps gliding after
 * the last wheel event.
 *
 *   node scripts/frame-budget.mjs [baseUrl] [passes]
 *
 * Caveat worth knowing before trusting a number: this runs headless with the
 * GPU off, so it is a software-rendering floor, and a busy machine moves it a
 * lot. On the box this was written on, the dropped-frame count for the same
 * build ranged from 5 to 41 across passes. Read it as a shape, not a score, and
 * compare builds back to back on an idle machine.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const PASSES = Number(process.argv[3] ?? 3);
const PORT = 9240;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('No Chrome or Edge binary found.');
  process.exit(1);
}

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${join(tmpdir(), 'portfolio-chrome-budget')}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);
const kill = () => {
  try {
    chrome.kill();
  } catch {
    /* already gone */
  }
};
process.on('exit', kill);

for (let i = 0; i < 100; i += 1) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break;
  } catch {
    /* not up yet */
  }
  await sleep(120);
}

const target = await (
  await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

let seq = 0;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    seq += 1;
    pending.set(seq, { resolve, reject });
    ws.send(JSON.stringify({ id: seq, method, params }));
  });
const evaluate = async (expression, awaitPromise = false) => {
  const { result } = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  return result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1500,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

const rows = [];

for (let pass = 0; pass < PASSES; pass += 1) {
  await send('Page.navigate', { url: `${BASE}/` });
  await sleep(2600);

  await evaluate(`(() => {
    window.__gaps = [];
    window.__on = true;
    let last = performance.now();
    const tick = (t) => {
      window.__gaps.push(t - last);
      last = t;
      if (window.__on) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })()`);

  const started = Date.now();
  while (Date.now() - started < 6000) {
    const atEnd = await evaluate(
      `window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 4`,
    );
    if (atEnd) break;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 700,
      y: 450,
      deltaX: 0,
      deltaY: 120,
    });
    await sleep(30);
  }

  // How long the page keeps gliding after the last wheel event. This is the
  // number that reads as heavy even when every frame is on time.
  const tail = await evaluate(`(async () => {
    const start = performance.now();
    let prev = window.scrollY;
    let lastMove = start;
    while (performance.now() - start < 2500) {
      await new Promise((r) => setTimeout(r, 40));
      const now = window.scrollY;
      if (Math.abs(now - prev) > 0.5) lastMove = performance.now();
      prev = now;
      if (performance.now() - lastMove > 160) return Math.round(lastMove - start);
    }
    return 2500;
  })()`, true);

  const stats = await evaluate(`(() => {
    window.__on = false;
    const gaps = window.__gaps.slice(2).filter((g) => g < 500);
    const sorted = [...gaps].sort((a, b) => a - b);
    const at = (q) => +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))].toFixed(1);
    const dropped = gaps.reduce((n, g) => n + Math.max(0, Math.round(g / 16.7) - 1), 0);
    return { frames: gaps.length, median: at(0.5), p95: at(0.95), dropped };
  })()`);

  rows.push({ ...stats, tail });
  console.log(
    `pass ${pass}: frames ${String(stats.frames).padStart(4)}  median ${String(stats.median).padStart(5)}ms  p95 ${String(stats.p95).padStart(5)}ms  dropped ${String(stats.dropped).padStart(3)}  tail ${tail}ms`,
  );
}

const mid = (pick) => {
  const v = rows.map(pick).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
};
console.log(
  `median of ${PASSES}: frames ${mid((r) => r.frames)}  median ${mid((r) => r.median)}ms  p95 ${mid((r) => r.p95)}ms  dropped ${mid((r) => r.dropped)}  tail ${mid((r) => r.tail)}ms`,
);

ws.close();
kill();
