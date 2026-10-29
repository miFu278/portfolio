/**
 * How quickly one wheel tick turns into movement, and how long the page keeps
 * gliding. Frame counts are too noisy on a busy machine to rank small changes;
 * this curve is deterministic and repeats within a few milliseconds.
 *
 *   node scripts/scroll-response.mjs [baseUrl] [passes]
 *
 * `lag` is measured from the wheel event the page itself receives, not from the
 * moment CDP dispatched it: the DevTools round trip lands about 110ms late and
 * would otherwise look like page latency.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const RUNS = Number(process.argv[3] ?? 3);
const PORT = 9241;
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => existsSync(p));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--hide-scrollbars', '--disable-gpu', '--no-first-run', '--user-data-dir=' + join(tmpdir(), 'portfolio-chrome-resp'), 'about:blank'], { stdio: 'ignore' });
const kill = () => { try { chrome.kill(); } catch { /* gone */ } };
process.on('exit', kill);
for (let i = 0; i < 100; i += 1) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break; } catch { /* up */ }
  await sleep(120);
}
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  seq += 1;
  pending.set(seq, { resolve, reject });
  ws.send(JSON.stringify({ id: seq, method, params }));
});
const evaluate = async (expression, awaitPromise = false) => {
  const { result } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
  return result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 900, deviceScaleFactor: 1, mobile: false });

const rows = [];
for (let pass = 0; pass < RUNS; pass += 1) {
  await send('Page.navigate', { url: `${BASE}/` });
  await sleep(2800);
  await evaluate(`window.scrollTo(0, 0)`);
  await sleep(500);

  await evaluate(`(() => {
    window.__trace = [];
    window.__on = true;
    window.__wheelAt = null;
    const t0 = performance.now();
    window.__t0 = t0;
    window.addEventListener('wheel', () => {
      if (window.__wheelAt === null) window.__wheelAt = performance.now() - t0;
    }, { passive: true });
    const tick = () => {
      window.__trace.push({ t: performance.now() - t0, y: window.scrollY });
      if (window.__on && performance.now() - t0 < 900) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })()`);

  await sleep(60);
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: 400 });
  await sleep(1000);

  const trace = await evaluate(`(() => { window.__on = false; return { trace: window.__trace, wheelAt: window.__wheelAt }; })()`);
  const points = trace.trace;
  const moving = points.filter((r) => r.y > 0.5);
  const first = moving[0]?.t ?? null;
  const end = points[points.length - 1]?.y ?? 0;
  const ninety = points.find((r) => r.y >= end * 0.9);
  const settle = (() => {
    let last = 0;
    for (let i = 1; i < points.length; i += 1) if (Math.abs(points[i].y - points[i - 1].y) > 0.4) last = points[i].t;
    return Math.round(last);
  })();

  const row = {
    wheelAt: trace.wheelAt === null ? null : Math.round(trace.wheelAt),
    firstMove: first === null ? null : Math.round(first),
    lag:
      first === null || trace.wheelAt === null ? null : Math.round(first - trace.wheelAt),
    ninety: ninety ? Math.round(ninety.t) : null,
    settle,
    end: Math.round(end),
    frames: points.length,
  };
  rows.push(row);
  console.log(`p${pass}`, JSON.stringify(row));
}

const mid = (pick) => {
  const v = rows.map(pick).filter((n) => n !== null).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
};
console.log('median', JSON.stringify({ wheelAt: mid((r) => r.wheelAt), firstMove: mid((r) => r.firstMove), lag: mid((r) => r.lag), ninety: mid((r) => r.ninety), settle: mid((r) => r.settle), end: mid((r) => r.end) }));

ws.close();
kill();
