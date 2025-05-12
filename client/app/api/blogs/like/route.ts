import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const likeData = await req.json();

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/like`, {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(likeData),
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to like blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}