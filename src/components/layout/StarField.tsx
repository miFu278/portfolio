import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollVelocity } from '../../lib/scrollVelocity';

/** A star on a sphere around the camera, fixed for the life of the layer. */
interface Star {
  x: number;
  y: number;
  z: number;
  /** 0 near, 1 far. Decides how much of the drift it feels. */
  depth: number;
  size: number;
  brightness: number;
  phase: number;
  speed: number;
  /** Which of the three tints this star carries. */
  tint: number;
}

/** How far the pointer can turn the field, in radians. */
const MAX_YAW = 0.3;
const MAX_PITCH = 0.22;
/** The idle turn, so the field is never still even with the cursor parked. */
const DRIFT = 0.02;
const FOV = (60 * Math.PI) / 180;
/** Stars the pointer bends toward it, and the reach of the lines it draws. */
const WELL = 150;
const REACH = 260;
const NEARBY = 5;
/** One star per this many pixels of viewport, within bounds. */
const DENSITY = 1500;
const MIN_STARS = 220;
const MAX_STARS = 1500;
/**
 * The backing store is always one device pixel per CSS pixel, never more. A
 * canvas whose store and display size differ is resampled on every frame, and
 * on this layer that resample costs more than the stars do; a faint pinpoint
 * does not want the extra resolution anyway.
 */
const SCALE = 1;
/**
 * The field draws at 30fps, not 60. Nothing in it moves fast enough for the
 * difference to be visible -- the drift is a degree a second, the twinkle is a
 * brightness curve -- and a full-viewport canvas at half rate is half the frame
 * budget it would otherwise take from the scroll.
 */
const FRAME_MS = 33;

/**
 * The sky behind the page.
 *
 * A star field is not a texture: it is a sphere around the camera, so every star
 * is kept as a direction at a fixed radius and projected each frame. That is
 * what lets one field answer the pointer (a shallow orbit), the scroll (a warp
 * that decays), and the cursor itself -- stars near it bend toward it, and the
 * nearest few are joined to it, as if the pointer were a well in the field
 * rather than an overlay on top of it.
 *
 * What keeps it off the frame budget, in order of how much each one buys: the
 * cloud behind it is a CSS gradient the compositor paints, not a full-viewport
 * canvas blit every frame; pinpoints are `fillRect` calls, and only the few
 * anchors pay for a path, an arc and an aura; the count comes from the viewport
 * area rather than being fixed; and the loop runs at half rate. It pauses with
 * the tab, and under reduced motion it paints one frame and never loops.
 *
 * The colours are tokens the canvas reads like any other: the field is starlight
 * on the page's own darkness, with a cloud behind it (`--star-veil`).
 */
