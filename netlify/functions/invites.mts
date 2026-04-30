import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'invitations';
const INDEX_KEY = '__invite-index';

interface Invite {
  token: string;
  name: string;
  tripIds: string[];
  createdAt: string;
  usedAt: string | null;
}

function unauthorized(msg = 'Unauthorized') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function checkSecret(req: Request): boolean {
  const secret = Netlify.env.get('INVITE_SECRET') || Netlify.env.get('PUSH_SECRET');
  if (!secret) return false;
  const provided =
    req.headers.get('x-admin-secret') ||
    new URL(req.url).searchParams.get('secret');
  return provided === secret;
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (!checkSecret(req)) {
    return unauthorized();
  }

  const store = getStore(STORE_NAME);
  const headers = { 'Content-Type': 'application/json' };

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const name = body.name || 'Unnamed';
    const tripIds: string[] = Array.isArray(body.tripIds) && body.tripIds.length > 0
      ? body.tripIds
      : ['*'];
    const token = crypto.randomUUID();

    const invite: Invite = {
      token,
      name,
      tripIds,
      createdAt: new Date().toISOString(),
      usedAt: null,
    };

    await store.set(token, JSON.stringify(invite));

    const index: string[] = JSON.parse((await store.get(INDEX_KEY)) || '[]');
    index.push(token);
    await store.set(INDEX_KEY, JSON.stringify(index));

    const origin = new URL(req.url).origin;
    const inviteUrl = `${origin}/invite?token=${token}`;

    return new Response(JSON.stringify({ ...invite, url: inviteUrl }), {
      status: 201,
      headers,
    });
  }

  if (req.method === 'GET') {
    const index: string[] = JSON.parse((await store.get(INDEX_KEY)) || '[]');
    const invites: Invite[] = [];

    for (const token of index) {
      const raw = await store.get(token);
      if (raw) {
        const inv = JSON.parse(raw);
        if (!inv.tripIds) inv.tripIds = ['*'];
        invites.push(inv);
      }
    }

    return new Response(JSON.stringify(invites), { headers });
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token param' }), {
        status: 400,
        headers,
      });
    }

    await store.delete(token);

    const index: string[] = JSON.parse((await store.get(INDEX_KEY)) || '[]');
    const updated = index.filter((t) => t !== token);
    await store.set(INDEX_KEY, JSON.stringify(updated));

    return new Response(JSON.stringify({ deleted: true }), { headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers,
  });
};
