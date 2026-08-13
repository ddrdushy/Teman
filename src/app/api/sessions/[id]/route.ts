import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { session, match, request, person, trustedContact } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { audit } from '@/lib/privacy';
import { notify } from '@/lib/notify';
import { sendSms, otpSmsBody } from '@/lib/sms';

/* I2/I3/I5/I8 · Session lifecycle. Start and end each need BOTH parties —
 * neither side can start or finish a session alone. Trusted contacts are
 * told at start and at safe end (H-07). Every transition is audited. */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await ctx.params;

  const s = await db.query.session.findFirst({ where: eq(session.id, id) });
  if (!s) return NextResponse.json({ ok: false }, { status: 404 });
  const m = await db.query.match.findFirst({ where: eq(match.id, s.matchId) });
  const r = m ? await db.query.request.findFirst({ where: eq(request.id, m.requestId) }) : null;
  if (!m || !r) return NextResponse.json({ ok: false }, { status: 404 });
  const isRequester = personId === r.requesterId;
  if (!isRequester && personId !== m.temanId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let b: { action?: string; enabled?: boolean };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  async function tellTrustedContacts(kind: 'sessionStarted' | 'sessionEnded' | 'trustedAlert', actorName: string) {
    /* contacts belong to the requester side — the person being accompanied */
    const contacts = await db.query.trustedContact.findMany({
      where: eq(trustedContact.personId, r!.requesterId),
    });
    for (const c of contacts) {
      /* SMS in the account holder's language; stubbed outside production */
      const owner = await db.query.person.findFirst({ where: eq(person.id, r!.requesterId) });
      const body = kind === 'trustedAlert'
        ? (await import(`@/messages/${owner?.preferredLanguage ?? 'en'}.json`)).default.notifications.trustedAlert.replace('{name}', actorName)
        : (await import(`@/messages/${owner?.preferredLanguage ?? 'en'}.json`)).default.notifications[kind].replace('{title}', r!.title);
      await sendSms(c.phone, body);
    }
    return contacts.length;
  }

  const me = await db.query.person.findFirst({ where: eq(person.id, personId) });
  const myFirstName = me?.displayName.split(/\s+/)[0] ?? '';
  const otherId = isRequester ? m.temanId : r.requesterId;

  switch (b.action) {
    case 'arrived': {
      if (s.state !== 'scheduled') return NextResponse.json({ ok: false }, { status: 409 });
      await notify(otherId, 'temanArrived', { name: myFirstName });
      await audit(personId, 'session_arrived', 'session', id);
      return NextResponse.json({ ok: true });
    }
    case 'start': {
      if (s.state !== 'scheduled') return NextResponse.json({ ok: false }, { status: 409 });
      if (!s.startedBy) {
        await db.update(session).set({ startedBy: personId }).where(eq(session.id, id));
        return NextResponse.json({ ok: true, waiting: true });
      }
      if (s.startedBy === personId) return NextResponse.json({ ok: true, waiting: true });
      await db.update(session)
        .set({ state: 'active', startedAt: new Date() })
        .where(eq(session.id, id));
      await db.update(request).set({ status: 'active', updatedAt: new Date() })
        .where(eq(request.id, r.id));
      const told = await tellTrustedContacts('sessionStarted', myFirstName);
      await notify(r.requesterId, 'sessionStarted', { title: r.title });
      await notify(m.temanId, 'sessionStarted', { title: r.title });
      await audit(personId, 'session_started', 'session', id, { trustedContactsTold: told });
      return NextResponse.json({ ok: true, active: true });
    }
    case 'location': {
      if (s.state !== 'active') return NextResponse.json({ ok: false }, { status: 409 });
      await db.update(session)
        .set({ liveLocationEnabled: Boolean(b.enabled) })
        .where(eq(session.id, id));
      await audit(personId, 'session_location_toggled', 'session', id, { enabled: Boolean(b.enabled) });
      return NextResponse.json({ ok: true });
    }
    case 'alert-trusted': {
      /* I7 · one tap, no questions asked, works in any state */
      const told = await tellTrustedContacts('trustedAlert', myFirstName);
      await audit(personId, 'safety_alert_trusted', 'session', id, { contactsTold: told });
      return NextResponse.json({ ok: true, told });
    }
    case 'end': {
      if (s.state !== 'active') return NextResponse.json({ ok: false }, { status: 409 });
      if (!s.endedBy) {
        await db.update(session).set({ endedBy: personId }).where(eq(session.id, id));
        return NextResponse.json({ ok: true, waiting: true });
      }
      if (s.endedBy === personId) return NextResponse.json({ ok: true, waiting: true });
      await db.update(session)
        .set({ state: 'ended', endedAt: new Date() })
        .where(eq(session.id, id));
      await db.update(request).set({ status: 'completed', updatedAt: new Date() })
        .where(eq(request.id, r.id));
      await tellTrustedContacts('sessionEnded', myFirstName);
      await notify(r.requesterId, 'sessionEnded', { title: r.title });
      await notify(m.temanId, 'sessionEnded', { title: r.title });
      await audit(personId, 'session_ended', 'session', id);
      return NextResponse.json({ ok: true, ended: true });
    }
    default:
      return NextResponse.json({ ok: false }, { status: 400 });
  }
}
