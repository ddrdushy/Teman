import { resolveTextScale } from '@/lib/preferences';
import { Gallery } from './Gallery';

/* /dev/components — in the repo forever (docs/09). Every component in every
   state; the language and text-size controls at the top re-render the whole
   page, which is how 28 components × states × 4 locales × 3 sizes stays
   checkable without opening 129 screens. */
export default async function DevComponentsPage() {
  const textScale = await resolveTextScale();
  return <Gallery textScale={textScale} />;
}
