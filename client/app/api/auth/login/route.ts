import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const reqData = await req.json();

  const beRes = await fetch(`${process.env.BE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqData)
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}