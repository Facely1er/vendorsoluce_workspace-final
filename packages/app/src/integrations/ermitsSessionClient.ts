export type ErmitsSessionSource =
  | "cyberbrief"
  | "cybercorrect"
  | "vendorsoluce"
  | "cybercaution"
  | "assessmenthub"
  | "sectorintel"
  | "cybersoluce";

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

export function getSessionIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("session");
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

export async function createErmitsRiskSession(input: {
  source: ErmitsSessionSource;
  industry?: string;
  companySize?: string;
  region?: string;
  dataSensitivity?: string;
  dependencyLevel?: string;
}) {
  const apiUrl = import.meta.env.VITE_ERMIT_API_URL;
  const apiKey = import.meta.env.VITE_ERMIT_API_KEY;

  if (!apiUrl) throw new Error("Missing VITE_ERMIT_API_URL");
  if (!apiKey) throw new Error("Missing VITE_ERMIT_API_KEY");

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/risk-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ermits-api-key": apiKey,
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
  const apiUrl = import.meta.env.VITE_ERMIT_API_URL;
  const apiKey = import.meta.env.VITE_ERMIT_API_KEY;

  if (!apiUrl) throw new Error("Missing VITE_ERMIT_API_URL");
  if (!apiKey) throw new Error("Missing VITE_ERMIT_API_KEY");

  const res = await fetch(
    `${apiUrl.replace(/\/$/, "")}/risk-session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      headers: {
        "x-ermits-api-key": apiKey,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`ERMITS session fetch failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<ErmitsRiskSession>;
}

export async function updateErmitsRiskSession(input: {
  sessionId: string;
  source: ErmitsSessionSource;
  updates: Record<string, unknown>;
}) {
  const apiUrl = import.meta.env.VITE_ERMIT_API_URL;
  const apiKey = import.meta.env.VITE_ERMIT_API_KEY;

  if (!apiUrl) throw new Error("Missing VITE_ERMIT_API_URL");
  if (!apiKey) throw new Error("Missing VITE_ERMIT_API_KEY");

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/risk-session-update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ermits-api-key": apiKey,
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
  const apiUrl = import.meta.env.VITE_ERMIT_API_URL;
  const apiKey = import.meta.env.VITE_ERMIT_API_KEY;
  if (!apiUrl) throw new Error("Missing VITE_ERMIT_API_URL");
  if (!apiKey) throw new Error("Missing VITE_ERMIT_API_KEY");
  const u = new URL(`${apiUrl.replace(/\/$/, "")}/sector-risk`);
  u.searchParams.set("industry", industry || "other");
  const res = await fetch(u.toString(), {
    headers: { "x-ermits-api-key": apiKey },
  });
  if (!res.ok) {
    throw new Error(`Sector risk fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<SectorRiskProfile>;
}
