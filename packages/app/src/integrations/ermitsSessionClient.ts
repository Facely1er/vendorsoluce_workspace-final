export type ErmitsSessionSource =
  | "cyberbrief"
  | "cybercorrect"
  | "vendorsoluce"
  | "cybersoluce"
  | "cybercaution"
  | "assessmenthub"
  | "sectorintel";

/** Session origins the browser may send on create/update; `cybersoluce` is reserved for server-side use. */
export type ErmitsClientSessionSource = Exclude<ErmitsSessionSource, "cybersoluce">;

export type ErmitsRiskSessionContexts = {
  brief: Record<string, unknown>;
  privacy: Record<string, unknown>;
  vendors: Record<string, unknown>;
  assets: Record<string, unknown>;
  cyber: Record<string, unknown>;
  assessment: Record<string, unknown>;
  sector: Record<string, unknown>;
};

export type ErmitsRiskSession = {
  sessionId: string;
  input: Record<string, unknown>;
  payload: Record<string, unknown>;
  source: ErmitsSessionSource | string;
  contexts: ErmitsRiskSessionContexts;
  createdAt: string;
  updatedAt: string;
};

const SESSION_STORAGE_KEY = "ermits:sessionId";

function apiBase(): string {
  const base =
    (import.meta as { env?: { VITE_ERMIT_API_URL?: string } }).env?.VITE_ERMIT_API_URL?.replace(/\/$/, "") ?? "";
  return base;
}

function apiKey(): string {
  return (import.meta as { env?: { VITE_ERMIT_API_KEY?: string } }).env?.VITE_ERMIT_API_KEY ?? "";
}

function headersInit(): HeadersInit {
  const key = apiKey();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h["x-ermits-api-key"] = key;
  return h;
}

export function getSessionIdFromUrl(search: string = typeof window !== "undefined" ? window.location.search : ""): string | null {
  const p = new URLSearchParams(search);
  const id = p.get("session");
  return id && id.trim() ? id.trim() : null;
}

export function persistSessionId(sessionId: string) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    /* ignore */
  }
}

export async function createErmitsRiskSession(body: {
  source: ErmitsClientSessionSource;
  industry?: string;
  companySize?: string;
  region?: string;
  dataSensitivity?: string;
  dependencyLevel?: string;
}): Promise<ErmitsRiskSession> {
  const res = await fetch(apiBase() + "/risk-session", {
    method: "POST",
    headers: headersInit(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "createErmitsRiskSession failed");
  }
  return (await res.json()) as ErmitsRiskSession;
}

export async function fetchErmitsRiskSession(sessionId: string): Promise<ErmitsRiskSession> {
  const u = new URL(apiBase() + "/risk-session");
  u.searchParams.set("sessionId", sessionId);
  const res = await fetch(u.toString(), { headers: headersInit() });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "fetchErmitsRiskSession failed");
  }
  return (await res.json()) as ErmitsRiskSession;
}

export async function updateErmitsRiskSession(body: {
  sessionId: string;
  source: ErmitsClientSessionSource;
  updates: Record<string, unknown>;
}): Promise<ErmitsRiskSession> {
  const res = await fetch(apiBase() + "/risk-session-update", {
    method: "POST",
    headers: headersInit(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "updateErmitsRiskSession failed");
  }
  return (await res.json()) as ErmitsRiskSession;
}

export type SectorRiskProfile = Record<string, unknown>;

export async function fetchSectorRisk(industry: string): Promise<SectorRiskProfile> {
  const u = new URL(apiBase() + "/sector-risk");
  u.searchParams.set("industry", industry || "other");
  const res = await fetch(u.toString(), { headers: headersInit() });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "fetchSectorRisk failed");
  }
  return (await res.json()) as SectorRiskProfile;
}
