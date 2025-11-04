import React, { useRef, useEffect } from 'react';

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2d context');
      return;
    }

    let animationFrameId: number;
    let stars: { x: number; y: number; z: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      targetMousePos.current.x = e.clientX - canvas.width / 2;
      targetMousePos.current.y = e.clientY - canvas.height / 2;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log('Canvas resized:', { width: canvas.width, height: canvas.height });
      stars = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 1000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width,
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // smooth mouse movement (ease)
      mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * 0.05;
      mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * 0.05;

      stars.forEach(star => {
        const perspective = canvas.width / star.z;
        const sx =
          (star.x - canvas.width / 2 + mousePos.current.x * 0.1) * perspective +
          canvas.width / 2;
        const sy =
          (star.y - canvas.height / 2 + mousePos.current.y * 0.1) * perspective +
          canvas.height / 2;
        const radius = Math.max(0, (1 - star.z / canvas.width) * 2.5);
        const opacity = 1 - star.z / canvas.width;

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      stars.forEach(star => {
        star.z -= 1.5;
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }
      });
    };

    const animate = () => {
      draw();
      update();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
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
