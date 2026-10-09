import { auth, isAuthDisabled } from "./firebase";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isAuthDisabled && auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // ignore
    }
  }

  return headers;
}

async function req<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(path, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) {
    return null as T;
  }

  let body: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      // ignore JSON parse error
    }
  }

  if (!res.ok) {
    const detail = body?.detail || body?.error || res.statusText || `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, body);
  }

  return body as T;
}

export interface InvestigationSummary {
  id: string;
  company: string;
  question: string;
  focus: string;
  status: "created" | "queued" | "running" | "completed" | "failed";
  stage: string | null;
  error: string | null;
  retries: number;
  created: number;
  updated: number;
  data?: any;
}

export const api = {
  getHealth: () => req<{ ok: boolean }>("/api/v1/health"),
  getReady: () => req<{ database: boolean; auth: boolean; missing_provider_config: string[] }>("/api/v1/ready"),
  getMe: () => req<{ uid: string; email_verified: boolean; phone_verified: boolean }>("/api/v1/me"),
  deleteMe: () => req<void>("/api/v1/me", { method: "DELETE" }),

  createInvestigation: (body: { company: string; question: string; focus?: string }) =>
    req<InvestigationSummary>("/api/v1/investigations", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listInvestigations: (skip = 0, limit = 50) =>
    req<InvestigationSummary[]>(`/api/v1/investigations?skip=${skip}&limit=${limit}`),

  getInvestigation: (id: string) => req<InvestigationSummary>(`/api/v1/investigations/${id}`),

  deleteInvestigation: (id: string) =>
    req<void>(`/api/v1/investigations/${id}`, { method: "DELETE" }),

  runInvestigation: (id: string) =>
    req<InvestigationSummary>(`/api/v1/investigations/${id}/run`, { method: "POST" }),

  retryInvestigation: (id: string) =>
    req<InvestigationSummary>(`/api/v1/investigations/${id}/retry`, { method: "POST" }),
};
