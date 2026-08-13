/**
 * R2, S3-compatible. ID documents and selfies only — deliberately not on the
 * app disk (docs/01 §1). Access is via short-lived signed URLs; the admin
 * review screens log every read (that logging lives with the caller, which
 * has the actor and the subject).
 */

import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class StorageUnavailableError extends Error {
  constructor() { super('R2 is not configured'); this.name = 'StorageUnavailableError'; }
}

function client(): S3Client {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new StorageUnavailableError();
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
}

export function storageConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
  );
}

const bucket = () => process.env.R2_BUCKET ?? 'teman-documents';

/** For the member's browser to PUT a document directly. 5 minutes. */
export async function signedUploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
}

/** For an admin to view a document. 60 seconds — the caller logs the access. */
export async function signedReadUrl(key: string) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
    { expiresIn: 60 },
  );
}

/** The 90-day retention job (C-07) deletes through here. */
export async function deleteObject(key: string) {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
