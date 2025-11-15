"use client";

import * as React from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [state, setState] = React.useState<{ error: string | null; success: boolean }>({
    error: null,
    success: false,
  });
  const [pending, setPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!name || !email || !password) {
      setState({ error: "Please complete every field.", success: false });
      return;
    }

    setPending(true);
    setState({ error: null, success: false });

    try {
      const response = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setState({ error: data?.error ?? "Could not create account.", success: false });
        return;
      }

      await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setState({ error: null, success: true });
      router.push("/profile");
    } catch (error) {
      console.error("Registration failed", error);
      setState({ error: "Could not create account.", success: false });
    } finally {
      setPending(false);
    }
  };

  return (
    <Box maxWidth={480} mx="auto">
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography component="h1" variant="h5" fontWeight={700}>
                Create your profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save your details for faster pickup and personalized recommendations.
              </Typography>
            </Stack>

            {state.error ? <Alert severity="error">{state.error}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField name="name" label="Full name" required fullWidth />
                <TextField name="email" label="Email" type="email" required fullWidth />
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  helperText="Use at least 8 characters."
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" disabled={pending}>
                  {pending ? "Creating profile..." : "Create account"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
