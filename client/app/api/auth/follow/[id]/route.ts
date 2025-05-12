import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  const cookie = req.headers.get('cookie') || '';

  const beRes = await fetch(`${process.env.BE_URL}/api/auth/follow/${id}`, {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}