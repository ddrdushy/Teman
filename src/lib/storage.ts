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

/* Any S3-compatible endpoint: R2 (via R2_* vars) or an explicit
   STORAGE_S3_ENDPOINT (e.g. Supabase Storage's S3 gateway). */
function s3Config() {
  if (process.env.STORAGE_S3_ENDPOINT && process.env.STORAGE_S3_ACCESS_KEY) {
    return {
      endpoint: process.env.STORAGE_S3_ENDPOINT,
      region: process.env.STORAGE_S3_REGION ?? 'auto',
      accessKeyId: process.env.STORAGE_S3_ACCESS_KEY,
      secretAccessKey: process.env.STORAGE_S3_SECRET_KEY ?? '',
      forcePathStyle: true,
    };
  }
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
    return {
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      forcePathStyle: false,
    };
  }
  return null;
}

export function storageConfigured(): boolean {
  return s3Config() !== null;
}

function client(): S3Client {
  const cfg = s3Config();
  if (!cfg) throw new Error('no S3 storage configured');
  return new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    forcePathStyle: cfg.forcePathStyle,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
}

const bucket = () => process.env.STORAGE_S3_BUCKET ?? process.env.R2_BUCKET ?? 'teman-documents';

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
