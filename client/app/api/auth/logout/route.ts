import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';

  const beRes = await fetch(`${process.env.BE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    credentials: 'include'
  });

  const data = await beRes.json();

  const response = NextResponse.json(data);
  response.cookies.delete('authToken'); 
  
  return response;
}
