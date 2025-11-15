"use client";

import * as React from "react";

import {
  CUSTOMER_ONLY_ROLES,
  KITCHEN_ALLOWED_ROLES,
  MANAGER_ALLOWED_ROLES,
  Role,
  isRole,
} from "../../lib/roles";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  isReady: boolean;
  allowedRoles: Role[];
};

const ROLE_STORAGE_KEY = "ghuman-restaurant-active-role";

const RoleContext = React.createContext<RoleContextValue | undefined>(undefined);

type RoleProviderProps = {
  children: React.ReactNode;
};
const CUSTOMER_ONLY = CUSTOMER_ONLY_ROLES;

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRoleState] = React.useState<Role>("customer");
  const [allowedRoles, setAllowedRoles] = React.useState<Role[]>(CUSTOMER_ONLY);
  const allowedRolesRef = React.useRef<Role[]>(CUSTOMER_ONLY);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    async function loadRoles() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (cancelled) return;

        const hostname = window.location.hostname.toLowerCase();
        const hostRoles = deriveRolesFromHost(hostname);
        const hostDefault = hostRoles ? getDefaultRoleForHost(hostRoles) : null;

        const rolesFromSession = Array.isArray(data?.allowedRoles)
          ? data.allowedRoles.filter(isRole)
          : [];

        const normalized = hostRoles
          ? hostRoles
          : rolesFromSession.length > 0
            ? rolesFromSession
            : CUSTOMER_ONLY;
        const defaultRole = hostDefault ?? normalized[0];

        setAllowedRoles(normalized);
        allowedRolesRef.current = normalized;

        const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
        if (isRole(stored) && normalized.includes(stored)) {
          setRoleState(stored);
        } else {
          setRoleState(defaultRole);
          if (isRole(stored)) {
            window.localStorage.setItem(ROLE_STORAGE_KEY, defaultRole);
          }
        }
      } catch (error) {
        console.warn("Failed to load role session", error);
        setAllowedRoles(CUSTOMER_ONLY);
        allowedRolesRef.current = CUSTOMER_ONLY;
        setRoleState("customer");
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    allowedRolesRef.current = allowedRoles;
  }, [allowedRoles]);

  React.useEffect(() => {
    setRoleState((current) => {
      if (allowedRoles.includes(current)) {
        return current;
      }

      const fallback = allowedRoles[0];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ROLE_STORAGE_KEY, fallback);
      }
      return fallback;
    });
  }, [allowedRoles]);

  const setRole = React.useCallback((nextRole: Role) => {
    if (!allowedRolesRef.current.includes(nextRole)) {
      return;
    }

    setRoleState((prev) => {
      if (prev === nextRole) {
        return prev;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
      }

      return nextRole;
    });
  }, []);

  const value = React.useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      isReady,
      allowedRoles,
    }),
    [role, setRole, isReady, allowedRoles],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

function deriveRolesFromHost(hostname: string): Role[] | null {
  if (hostname.startsWith("manager.")) {
    return MANAGER_ALLOWED_ROLES;
  }
  if (hostname.startsWith("kitchen.")) {
    return KITCHEN_ALLOWED_ROLES;
  }
  return null;
}

function getDefaultRoleForHost(roles: Role[]): Role {
  if (roles.includes("manager")) {
    return "manager";
  }
  if (roles.includes("kitchen")) {
    return "kitchen";
  }
  return roles[0];
}

export { ROLE_LABELS, ROLE_OPTIONS } from "../../lib/roles";
export type { Role } from "../../lib/roles";

export function useRole() {
  const context = React.useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return context;
}
