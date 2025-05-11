import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/${id}`, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const beRes = await fetch(`${process.env.BE_URL}/api/blogs/${id}`, {
    method: 'PATCH',
    headers: {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!beRes.ok) {
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: beRes.status });
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}