const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 4173);

const SUPABASE_URL = process.env.SUPABASE_URL || "https://hbccslbwxxvkutzncakl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_KeeiTQo_zeqn1xb8RMZjhA_urAd_1Ck";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
const NVIDIA_API_BASE_URL = (process.env.NVIDIA_API_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, "");
const DEFAULT_NVIDIA_MODELS = [
  "nvidia/llama-3.1-nemotron-nano-8b-v1",
  "nvidia/llama-3.1-nemotron-ultra-253b-v1",
  "google/gemma-4-31b-it"
];
const NVIDIA_MODELS = parseList(process.env.NVIDIA_MODELS, DEFAULT_NVIDIA_MODELS);
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || NVIDIA_MODELS[0];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function parseList(value, fallback) {
  const parsed = String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  return parsed.length ? parsed : [...fallback];
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(message);
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error("Invalid JSON payload."));
      }
    });

    req.on("error", reject);
  });
}

function extractBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice("Bearer ".length).trim();
}

async function verifySupabaseUser(req) {
  const token = extractBearerToken(req);
  if (!token) {
    return {
      ok: false,
      reason: "missing_bearer_token",
      status: 401,
      user: null
    };
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const rawText = await response.text().catch(() => "");
    return {
      ok: false,
      reason: "supabase_user_lookup_failed",
      status: response.status,
      details: rawText || "Unable to verify Supabase user.",
      user: null
    };
  }

  return {
    ok: true,
    reason: "verified",
    status: 200,
    user: await response.json()
  };
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(item => item && typeof item === "object")
    .map(item => ({
      role: item.role === "assistant" ? "assistant" : item.role === "system" ? "system" : "user",
      content: String(item.content || "").trim()
    }))
    .filter(item => item.content);
}

async function handleAiConfig(res) {
  sendJson(res, 200, {
    enabled: Boolean(NVIDIA_API_KEY),
    provider: "NVIDIA NIM",
    models: NVIDIA_MODELS,
    defaultModel: NVIDIA_MODEL,
    reason: NVIDIA_API_KEY
      ? "NVIDIA 助理已啟用。"
      : "尚未設定 NVIDIA_API_KEY；請先在 Render 環境變數填入。"
  });
}

async function handleNvidiaChat(req, res) {
  if (!NVIDIA_API_KEY) {
    sendJson(res, 503, {
      error: "NVIDIA 助理尚未啟用。",
      details: "請先在 Render 環境變數設定 NVIDIA_API_KEY。"
    });
    return;
  }

  const authResult = await verifySupabaseUser(req);
  if (!authResult.ok) {
    sendJson(res, 401, {
      error: "請先登入後再使用 NVIDIA 助理。",
      auth_reason: authResult.reason,
      auth_status: authResult.status,
      details: authResult.details || ""
    });
    return;
  }
  const user = authResult.user;

  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages.length) {
    sendJson(res, 400, { error: "messages 為必填，且至少要有一則訊息。" });
    return;
  }

  const requestedModel = String(body.model || "").trim();
  const model = NVIDIA_MODELS.includes(requestedModel) ? requestedModel : NVIDIA_MODEL;
  const payload = {
    model,
    messages,
    temperature: clampNumber(body.temperature, 0, 1.5, 0.25),
    max_tokens: clampNumber(body.max_tokens, 64, 2048, 900),
    stream: false
  };

  const upstream = await fetch(`${NVIDIA_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const rawText = await upstream.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!upstream.ok) {
    sendJson(res, upstream.status, {
      error: "NVIDIA API 呼叫失敗。",
      details: data?.error?.message || data?.detail || rawText || "Upstream error"
    });
    return;
  }

  sendJson(res, 200, {
    id: data?.id || "",
    model: data?.model || model,
    text: data?.choices?.[0]?.message?.content || "",
    usage: data?.usage || null,
    user: {
      id: user.id,
      email: user.email || ""
    }
  });
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const relativePath = requested.replace(/^\/+/, "");
  const absolutePath = path.resolve(ROOT_DIR, relativePath);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = await fsp.stat(absolutePath);
    if (stat.isDirectory()) {
      return serveStatic(req, res, path.posix.join(requested, "index.html"));
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const stream = fs.createReadStream(absolutePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=300"
    });
    if (req.method === "HEAD") {
      res.end();
      stream.destroy();
      return;
    }
    stream.pipe(res);
  } catch (error) {
    if (path.extname(relativePath)) {
      sendText(res, 404, "Not Found");
      return;
    }

    const fallback = path.join(ROOT_DIR, "index.html");
    const html = await fsp.readFile(fallback, "utf8");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(html);
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

  try {
    if (requestUrl.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        nvidiaEnabled: Boolean(NVIDIA_API_KEY),
        defaultModel: NVIDIA_MODEL
      });
      return;
    }

    if (requestUrl.pathname === "/api/ai-config") {
      await handleAiConfig(res);
      return;
    }

    if (requestUrl.pathname === "/api/nvidia/chat") {
      if (req.method !== "POST") {
        sendJson(res, 405, { error: "Method Not Allowed" });
        return;
      }
      await handleNvidiaChat(req, res);
      return;
    }

    if (!["GET", "HEAD"].includes(req.method || "GET")) {
      sendJson(res, 405, { error: "Method Not Allowed" });
      return;
    }

    await serveStatic(req, res, requestUrl.pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {
      error: "Server error",
      details: error.message || "Unknown error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`Interview prep server listening on http://127.0.0.1:${PORT}`);
});
