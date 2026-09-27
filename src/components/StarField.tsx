import React, { useRef, useEffect } from 'react';

type Star = {
  x: number;      // base position (unit dir * radius)
  y: number;
  z: number;
  depth: number;  // 0 (near) .. 1 (far), fixed per star
  size: number;   // magnitude
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
  tint: number;   // < 0.12 -> cool white, else pure white
};

const MAX_YAW = 0.3;       // cursor orbit range (rad)
const MAX_PITCH = 0.22;
const BASE_DRIFT = 0.02;   // idle rotation (rad/s)
const FOV = (60 * Math.PI) / 180;

const GRAV_R = 150;        // gravity-well radius (px)
const GRAV_R2 = GRAV_R * GRAV_R;
const LINE_R = 260;        // constellation-line reach (px)
const LINE_R2 = LINE_R * LINE_R;
const NEAR_MAX = 5;        // stars connected to the cursor

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let nebula: HTMLCanvasElement | null = null;
    let raf = 0;
    let lastT = performance.now();
    let driftYaw = 0;
    let mouseYaw = 0;
    let mousePitch = 0;
    let lastScrollY = window.scrollY;
    let warp = 0;
    let surge = 0;         // brightens the field while hovering interactive elements

    const mouse = { tx: 0, ty: 0 };            // normalized -1..1 (for orbit)
    let mx = -9999;                            // eased cursor px (for gravity/lines)
    let my = -9999;
    let hasMouse = false;

    const nearX = new Float32Array(NEAR_MAX);
    const nearY = new Float32Array(NEAR_MAX);
    const nearA = new Float32Array(NEAR_MAX);
    const nearD = new Float32Array(NEAR_MAX);
    let nearCount = 0;

    const randUnit = () => {
      let x = 0;
      let y = 0;
      let z = 0;
      let len = 0;
      while (len < 0.01) {
        x = Math.random() * 2 - 1;
        // Bias latitude toward the camera's viewable pitch zone to ensure high on-screen density
        y = (Math.random() * 2 - 1) * 0.65;
        z = Math.random() * 2 - 1;
        len = Math.sqrt(x * x + y * y + z * z);
      }
      return { x: x / len, y: y / len, z: z / len };
    };

    const buildStars = () => {
      // Much higher star count for a rich, dense cosmic starfield across the screen
      const count = Math.min(5200, Math.floor((width * height) / 260));
      const R = Math.max(width, height) * 0.65;
      stars = [];
      for (let i = 0; i < count; i++) {
        const d = randUnit();
        const depth = Math.pow(Math.random(), 1.2);
        // Minimum distance buffer to prevent stars from getting too close and ballooning in size
        const r = R * (0.55 + 0.45 * depth);
        stars.push({
          x: d.x * r,
          y: d.y * r,
          z: d.z * r,
          depth,
          // Varied star magnitude: mostly crisp pinpoints with a selection of glowing anchor stars
          size: 0.8 + Math.pow(Math.random(), 2.8) * 2.5,
          brightness: 0.4 + 0.6 * (1 - depth * 0.4),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.3 + Math.random() * 2.2,
          tint: Math.random(),
        });
      }
    };

    const buildNebula = () => {
      nebula = document.createElement('canvas');
      nebula.width = Math.floor(width * dpr);
      nebula.height = Math.floor(height * dpr);
      const n = nebula.getContext('2d');
      if (!n) return;
      n.scale(dpr, dpr);
      n.fillStyle = '#000';
      n.fillRect(0, 0, width, height);
      const blobs = [
        { x: 0.18, y: 0.22, r: 1.0, c: 'rgba(22,17,52,0.55)' },
        { x: 0.82, y: 0.72, r: 1.05, c: 'rgba(9,20,38,0.60)' },
        { x: 0.55, y: 0.1, r: 0.75, c: 'rgba(16,26,46,0.42)' },
        { x: 0.4, y: 0.85, r: 0.85, c: 'rgba(14,12,34,0.45)' },
      ];
      for (const b of blobs) {
        const g = n.createRadialGradient(
          b.x * width, b.y * height, 0,
          b.x * width, b.y * height, b.r * Math.max(width, height),
        );
        g.addColorStop(0, b.c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        n.fillStyle = g;
        n.fillRect(0, 0, width, height);
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      buildNebula();
    };

    const project = (s: Star, yaw: number, pitch: number) => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const x1 = s.x * cy + s.z * sy;
      const z1 = -s.x * sy + s.z * cy;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y2 = s.y * cp - z1 * sp;
      const z2 = s.y * sp + z1 * cp;
      return { x: x1, y: y2, z: z2 };
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // scroll velocity feeds a decaying "warp" rotation
      const sy = window.scrollY;
      warp += (sy - lastScrollY) * 0.0008;
      lastScrollY = sy;
      warp *= 0.9;
      surge *= 0.93;

      driftYaw += (BASE_DRIFT + warp + surge * 0.03) * dt;
      mouseYaw += (mouse.tx * MAX_YAW - mouseYaw) * 0.04;
      mousePitch += (mouse.ty * MAX_PITCH - mousePitch) * 0.04;
      const yaw = driftYaw + mouseYaw;
      const pitch = mousePitch;

      if (hasMouse) {
        mx += (mouse.tx * width * 0.5 + width * 0.5 - mx) * 0.2;
        my += (mouse.ty * height * 0.5 + height * 0.5 - my) * 0.2;
      }

      ctx.clearRect(0, 0, width, height);
      if (nebula) ctx.drawImage(nebula, 0, 0, width, height);

      // cursor halo
      if (hasMouse) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 70);
        const gi = 0.05 + surge * 0.08;
        glow.addColorStop(0, `rgba(190,208,255,${gi.toFixed(3)})`);
        glow.addColorStop(1, 'rgba(190,208,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(mx - 70, my - 70, 140, 140);
      }

      const f = height / 2 / Math.tan(FOV / 2);
      const cx = width / 2;
      const cyy = height / 2;
      nearCount = 0;

      for (const s of stars) {
        const p = project(s, yaw, pitch);
        if (p.z > -0.1) continue; // behind camera
        const dist = -p.z;
        const scale = f / Math.max(180, dist);
        let sx = cx + p.x * scale;
        let syy = cyy + p.y * scale;
        if (sx < -20 || sx > width + 20 || syy < -20 || syy > height + 20) continue;

        let sz = Math.min(2.8, Math.max(0.5, s.size * scale * 0.28));
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        let alpha = Math.min(1, s.brightness * (0.5 + 0.5 * tw) * (1 + surge * 0.7));

        // gravity well: bend nearby stars toward the cursor
        let gd2 = Infinity;
        if (hasMouse) {
          const gdx = sx - mx;
          const gdy = syy - my;
          gd2 = gdx * gdx + gdy * gdy;
          if (gd2 < GRAV_R2) {
            const gd = Math.sqrt(gd2) || 1;
            const falloff = 1 - gd / GRAV_R;
            sx -= gdx * falloff * 0.32;
            syy -= gdy * falloff * 0.32;
            alpha = Math.min(1, alpha * (1 + falloff * 0.9));
            sz = Math.min(2.8, sz * (1 + falloff * 0.2));
          }
        }

        const tint = s.tint < 0.15 ? '200, 225, 255' : s.tint < 0.28 ? '255, 245, 230' : '255, 255, 255';

        // soft subtle aura for prominent stars (never a harsh flat ring)
        if (sz > 1.3) {
          ctx.fillStyle = `rgba(${tint}, ${(alpha * 0.12).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, syy, sz * 2.0, 0, Math.PI * 2);
          ctx.fill();
        }

        // star core
        ctx.fillStyle = `rgba(${tint}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, syy, sz, 0, Math.PI * 2);
        ctx.fill();

        // brilliant pinpoint center for brightest stars
        if (sz > 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(alpha * 0.85).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, syy, sz * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // keep the nearest few for constellation lines
        if (gd2 < LINE_R2) {
          if (nearCount < NEAR_MAX) {
            nearX[nearCount] = sx;
            nearY[nearCount] = syy;
            nearA[nearCount] = alpha;
            nearD[nearCount] = gd2;
            nearCount++;
          } else {
            let maxI = 0;
            for (let i = 1; i < NEAR_MAX; i++) if (nearD[i] > nearD[maxI]) maxI = i;
            if (gd2 < nearD[maxI]) {
              nearX[maxI] = sx;
              nearY[maxI] = syy;
              nearA[maxI] = alpha;
              nearD[maxI] = gd2;
            }
          }
        }
      }

      // constellation lines from cursor to nearest stars
      if (hasMouse && nearCount > 0) {
        ctx.lineWidth = 1;
        for (let i = 0; i < nearCount; i++) {
          const d = Math.sqrt(nearD[i]);
          const a = (1 - d / LINE_R) * 0.34 * (0.6 + 0.4 * nearA[i]) + surge * 0.12;
          if (a <= 0.01) continue;
          ctx.strokeStyle = `rgba(190,208,255,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(nearX[i], nearY[i]);
          ctx.stroke();
          ctx.fillStyle = `rgba(210,224,255,${(a * 1.6).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(nearX[i], nearY[i], 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const animate = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / width - 0.5) * 2;
      mouse.ty = (e.clientY / height - 0.5) * 2;
      if (!hasMouse) {
        mx = e.clientX;
        my = e.clientY;
        hasMouse = true;
      }
    };

    // hovering any interactive element brightens the whole field
    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.('a, button, [role="button"], input, textarea, select, label')) {
        surge = 1;
      }
    };

    resize();
    if (reducedMotion) {
      draw(performance.now()); // single static frame
    } else {
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onOver);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen z-0"
      style={{ display: 'block', margin: 0, padding: 0 }}
    />
  );
};

export default Starfield;
