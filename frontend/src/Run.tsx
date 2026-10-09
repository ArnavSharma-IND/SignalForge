import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Check,
  Circle,
  Loader2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Search,
  FileText,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import { api, type InvestigationSummary } from "./api";
import { useApp } from "./ctx";
import { Badge, Btn, Card, cn } from "./ui";

const PIPELINE_STAGES = [
  {
    key: "planning",
    label: "Hypothesis Planning",
    desc: "Decomposing research query into competing theses and falsifiers",
    icon: BrainCircuit,
  },
  {
    key: "searching",
    label: "Evidence Gathering",
    desc: "Executing targeted multi-domain searches across filings and press",
    icon: Search,
  },
  {
    key: "extracting",
    label: "Verbatim Extraction",
    desc: "Extracting atomic claims and verifying verbatim presence in sources",
    icon: FileText,
  },
  {
    key: "analysing",
    label: "Adversarial Synthesis",
    desc: "Evaluating falsifiers, detecting contradictions, and computing score",
    icon: Sparkles,
  },
];

export default function Run() {
  const { form, setForm, setD } = useApp();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");

  const [invId, setInvId] = useState<string | null>(queryId);
  const [inv, setInv] = useState<InvestigationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const pollIntervalRef = useRef<any>(null);

  // 1. Initialize or load investigation
  useEffect(() => {
    let unmounted = false;

    async function init() {
      setError(null);
      setLoading(true);

      try {
        if (queryId) {
          // Existing investigation
          const item = await api.getInvestigation(queryId);
          if (unmounted) return;
          setInv(item);
          setInvId(item.id);
          setForm({
            company: item.company,
            question: item.question,
            focus: item.focus || "Growth sustainability",
          });

          // If created but not started, start it
          if (item.status === "created") {
            await api.runInvestigation(item.id);
          }
        } else {
          // Create new investigation
          const created = await api.createInvestigation({
            company: form.company,
            question: form.question,
            focus: form.focus,
          });
          if (unmounted) return;
          setInvId(created.id);
          setInv(created);
          // Start running
          await api.runInvestigation(created.id);
        }
      } catch (err: any) {
        if (!unmounted) {
          setError(err?.message || "Failed to initialize research job");
        }
      } finally {
        if (!unmounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      unmounted = true;
    };
  }, [queryId]);

  // 2. Poll job status
  useEffect(() => {
    if (!invId) return;

    async function checkStatus() {
      try {
        const item = await api.getInvestigation(invId!);
        setInv(item);

        if (item.status === "completed") {
          clearInterval(pollIntervalRef.current);
          if (item.data) {
            setD({
              ...item.data,
              company: item.company,
              question: item.question,
              isLive: true,
            });
          }
        } else if (item.status === "failed") {
          clearInterval(pollIntervalRef.current);
          setError(item.error || "Research investigation failed");
        }
      } catch (err: any) {
        // network or server error during polling
      }
    }

    pollIntervalRef.current = setInterval(checkStatus, 1500);
    checkStatus(); // immediate first check

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [invId]);

  const handleRetry = async () => {
    if (!invId) return;
    setRetrying(true);
    setError(null);
    try {
      await api.retryInvestigation(invId);
      const item = await api.getInvestigation(invId);
      setInv(item);
    } catch (err: any) {
      setError(err?.message || "Failed to retry investigation");
    } finally {
      setRetrying(false);
    }
  };

  const currentStage = inv?.stage || (inv?.status === "running" ? "planning" : null);
  const isDone = inv?.status === "completed";
  const isRunning = inv?.status === "running" || inv?.status === "queued" || inv?.status === "created";
  const isFailed = inv?.status === "failed";

  const getStageStatus = (stageKey: string) => {
    if (isDone) return "completed";
    if (!currentStage) return "pending";

    const stageOrder = ["planning", "searching", "extracting", "analysing", "done"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const thisIndex = stageOrder.indexOf(stageKey);

    if (thisIndex < currentIndex) return "completed";
    if (thisIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Live Research Run</h1>
          <p className="mt-1 text-mute text-sm">
            {inv?.company || form.company}: {inv?.question || form.question}
          </p>
        </div>
        {inv && (
          <Badge
            tone={
              isDone ? "green" : isFailed ? "red" : isRunning ? "blue" : "slate"
            }
          >
            {inv.status.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Main Status Header Card */}
      <Card className="mb-6 flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          {isRunning ? (
            <Loader2 size={20} className="animate-spin text-gold" />
          ) : isDone ? (
            <Check size={20} className="text-emerald-400" />
          ) : (
            <ShieldAlert size={20} className="text-rose-400" />
          )}
          <div>
            <div className="text-sm font-medium">
              {isRunning && (inv?.status === "queued" ? "Job is queued in runner..." : `Executing stage: ${currentStage || "planning"}`)}
              {isDone && "Investigation completed successfully"}
              {isFailed && "Investigation encountered an error"}
            </div>
            <div className="text-xs text-warm font-mono mt-0.5">
              ID: {invId || "creating..."}
            </div>
          </div>
        </div>

        {isDone && (
          <Btn onClick={() => nav("/results")} className="px-4 py-2 text-xs">
            OPEN RESULTS <ArrowRight size={14} />
          </Btn>
        )}
      </Card>

      {/* Error Alert Box */}
      {error && (
        <Card className="mb-6 border-rose-500/40 bg-rose-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h2 className="text-sm font-semibold text-rose-300">Pipeline Execution Error</h2>
              <p className="text-xs text-rose-200 font-mono leading-relaxed">{error}</p>

              {error.includes("not configured") && (
                <div className="mt-3 rounded bg-char p-3 text-xs text-mute space-y-1">
                  <div className="font-semibold text-ivory">Missing Provider Keys:</div>
                  <p>Configure `ANTHROPIC_API_KEY` and `TAVILY_API_KEY` in `backend/.env` to run live research.</p>
                  <p className="pt-1">
                    Or check out the synthetic dataset via{" "}
                    <Link to="/demo" className="text-gold underline">
                      View Demo
                    </Link>
                    .
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Btn
                  variant="ghost"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="border-rose-400/40 text-rose-300 hover:bg-rose-500/20 text-xs"
                >
                  {retrying ? <Loader2 size={14} className="animate-spin" /> : <><RotateCcw size={14} /> RETRY INVESTIGATION</>}
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => nav("/history")}
                  className="text-xs"
                >
                  View History
                </Btn>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pipeline Stage Tracker */}
      <Card className="divide-y divide-ivory/10 p-0 overflow-hidden shadow-2xl">
        {PIPELINE_STAGES.map((s, index) => {
          const status = getStageStatus(s.key);
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className={cn(
                "flex items-center gap-4 px-6 py-4 transition",
                status === "active" && "bg-gold/10"
              )}
            >
              <div className="flex items-center justify-center">
                {status === "completed" ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check size={16} />
                  </div>
                ) : status === "active" ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ivory/5 text-warm">
                    <Circle size={14} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ivory">{s.label}</span>
                  {status === "active" && (
                    <span className="text-[10px] font-mono font-medium text-gold uppercase animate-pulse">
                      • In Progress
                    </span>
                  )}
                </div>
                <div className="text-xs text-mute truncate">{s.desc}</div>
              </div>

              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition",
                  status === "active" ? "text-gold" : status === "completed" ? "text-emerald-400" : "text-warm/40"
                )}
              />
            </div>
          );
        })}
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <Btn variant="ghost" onClick={() => nav("/history")} className="text-xs">
          ← Back to History
        </Btn>

        <Btn
          disabled={!isDone}
          onClick={() => nav("/results")}
          className="px-6"
        >
          VIEW DOSSIER RESULTS
        </Btn>
      </div>
    </main>
  );
}
