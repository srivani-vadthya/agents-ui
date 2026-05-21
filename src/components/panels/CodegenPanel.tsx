import type { AgentDef } from "@/lib/agents";
import { File, FolderTree, Terminal } from "lucide-react";

type GenFile = { path: string; lines: number; lang: string };

export function CodegenPanel({
  meta,
  agent,
}: {
  meta: Record<string, unknown>;
  agent: AgentDef;
}) {
  const files = (meta.files as GenFile[] | undefined) ?? [];
  const framework = meta.framework as string | undefined;
  const runtime = meta.runtime as string | undefined;

  return (
    <div className="space-y-5">
      {(framework || runtime) && (
        <div className="grid grid-cols-2 gap-2">
          {framework && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Framework
              </div>
              <div className="mt-0.5 text-xs font-medium">{framework}</div>
            </div>
          )}
          {runtime && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Runtime
              </div>
              <div className="mt-0.5 text-xs font-medium">{runtime}</div>
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <FolderTree className="h-3 w-3" /> Generated files
          </div>
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2 font-mono text-[12px]"
              >
                <File className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{f.path}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px]"
                  style={{ background: `${agent.accentHex}22`, color: agent.accentHex }}
                >
                  {f.lines} lines
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <Terminal className="h-3 w-3" /> Generation log
        </div>
        <div className="rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-[11px] leading-5 text-foreground/75">
          <div><span className="text-emerald-300">✓</span> parsed intent</div>
          <div><span className="text-emerald-300">✓</span> selected stack</div>
          <div><span className="text-emerald-300">✓</span> scaffolded {files.length || 0} files</div>
          <div><span className="text-emerald-300">✓</span> validated types</div>
          <div className="text-muted-foreground">▌ ready</div>
        </div>
      </div>
    </div>
  );
}