'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';

export function BlockedList({ people }: { people: { id: string; name: string }[] }) {
  const t = useTranslations('safety');
  const router = useRouter();

  async function unblock(id: string) {
    await fetch(`/api/blocks?personId=${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="stack">
      {people.map((p) => (
        <div key={p.id} style={{ display: 'grid', gap: 'var(--s-1)' }}>
          <ListRow icon={p.name.charAt(0)} title={p.name} onClick={() => {}} />
          <Button variant="line" size="md" onClick={() => unblock(p.id)}>
            {t('unblock', { name: p.name })}
          </Button>
        </div>
      ))}
    </div>
  );
}
