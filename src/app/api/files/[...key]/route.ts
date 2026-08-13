import { NextRequest, NextResponse } from 'next/server';
import { personIdFromSession } from '@/auth';
import { readObject, storageConfigured } from '@/lib/storage';

/* Local-mode file serving only (R2 uses signed URLs instead). A person can
   fetch their own verification images; admin access arrives with the G9
   roles and is logged there. Never a public path. */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> },
) {
  if (storageConfigured()) return NextResponse.json({}, { status: 404 });

  const personId = await personIdFromSession();
  if (!personId) return NextResponse.json({}, { status: 401 });

  const { key } = await ctx.params;
  const path = key.join('/');
  if (!path.startsWith(`verif/${personId}/`)) {
    return NextResponse.json({}, { status: 403 });
  }

  try {
    const buf = await readObject(path);
    return new NextResponse(new Uint8Array(buf), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json({}, { status: 404 });
  }
}
