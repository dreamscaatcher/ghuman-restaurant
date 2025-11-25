import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { RoleGuard } from "../../components/security/RoleGuard";
import { MenuItemForm } from "./_components/MenuItemForm";
import { MenuItemCard } from "./_components/MenuItemCard";
import { createMenuItem, listKitchenTickets, listMenuItems, updateMenuItem } from "../../services/menu";
import { KitchenTicketCard } from "../../components/tickets/KitchenTicketCard";
import { updateTicketStatusAction } from "../_actions/tickets";
import { getAllowedRolesForSession, getSessionRole } from "../../lib/auth";

type ActionState = {
  error: string | null;
  success: boolean;
};

export const dynamic = "force-dynamic";

async function addMenuItem(_: ActionState, formData: FormData): Promise<ActionState> {
  "use server";

  const role = await getSessionRole();
  const allowed = getAllowedRolesForSession(role);
  if (!allowed.includes("manager")) {
    return { error: "Unauthorized.", success: false };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const photoUrl = formData.get("photoUrl")?.toString().trim();
  const priceRaw = formData.get("price")?.toString().trim();

  if (!name || !description || !photoUrl || !priceRaw) {
    return { error: "All fields are required.", success: false };
  }

  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be a positive number.", success: false };
  }

  try {
    await createMenuItem({ name, description, photoUrl, price });
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/kitchen");
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to create menu item", error);
    return { error: "Could not save the menu item. Please try again.", success: false };
  }
}

async function editMenuItem(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  "use server";

  const role = await getSessionRole();
  const allowed = getAllowedRolesForSession(role);
  if (!allowed.includes("manager")) {
    return { error: "Unauthorized.", success: false };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const photoUrl = formData.get("photoUrl")?.toString().trim();
  const priceRaw = formData.get("price")?.toString().trim();

  if (!name || !description || !photoUrl || !priceRaw) {
    return { error: "All fields are required.", success: false };
  }

  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be a positive number.", success: false };
  }

  try {
    await updateMenuItem({ id, name, description, photoUrl, price });
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/kitchen");
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to update menu item", error);
    return { error: "Could not update the menu item.", success: false };
  }
}

export default async function DashboardPage() {
  const [menuItems, kitchenTickets] = await Promise.all([
    listMenuItems(),
    listKitchenTickets(),
  ]);

  return (
    <RoleGuard allowedRoles={["manager"]}>
      <Stack spacing={4}>
        <Stack
          spacing={1}
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography component="h1" variant="h4" fontWeight={700}>
              Manager Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Publish dishes to the guest menu and send them to the kitchen queue.
            </Typography>
          </Stack>
          <Button component={Link} href="/manager" variant="outlined" size="small">
            Back to manager home
          </Button>
        </Stack>

        <MenuItemForm action={addMenuItem} />

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Current Menu
          </Typography>
          {menuItems.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No dishes have been published yet.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                action={editMenuItem.bind(null, item.id)}
              />
            ))
          )}
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Kitchen Tickets
          </Typography>
          {kitchenTickets.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No active tickets at the moment.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            kitchenTickets.map((ticket) => (
              <KitchenTicketCard
                key={ticket.id}
                ticket={ticket}
                action={updateTicketStatusAction}
              />
            ))
          )}
        </Stack>
      </Stack>
    </RoleGuard>
  );
}
