import type { IceServer } from "@withu/shared-types";
import { env } from "../../config/env";

const GOOGLE_STUN: IceServer = { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] };

// Twilio issues short-lived TURN credentials (default ttl 86400s) - caching them
// avoids hitting the Tokens API on every single call start, while still rotating
// well before expiry.
const CACHE_TTL_MS = 60 * 60 * 1000;
let cached: { expiresAt: number; servers: IceServer[] } | null = null;

async function fetchTwilioIceServers(): Promise<IceServer[] | null> {
  if (!env.twilioAccountSid || !env.twilioAuthToken) return null;

  const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Tokens.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { ice_servers?: Array<{ url?: string; urls?: string; username?: string; credential?: string }> };
  const servers: IceServer[] = [];
  for (const s of json.ice_servers ?? []) {
    const urls = s.urls ?? s.url;
    if (!urls) continue;
    servers.push({ urls, username: s.username, credential: s.credential });
  }

  return servers.length > 0 ? servers : null;
}

/** Returns a fresh-ish set of ICE servers for a client to start a call with. Always
 * includes Google's public STUN; adds Twilio's TURN relay on top when configured,
 * since STUN alone can't traverse the NAT most real-world calls run into. Never
 * throws - a Twilio outage should degrade to STUN-only, not break call setup. */
export async function getIceServers(): Promise<IceServer[]> {
  if (cached && cached.expiresAt > Date.now()) return cached.servers;

  try {
    const twilioServers = await fetchTwilioIceServers();
    const servers = twilioServers ? [GOOGLE_STUN, ...twilioServers] : [GOOGLE_STUN];
    cached = { expiresAt: Date.now() + CACHE_TTL_MS, servers };
    return servers;
  } catch {
    return cached?.servers ?? [GOOGLE_STUN];
  }
}
