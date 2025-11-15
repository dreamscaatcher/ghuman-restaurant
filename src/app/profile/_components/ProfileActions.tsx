"use client";

import * as React from "react";
import { Button, Stack } from "@mui/material";
import { signOut } from "next-auth/react";
import NextLink from "next/link";

export function ProfileActions() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <Button component={NextLink} href="/" variant="text">
        Back to menu
      </Button>
      <Button variant="outlined" onClick={handleLogout}>
        Log out
      </Button>
    </Stack>
  );
}
