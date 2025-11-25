import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createOrderTickets } from "../../../services/menu";
import { getAllowedRolesForSession, getSessionRole } from "../../../lib/auth";
import { requireSameOrigin } from "../../../lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originCheck = requireSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.message }, { status: 403 });
  }

  const role = await getSessionRole();
  const allowed = getAllowedRolesForSession(role);
  if (!allowed.includes("customer")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body?.items)
      ? (body.items as Array<{ id?: unknown; quantity?: unknown }>)
      : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const sanitized = items
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : "",
        quantity: Number(item.quantity) || 0,
      }))
      .filter((item) => item.id && item.quantity > 0);

    if (sanitized.length === 0) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    const { orderId, tickets } = await createOrderTickets(sanitized);

    revalidatePath("/dashboard");
    revalidatePath("/kitchen");

    return NextResponse.json({ orderId, tickets }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
