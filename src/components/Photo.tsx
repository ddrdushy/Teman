import type { CSSProperties } from 'react';
import { IMAGES } from '@/lib/images.generated';

export type PhotoSlot = keyof typeof IMAGES;

/* The only way an image is placed (docs/15). AVIF → WebP → JPEG at 1x/2x,
   explicit intrinsic dimensions so the box is reserved before a byte
   arrives, and the inline LQIP sits underneath until real pixels cover it —
   no layout shift, no pop-in, no JS. Above-the-fold callers pass eager. */
export function Photo({ slot, alt, eager = false, style }: {
  slot: PhotoSlot;
  alt: string;
  eager?: boolean;
  style?: CSSProperties;
}) {
  const m = IMAGES[slot];
  const srcset = (ext: string) => m.widths.map((w) => `/images/${slot}-${w}.${ext} ${w}w`).join(', ');
  const sizes = `(max-width: 760px) 92vw, ${m.width}px`;

  return (
    <picture>
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
      <img
        src={`/images/${slot}-${m.width}.jpg`}
        srcSet={srcset('jpg')}
        sizes={sizes}
        alt={alt}
        width={m.width}
        height={m.height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: 'var(--r-card)',
          background: `url(${m.lqip}) center / cover no-repeat`,
          ...style,
        }}
      />
    </picture>
  );
}
