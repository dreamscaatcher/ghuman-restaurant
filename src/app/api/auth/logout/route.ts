import { NextResponse } from "next/server";

import { ROLE_COOKIE_NAME } from "../../../../lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ROLE_COOKIE_NAME,
    value: "",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
