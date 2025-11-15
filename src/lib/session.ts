import { getServerSession } from "next-auth";

import { authOptions } from "../auth";

export async function getSafeServerSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.warn("Failed to read session", error);
    return null;
  }
}
