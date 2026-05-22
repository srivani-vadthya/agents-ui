import type { AgentDef } from "@/lib/agents";
import type { UploadedFile } from "@/lib/store";
import { useRef, useState } from "react";
import { ChevronDown, FileSearch, FileText, Loader2, Plus, UploadCloud, X } from "lucide-react";

interface Citation {
  title: string;
  page: number;
  score: number;
  excerpt?: string;
  url?: string;
}

export function KnowledgePanel({
  meta,
  agent,
  files,
  onUploadToPinecone,
}: {
  meta: Record<string, unknown>;
  agent: AgentDef;
  files: UploadedFile[];
  onUploadToPinecone?: (files: File[]) => Promise<boolean>;
}) {
  const citations = (meta.citations as Citation[] | undefined) ?? [];
  const confidence = (meta.confidence as number | undefined) ?? 0;
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | undefined>();

  const uploadSelected = async () => {
    if (!selectedFiles.length || !onUploadToPinecone) return;
    setUploading(true);
    setUploadStatus(undefined);
    try {
      const uploaded = await onUploadToPinecone(selectedFiles);
      if (uploaded) {
        setUploadStatus(`${selectedFiles.length} document${selectedFiles.length === 1 ? "" : "s"} sent to Pinecone indexing.`);
        setSelectedFiles([]);
      } else {
        setUploadStatus("Upload endpoint is not configured or did not index the document.");
      }
    } catch (error) {
      console.error("[knowledge-panel] Upload to Pinecone failed", error);
      setUploadStatus("Upload failed. Check the dev server logs for the backend response.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Confidence
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums">
            {(confidence * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-muted-foreground">retrieval score</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${confidence * 100}%`,
              background: agent.accentHex,
              boxShadow: `0 0 12px ${agent.accentHex}`,
            }}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <UploadCloud className="h-3 w-3" /> Pinecone upload
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.csv,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            onChange={(event) => {
              if (event.target.files) {
                setSelectedFiles((current) => [...current, ...Array.from(event.target.files!)]);
                setUploadStatus(undefined);
              }
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium transition-colors hover:bg-white/[0.06]"
          >
            <Plus className="h-3.5 w-3.5" /> Select documents
          </button>

          {selectedFiles.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFiles((current) => current.filter((_, i) => i !== index))
                    }
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={uploadSelected}
            disabled={!selectedFiles.length || uploading || !onUploadToPinecone}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-background transition-opacity disabled:opacity-45"
            style={{ background: agent.accentHex }}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
            Upload to Pinecone
          </button>

          {uploadStatus && (
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{uploadStatus}</p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <FileText className="h-3 w-3" /> Uploaded documents
        </div>
        {files.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
            No documents are attached in this conversation yet.
          </div>
        ) : (
          <div className="space-y-2">
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] leading-5 text-muted-foreground">
              These are attached in this chat. Pinecone indexing is handled by your backend.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <FileSearch className="h-3 w-3" /> Answer retrieved from
        </div>
        {citations.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            Source passages will appear here when the answer uses retrieved documents.
          </div>
        ) : (
          <ul className="space-y-2">
            {citations.map((c, i) => (
              <details
                key={i}
                className="group rounded-lg border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-start gap-2 p-3">
                  <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">p. {c.page}</div>
                  </div>
                  <div
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums"
                    style={{ background: `${agent.accentHex}22`, color: agent.accentHex }}
                  >
                    {(c.score * 100).toFixed(0)}%
                  </div>
                </summary>
                <div className="border-t border-white/5 px-3 pb-3 pt-2">
                  {c.excerpt ? (
                    <p className="text-xs leading-5 text-muted-foreground">{c.excerpt}</p>
                  ) : (
                    <p className="text-xs leading-5 text-muted-foreground">
                      This source was returned by the retriever, but no passage excerpt was included.
                    </p>
                  )}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block truncate text-[11px]"
                      style={{ color: agent.accentHex }}
                    >
                      {c.url}
                    </a>
                  )}
                </div>
              </details>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
