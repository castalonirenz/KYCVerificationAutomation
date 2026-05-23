import apiClient, { apiGet, apiPost, apiPut, apiDelete, apiPatch, setAuthTokens, clearAuthTokens } from "../lib/apiClient";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
  return apiGet<T>(endpoint, undefined, signal);
}

export async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  return apiPost<T>(endpoint, body as any);
}

export async function putJson<T>(endpoint: string, body: unknown): Promise<T> {
  return apiPut<T>(endpoint, body as any);
}

export async function patchJson<T>(endpoint: string, body: unknown): Promise<T> {
  return apiPatch<T>(endpoint, body as any);
}

export async function deleteJson<T>(endpoint: string): Promise<T> {
  return apiDelete<T>(endpoint);
}

export function formatValue(value: ModuleItem[string]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null) return "None";
  return String(value);
}

export function setToken(token: string | null, refreshToken?: string | null) {
  setAuthTokens(token, refreshToken ?? null);
}

export function clearToken() {
  clearAuthTokens();
}

export default apiClient;
