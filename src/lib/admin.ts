import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { person } from '@/db/schema';
import { personIdFromSession } from '@/auth';

export type AdminRole = 'coordinator' | 'admin';

/** Server-side role gate — the ONLY admin access check. UI never merely
 *  hides buttons; every admin route and API calls this first. */
export async function requireRole(allowed: AdminRole[]): Promise<
  { id: string; role: AdminRole; displayName: string } | null
> {
  const personId = await personIdFromSession();
  if (!personId) return null;
  const p = await db.query.person.findFirst({
    where: eq(person.id, personId),
    columns: { id: true, role: true, displayName: true },
  });
  if (!p?.role || !allowed.includes(p.role as AdminRole)) return null;
  return { id: p.id, role: p.role as AdminRole, displayName: p.displayName };
}
