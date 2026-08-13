import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { person } from '@/db/schema';
import { personIdFromSession } from '@/auth';

/** Account first, cookie fallback, 18 as the floor default. */
export async function resolveTextScale(): Promise<number> {
  const personId = await personIdFromSession();
  if (personId) {
    const row = await db.query.person.findFirst({
      where: eq(person.id, personId),
      columns: { textScale: true },
    });
    if (row) return row.textScale;
  }
  const jar = await cookies();
  const fromCookie = Number(jar.get('text-scale')?.value);
  return [18, 22, 26].includes(fromCookie) ? fromCookie : 18;
}
