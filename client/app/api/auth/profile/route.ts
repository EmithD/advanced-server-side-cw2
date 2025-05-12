import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';

  const beRes = await fetch(`${process.env.BE_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  });

  if (!beRes.ok) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: beRes.status }
    );
  }

  const data = await beRes.json();
  return NextResponse.json(data);
}