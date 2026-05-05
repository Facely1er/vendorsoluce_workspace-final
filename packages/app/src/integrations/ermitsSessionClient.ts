export type ErmitsSessionSource =
  | "cyberbrief"
  | "cybercorrect"
  | "vendorsoluce"
  | "cybercaution"
  | "assessmenthub"
  | "sectorintel"
  | "cybersoluce";

/** Browser clients must not send `cybersoluce` on create/update (internal / server use only). */
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
  updates?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export function getSessionIdFromUrl(search?: string): string | null {
  const q = search !== undefined ? search : typeof window !== "undefined" ? window.location.search : "";
  if (!q) return null;
  const id = new URLSearchParams(q).get("session");
  return id && id.trim() ? id.trim() : null;
}

export function persistSessionId(sessionId: string) {
  localStorage.setItem("ermitsRiskSessionId", sessionId);
}

export function getPersistedSessionId(): string | null {
  try {
    return (
      localStorage.getItem("ermitsRiskSessionId") ?? localStorage.getItem("ermits:sessionId")
    );
  } catch {
    return null;
  }
}

export function isErmitsSessionApiConfigured(): boolean {
  // Configuration is server-side (Netlify function env). The browser cannot validate it safely.
  return true;
}

export async function createErmitsRiskSession(input: {
  source: ErmitsClientSessionSource;
  industry?: string;
  companySize?: string;
  region?: string;
  dataSensitivity?: string;
  dependencyLevel?: string;
}) {
  const u = new URL("/.netlify/functions/ermits-proxy", window.location.origin);
  u.searchParams.set("path", "risk-session");
  const res = await fetch(u.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`ERMITS session creation failed: ${res.status} ${await res.text()}`);
  }

  const session = (await res.json()) as ErmitsRiskSession;
  persistSessionId(session.sessionId);
  return session;
}

export async function fetchErmitsRiskSession(sessionId: string) {
  const u = new URL("/.netlify/functions/ermits-proxy", window.location.origin);
  u.searchParams.set("path", "risk-session");
  u.searchParams.set("sessionId", sessionId);
  const res = await fetch(u.toString(), { headers: { "Content-Type": "application/json" } });

  if (!res.ok) {
    throw new Error(`ERMITS session fetch failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<ErmitsRiskSession>;
}

export async function updateErmitsRiskSession(input: {
  sessionId: string;
  source: ErmitsClientSessionSource;
  updates: Record<string, unknown>;
}) {
  const u = new URL("/.netlify/functions/ermits-proxy", window.location.origin);
  u.searchParams.set("path", "risk-session-update");
  const res = await fetch(u.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`ERMITS session update failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<ErmitsRiskSession>;
}

export type SectorRiskProfile = Record<string, unknown>;

export async function fetchSectorRisk(industry: string): Promise<SectorRiskProfile> {
  const u = new URL("/.netlify/functions/ermits-proxy", window.location.origin);
  u.searchParams.set("path", "sector-risk");
  u.searchParams.set("industry", industry || "other");
  const res = await fetch(u.toString(), { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    throw new Error(`Sector risk fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<SectorRiskProfile>;
}
