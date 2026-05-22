import type { AgentId } from "./agents";
import { streamAgent as streamMockAgent } from "./mockAgents";

export interface StreamChunk {
  text: string;
}

export interface AgentResponse {
  meta?: Record<string, unknown>;
}

export interface AgentRequest {
  threadId?: string;
  files?: File[];
}

type UnknownRecord = Record<string, unknown>;

const TEXT_KEYS = ["text", "token", "delta", "content", "answer", "response", "message", "rca_report"];
const CITATION_KEYS = ["citations", "sources", "source_documents", "documents", "references"];
const CONFIDENCE_KEYS = ["confidence", "confidence_score", "retrieval_score", "score"];
const GREETING_PATTERN =
  /^(hi|hello|hey|good\s+(morning|afternoon|evening)|thanks?|thank\s+you|ok|okay)\b[!. ]*$/i;

const isRecord = (value: unknown): value is UnknownRecord =>
  value != null && typeof value === "object" && !Array.isArray(value);

const hasFiles = (files: File[] | undefined): files is File[] =>
  Array.isArray(files) && files.length > 0;

function agentRequestBody(prompt: string, request: AgentRequest): BodyInit {
  return JSON.stringify({
    prompt,
    question: prompt,
    message: prompt,
    input: prompt,
    threadId: request.threadId,
    files: request.files?.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })) ?? [],
  });
}

async function uploadAgentDocuments(agentId: AgentId, request: AgentRequest): Promise<boolean> {
  if (!hasFiles(request.files)) return false;

  let uploadedAny = false;

  for (const file of request.files) {
    const form = new FormData();
    form.set("file", file, file.name);
    if (request.threadId) form.set("threadId", request.threadId);

    console.info(`[agent-client] Uploading document for "${agentId}"`, {
      endpoint: `/api/agents/${agentId}/upload`,
      threadId: request.threadId,
      file: file.name,
      size: file.size,
    });

    const response = await fetch(`/api/agents/${agentId}/upload`, {
      method: "POST",
      body: form,
    });

    console.info(`[agent-client] Upload response for "${agentId}"`, {
      file: file.name,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[agent-client] Document upload did not complete for "${agentId}"; continuing`, {
        file: file.name,
        status: response.status,
        detail: detail.slice(0, 800),
      });
      continue;
    }

    uploadedAny = response.status !== 204 || uploadedAny;
  }

  return uploadedAny;
}

export async function uploadKnowledgeDocuments(
  files: File[],
  threadId?: string
): Promise<boolean> {
  return uploadAgentDocuments("knowledge", { files, threadId });
}

function textFromPayload(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return "";

  for (const key of TEXT_KEYS) {
    const value = payload[key];
    if (typeof value === "string") {
      let cleaned = value;
      // Remove Unicode box-drawing characters
      cleaned = cleaned.replace(/[─-╿]+/g, '');
      // Remove lines that are only whitespace after removing box chars
      cleaned = cleaned.replace(/^\s*$/gm, '');
      // Remove excessive blank lines (more than 2 consecutive)
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      // Remove inline code backticks (but preserve code blocks)
      cleaned = cleaned.replace(/`([^`\n]+)`/g, '$1');
      return cleaned.trim();
    }
  }

  const choices = payload.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    return textFromPayload(choices[0]);
  }

  return "";
}

function numberFromValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1 ? value / 100 : value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed > 1 ? parsed / 100 : parsed;
  }
  return undefined;
}

