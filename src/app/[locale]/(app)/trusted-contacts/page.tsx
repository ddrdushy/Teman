import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { trustedContact } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { ContactManager } from './ContactManager';

/* I9/I10 · Trusted contacts. The empty state explains why it matters, not
   that it's empty. */
export default async function TrustedContactsPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('safety');

  const rows = await db.query.trustedContact.findMany({
    where: eq(trustedContact.personId, personId),
  });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('contactsTitle')}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{t('contactsLead')}</p>
      <ContactManager
        contacts={rows.map((r) => ({ id: r.id, name: r.name, relationship: r.relationship }))}
      />
    </main>
  );
}
