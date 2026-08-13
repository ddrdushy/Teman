/**
 * Document storage: R2 when configured (production — keeps ID documents off
 * the app disk, docs/01 §1), local disk under .data/uploads otherwise (dev
 * and the demo environment, which must run with nothing external).
 *
 * Reads are short-lived signed URLs on R2, or the self/admin-gated
 * /api/files route locally. Callers log access — they know the actor.
 */

import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const LOCAL_ROOT = '.data/uploads';

export function storageConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
  );
}

function client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const bucket = () => process.env.R2_BUCKET ?? 'teman-documents';

function localPath(key: string): string {
  const p = normalize(join(LOCAL_ROOT, key));
  if (!p.startsWith(LOCAL_ROOT)) throw new Error('bad storage key');
  return p;
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (storageConfigured()) {
    await client().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));
    return;
  }
  const p = localPath(key);
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, body);
}

/** A URL an authorised viewer can open right now. R2: 60s signed. Local: the
 *  gated /api/files route. Access logging is the caller's job. */
export async function readUrl(key: string): Promise<string> {
  if (storageConfigured()) {
    return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn: 60 });
  }
  return `/api/files/${key}`;
}

export async function readObject(key: string): Promise<Buffer> {
  if (storageConfigured()) {
    const res = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    return Buffer.from(await res.Body!.transformToByteArray());
  }
  return readFile(localPath(key));
}

/** The 90-day retention job (C-07) deletes through here. */
export async function deleteStoredObject(key: string): Promise<void> {
  if (storageConfigured()) {
    await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
    return;
  }
  await unlink(localPath(key)).catch(() => {});
}
