'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function GoldTransition() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const [fade, setFade] = useState(false);
  const prevPath = useRef(pathname);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    /* Reset */
    setFade(false);
    setWidth(0);
    setActive(true);

    /* Animate bar from 0 → 85% fast, then 85 → 100% on finish */
    let current = 0;
    const step = () => {
      current += (85 - current) * 0.12;
      setWidth(Math.min(current, 85));
      if (current < 84.5) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    /* After 500 ms complete to 100% and fade out */
    timerRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      setWidth(100);
      setTimeout(() => setFade(true), 200);
      setTimeout(() => setActive(false), 600);
    }, 500);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <>
      {/* Gold progress bar at top */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 2,
          width: `${width}%`,
          background: 'linear-gradient(90deg, #B8960C 0%, #D4AF37 40%, #F5D78A 65%, #D4AF37 100%)',
          backgroundSize: '200% auto',
          animation: 'gold-sweep 1.5s linear infinite',
          zIndex: 99999,
          transition: 'width 0.12s linear, opacity 0.35s ease',
          opacity: fade ? 0 : 1,
          boxShadow: '0 0 10px 1px rgba(212,175,55,0.6)',
          borderRadius: '0 2px 2px 0',
          pointerEvents: 'none',
        }}
      />
      {/* Subtle dark overlay flash */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3,17,38,0.18)',
          zIndex: 99998,
          pointerEvents: 'none',
          animation: 'gt-fade 0.45s ease forwards',
        }}
      />
      <style>{`
        @keyframes gt-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
