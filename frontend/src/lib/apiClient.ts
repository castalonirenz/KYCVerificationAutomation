/* Typed API client with automatic refresh flow
 * - Uses Fetch API
 * - Reads/writes tokens to localStorage (keeps compatibility with existing `passport_token` key)
 * - On 401, attempts a single token refresh using `/auth/refresh`
 * - Unwraps the standard response envelope { success, data, error, meta }
 */

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL as string) ||
  (process.env.NEXT_PUBLIC_API_URL as string) ||
  "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEYS = ["passport_token", "access_token"];
const REFRESH_TOKEN_KEYS = ["refresh_token", "passport_refresh_token"];

type ResponseEnvelope<T> = {
  success: boolean;
  data: T | null;
  meta?: any;
  error?: { code: string; message: string; details?: any };
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readFromStorage(keys: string[]) {
  if (!isBrowser()) return null;
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function writeToStorage(kv: Record<string, string | null>) {
  if (!isBrowser()) return;
  Object.entries(kv).forEach(([k, v]) => {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  });
}

export function getAccessToken(): string | null {
  return readFromStorage(ACCESS_TOKEN_KEYS);
}

export function getRefreshToken(): string | null {
  return readFromStorage(REFRESH_TOKEN_KEYS);
}

export function setAuthTokens(accessToken: string | null, refreshToken?: string | null) {
  // Save under both common keys for compatibility
  writeToStorage({ passport_token: accessToken, access_token: accessToken });
  if (typeof refreshToken !== "undefined") {
    writeToStorage({ refresh_token: refreshToken, passport_refresh_token: refreshToken });
  }
}

export function clearAuthTokens() {
  writeToStorage({ passport_token: null, access_token: null, refresh_token: null, passport_refresh_token: null });
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const env = (await res.json()) as ResponseEnvelope<{ accessToken: string; refreshToken?: string }>;
    if (!env.success || !env.data || !env.data.accessToken) return false;

    setAuthTokens(env.data.accessToken, env.data.refreshToken ?? refreshToken);
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchWithAuth<T>(input: RequestInfo, init: RequestInit = {}, triedRefresh = false): Promise<T> {
  const url = typeof input === "string" && input.startsWith("/") ? `${API_BASE_URL}${input}` : String(input);

  const headers: Record<string, string> = { Accept: "application/json", ...(init.headers as Record<string, string> || {}) };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // If body is FormData, don't set Content-Type (browser will set it including boundary)
  if (init.body && !(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401 && !triedRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) return fetchWithAuth<T>(input, init, true);
    // refresh failed — clear tokens and redirect to login
    clearAuthTokens();
    if (isBrowser()) window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // try to parse JSON if present
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const env = (await response.json()) as ResponseEnvelope<T>;
    if (!response.ok) {
      const msg = env?.error?.message || `Request failed: ${response.status}`;
      const err = new Error(msg) as any;
      err.code = env?.error?.code;
      err.details = env?.error?.details;
      throw err;
    }
    if (!env.success) {
      const err = new Error(env.error?.message || "API returned an error") as any;
      err.code = env.error?.code;
      err.details = env.error?.details;
      throw err;
    }
    return env.data as T;
  }

  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  // fallback: return raw body (text)
  const text = await response.text();
  return (text as unknown) as T;
}

export async function apiGet<T = any>(path: string, params?: Record<string, string | number | boolean>, signal?: AbortSignal) {
  const qs = params
    ? "?" +
      Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  return fetchWithAuth<T>(`${path}${qs}`, { method: "GET", signal });
}

export async function apiPost<T = any>(path: string, body?: any, opts: { signal?: AbortSignal } = {}) {
  const init: RequestInit = { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), signal: opts.signal };
  return fetchWithAuth<T>(path, init);
}

export async function apiPut<T = any>(path: string, body?: any) {
  const init: RequestInit = { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) };
  return fetchWithAuth<T>(path, init);
}

export async function apiPatch<T = any>(path: string, body?: any) {
  const init: RequestInit = { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) };
  return fetchWithAuth<T>(path, init);
}

export async function apiDelete<T = any>(path: string) {
  return fetchWithAuth<T>(path, { method: "DELETE" });
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  setAuthTokens,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
};
