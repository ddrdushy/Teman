import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/db';
import { area } from '@/db/schema';

/** A6's searchable list — a picker, never a map pin. Names are returned in
 *  all four languages; the client shows the viewer's plus the primary. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const rows = await db
    .select({
      id: area.id,
      name: area.name,
      nameMs: area.nameMs,
      nameTa: area.nameTa,
      nameZh: area.nameZh,
    })
    .from(area)
    .where(
      q
        ? and(
            eq(area.level, 'area'),
            or(
              ilike(area.name, `%${q}%`),
              ilike(area.nameMs, `%${q}%`),
              ilike(area.nameTa, `%${q}%`),
              ilike(area.nameZh, `%${q}%`),
            ),
          )
        : eq(area.level, 'area'),
    )
    .orderBy(area.name)
    .limit(20);
  return NextResponse.json({ areas: rows });
}
