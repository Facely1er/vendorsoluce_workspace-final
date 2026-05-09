type ProxyEvent = {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
};

type ProxyResult = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const ALLOWED_PATHS = new Set([
  "risk-session",
  "risk-session-update",
  "sector-risk",
  // ERMITS API Core (served under /functions/v1/ermits-api)
  "ermits-api/v1/vendors/risk-score",
  "ermits-api/v1/sbom/analyze",
]);

function json(statusCode: number, body: unknown, extraHeaders?: Record<string, string>): ProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: ProxyEvent): Promise<ProxyResult> => {
  if ((event.httpMethod || "GET").toUpperCase() === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Cache-Control": "no-store",
      },
      body: "ok",
    };
  }

  const path = (event.queryStringParameters?.path || "").trim().replace(/^\/+/, "");
  if (!ALLOWED_PATHS.has(path)) {
    return json(400, { error: "Invalid path" });
  }

  const apiBase = (process.env.ERMITS_API_URL || "").trim().replace(/\/$/, "");
  const apiKey = (process.env.ERMITS_API_KEY || "").trim();
  if (!apiBase || !apiKey) {
    return json(500, { error: "Server missing ERMITS_API_URL or ERMITS_API_KEY" });
  }

  const u = new URL(`${apiBase}/${path}`);
  for (const [k, v] of Object.entries(event.queryStringParameters || {})) {
    if (k === "path") continue;
    if (typeof v === "string") u.searchParams.set(k, v);
  }

  const method = (event.httpMethod || "GET").toUpperCase();
  const incomingType = (event.headers?.["content-type"] || event.headers?.["Content-Type"] || "").toString();

  const upstream = await fetch(u.toString(), {
    method,
    headers: {
      ...(incomingType ? { "Content-Type": incomingType } : {}),
      "x-ermits-api-key": apiKey,
    },
    body: method === "GET" || method === "HEAD" ? undefined : event.body ?? "",
  });

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") || "application/json; charset=utf-8";

  return {
    statusCode: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
    body: text,
  };
};

