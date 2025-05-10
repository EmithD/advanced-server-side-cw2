import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reqBody = await req.json();

  const beRes = await fetch(`${process.env.BE_URL}/api/countries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        searchType: reqBody.searchType,
        searchQuery: reqBody.searchQuery,
    })
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}
