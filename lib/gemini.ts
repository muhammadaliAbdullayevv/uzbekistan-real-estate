// Conservative default chain: "gemini-flash-latest" is a Google-maintained
// alias that always points to their current recommended flash model, so it
// resists going stale; the rest are pinned flash-tier fallbacks confirmed
// live (via direct generateContent calls, not just docs) to actually work on
// a free-tier key. The older "gemini-2.5-*" and "gemini-pro-*" models are
// deliberately excluded -- as of this writing they either 404 ("no longer
// available to new users") or carry a 0 free-tier quota. Exact availability
// shifts over time and per account -- override via GEMINI_MODEL_FALLBACKS
// (comma-separated) if your AI Studio dashboard shows different models.
const DEFAULT_MODEL = "gemini-flash-latest";
const DEFAULT_FALLBACKS = [
  "gemini-flash-latest",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite"
];

export function hasGeminiConfig() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

// Caps how long a single model attempt can take. A live test against
// production's key/network caught gemini-3.1-flash-lite hanging for 23s
// before failing with a 503 (not a fast error) -- Google's API doesn't
// always fail fast under load, so this timeout is what actually bounds a
// stuck attempt instead of it eating the whole request budget. Kept well
// under nginx's proxy_read_timeout for this endpoint (120s, see
// deploy/nginx-uzbekistan-rentals.conf) with room for two calls (extraction
// + phrasing) to each burn through a few stuck models in the worst case.
const MODEL_FETCH_TIMEOUT_MS = 8_000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function getModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const configuredFallbacks = process.env.GEMINI_MODEL_FALLBACKS?.trim();
  const fallbacks = configuredFallbacks
    ? configuredFallbacks.split(",").map((m) => m.trim()).filter(Boolean)
    : DEFAULT_FALLBACKS;

  // Dedupe while preserving order, primary always first.
  return [primary, ...fallbacks].filter((model, index, all) => all.indexOf(model) === index);
}

/** True for responses that mean "this model is unavailable right now" rather than a real error in the request itself. */
function isSwitchableStatus(status: number) {
  return status === 429 || status === 503 || status === 404;
}

export type GeminiPart = { text: string };

export type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

/**
 * Sends one generateContent request, walking the model fallback chain on
 * quota/availability errors or a stuck attempt. Returns the first
 * candidate's parts. Used by both runGeminiText and runGeminiJson -- neither
 * needs a multi-round conversation loop since each caller sends exactly one
 * request and gets exactly one answer back.
 */
async function callGeminiModelChain(requestBody: Record<string, unknown>): Promise<GeminiPart[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const body = JSON.stringify(requestBody);
  let lastError: string | null = null;

  for (const model of getModelChain()) {
    let response: Response;

    try {
      response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body
        },
        MODEL_FETCH_TIMEOUT_MS
      );
    } catch (fetchError) {
      // Timed out or a network-level failure -- treat the same as a
      // switchable status and move on to the next model.
      lastError = `Gemini request to ${model} failed: ${
        fetchError instanceof Error ? fetchError.message : String(fetchError)
      }`;
      continue;
    }

    if (response.ok) {
      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
      };
      return payload.candidates?.[0]?.content?.parts ?? [];
    }

    const errorBody = await response.text().catch(() => "");
    lastError = `Gemini API error (${response.status}) on ${model}: ${errorBody.slice(0, 300)}`;

    if (!isSwitchableStatus(response.status)) {
      // Not a quota/availability issue (e.g. a bad request) -- retrying
      // with a different model won't help, so stop here.
      throw new Error(lastError);
    }
    // Otherwise fall through and try the next model in the chain.
  }

  throw new Error(lastError ?? "All configured Gemini models are unavailable.");
}

function partsToText(parts: GeminiPart[]) {
  return parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

/** One-shot plain-text completion -- no function calling, no multi-round loop. */
export async function runGeminiText(input: {
  systemInstruction: string;
  contents: GeminiContent[];
}): Promise<string> {
  const parts = await callGeminiModelChain({
    systemInstruction: { parts: [{ text: input.systemInstruction }] },
    contents: input.contents
  });

  return partsToText(parts);
}

/**
 * One-shot structured completion using Gemini's JSON response mode. Used for
 * intent classification + filter extraction: the model outputs data that
 * conforms to responseSchema instead of free text, so the result can be
 * parsed directly without a function-calling round trip.
 */
export async function runGeminiJson<T>(input: {
  systemInstruction: string;
  contents: GeminiContent[];
  responseSchema: Record<string, unknown>;
}): Promise<T> {
  const parts = await callGeminiModelChain({
    systemInstruction: { parts: [{ text: input.systemInstruction }] },
    contents: input.contents,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: input.responseSchema
    }
  });

  const text = partsToText(parts);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 300)}`);
  }
}
