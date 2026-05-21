import type { AgentId } from "./agents";

/**
 * Mock streaming service layer.
 *
 * Each agent has a `stream` function that yields tokens with realistic
 * cadence and returns optional structured metadata for the right panel.
 *
 * Swap these implementations for real Render endpoints when ready —
 * the chat UI only relies on the async iterable + final meta payload.
 */

export interface StreamChunk {
  text: string;
}

export interface AgentResponse {
  meta?: Record<string, unknown>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* streamText(text: string, perCharMs = 8): AsyncGenerator<StreamChunk> {
  // Stream by small word groups for natural cadence
  const tokens = text.match(/\S+\s*|\s+/g) ?? [text];
  for (const t of tokens) {
    await sleep(Math.max(10, perCharMs * Math.min(t.length, 6)));
    yield { text: t };
  }
}

/* ----------------------------- Knowledge ----------------------------- */

const KNOWLEDGE_REPLY = (q: string) => `Based on the indexed knowledge base, here is a synthesized answer:

**${q.slice(0, 80)}** — short answer:

Our enterprise documentation indicates a structured, multi-layer approach. Three sources were retrieved with high relevance:

1. **Architecture Overview v2.3** — describes the canonical pattern used across services.
2. **Operations Runbook** — defines escalation paths and SLOs.
3. **Security & Compliance Handbook** — outlines data residency and audit obligations.

### Key takeaways
- Adopt the documented pattern verbatim before customizing.
- Confidence is **high** where multiple sources agree; flagged otherwise.
- See citations panel for direct passages.

Let me know if you'd like me to dig deeper into any single source.`;

/* -------------------------------- RCA -------------------------------- */

const RCA_REPLY = (q: string) => `## Root Cause Analysis Report

**Incident**: ${q.slice(0, 100)}

I clustered the log events, walked the dependency graph and ranked candidate causes:

### Investigation chain
1. Spike in 5xx originated at \`auth-service\` (14:02 UTC).
2. Upstream \`session-cache\` latency p99 climbed 8x in the prior 90s.
3. \`session-cache\` saturated CPU after a config push to **redis-cluster-b**.
4. The config push removed two replicas, halving available read throughput.

### Most likely root cause
**Mis-scoped Redis topology change** — confidence **0.87**.

### Recommended remediation
- Roll back the redis-cluster-b config to the previous revision.
- Re-enable the two removed replicas.
- Add a guard on replica count in the deploy pipeline.`;

/* ------------------------------ CodeGen ------------------------------ */

const CODEGEN_REPLY = (q: string) => `Here is a production-ready scaffold for: _${q.slice(0, 80)}_

\`\`\`typescript
// src/server/inventory.ts
import { z } from "zod";
import { Hono } from "hono";

const Item = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
});

export const inventory = new Hono()
  .get("/items", async (c) => {
    const items = await c.var.db.item.findMany();
    return c.json({ items });
  })
  .post("/items", async (c) => {
    const body = Item.parse(await c.req.json());
    const created = await c.var.db.item.create({ data: body });
    return c.json(created, 201);
  })
  .patch("/items/:sku", async (c) => {
    const sku = c.req.param("sku");
    const patch = Item.partial().parse(await c.req.json());
    const updated = await c.var.db.item.update({ where: { sku }, data: patch });
    return c.json(updated);
  });
\`\`\`

### Notes
- Validation lives at the boundary with Zod.
- Routes are composable for mounting under any prefix.
- Replace \`c.var.db\` with your Prisma or Drizzle client.`;

/* ------------------------------ AutoFix ------------------------------ */

const AUTOFIX_REPLY = (q: string) => `## Diagnosis

The snippet you shared contains a classic **stale closure** in the effect's dependency array, causing the handler to read an outdated value of \`count\`.

## Patch (unified diff)

\`\`\`diff
- useEffect(() => {
-   const id = setInterval(() => {
-     setCount(count + 1);
-   }, 1000);
-   return () => clearInterval(id);
- }, []);
+ useEffect(() => {
+   const id = setInterval(() => {
+     setCount((c) => c + 1);
+   }, 1000);
+   return () => clearInterval(id);
+ }, []);
\`\`\`

## Reasoning
- The empty dependency array captures the initial \`count\` (\`0\`).
- Using the functional updater removes the closure read entirely.
- Confidence: **0.94**.

_Original prompt: ${q.slice(0, 60)}_`;

/* ------------------------------ Dispatch ----------------------------- */

export async function* streamAgent(
  agentId: AgentId,
  prompt: string
): AsyncGenerator<StreamChunk, AgentResponse> {
  let text: string;
  let meta: Record<string, unknown> = {};

  switch (agentId) {
    case "knowledge":
      text = KNOWLEDGE_REPLY(prompt);
      meta = {
        citations: [
          { title: "Architecture Overview v2.3", page: 14, score: 0.93 },
          { title: "Operations Runbook", page: 7, score: 0.88 },
          { title: "Security & Compliance Handbook", page: 22, score: 0.81 },
        ],
        confidence: 0.91,
      };
      break;
    case "rca":
      text = RCA_REPLY(prompt);
      meta = {
        rootCause: "Mis-scoped Redis topology change",
        confidence: 0.87,
        nodes: [
          { id: "edge", label: "Edge", status: "ok" },
          { id: "auth", label: "auth-service", status: "error" },
          { id: "cache", label: "session-cache", status: "warn" },
          { id: "redis", label: "redis-cluster-b", status: "error" },
          { id: "db", label: "postgres-primary", status: "ok" },
        ],
        edges: [
          ["edge", "auth"],
          ["auth", "cache"],
          ["cache", "redis"],
          ["auth", "db"],
        ],
        steps: [
          "Cluster 5xx events by service",
          "Correlate with deploy timeline",
          "Walk dependency graph from origin",
          "Score candidate causes",
        ],
      };
      break;
    case "codegen":
      text = CODEGEN_REPLY(prompt);
      meta = {
        files: [
          { path: "src/server/inventory.ts", lines: 32, lang: "TypeScript" },
          { path: "src/server/db/schema.ts", lines: 18, lang: "TypeScript" },
          { path: "tests/inventory.test.ts", lines: 41, lang: "TypeScript" },
        ],
        framework: "Hono + Zod",
        runtime: "Node 20 / Bun",
      };
      break;
    case "autofix":
      text = AUTOFIX_REPLY(prompt);
      meta = {
        confidence: 0.94,
        diff: {
          removed: 4,
          added: 4,
        },
        category: "Stale closure in useEffect",
      };
      break;
  }

  for await (const c of streamText(text)) yield c;
  return { meta };
}