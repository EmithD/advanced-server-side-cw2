import { NextResponse } from 'next/server';

export async function GET() {

  const beRes = await fetch(`${process.env.BE_URL}/api/countries`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}
