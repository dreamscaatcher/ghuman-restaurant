import { NextResponse } from "next/server";

import {
  ROLE_COOKIE_NAME,
  getAllowedRolesForSession,
  sanitizeRequestedRole,
} from "../../../../lib/auth";

function getExpectedPasscode(role: "manager" | "kitchen"): string | null {
  if (role === "manager") {
    return process.env.MANAGER_PASSCODE ?? null;
  }
  return process.env.KITCHEN_PASSCODE ?? null;
}

function isStaffRole(role: unknown): role is "manager" | "kitchen" {
  return role === "manager" || role === "kitchen";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = sanitizeRequestedRole(body?.role);
    const passcode = body?.passcode?.toString() ?? "";

    if (!role || !isStaffRole(role) || !passcode) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 },
      );
    }

    const expected = getExpectedPasscode(role);
    if (!expected) {
      return NextResponse.json(
        { error: "Staff access is not configured." },
        { status: 500 },
      );
    }

    if (passcode !== expected) {
      return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
    }

    const allowedRoles = getAllowedRolesForSession(role);
    const response = NextResponse.json({ role, allowedRoles }, { status: 200 });
    response.cookies.set({
      name: ROLE_COOKIE_NAME,
      value: role,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Staff login failed", error);
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
