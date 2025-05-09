import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.BE_URL}/api/blogs`, {
      method: "GET",
        headers: {
          'Authorization': `Bearer ${process.env.PERMA_TOKEN}`,
          'Content-Type': 'application/json'
        }
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}