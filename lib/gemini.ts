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

// Caps how long a single model attempt can take. Without this, a model that
// hangs (rather than failing fast with 429/503) could eat the entire
// request budget by itself, across every round and fallback model, which is
// what let a real request run past nginx's proxy_read_timeout and come
// back as an HTML 504 page instead of a JSON response.
const MODEL_FETCH_TIMEOUT_MS = 20_000;

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

export type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

export type FunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

type ToolHandler = (args: Record<string, unknown>) => Promise<Record<string, unknown>>;

// Multi-search conversations (the model retrying search_listings with looser
// filters before giving a final answer) can easily use 3+ rounds on their
// own, so this leaves headroom beyond that for a real final-text round.
const MAX_TOOL_ROUNDS = 6;

/**
 * Runs a Gemini generateContent conversation, executing any function calls
 * the model requests (via `tools.handlers`) and feeding results back until
 * the model produces a final text answer or MAX_TOOL_ROUNDS is hit.
 */
export async function runGeminiConversation(input: {
  systemInstruction: string;
  contents: GeminiContent[];
  tools: { declarations: FunctionDeclaration[]; handlers: Record<string, ToolHandler> };
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  let contents = [...input.contents];
  const listingIds = new Set<string>();
  const modelChain = getModelChain();
  // Once a model responds successfully, keep trying it first on later
  // rounds of the same conversation instead of re-paying the latency of a
  // currently-overloaded model at the front of the chain every round.
  let preferredIndex = 0;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: input.systemInstruction }] },
      contents,
      tools: [{ functionDeclarations: input.tools.declarations }]
    });

    let payload: { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> } | null = null;
    let lastError: string | null = null;
    const tryOrder = [
      ...modelChain.slice(preferredIndex),
      ...modelChain.slice(0, preferredIndex)
    ];

    for (const model of tryOrder) {
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
        payload = await response.json();
        preferredIndex = modelChain.indexOf(model);
        break;
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

    if (!payload) {
      throw new Error(lastError ?? "All configured Gemini models are unavailable.");
    }
    const parts: GeminiPart[] = payload.candidates?.[0]?.content?.parts ?? [];
    const functionCalls = parts.filter(
      (part): part is { functionCall: { name: string; args: Record<string, unknown> } } =>
        "functionCall" in part
    );

    if (functionCalls.length === 0) {
      const text = parts
        .map((part) => ("text" in part ? part.text : ""))
        .join("")
        .trim();
      return { text, listingIds: [...listingIds] };
    }

    contents = [...contents, { role: "model", parts }];

    const responseParts: GeminiPart[] = [];
    for (const call of functionCalls) {
      const handler = input.tools.handlers[call.functionCall.name];
      const result = handler
        ? await handler(call.functionCall.args ?? {})
        : { error: "Unknown function." };

      const ids = result.listingIds;
      if (Array.isArray(ids)) {
        for (const id of ids) {
          if (typeof id === "string") {
            listingIds.add(id);
          }
        }
      }

      responseParts.push({ functionResponse: { name: call.functionCall.name, response: result } });
    }

    // The Gemini REST API only recognizes "user" and "model" roles; function
    // results go back as a "user" turn.
    contents = [...contents, { role: "user", parts: responseParts }];
  }

  return { text: "", listingIds: [...listingIds] };
}