function stringFromFields(payload: UnknownRecord, fields: string[], fallback: string): string {
  for (const field of fields) {
    const value = payload[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function citationFromPayload(payload: unknown, index: number): UnknownRecord | undefined {
  if (typeof payload === "string" && payload.trim()) {
    return { title: payload.trim(), page: 1, score: 1 };
  }
  if (!isRecord(payload)) return undefined;

  const nestedMeta = payload.metadata;
  const merged = isRecord(nestedMeta) ? { ...nestedMeta, ...payload } : payload;
  const title = stringFromFields(
    merged,
    ["title", "source", "file", "filename", "document", "name", "url"],
    `Source ${index + 1}`
  );
  const excerpt = stringFromFields(
    merged,
    ["excerpt", "snippet", "content", "text", "page_content", "passage"],
    ""
  );
  const url = stringFromFields(merged, ["url", "source_url", "link"], "");
  const page = numberFromValue(merged.page ?? merged.page_number ?? merged.pageNumber) ?? 1;
  const score = numberFromValue(
    merged.score ?? merged.similarity ?? merged.relevance ?? merged.confidence
  ) ?? 1;

  return { title, page: Math.max(1, Math.round(page)), score, excerpt, url };
}

function normalizeKnowledgeMeta(
  payload: UnknownRecord,
  prompt: string
): Record<string, unknown> | undefined {
  if (GREETING_PATTERN.test(prompt.trim())) {
    return {
      confidence: 0,
      citations: [],
      evidenceSuppressedReason: "Greeting prompts do not use retrieval citations.",
    };
  }

  const directMeta = payload.meta ?? payload.metadata;
  const meta = isRecord(directMeta) ? directMeta : {};
  const combined = { ...payload, ...meta };

  let confidence: number | undefined;
  for (const key of CONFIDENCE_KEYS) {
    confidence = numberFromValue(combined[key]);
    if (confidence != null) break;
  }

  let rawCitations: unknown;
  for (const key of CITATION_KEYS) {
    if (combined[key] != null) {
      rawCitations = combined[key];
      break;
    }
  }

  const citations = Array.isArray(rawCitations)
    ? rawCitations
        .map((citation, index) => citationFromPayload(citation, index))
        .filter((citation): citation is UnknownRecord => Boolean(citation))
    : [];

  if (confidence == null && citations.length > 0) {
    confidence =
      citations.reduce((sum, citation) => sum + ((citation.score as number | undefined) ?? 0), 0) /
      citations.length;
  }

  if (confidence == null && citations.length === 0) return undefined;

  return {
    ...meta,
    confidence: confidence ?? 0,
    citations,
  };
}

function metaFromPayload(
  agentId: AgentId,
  payload: unknown,
  prompt: string
): Record<string, unknown> | undefined {
  if (!isRecord(payload)) return undefined;
  if (agentId === "knowledge") return normalizeKnowledgeMeta(payload, prompt);

  if (agentId === "rca") {
    // Extract RCA-specific metadata
    return {
      steps_taken: payload.steps_taken,
      provider: payload.provider,
      timestamp: payload.timestamp,
      token_usage: payload.token_usage,
    };
  }

  const meta = payload.meta ?? payload.metadata ?? payload.context;
  return isRecord(meta) ? meta : undefined;
}

function parseJsonLine(line: string): unknown | undefined {
  const trimmed = line.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

async function* streamLines(
  agentId: AgentId,
  response: Response,
  mode: "sse" | "ndjson",
  prompt: string
): AsyncGenerator<StreamChunk, AgentResponse> {
  const reader = response.body?.getReader();
  if (!reader) return {};

  const decoder = new TextDecoder();
  let buffer = "";
  let finalMeta: Record<string, unknown> | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (mode === "sse" && !line.startsWith("data:")) continue;

      const data = mode === "sse" ? line.slice(5).trim() : line;
      if (!data || data === "[DONE]") continue;

      const payload = parseJsonLine(data);
      const meta = metaFromPayload(agentId, payload, prompt);
      if (meta) finalMeta = meta;

      const text = textFromPayload(payload);
      if (text) yield { text };
    }
  }

  if (buffer.trim()) {
    const payload = parseJsonLine(mode === "sse" ? buffer.replace(/^data:\s*/, "") : buffer);
    const meta = metaFromPayload(agentId, payload, prompt);
    if (meta) finalMeta = meta;
    const text = textFromPayload(payload);
    if (text) yield { text };
  }

  return { meta: finalMeta };
}

async function* streamRenderAgent(
  agentId: AgentId,
  prompt: string,
  request: AgentRequest = {}
): AsyncGenerator<StreamChunk, AgentResponse> {
  const trimmedPrompt = prompt.trim();

  if (agentId === "knowledge") {
    const uploaded = await uploadAgentDocuments(agentId, request);
    if (!trimmedPrompt && hasFiles(request.files)) {
      yield {
        text: uploaded
          ? "Document uploaded for indexing. Ask a question when indexing is complete."
          : "Document attached here, but this Knowledge API does not currently expose an upload endpoint. Pre-ingest the document into Pinecone locally, then ask a question.",
      };
      return {
        meta: {
          confidence: 0,
          citations: [],
          uploadedDocuments: request.files.map((file) => file.name),
        },
      };
    }
  }

  console.info(`[agent-client] Calling Render agent "${agentId}" through proxy`, {
    endpoint: `/api/agents/${agentId}/chat`,
    threadId: request.threadId,
    fileCount: request.files?.length ?? 0,
  });

  const response = await fetch(`/api/agents/${agentId}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: agentRequestBody(prompt, request),
  });

  console.info(`[agent-client] Proxy response for "${agentId}"`, {
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type"),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[agent-client] Render agent "${agentId}" returned an error`, {
      status: response.status,
      detail: detail.slice(0, 800),
    });
    throw new Error(detail || `Agent request failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/event-stream")) {
    return yield* streamLines(agentId, response, "sse", prompt);
  }

  if (contentType.includes("application/x-ndjson") || contentType.includes("application/jsonl")) {
    return yield* streamLines(agentId, response, "ndjson", prompt);
  }

  if (contentType.includes("application/json")) {
    const payload = await response.json();
    console.log(`[agent-client] ===== RCA PAYLOAD START =====`);
    console.log(JSON.stringify(payload, null, 2));
    console.log(`[agent-client] ===== RCA PAYLOAD END =====`);
    const text = textFromPayload(payload);
    console.log(`[agent-client] Extracted text length:`, text?.length);
    if (text) yield { text };
    const meta = metaFromPayload(agentId, payload, prompt);
    console.log(`[agent-client] Extracted meta:`, meta);
    return { meta };
  }

  const text = await response.text();
  if (text) yield { text };
  return {};
}

export async function* streamAgent(
  agentId: AgentId,
  prompt: string,
  request: AgentRequest = {}
): AsyncGenerator<StreamChunk, AgentResponse> {
  try {
    return yield* streamRenderAgent(agentId, prompt, request);
  } catch (error) {
    console.warn(`[agent-client] Render agent "${agentId}" failed; falling back to mock data.`, error);
    return yield* streamMockAgent(agentId, prompt);
  }
}
