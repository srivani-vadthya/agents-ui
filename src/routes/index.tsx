import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Layers, LogIn, User } from "lucide-react";
import { AGENT_LIST, type AgentId } from "@/lib/agents";
import { useChatStore } from "@/lib/store";
import { AgentBadge } from "@/components/AgentBadge";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus AI — Enterprise Multi-Agent Platform" },
      {
        name: "description",
        content:
          "A centralized AI workspace for enterprise teams. Four specialized agents — knowledge, root cause, code generation, and auto-fix — in one futuristic interface.",
      },
      { property: "og:title", content: "Nexus AI — Enterprise Multi-Agent Platform" },
      {
        property: "og:description",
        content: "One intelligent workspace. Four specialist agents.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const createThread = useChatStore((s) => s.createThread);
  const user = useChatStore((s) => s.user);
  const setUser = useChatStore((s) => s.setUser);
  const [showLogin, setShowLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const launch = (agentId: AgentId) => {
    const t = createThread(agentId);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId, threadId: t.id },
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setUser({ name, email });
      setShowLogin(false);
    }
  };

  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-aurora glow-primary">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div className="text-sm font-semibold tracking-tight">Nexus AI</div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">{user.name}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.08]"
            >
              <LogIn className="h-3 w-3" /> Login
            </button>
          )}
          <button
            onClick={() => launch("knowledge")}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.08]"
          >
            Open Workspace <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground">
            <span className="pulse-ring h-1.5 w-1.5 rounded-full bg-primary" />
            Enterprise Multi-Agent Platform · v1.0
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            One intelligent workspace.
            <br />
            <span className="text-gradient">Four specialist agents.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground">
            Nexus unifies knowledge retrieval, root-cause analysis, code
            generation and automatic remediation in a single AI-native
            interface — built for the way enterprise teams actually work.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => launch("knowledge")}
              className="group inline-flex items-center gap-2 rounded-full bg-aurora px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              Launch workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#agents"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/[0.06]"
            >
              Meet the agents
            </a>
          </div>
        </motion.div>

        {/* Agent grid */}
        <div id="agents" className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                The agents
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Each agent. Its own surface.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {AGENT_LIST.map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 * i, ease: "easeOut" }}
                onClick={() => launch(a.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                  style={{ background: a.accentHex }}
                />
                <div className="relative flex items-start gap-4">
                  <AgentBadge agent={a} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">{a.name}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-24 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Layers, title: "Unified workspace", body: "Switch agents without losing context. One sidebar, one composer, four specialists." },
            { icon: Zap, title: "Streaming reasoning", body: "Token-level streaming, animated steps and live tool execution surfaces." },
            { icon: Shield, title: "Enterprise-ready", body: "Pluggable API layer that connects directly to your private deployments." },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
            >
              <p.icon className="h-4 w-4 text-primary" />
              <div className="mt-3 text-sm font-semibold">{p.title}</div>
              <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{p.body}</div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6"
          >
            <h2 className="text-xl font-semibold">Welcome to Nexus AI</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enter your details to continue</p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
