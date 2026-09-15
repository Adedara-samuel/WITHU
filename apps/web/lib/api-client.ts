import type { ApiResponse } from "@withu/shared-types";
import { useAuthStore } from "@/stores/auth-store";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const json = (await res.json()) as ApiResponse<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>;

  if (!res.ok || !json.success) {
    useAuthStore.getState().clear();
    return null;
  }

  useAuthStore.getState().setTokens(json.data.tokens);
  useAuthStore.getState().setUser(json.data.user as never);
  return json.data.tokens.accessToken;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, skipAuth } = options;

  const doFetch = async (): Promise<Response> => {
    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token && !skipAuth) headers.Authorization = `Bearer ${token}`;

    return fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    if (!refreshPromise) refreshPromise = performRefresh().finally(() => (refreshPromise = null));
    const newToken = await refreshPromise;
    if (newToken) res = await doFetch();
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json || !json.success) {
    const message = json && !json.success ? json.error.message : `Request failed (${res.status})`;
    const code = json && !json.success ? json.error.code : "UNKNOWN_ERROR";
    const details = json && !json.success ? json.error.details : undefined;
    throw new ApiError(res.status, code, message, details);
  }

  return json.data;
}
