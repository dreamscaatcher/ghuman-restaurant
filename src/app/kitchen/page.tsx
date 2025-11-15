import { Stack, Typography } from "@mui/material";

import { RoleGuard } from "../../components/security/RoleGuard";
import { listKitchenTickets } from "../../services/menu";
import { KitchenTicketCard } from "../../components/tickets/KitchenTicketCard";
import { updateTicketStatusAction } from "../_actions/tickets";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const tickets = await listKitchenTickets();

  return (
    <RoleGuard allowedRoles={["kitchen", "manager"]}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography component="h1" variant="h4" fontWeight={700}>
            Kitchen Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tickets are listed in the order they were placed. Mark them complete in your production
            workflow once plated.
          </Typography>
        </Stack>

        {tickets.length === 0 ? (
          <Stack spacing={2}>
            <Typography variant="body1" fontWeight={600}>
              No active tickets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New orders will appear here automatically once guests place them.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {tickets.map((ticket) => (
              <KitchenTicketCard
                key={ticket.id}
                ticket={ticket}
                action={updateTicketStatusAction}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </RoleGuard>
  );
}
