import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { AGENTS, type AgentId } from "@/lib/agents";
import { useChatStore } from "@/lib/store";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatView } from "@/components/ChatView";

export const Route = createFileRoute("/chat/$agentId/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { agentId, threadId } = useParams({
    from: "/chat/$agentId/$threadId",
  });
  const navigate = useNavigate();
  const thread = useChatStore((s) => s.threads[threadId]);
  const createThread = useChatStore((s) => s.createThread);

  const validAgent = agentId in AGENTS;

  // If thread doesn't exist in store (fresh reload — no persistence),
  // create a new one for this agent and redirect to its real ID so the
  // route + store stay in sync.
  useEffect(() => {
    if (!thread && validAgent) {
      const t = createThread(agentId as AgentId);
      navigate({
        to: "/chat/$agentId/$threadId",
        params: { agentId, threadId: t.id },
        replace: true,
      });
    }
  }, [thread, validAgent, agentId, createThread, navigate]);

  const activeAgent = useMemo<AgentId>(
    () => (validAgent ? (agentId as AgentId) : "knowledge"),
    [agentId, validAgent]
  );

  return (
    <div className="aurora-bg flex min-h-screen w-full">
      <AppSidebar activeAgent={activeAgent} />
      {thread ? (
        <ChatView thread={thread} key={thread.id} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <span className="shimmer-text">Preparing workspace…</span>
        </div>
      )}
    </div>
  );
}