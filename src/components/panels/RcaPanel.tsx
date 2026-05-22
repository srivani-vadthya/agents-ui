import type { AgentDef } from "@/lib/agents";
import { AlertTriangle } from "lucide-react";

export function RcaPanel({
  meta,
  agent,
}: {
  meta: Record<string, unknown>;
  agent: AgentDef;
}) {
  const stepsTaken = (meta.steps_taken as number | undefined) ?? 0;
  const provider = (meta.provider as string | undefined) ?? null;
  const timestamp = (meta.timestamp as string | undefined) ?? null;
  const tokenUsage = (meta.token_usage as Record<string, any> | undefined) ?? null;
  const reportSaved = (meta.report_saved as string | undefined) ?? null;
  const llmCalls = tokenUsage?.llm_calls ?? 0;

  const hasData = provider || timestamp || llmCalls > 0;

  return (
    <div className="space-y-5">
      {hasData ? (
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: `${agent.accentHex}55`,
            background: `linear-gradient(180deg, ${agent.accentHex}12, transparent)`,
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: agent.accentHex }}>
            <AlertTriangle className="h-3 w-3" /> Analysis Complete
          </div>
          <div className="mt-2 space-y-2 text-xs">
            {llmCalls > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">LLM Calls:</span>
                <span className="font-medium">{llmCalls}</span>
              </div>
            )}
            {provider && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium text-[11px]">{provider}</span>
              </div>
            )}
            {timestamp && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-medium text-[10px]">{new Date(timestamp).toLocaleString()}</span>
              </div>
            )}
            {reportSaved && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Report:</span>
                <span className="font-medium text-[10px] truncate max-w-[180px]" title={reportSaved}>{reportSaved}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-muted-foreground py-8">
          Submit a log or error trace to see analysis details
        </div>
      )}
    </div>
  );
}