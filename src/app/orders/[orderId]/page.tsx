import { Card, CardContent, Stack, Typography, Chip, Button } from "@mui/material";
import Link from "next/link";

import { RoleGuard } from "../../../components/security/RoleGuard";
import { listOrderTickets } from "../../../services/menu";

type OrderStatusPageProps = {
  params: {
    orderId: string;
  };
};

const STATUS_LABELS = {
  queued: "Queued",
  prepping: "In Prep",
  completed: "Completed",
} as const;

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params }: OrderStatusPageProps) {
  const tickets = await listOrderTickets(params.orderId);

  return (
    <RoleGuard allowedRoles={["customer", "manager", "kitchen"]}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography component="h1" variant="h4" fontWeight={700}>
            Order #{params.orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your dishes as they move through the kitchen.
          </Typography>
        </Stack>

        {tickets.length === 0 ? (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1" fontWeight={600}>
                We&apos;re preparing your order details.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If you just placed this order, refresh the page in a moment. Otherwise, confirm you
                entered the correct order number.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {tickets.map((ticket) => (
              <Card key={ticket.id} variant="outlined">
                <CardContent>
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
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                    {ticket.item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty {ticket.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.item.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Button component={Link} href="/" variant="outlined">
          Back to menu
        </Button>
      </Stack>
    </RoleGuard>
  );
}
