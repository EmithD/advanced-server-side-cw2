import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to Load blog posts' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}