import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const blogData = await req.json();
  const cookie = req.headers.get('cookie') || '';

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs`, {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(blogData),
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}

export async function GET() {

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}