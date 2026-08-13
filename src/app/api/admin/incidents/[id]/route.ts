import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { report, person } from '@/db/schema';
import { requireRole } from '@/lib/admin';
import { audit } from '@/lib/privacy';

/** N11 · Decide an incident. Suspension is reversible; the audit entry
 *  carries the typed reason. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole(['admin']);
  if (!actor) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await ctx.params;

  let b: { action?: string; reason?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b.reason?.trim()) return NextResponse.json({ ok: false, reason: 'reason' }, { status: 400 });

  const r = await db.query.report.findFirst({ where: eq(report.id, id) });
  if (!r || r.status !== 'open') return NextResponse.json({ ok: false }, { status: 409 });

  const close = async (status: string) => {
    await db.update(report).set({ status, handledBy: actor.id, handledAt: new Date() })
      .where(eq(report.id, id));
  };

  switch (b.action) {
    case 'dismiss':
      await close('dismissed');
      /* dismissing an auto-restriction lifts it */
      await db.update(person).set({ suspendedAt: null, updatedAt: new Date() })
        .where(eq(person.id, r.subjectPersonId));
      break;
    case 'warn':
      await close('warned');
      await db.update(person).set({ suspendedAt: null, updatedAt: new Date() })
        .where(eq(person.id, r.subjectPersonId));
      break;
    case 'restrict':
    case 'keepRestricted':
      await db.update(person).set({ suspendedAt: new Date(), updatedAt: new Date() })
        .where(eq(person.id, r.subjectPersonId));
      await close('restricted');
      break;
    case 'reinstate':
      await db.update(person).set({ suspendedAt: null, updatedAt: new Date() })
        .where(eq(person.id, r.subjectPersonId));
      await close('resolved');
      break;
    default:
      return NextResponse.json({ ok: false }, { status: 400 });
  }

  await audit(actor.id, `incident_${b.action}`, 'report', id, {
    reason: b.reason, subjectPersonId: r.subjectPersonId,
  });
  return NextResponse.json({ ok: true });
}
