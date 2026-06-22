// Thin fetch wrapper around the Jari backend (jari-back, Hono on :4000).
// Base URL is configurable so the same build works in any environment.

const BASE_URL =
  process.env.NEXT_PUBLIC_JARI_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export const TOKEN_STORAGE_KEY = "jari-token";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* ignore */
    }
    throw new Error(`API ${res.status} ${path} ${detail}`.trim());
  }

  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string) => api<T>(path);

export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });

/** Pull the backend's `{ error }` message out of a thrown api() Error (which
 *  embeds the response JSON), falling back to a generic message. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    const match = err.message.match(/\{.*\}$/);
    if (match) {
      try {
        const body = JSON.parse(match[0]) as { error?: string };
        if (body.error) return body.error;
      } catch {
        /* ignore */
      }
    }
  }
  return fallback;
}
