"use client";

import * as React from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useActionState } from "react";

type ActionState = {
  error: string | null;
  success: boolean;
};

const initialState: ActionState = {
  error: null,
  success: false,
};

type MenuItemFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
};

export function MenuItemForm({ action }: MenuItemFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} style={{ width: "100%" }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6" fontWeight={600}>
          Add Menu Item
        </Typography>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}
        {state.success ? (
          <Alert severity="success">Menu item created and sent to the kitchen.</Alert>
        ) : null}

        <TextField
          name="name"
          label="Dish name"
          placeholder="Vegetable Roll"
          required
          fullWidth
        />
        <TextField
          name="description"
          label="Short description"
          placeholder="A crisp spring roll stuffed with seasonal vegetables."
          required
          fullWidth
          multiline
          minRows={2}
        />
        <TextField
          name="photoUrl"
          label="Photo URL"
          placeholder="https://example.com/images/vegetable-roll.jpg"
          required
          fullWidth
        />
        <TextField
          name="price"
          label="Price (€)"
          placeholder="12.50"
          type="number"
          inputProps={{ step: "0.01", min: "0" }}
          required
          fullWidth
        />
        <SubmitButton pending={isPending} />
      </Stack>
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save dish"}
    </Button>
  );
}
