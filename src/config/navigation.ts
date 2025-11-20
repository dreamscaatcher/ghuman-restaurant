import type { Role } from "../components/providers/RoleProvider";

export type NavigationLink = {
  label: string;
  href: string;
  icon?: "customer" | "dashboard" | "kitchen" | "home";
};

const navigationByRole: Record<Role, NavigationLink[]> = {
  customer: [],
  manager: [
    { label: "Manager Home", href: "/manager", icon: "home" },
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Kitchen", href: "/kitchen", icon: "kitchen" },
    { label: "Customer View", href: "/", icon: "customer" },
  ],
  kitchen: [
    { label: "Kitchen Queue", href: "/kitchen", icon: "kitchen" },
  ],
};

export function getNavigationForRole(role: Role): NavigationLink[] {
  return navigationByRole[role] ?? [];
}

// Backwards compatibility for legacy imports.
export const primaryNavigation: NavigationLink[] = getNavigationForRole("manager");
