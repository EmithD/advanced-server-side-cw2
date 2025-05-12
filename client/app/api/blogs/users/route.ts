import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to Load blog posts' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}