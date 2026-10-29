import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollVelocity } from '../../lib/scrollVelocity';

interface Node {
  x: number;
  y: number;
  r: number;
}

interface Edge {
  a: number;
  b: number;
}

/**
 * The topology behind the hero. Not a starfield: nodes on a service graph,
 * and one packet that travels the graph as you scroll.
 *
 * - Node count scales with area, so a phone does not render a desktop graph.
 * - The graph sits on a camera that drifts toward the pointer and gives a
   little to scroll speed, so the backdrop responds to the reader instead of
   playing to itself. The camera is clamped inside a 6% margin it adds by
   scaling, so it can never uncover an edge of the hero.
 * - Pauses when the tab is hidden or the canvas scrolls out of view.
 * - Renders a single static frame under prefers-reduced-motion.
 */
const TopologyCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let route: number[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    let dpr = 1;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.round(
        Math.min(40, Math.max(18, (width * height) / 40000)),
      );
      const minDist = Math.sqrt((width * height) / target) * 0.62;

      nodes = [];
      let guard = 0;
      while (nodes.length < target && guard < target * 60) {
        guard += 1;
        const candidate = {
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          r: 1.1 + Math.random() * 1.9,
        };
        if (nodes.every((n) => Math.hypot(n.x - candidate.x, n.y - candidate.y) > minDist)) {
          nodes.push(candidate);
        }
      }

      // connect each node to its 2 nearest neighbours
      edges = [];
      const seen = new Set<string>();
      nodes.forEach((node, i) => {
        const nearest = nodes
          .map((other, j) => ({ j, d: Math.hypot(other.x - node.x, other.y - node.y) }))
          .filter((e) => e.j !== i && e.d < width * 0.42)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        nearest.forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          edges.push({ a: i, b: j });
        });
      });

      // greedy route from the lowest-left node, so the packet reads left→right
      if (nodes.length > 0) {
        const start = nodes.reduce((best, n, i) =>
          n.x + (height - n.y) * 0.4 < nodes[best].x + (height - nodes[best].y) * 0.4 ? i : best, 0);
        route = [start];
        const used = new Set([start]);
        while (route.length < 9) {
          const from = nodes[route[route.length - 1]];
          let bestIdx = -1;
          let bestScore = -Infinity;
          nodes.forEach((n, i) => {
            if (used.has(i)) return;
            const d = Math.hypot(n.x - from.x, n.y - from.y);
            if (d > width * 0.55) return;
            const score = n.x - d * 0.25;
            if (score > bestScore) {
              bestScore = score;
              bestIdx = i;
            }
          });
          if (bestIdx === -1) break;
          used.add(bestIdx);
          route.push(bestIdx);
        }
      }

      bake();
      readAccent();
    };

    // The graph is static between resizes, so it is painted once into an
    // offscreen sheet and blitted each frame. Redrawing every edge and node per
    // frame was the largest single frame cost on the page.
    let sheet: HTMLCanvasElement | null = null;
    let accent = '#38bdf8';

    const bake = () => {
      const next = document.createElement('canvas');
      next.width = Math.round(width * dpr);
      next.height = Math.round(height * dpr);
      const paint = next.getContext('2d');
      if (!paint) return;
      paint.setTransform(dpr, 0, 0, dpr, 0, 0);

      paint.strokeStyle = 'rgba(255,255,255,0.055)';
      paint.lineWidth = 1;
      paint.beginPath();
      edges.forEach(({ a, b }) => {
        paint.moveTo(nodes[a].x, nodes[a].y);
        paint.lineTo(nodes[b].x, nodes[b].y);
      });
      paint.stroke();

      nodes.forEach((n) => {
        paint.beginPath();
        paint.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        paint.fillStyle = 'rgba(255,255,255,0.32)';
        paint.fill();
      });

      sheet = next;
    };

    // Read once per build: getComputedStyle on every frame is a forced style
    // recalculation, and the token never changes while the page is live.
    const readAccent = () => {
      accent = getComputedStyle(canvas).getPropertyValue('--signal').trim() || '#38bdf8';
    };

    const drawBase = () => {
      if (sheet) ctx.drawImage(sheet, 0, 0, width, height);
    };

    /** 0 → 1 across the hero's own scroll range. */
    const packetProgress = () => {
      const max = Math.max(1, height * 1.15);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    const drawPacket = (t: number) => {
      if (route.length < 2) return;

      // The packet halts before a node in the middle of its journey: that is
      // the out-of-distribution beat from the research chapter, told in motion.
      let p = packetProgress();
      const halt = 0.58;
      if (p > halt) p = halt + (p - halt) * 0.55;

      const segments = route.length - 1;
      const raw = p * segments;
      const idx = Math.min(segments - 1, Math.floor(raw));
      const local = raw - idx;
      const from = nodes[route[idx]];
      const to = nodes[route[idx + 1]];
      const ease = local * local * (3 - 2 * local);
      const x = from.x + (to.x - from.x) * ease;
      const y = from.y + (to.y - from.y) * ease;

      // trail
      const grad = ctx.createLinearGradient(
        from.x + (to.x - from.x) * Math.max(0, ease - 0.25),
        from.y + (to.y - from.y) * Math.max(0, ease - 0.25),
        x,
        y,
      );
      grad.addColorStop(0, 'rgba(90,230,176,0)');
      grad.addColorStop(1, accent);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(from.x + (to.x - from.x) * Math.max(0, ease - 0.25), from.y + (to.y - from.y) * Math.max(0, ease - 0.25));
      ctx.lineTo(x, y);
      ctx.stroke();

      // packet
      ctx.beginPath();
      ctx.arc(x, y, 2.6 + Math.sin(t / 420) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();

      // the node it is heading for
      ctx.beginPath();
      ctx.arc(to.x, to.y, 7 + Math.sin(t / 500) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // The camera: a small pointer-driven offset, plus a nudge from scroll
    // speed. CAMERA_SCALE is what pays for the offsets; at 1.06 the drawing
    // covers the frame with 27px to spare on each vertical edge.
    const CAMERA_SCALE = 1.06;
    const CAMERA_LIMIT_X = 20;
    const CAMERA_LIMIT_Y = 10;
    let camX = 0;
    let camY = 0;
    let aimX = 0;
    let aimY = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      aimX = (event.clientX / window.innerWidth - 0.5) * 2;
      aimY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const placeCamera = (moving: boolean) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      let offsetY = aimY * CAMERA_LIMIT_Y;
      if (moving) {
        camX += (aimX * CAMERA_LIMIT_X - camX) * 0.08;
        offsetY += scrollVelocity.value * 8;
        camY += (offsetY - camY) * 0.08;
      } else {
        camX = aimX * CAMERA_LIMIT_X;
        camY = offsetY;
      }

      const scale = dpr * CAMERA_SCALE;
      ctx.setTransform(scale, 0, 0, scale, camX * dpr, camY * dpr);
    };

    const loop = (t: number) => {
      if (!running) return;
      placeCamera(true);
      drawBase();
      drawPacket(t);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced) {
        placeCamera(false);
        drawBase();
        return;
      }
      if (!running) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };

    const stop = () => cancelAnimationFrame(frame);

    build();

    if (reduced) {
      placeCamera(false);
      drawBase();
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      start();
    }

    const onResize = () => {
      build();
      if (reduced) {
        placeCamera(false);
        drawBase();
      }
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) start();
      else stop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !document.hidden;
        if (running) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      stop();
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
};

export default TopologyCanvas;
