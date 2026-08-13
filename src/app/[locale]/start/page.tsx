import { LanguageCards } from './LanguageCards';
import { Sisi } from '@/components/Sisi';

/* A1 · The language picker. The first thing anyone sees, and the screen most
   likely to be reached by someone who can't read the current language — so:
   four cards in their own scripts, fixed order, no flags, and nothing else
   competing. The mark sits small at the top in its waiting state. */
export default function LanguagePickerPage() {
  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--s-8)' }}>
        <Sisi state="waiting" size={44} />
      </div>
      <LanguageCards />
    </main>
  );
}
