import { cookies } from "next/headers";

import {
  CUSTOMER_ONLY_ROLES,
  KITCHEN_ALLOWED_ROLES,
  MANAGER_ALLOWED_ROLES,
  Role,
  isRole,
} from "./roles";

export const ROLE_COOKIE_NAME = "ghuman_role";

export async function getSessionRole(): Promise<Role | null> {
  const store = await cookies();
  const value = store.get(ROLE_COOKIE_NAME)?.value;
  if (!isRole(value)) {
    return null;
  }
  return value;
}

export function getAllowedRolesForSession(role: Role | null): Role[] {
  if (role === "manager") {
    return MANAGER_ALLOWED_ROLES;
  }

  if (role === "kitchen") {
    return KITCHEN_ALLOWED_ROLES;
  }

  return CUSTOMER_ONLY_ROLES;
}

export function isStaffRole(role: Role): boolean {
  return role === "manager" || role === "kitchen";
}

export function sanitizeRequestedRole(value: unknown): Role | null {
  if (!isRole(value)) {
    return null;
  }
  return value;
}
