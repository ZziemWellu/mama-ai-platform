// Single source of truth for talking to the MAMA-AI backend. Before this file existed, each page
// hand-rolled its own fetch() call with the production URL hardcoded directly in the component —
// four different copies, one of which (waiting-home) pointed at a completely different, unrelated
// host (`mama-ai-access-risk.onrender.com`) that isn't even part of this deployment. That also meant
// there was no way to point the app at a local backend during development, and no shared place to
// attach the auth token once real login existed.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const TOKEN_KEY = "mama_ai_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Private browsing / storage blocked — the session just won't persist across reloads.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to do — see setToken.
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // The token is missing/expired/invalid — never useful to keep around once the server has said so.
    clearToken();
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // A non-JSON body (e.g. a plain-text 502 from an infra layer) - fall through with data = null.
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.detail || `Request failed (${res.status})`);
  }
  return data as T;
}

// ---- Auth ----
export interface LoginResult {
  access_token: string;
  token_type: string;
}
export interface UserProfile {
  id: string;
  phone_number: string;
  email: string | null;
  full_name: string;
  role: string;
  is_active: boolean;
}
export const ROLES = ["MIDWIFE", "COMMUNITY_HEALTH_WORKER", "DISTRICT_HEALTH_OFFICER", "ADMIN"] as const;

export async function login(phone_number: string, password: string): Promise<LoginResult> {
  const result = await request<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify({ phone_number, password }) });
  setToken(result.access_token);
  return result;
}

export function register(payload: { phone_number: string; full_name: string; password: string; role: string; facility_id?: string }) {
  return request<UserProfile>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function getMe() {
  return request<UserProfile>("/auth/me");
}

export function logout() {
  clearToken();
}

// ---- Assessments ----
export function assessRisk(payload: unknown) {
  return request<any>("/assessments/assess", { method: "POST", body: JSON.stringify(payload) });
}

// ---- Referrals ----
export function recommendReferral(payload: unknown) {
  return request<any>("/referrals/recommend", { method: "POST", body: JSON.stringify(payload) });
}

// ---- Waiting centers / access risk ----
// This used to call access-risk on a different host entirely; it's the same backend, same base URL,
// like every other route.
export function assessAccessRisk(payload: unknown) {
  return request<any>("/access-risk/assess", { method: "POST", body: JSON.stringify(payload) });
}

// ---- Economics dashboard ----
export function getEconomicsDashboard() {
  return request<any>("/economics/dashboard");
}
