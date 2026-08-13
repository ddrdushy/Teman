import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { putObject } from '@/lib/storage';
import { audit } from '@/lib/privacy';

const MAX_BYTES = 10 * 1024 * 1024;

/* Never store the raw document number. The salted hash exists only so the
   admin queue can flag the same MyKad appearing on two accounts. */
function docHash(num: string): string {
  const pepper = process.env.AUTH_SECRET ?? '';
  return createHash('sha256').update(`${pepper}:${num.replace(/\D/g, '')}`).digest('hex');
}

export async function POST(req: NextRequest) {
  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({ ok: false }, { status: 401 });

  const form = await req.formData();
  const docType = form.get('docType');
  const docNumber = form.get('docNumber');
  const doc = form.get('doc');
  const selfie = form.get('selfie');

  if (
    (docType !== 'mykad' && docType !== 'passport') ||
    typeof docNumber !== 'string' || !docNumber.trim() ||
    !(doc instanceof File) || !(selfie instanceof File) ||
    doc.size === 0 || selfie.size === 0 ||
    doc.size > MAX_BYTES || selfie.size > MAX_BYTES
  ) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }

  /* No client-side quality gate and no server-side one either — accept it,
     let a human review it, and say why if it's rejected (docs/04). */
  const docKey = `verif/${personId}/${randomUUID()}-doc`;
  const selfieKey = `verif/${personId}/${randomUUID()}-selfie`;
  await putObject(docKey, Buffer.from(await doc.arrayBuffer()), doc.type || 'image/jpeg');
  await putObject(selfieKey, Buffer.from(await selfie.arrayBuffer()), selfie.type || 'image/jpeg');

  await db.insert(verification).values({
    personId,
    tier: 'identity',
    docType,
    docKey,
    selfieKey,
    docHash: docHash(docNumber),
    state: 'pending',
  });
  await audit(personId, 'verification_submitted', 'person', personId, { docType });

  return NextResponse.json({ ok: true });
}
