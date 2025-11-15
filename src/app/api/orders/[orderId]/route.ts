import { NextResponse } from "next/server";

import { listOrderTickets } from "../../../../services/menu";

type RouteParams = Promise<{
  orderId: string;
}>;

export async function GET(_: Request, { params }: { params: RouteParams }) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  try {
    const tickets = await listOrderTickets(orderId);
    return NextResponse.json({ orderId, tickets });
  } catch (error) {
    console.error("Failed to load order status", error);
    return NextResponse.json({ error: "Unable to load order status" }, { status: 500 });
  }
}
