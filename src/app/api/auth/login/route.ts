import { NextResponse } from "next/server";

import {
  ROLE_COOKIE_NAME,
  getAllowedRolesForSession,
  sanitizeRequestedRole,
} from "../../../../lib/auth";
import { requireSameOrigin } from "../../../../lib/security";

const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; firstAttempt: number }>();

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
  const originCheck = requireSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.message }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const record = attempts.get(ip);
  if (record && now - record.firstAttempt < ATTEMPT_WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

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
      const nextCount =
        record && now - record.firstAttempt < ATTEMPT_WINDOW_MS
          ? record.count + 1
          : 1;
      attempts.set(ip, { count: nextCount, firstAttempt: record?.firstAttempt ?? now });
      return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
    }

    attempts.set(ip, { count: 0, firstAttempt: now });

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
