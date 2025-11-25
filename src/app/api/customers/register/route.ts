import { NextResponse } from "next/server";

import { createCustomer } from "../../../../services/users";
import { requireSameOrigin } from "../../../../lib/security";

export async function POST(request: Request) {
  const originCheck = requireSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.message }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = body?.name?.toString().trim();
    const email = body?.email?.toString().toLowerCase().trim();
    const password = body?.password?.toString();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const profile = await createCustomer({ name, email, password });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Customer registration failed", error);
    const message =
      error instanceof Error && error.message.includes("already registered")
        ? error.message
        : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
