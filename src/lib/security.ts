export function requireSameOrigin(
  request: Request,
): { ok: true } | { ok: false; message: string } {
  const targetOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    if (origin !== targetOrigin) {
      return { ok: false, message: "Cross-origin requests are not allowed." };
    }
    return { ok: true };
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (refererOrigin !== targetOrigin) {
        return { ok: false, message: "Cross-site requests are not allowed." };
      }
      return { ok: true };
    } catch {
      return { ok: false, message: "Invalid referrer." };
    }
  }

  return { ok: false, message: "Missing origin." };
}
