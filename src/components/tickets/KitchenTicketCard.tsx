"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import type { KitchenTicket } from "../../services/menu";
import type { TicketActionState } from "../../app/_actions/tickets";

type KitchenTicketCardProps = {
  ticket: KitchenTicket;
  action: (state: TicketActionState, formData: FormData) => Promise<TicketActionState>;
};

const STATUS_LABELS: Record<KitchenTicket["status"], string> = {
  queued: "Queued",
  prepping: "In Prep",
  completed: "Completed",
};

const STATUS_TRANSITIONS: Record<KitchenTicket["status"], KitchenTicket["status"][]> = {
  queued: ["prepping"],
  prepping: ["completed"],
  completed: [],
};

const initialActionState: TicketActionState = { error: null, success: false };

export function KitchenTicketCard({ ticket, action }: KitchenTicketCardProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const router = useRouter();

  React.useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const transitions = STATUS_TRANSITIONS[ticket.status] ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Ticket {ticket.id}
            </Typography>
            <Chip
              label={STATUS_LABELS[ticket.status]}
              color={ticket.status === "completed" ? "success" : "default"}
              size="small"
            />
          </Stack>

          <Typography variant="subtitle1" fontWeight={600}>
            {ticket.item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Qty {ticket.quantity}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.item.description}
          </Typography>

          {state.error ? <Alert severity="error">{state.error}</Alert> : null}

          {transitions.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {transitions.map((nextStatus) => (
                <Box
                  key={nextStatus}
                  component="form"
                  action={formAction}
                  sx={{ mt: 1 }}
                >
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <input type="hidden" name="nextStatus" value={nextStatus} />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={pending}
                  >
                    {nextStatus === "prepping" ? "Start prep" : "Complete"}
                  </Button>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Ticket completed.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
