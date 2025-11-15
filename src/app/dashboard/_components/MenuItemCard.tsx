"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Collapse,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useActionState } from "react";

import type { MenuItem } from "../../../services/menu";

type ActionState = {
  error: string | null;
  success: boolean;
};

const initialState: ActionState = {
  error: null,
  success: false,
};

type MenuItemCardProps = {
  item: MenuItem;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
};

export function MenuItemCard({ item, action }: MenuItemCardProps) {
  const [editing, setEditing] = React.useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);

  React.useEffect(() => {
    if (state.success) {
      setEditing(false);
    }
  }, [state.success]);

  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {item.photoUrl ? (
        <CardMedia
          component="img"
          image={item.photoUrl}
          alt={item.name}
          sx={{ width: { md: 200 }, objectFit: "cover" }}
        />
      ) : null}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle1" fontWeight={600}>
              {item.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {item.price != null ? `€${item.price.toFixed(2)}` : ""}
            </Typography>
            <Button size="small" onClick={() => setEditing((prev) => !prev)}>
              {editing ? "Cancel" : "Edit"}
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        </Stack>

        <Collapse in={editing} timeout="auto" unmountOnExit>
          <Box component="form" action={formAction} sx={{ mt: 2 }}>
            <Stack spacing={2} alignItems="flex-start">
              {state.error ? <Alert severity="error">{state.error}</Alert> : null}
              {state.success ? <Alert severity="success">Menu item updated.</Alert> : null}
              <input type="hidden" name="id" value={item.id} />
              <TextField name="name" label="Dish name" defaultValue={item.name} fullWidth required />
              <TextField
                name="description"
                label="Description"
                defaultValue={item.description}
                fullWidth
                multiline
                minRows={2}
                required
              />
              <TextField
                name="photoUrl"
                label="Photo URL"
                defaultValue={item.photoUrl || ""}
                fullWidth
                required
              />
              <TextField
                name="price"
                label="Price (€)"
                defaultValue={item.price ?? ""}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                required
              />
              <Button type="submit" variant="contained" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
