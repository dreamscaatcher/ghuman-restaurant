"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Stack, Typography } from "@mui/material";

import { ROLE_LABELS, Role, useRole } from "../providers/RoleProvider";

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

function formatAllowedRoles(roles: Role[]) {
  if (roles.length === 1) {
    return ROLE_LABELS[roles[0]];
  }

  const labels = roles.map((role) => ROLE_LABELS[role]);
  const last = labels.pop();

  return `${labels.join(", ")} or ${last}`;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, isReady, allowedRoles: contextAllowed } = useRole();
  const router = useRouter();
  const hasRedirected = React.useRef(false);
  const isStaffPortal = contextAllowed.length > 1;
  const hasContextAccess = allowedRoles.some((candidate) =>
    contextAllowed.includes(candidate),
  );
  const isAllowed = allowedRoles.includes(role) || (isStaffPortal && hasContextAccess);

  React.useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAllowed && !isStaffPortal && role === "customer" && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [isAllowed, isReady, isStaffPortal, role, router]);

  if (!isReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <Typography variant="body2" color="text.secondary">
          Preparing workspace…
        </Typography>
      </Box>
    );
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (!isStaffPortal) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, md: 6 },
        maxWidth: 560,
        mx: "auto",
        mt: { xs: 4, md: 8 },
      }}
    >
      <Stack spacing={2} textAlign="center">
        <Typography variant="h6" fontWeight={600}>
          Access Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This section is available to{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
            {formatAllowedRoles(allowedRoles)}
          </Box>{" "}
          only. Use the role switcher in the header to change workspaces.
        </Typography>
      </Stack>
    </Paper>
  );
}
