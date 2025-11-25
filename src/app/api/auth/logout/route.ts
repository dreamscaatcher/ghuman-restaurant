import { NextResponse } from "next/server";

import { ROLE_COOKIE_NAME } from "../../../../lib/auth";
import { requireSameOrigin } from "../../../../lib/security";

export async function POST(request: Request) {
  const originCheck = requireSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.message }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ROLE_COOKIE_NAME,
    value: "",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
