'use client';

import { useEffect, useState } from 'react';
import { Sisi } from './Sisi';

/** The one signature motion: the dashed space fills amber — the product's
 *  whole argument in half a second. Match screen only; anywhere else it
 *  becomes wallpaper. With reduced motion the answered state renders
 *  immediately (the fill transition is killed globally by tokens.css). */
export function SisiReveal({ size = 118, tone = 'light' }: {
  size?: number;
  tone?: 'light' | 'dark';
}) {
  const [answered, setAnswered] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnswered(true), 400);
    return () => clearTimeout(id);
  }, []);
  return <Sisi state={answered ? 'answered' : 'waiting'} size={size} tone={tone} />;
}
