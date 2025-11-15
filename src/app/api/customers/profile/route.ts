import { NextResponse } from "next/server";

import { getSafeServerSession } from "../../../../lib/session";
import { getCustomerById, updateCustomerProfile } from "../../../../services/users";

export async function GET() {
  const session = await getSafeServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCustomerById(session.user.id);
  return NextResponse.json({ profile }, { status: 200 });
}

export async function PUT(request: Request) {
  const session = await getSafeServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = body?.name?.toString().trim();
  const phone = body?.phone?.toString().trim() || null;
  const favoriteDish = body?.favoriteDish?.toString().trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  try {
    const profile = await updateCustomerProfile(session.user.id, {
      id: session.user.id,
      name,
      phone,
      favoriteDish,
    });
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Failed to update profile", error);
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}
