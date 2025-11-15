"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";

import { Role, ROLE_LABELS, useRole } from "../providers/RoleProvider";

const STAFF_ROLES: Role[] = ["manager", "kitchen"];

export function RoleSwitcher() {
  const { role, setRole, isReady, allowedRoles } = useRole();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [targetRole, setTargetRole] = React.useState<Role>("manager");
  const [passcode, setPasscode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  if (!isReady) {
    return null;
  }

  const handleChange = (event: SelectChangeEvent<Role>) => {
    setRole(event.target.value as Role);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole, passcode }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Could not sign in.");
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error("Staff login failed", err);
      setError("Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Staff logout failed", error);
    } finally {
      window.location.reload();
    }
  };

  const showWorkspaceSelect = allowedRoles.length > 1;

  return (
    <>
      {showWorkspaceSelect ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="ghuman-role-select-label">Workspace</InputLabel>
            <Select
              labelId="ghuman-role-select-label"
              id="ghuman-role-select"
              label="Workspace"
              value={role}
              onChange={handleChange}
            >
              {allowedRoles.map((value) => (
                <MenuItem key={value} value={value}>
                  {ROLE_LABELS[value]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button size="small" onClick={handleLogout} disabled={signingOut}>
            Sign out
          </Button>
        </Stack>
      ) : (
        <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
          Staff access
        </Button>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleLogin}>
          <DialogTitle>Staff access</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <FormControl fullWidth>
                <InputLabel id="ghuman-role-target-label">Workspace</InputLabel>
                <Select
                  labelId="ghuman-role-target-label"
                  label="Workspace"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value as Role)}
                >
                  {STAFF_ROLES.map((value) => (
                    <MenuItem key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Access code"
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                autoFocus
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
