import { NextRequest, NextResponse } from 'next/server';
import { runAllDueJobs } from '@/lib/jobs';

export const maxDuration = 60;

/* Serverless job runner. On the VPS pg-boss does this instead — same
 * functions. Protected by CRON_SECRET: Vercel Cron sends it as a Bearer
 * token automatically; an external cron passes x-cron-secret. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const header = req.headers.get('x-cron-secret');
  if (!secret || (auth !== `Bearer ${secret}` && header !== secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await runAllDueJobs();
  return NextResponse.json({ ok: true, ...result });
}
