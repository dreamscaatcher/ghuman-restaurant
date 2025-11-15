import { NextResponse } from "next/server";

import { getAllowedRolesForSession, getSessionRole } from "../../../../lib/auth";

export async function GET() {
  const role = await getSessionRole();
  const allowedRoles = getAllowedRolesForSession(role);

  return NextResponse.json({
    role,
    allowedRoles,
  });
}
