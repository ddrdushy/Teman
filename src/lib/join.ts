import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { person } from '@/db/schema';

/** Every join step is resumable — a force-quit loses nothing. This is the
 *  single place that knows where an account left off. */
export function nextJoinPath(p: { displayName: string; areaId: string | null }): string {
  if (!p.displayName) return '/join/name';
  if (!p.areaId) return '/join/area';
  return '/home';
}

export async function personForJoin(personId: string) {
  return db.query.person.findFirst({
    where: eq(person.id, personId),
    columns: { id: true, displayName: true, areaId: true, preferredLanguage: true },
  });
}
