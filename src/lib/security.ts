function getBaseDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return hostname;
  }
  if (parts.length <= 2) {
    return hostname;
  }
  return parts.slice(-2).join(".");
}

export function requireSameOrigin(
  request: Request,
): { ok: true } | { ok: false; message: string } {
  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const target = new URL(request.url);
  const targetHost = forwardedHost || target.hostname;
  const targetOrigin = `${forwardedProto}://${targetHost}`;
  const targetBase = getBaseDomain(targetHost);
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  const validate = (raw: string) => {
    const candidate = new URL(raw);
    if (candidate.origin === targetOrigin) return true;
    return (
      candidate.hostname === target.hostname ||
      candidate.hostname === targetHost ||
      candidate.hostname.endsWith(`.${targetBase}`) ||
      getBaseDomain(candidate.hostname) === targetBase
    );
  };

  if (originHeader) {
    if (!validate(originHeader)) {
      return { ok: false, message: "Cross-origin requests are not allowed." };
    }
    return { ok: true };
  }

  if (refererHeader) {
    try {
      if (!validate(refererHeader)) {
        return { ok: false, message: "Cross-site requests are not allowed." };
      }
      return { ok: true };
    } catch {
      return { ok: false, message: "Invalid referrer." };
    }
  }

  // If no origin or referer is provided, treat as same-site to avoid blocking valid requests
  return { ok: true };
}
