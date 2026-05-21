export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export type ApiStatus = "connecting" | "connected" | "fallback";

export type ModuleItem = Record<string, string | number | boolean | string[] | null>;

export type ModulePayload = {
  data: ModuleItem[];
  rules?: ModuleItem[];
  stages?: string[];
  events?: string[];
  export_formats?: string[];
  meta?: Record<string, string | number | boolean | null>;
};

export async function getJson<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("passport_token") : null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${endpoint}`);
  }

  return response.json();
}

export async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  return sendJson<T>("POST", endpoint, body);
}

export async function putJson<T>(endpoint: string, body: unknown): Promise<T> {
  return sendJson<T>("PUT", endpoint, body);
}

export async function deleteJson<T>(endpoint: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("passport_token") : null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${endpoint}`);
  }

  return response.json();
}

async function sendJson<T>(method: "POST" | "PUT", endpoint: string, body: unknown): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("passport_token") : null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${endpoint}`);
  }

  return response.json();
}

export function formatValue(value: ModuleItem[string]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null) return "None";
  return String(value);
}
