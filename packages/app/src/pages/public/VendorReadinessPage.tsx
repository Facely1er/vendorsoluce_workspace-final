import React, { useEffect, useMemo, useState } from "react";
import {
  fetchErmitsRiskSession,
  getSessionIdFromUrl,
  isErmitsSessionApiConfigured,
  persistSessionId,
  updateErmitsRiskSession,
  type ErmitsRiskSession,
} from "../../integrations/ermitsSessionClient";

function workspaceBase(): string {
  const raw = (import.meta as ImportMeta & { env: { VITE_CYBERCAUTION_WORKSPACE_URL?: string } }).env
    .VITE_CYBERCAUTION_WORKSPACE_URL;
  const s = (raw || "/workspace").trim();
  return s.replace(/\/$/, "") || "/workspace";
}

function hasVendorContext(s: ErmitsRiskSession | null) {
  if (!s) return false;
  return Object.keys(s.contexts?.vendors ?? {}).length > 0;
}

const VendorReadinessPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(() => getSessionIdFromUrl());
  const [session, setSession] = useState<ErmitsRiskSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [criticalVendors, setCriticalVendors] = useState("");

  useEffect(() => {
    const id = getSessionIdFromUrl();
    setSessionId(id);
    if (id) persistSessionId(id);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    if (!isErmitsSessionApiConfigured()) {
      setError("ERMITS session proxy is not available.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await fetchErmitsRiskSession(sessionId);
        if (!cancelled) setSession(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const skipIntake = useMemo(() => hasVendorContext(session), [session]);

  function goWorkspace() {
    if (!sessionId) return;
    const base = workspaceBase();
    const q = "session=" + encodeURIComponent(sessionId);
    if (base.startsWith("http://") || base.startsWith("https://")) {
      window.location.href = base.includes("?") ? `${base}&${q}` : `${base}?${q}`;
    } else {
      const path = base.startsWith("/") ? base : `/${base}`;
      window.location.href = `${path}?${q}`;
    }
  }

  async function complete() {
    if (!sessionId) return;
    await updateErmitsRiskSession({
      sessionId,
      source: "vendorsoluce",
      updates: {
        vendors: {
          readinessNotes: notes,
          criticalVendorsSummary: criticalVendors,
          completedAt: new Date().toISOString(),
        },
      },
    });
    goWorkspace();
  }

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold mb-2">Vendor readiness</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add a <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">session</code> query parameter to load an
          ERMITS risk session.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading session…</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Vendor readiness</h1>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <h2 className="font-medium mb-2 text-gray-900 dark:text-white">Session context</h2>
        <pre className="text-xs overflow-auto max-h-64 text-gray-700 dark:text-gray-300">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      {skipIntake ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Vendor context is already captured for this session. Continuing skips duplicate intake.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded bg-vendorsoluce-green text-white hover:opacity-90"
            onClick={goWorkspace}
          >
            Continue to CyberCaution workspace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Critical vendors summary</span>
            <textarea
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              rows={4}
              value={criticalVendors}
              onChange={(e) => setCriticalVendors(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Readiness notes</span>
            <textarea
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="px-4 py-2 rounded bg-vendorsoluce-green text-white hover:opacity-90"
            onClick={() => void complete()}
          >
            Save and continue to CyberCaution workspace
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorReadinessPage;
