import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqData = await req.json();

  const beRes = await fetch(`${process.env.BE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqData),
    credentials: 'include'
  });

  const data = await beRes.json();
  const response = NextResponse.json(data);

  const setCookieHeader = beRes.headers.get('set-cookie');
  
  if (setCookieHeader) {
    response.headers.set('set-cookie', setCookieHeader);
  }
  
  return response;
}