const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = SCALE;
    let stars: Star[] = [];
    let frame = 0;
    let last = performance.now();
    let lastDraw = 0;

    let drift = 0;
    let yaw = 0;
    let pitch = 0;
    let warp = 0;
    let surge = 0;

    /** Pointer in normalised -1..1, and the eased position of its well. */
    const pointer = { x: 0, y: 0 };
    let wellX = -9999;
    let wellY = -9999;
    let hasPointer = false;

    /** The well's halo, rebuilt only when the well has actually moved. */
    let halo: CanvasGradient | null = null;
    let haloX = -9999;
    let haloY = -9999;

    /** The nearest few stars to the well, as preallocated slots. */
    const nearX = new Float32Array(NEARBY);
    const nearY = new Float32Array(NEARBY);
    const nearA = new Float32Array(NEARBY);
    const nearD = new Float32Array(NEARBY);
    let nearCount = 0;

    /** Palette, read from the tokens once per build and on a skin change. */
    let star = '255, 255, 255';
    let cool = '200, 225, 255';
    let warm = '255, 245, 230';
    let gain = 1;

    const readTokens = () => {
      const style = getComputedStyle(canvas);
      const token = (name: string, fallback: string) =>
        style.getPropertyValue(name).trim() || fallback;
      star = token('--star', star);
      cool = token('--star-cool', cool);
      warm = token('--star-warm', warm);
      gain = Number(token('--star-gain', '1')) || 0;
      halo = null;
    };

    const buildStars = () => {
      const count = Math.min(
        MAX_STARS,
        Math.max(MIN_STARS, Math.floor((width * height) / DENSITY)),
      );
      const radius = Math.max(width, height) * 0.65;
      stars = [];

      for (let i = 0; i < count; i += 1) {
        // A direction on the sphere, latitude biased toward the frustum so the
        // screen fills rather than the poles.
        let x = 0;
        let y = 0;
        let z = 0;
        let len = 0;
        while (len < 0.01) {
          x = Math.random() * 2 - 1;
          y = (Math.random() * 2 - 1) * 0.65;
          z = Math.random() * 2 - 1;
          len = Math.hypot(x, y, z);
        }

        const depth = Math.random() ** 1.2;
        const r = radius * (0.55 + 0.45 * depth);
        stars.push({
          x: (x / len) * r,
          y: (y / len) * r,
          z: (z / len) * r,
          depth,
          // Mostly pinpoints, with a few anchors that carry an aura.
          size: 0.8 + Math.random() ** 2.8 * 2.5,
          brightness: 0.4 + 0.6 * (1 - depth * 0.4),
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 2.2,
          tint: Math.random(),
        });
      }
    };

    const resize = () => {
      // 1.5, not 2: the field is faint by nature, and the difference between a
      // pinpoint at 1.5 and at 2 device pixels is invisible while the paint cost
      // is not.
      dpr = SCALE;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      if (reduced) draw(performance.now());
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Scrolling warps the field and lets go of it: a rotation that decays,
      // rather than a second animation with its own timeline.
      warp = (warp + scrollVelocity.value * 0.02) * 0.9;
      surge *= 0.93;
      drift += (DRIFT + warp + surge * 0.03) * dt;
      yaw += (pointer.x * MAX_YAW - yaw) * 0.04;
      pitch += (pointer.y * MAX_PITCH - pitch) * 0.04;

      if (hasPointer) {
        wellX += (pointer.x * width * 0.5 + width * 0.5 - wellX) * 0.2;
        wellY += (pointer.y * height * 0.5 + height * 0.5 - wellY) * 0.2;
      }

      ctx.clearRect(0, 0, width, height);

      if (hasPointer && Math.abs(wellX - haloX) + Math.abs(wellY - haloY) > 3) {
        haloX = wellX;
        haloY = wellY;
        halo = ctx.createRadialGradient(wellX, wellY, 0, wellX, wellY, 70);
        halo.addColorStop(0, `rgba(${cool},1)`);
        halo.addColorStop(1, `rgba(${cool},0)`);
      }
      if (hasPointer && halo) {
        ctx.globalAlpha = 0.05 + surge * 0.08;
        ctx.fillStyle = halo;
        ctx.fillRect(wellX - 70, wellY - 70, 140, 140);
        ctx.globalAlpha = 1;
      }

      const focal = height / 2 / Math.tan(FOV / 2);
      const cx = width / 2;
      const cy = height / 2;
      const turn = drift + yaw;
      const cosYaw = Math.cos(turn);
      const sinYaw = Math.sin(turn);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      nearCount = 0;

      for (const s of stars) {
        // Project: yaw about the vertical, then pitch about the horizontal.
        const x1 = s.x * cosYaw + s.z * sinYaw;
        const z1 = -s.x * sinYaw + s.z * cosYaw;
        const y2 = s.y * cosPitch - z1 * sinPitch;
        const z2 = s.y * sinPitch + z1 * cosPitch;
        if (z2 > -0.1) continue;

        const scale = focal / Math.max(180, -z2);
        let sx = cx + x1 * scale;
        let sy = cy + y2 * scale;
        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

        let size = Math.min(2.8, Math.max(0.5, s.size * scale * 0.28));
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        let alpha = s.brightness * (0.5 + 0.5 * twinkle) * (1 + surge * 0.7);

        let distance2 = Infinity;
        if (hasPointer) {
          const dx = sx - wellX;
          const dy = sy - wellY;
          distance2 = dx * dx + dy * dy;
          if (distance2 < WELL * WELL) {
            const distance = Math.sqrt(distance2) || 1;
            const fall = 1 - distance / WELL;
            sx -= dx * fall * 0.32;
            sy -= dy * fall * 0.32;
            alpha *= 1 + fall * 0.9;
            size = Math.min(2.8, size * (1 + fall * 0.2));
          }
        }

        const tint = s.tint < 0.15 ? cool : s.tint < 0.28 ? warm : star;
        const a = Math.min(1, alpha) * gain;

        if (size < 1.2) {
          // A pinpoint is a couple of pixels, not a shape: hundreds of these are
          // `fillRect`, which costs a fraction of a path plus an arc plus a fill.
          ctx.fillStyle = `rgba(${tint},${a.toFixed(3)})`;
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
        } else {
          ctx.fillStyle = `rgba(${tint},${(a * 0.12).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(${tint},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();

          if (size > 1.5) {
            ctx.fillStyle = `rgba(${star},${(a * 0.85).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (distance2 < REACH * REACH) {
          if (nearCount < NEARBY) {
            nearX[nearCount] = sx;
            nearY[nearCount] = sy;
            nearA[nearCount] = a;
            nearD[nearCount] = distance2;
            nearCount += 1;
          } else {
            let farthest = 0;
            for (let i = 1; i < NEARBY; i += 1) if (nearD[i] > nearD[farthest]) farthest = i;
            if (distance2 < nearD[farthest]) {
              nearX[farthest] = sx;
              nearY[farthest] = sy;
              nearA[farthest] = a;
              nearD[farthest] = distance2;
            }
          }
        }
      }

      // The constellation the pointer draws: it is the well's, not the page's.
      // One path and one stroke for the whole thing, tips as squares.
      if (hasPointer && nearCount > 0) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < nearCount; i += 1) {
          const strength =
            (1 - Math.sqrt(nearD[i]) / REACH) * 0.34 * (0.6 + 0.4 * nearA[i]) + surge * 0.12;
          if (strength <= 0.01) continue;
          ctx.moveTo(wellX, wellY);
          ctx.lineTo(nearX[i], nearY[i]);
          ctx.fillStyle = `rgba(${cool},${(strength * 1.6 * gain).toFixed(3)})`;
          ctx.fillRect(nearX[i] - 1.2, nearY[i] - 1.2, 2.4, 2.4);
        }
        ctx.strokeStyle = `rgba(${cool},${(0.34 * gain).toFixed(3)})`;
        ctx.stroke();
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      draw(now);
    };

    const start = () => {
      if (frame || reduced || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / width - 0.5) * 2;
      pointer.y = (event.clientY / height - 0.5) * 2;
      if (!hasPointer) {
        wellX = event.clientX;
        wellY = event.clientY;
        hasPointer = true;
      }
    };

    // Pointing at something that can be pressed brightens the whole field.
    const onOver = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a, button, input, textarea, select, label')) {
        surge = 1;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    readTokens();
    resize();
    start();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  return (
    <>
      {/* The cloud and the field are two layers on purpose. Painted as the
          canvas's own background, the gradient is re-rastered every time the
          canvas is invalidated - which is every frame - and that alone cost the
          page half its frame rate. As a sibling it is painted once. */}
      <div className="starfield__veil" aria-hidden="true" />
      <canvas ref={canvasRef} className="starfield" aria-hidden="true" />
    </>
  );
};

export default StarField;
