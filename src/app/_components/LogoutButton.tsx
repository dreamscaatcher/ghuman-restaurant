"use client";

import * as React from "react";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [pending, startTransition] = React.useTransition();

  const handleClick = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/" });
    });
  };

  return (
    <Button variant="text" color="inherit" onClick={handleClick} disabled={pending}>
      {pending ? "Signing out..." : "Log out"}
    </Button>
  );
}
