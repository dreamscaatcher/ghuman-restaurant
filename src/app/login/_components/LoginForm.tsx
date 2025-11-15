"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { signIn } from "next-auth/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  redirectTo: string;
  initialError?: string | null;
};

export function LoginForm({ redirectTo, initialError }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(initialError ?? null);
  const [pending, setPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("Enter both email and password.");
      return;
    }

    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setPending(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(redirectTo);
  };

  return (
    <Box maxWidth={420} mx="auto">
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography component="h1" variant="h5" fontWeight={700}>
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to view your profile and track your kitchen tickets.
              </Typography>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField name="email" label="Email" type="email" required fullWidth />
                <TextField name="password" label="Password" type="password" required fullWidth />
                <Button type="submit" variant="contained" disabled={pending}>
                  {pending ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              New guest?{" "}
              <MuiLink component={NextLink} href="/register" underline="hover">
                Create your profile
              </MuiLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
