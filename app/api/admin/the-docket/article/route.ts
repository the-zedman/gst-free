import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const rows = await sql`SELECT * FROM articles WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(rows[0]);
}
