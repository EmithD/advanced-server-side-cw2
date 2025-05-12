import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const userId = (await params).userId

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}