import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STAFF_SUBDOMAINS = ["manager", "kitchen"];

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  const primaryHost = process.env.PRIMARY_HOST?.toLowerCase();

  if (!host || !primaryHost) {
    return NextResponse.next();
  }

  // Avoid loops if already on the primary host.
  if (host === primaryHost) {
    return NextResponse.next();
  }

  // Redirect staff subdomains back to the primary host to enforce single entry point.
  const shouldRedirect = STAFF_SUBDOMAINS.some((subdomain) =>
    host.startsWith(`${subdomain}.`),
  );

  if (!shouldRedirect) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.host = primaryHost;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
