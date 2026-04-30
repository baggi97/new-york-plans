import { getStore } from "https://esm.sh/@netlify/blobs@8.1.0";
import type { Context, Config } from "https://edge.netlify.com";

const COOKIE_NAME = "travel_access";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

const EXEMPT_PATHS = [
  "/favicon.ico",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/sw.js",
];

const EXEMPT_PREFIXES = [
  "/icons/",
  "/.netlify/functions/invites",
];

function isExempt(pathname: string): boolean {
  if (EXEMPT_PATHS.includes(pathname)) return true;
  return EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  return expected === signature;
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const [k, ...v] = pair.trim().split("=");
    if (k) cookies[k.trim()] = v.join("=").trim();
  }
  return cookies;
}

function gatedPage(): Response {
  const html = `<!doctype html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <title>Rejseguide</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #faf8f5; --card: #fff; --text: #2c2825;
      --muted: #7a7068; --border: #e8e2da; --navy: #3d4f6f;
      --gold: #c9a96e; --radius: 12px;
      --sans: 'Inter', -apple-system, sans-serif;
      --serif: 'Playfair Display', Georgia, serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--sans); background: var(--bg); color: var(--text);
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; padding: 1.5rem;
    }
    .card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 2.5rem 2rem;
      width: 100%; max-width: 380px; text-align: center;
      box-shadow: 0 4px 24px rgba(44,40,37,0.08);
    }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 {
      font-family: var(--serif); font-size: 1.5rem;
      font-weight: 500; margin-bottom: 0.5rem;
    }
    p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✈️</div>
    <h1>Rejseguide</h1>
    <p>Denne app kræver en invitation.<br>Bed om et invitationslink for at få adgang.</p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 403,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const secret = Netlify.env.get("ACCESS_SECRET") || "";

  if (!secret) {
    return context.next();
  }

  if (isExempt(url.pathname)) {
    return context.next();
  }

  if (url.pathname === "/invite") {
    const token = url.searchParams.get("token");
    if (!token) return gatedPage();

    try {
      const store = getStore("invitations");
      const raw = await store.get(token);
      if (!raw) return gatedPage();

      const invite = JSON.parse(raw);
      if (!invite.token) return gatedPage();

      invite.usedAt = invite.usedAt || new Date().toISOString();
      await store.set(token, JSON.stringify(invite));

      const tripIds: string[] = invite.tripIds || ["*"];
      const payload = `${token}:${tripIds.join(",")}`;
      const sig = await hmacSign(payload, secret);
      const cookieValue = `${payload}.${sig}`;

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": `${COOKIE_NAME}=${cookieValue}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`,
        },
      });
    } catch {
      return gatedPage();
    }
  }

  const cookies = parseCookies(req.headers.get("cookie"));
  const cookieValue = cookies[COOKIE_NAME];

  if (!cookieValue) return gatedPage();

  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex < 0) return gatedPage();

  const payload = cookieValue.substring(0, dotIndex);
  const sig = cookieValue.substring(dotIndex + 1);

  const valid = await hmacVerify(payload, sig, secret);
  if (!valid) return gatedPage();

  // Extract trip scope from payload (format: "token:trip1,trip2" or legacy "token")
  const colonIndex = payload.indexOf(":");
  const trips = colonIndex >= 0 ? payload.substring(colonIndex + 1) : "*";

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-travel-trips", trips);
  const newReq = new Request(req.url, {
    method: req.method,
    headers: reqHeaders,
    body: req.body,
    redirect: "manual",
  });

  return context.next(newReq);
};

export const config: Config = {
  path: "/*",
  excludedPath: ["/icons/*"],
};
