import { revalidatePath } from "next/cache";

import {
  KITCHEN_TICKET_STATUSES,
  KitchenTicketStatus,
  updateKitchenTicketStatus,
} from "../../services/menu";
import { getAllowedRolesForSession, getSessionRole } from "../../lib/auth";

const VALID_STATUS_SET = new Set<KitchenTicketStatus>(KITCHEN_TICKET_STATUSES);

export type TicketActionState = {
  error: string | null;
  success: boolean;
};

const initialState: TicketActionState = { error: null, success: false };

function isValidStatus(status: unknown): status is KitchenTicketStatus {
  return typeof status === "string" && VALID_STATUS_SET.has(status as KitchenTicketStatus);
}

export const emptyTicketActionState = initialState;

export async function updateTicketStatusAction(
  _: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  "use server";

  const role = await getSessionRole();
  const allowed = getAllowedRolesForSession(role);
  if (!allowed.includes("kitchen") && !allowed.includes("manager")) {
    return { error: "Unauthorized.", success: false };
  }

  const ticketId = formData.get("ticketId")?.toString().trim();
  const nextStatusRaw = formData.get("nextStatus");
  const nextStatus = nextStatusRaw?.toString().trim();

  if (!ticketId || !isValidStatus(nextStatus)) {
    return { error: "Invalid ticket information.", success: false };
  }

  try {
    await updateKitchenTicketStatus(ticketId, nextStatus);
    revalidatePath("/kitchen");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to update kitchen ticket", error);
    return { error: "Could not update the ticket.", success: false };
  }
}
