import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vr: number;
  life: number;
  shape: 'rect' | 'circle';
}

interface ConfettiProps {
  active: boolean;
  durationMs?: number;
}

const COLORS = ['#f43f5e', '#fbbf24', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#f97316'];

export function Confetti({ active, durationMs = 3500 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    startedAtRef.current = performance.now();
    particlesRef.current = [];

    const burst = (count: number, fromTop: boolean) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = fromTop ? -10 : canvas.height * 0.3 + Math.random() * 40;
        const angle = fromTop
          ? Math.PI * 0.5 + (Math.random() - 0.5) * 0.6
          : -Math.PI * 0.5 + (Math.random() - 0.5) * 1.2;
        const speed = fromTop ? 2 + Math.random() * 3 : 6 + Math.random() * 6;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (fromTop ? 0 : 4),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 6 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
      }
    };

    burst(140, false);
    setTimeout(() => burst(80, true), 200);

    const gravity = 0.18;

    const tick = () => {
      const elapsed = performance.now() - startedAtRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0 && p.y < canvas.height + 40);

      for (const p of particlesRef.current) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        if (elapsed > durationMs - 1000) {
          p.life = Math.max(0, p.life - 0.02);
        }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < durationMs || particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden
    />
  );
}
