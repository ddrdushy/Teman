'use client';

import { useEffect } from 'react';

/* The landing's two scroll behaviours: reveal-on-scroll for .rv blocks and
   the spine that fills as you read. Armed only after mount — without JS the
   page renders complete and static. Reduced motion never arms at all (CSS
   also forces everything visible as a second guard). */
export function LandingFx() {
  useEffect(() => {
    const root = document.getElementById('ld-root');
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.classList.add('ld-anim');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    root.querySelectorAll('.rv').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${Math.min(i % 4, 3) * 55}ms`;
      io.observe(el);
    });

    const fill = document.getElementById('ld-fill');
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!fill) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        fill.style.height = `${p * 100}%`;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
    return () => {
      io.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
