export type Role = "customer" | "manager" | "kitchen";

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  manager: "Manager",
  kitchen: "Kitchen",
};

export const ROLE_OPTIONS = (["customer", "manager", "kitchen"] as Role[]).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export const CUSTOMER_ONLY_ROLES: Role[] = ["customer"];
export const MANAGER_ALLOWED_ROLES: Role[] = ["customer", "manager", "kitchen"];
export const KITCHEN_ALLOWED_ROLES: Role[] = ["customer", "kitchen"];

export function isRole(value: unknown): value is Role {
  return value === "customer" || value === "manager" || value === "kitchen";
}
