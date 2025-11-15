"use client";

import * as React from "react";
import { Alert, Button, Stack, TextField } from "@mui/material";

import type { CustomerProfile } from "../../../services/users";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  profile: CustomerProfile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [state, setState] = React.useState(profile);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [pending, setPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/customers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          phone: state.phone,
          favoriteDish: state.favoriteDish,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFeedback({ type: "error", message: data?.error ?? "Could not update profile." });
        return;
      }

      setFeedback({ type: "success", message: "Profile updated." });
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error) {
      console.error("Profile update failed", error);
      setFeedback({ type: "error", message: "Could not update profile." });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}
        <TextField
          label="Full name"
          value={state.name}
          onChange={(event) => setState((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <TextField label="Email" value={state.email} disabled />
        <TextField
          label="Phone number"
          value={state.phone ?? ""}
          onChange={(event) => setState((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder="+49 111 222333"
        />
        <TextField
          label="Favorite dish"
          value={state.favoriteDish ?? ""}
          onChange={(event) => setState((prev) => ({ ...prev, favoriteDish: event.target.value }))}
          placeholder="e.g., Paneer Tikka"
        />
        <Button type="submit" variant="contained" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </Stack>
    </form>
  );
}
