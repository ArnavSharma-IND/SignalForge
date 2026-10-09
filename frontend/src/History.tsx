import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type InvestigationSummary } from "./api";
import { useApp } from "./ctx";
import { Btn, Card, Badge, cn } from "./ui";
import {
  Clock,
  Search,
  ArrowUpRight,
  RotateCcw,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Hourglass,
  Plus,
} from "lucide-react";

const statusTones: Record<string, "green" | "red" | "amber" | "blue" | "slate"> = {
  completed: "green",
  running: "blue",
  queued: "amber",
  failed: "red",
  created: "slate",
};

export default function History() {
  const [items, setItems] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { setD, setForm } = useApp();
  const nav = useNavigate();

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listInvestigations(0, 50);
      setItems(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load research history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleOpenCompleted = async (item: InvestigationSummary) => {
    try {
      const full = await api.getInvestigation(item.id);
      if (full.data) {
        setD({
          ...full.data,
          company: full.company,
          question: full.question,
          isLive: true,
        });
        setForm({
          company: full.company,
          question: full.question,
          focus: full.focus,
        });
        nav("/results");
      } else {
        nav(`/run?id=${item.id}`);
      }
    } catch (err: any) {
      setError(err?.message || "Could not retrieve investigation details");
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await api.retryInvestigation(id);
      nav(`/run?id=${id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to retry investigation");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this investigation?")) return;
    setDeletingId(id);
    try {
      await api.deleteInvestigation(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete investigation");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl">Investigation History</h1>
          <p className="mt-1 text-sm text-mute">
            Review past dossiers, check real-time pipeline states, and resume runs
          </p>
        </div>
        <Btn onClick={() => nav("/research")} className="flex items-center gap-2">
          <Plus size={16} /> NEW INVESTIGATION
        </Btn>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Error:</span> {error}
          </div>
          <button onClick={loadHistory} className="text-gold hover:underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-ivory/10 bg-surf">
            <Clock className="text-warm" size={26} />
          </div>
          <h2 className="text-xl font-semibold">No investigations yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-mute">
            Launch your first adversarial research pipeline to uncover signals and detect hidden contradictions.
          </p>
          <Btn onClick={() => nav("/research")} className="mt-6">
            START RESEARCH
          </Btn>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group relative transition hover:border-gold/40 hover:bg-surf/90"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-ivory group-hover:text-gold transition">
                      {item.company}
                    </span>
                    <Badge tone={statusTones[item.status] || "slate"}>
                      {item.status.toUpperCase()}
                      {item.stage && item.status === "running" ? `: ${item.stage}` : ""}
                    </Badge>
                    {item.focus && (
                      <span className="text-xs text-warm font-mono">[{item.focus}]</span>
                    )}
                  </div>

                  <p className="text-sm text-mute leading-relaxed">{item.question}</p>

                  <div className="flex items-center gap-4 text-xs text-warm pt-1">
                    <span>
                      Created: {new Date(item.created * 1000).toLocaleString()}
                    </span>
                    {item.retries > 0 && <span>Retries: {item.retries}</span>}
                  </div>

                  {item.error && (
                    <div className="mt-2 text-xs text-rose-300 font-mono bg-rose-500/10 p-2 rounded border border-rose-500/20">
                      Error: {item.error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "completed" && (
                    <Btn
                      onClick={() => handleOpenCompleted(item)}
                      className="px-4 py-2 text-xs"
                    >
                      VIEW RESULTS <ArrowUpRight size={14} />
                    </Btn>
                  )}

                  {(item.status === "running" || item.status === "queued" || item.status === "created") && (
                    <Btn
                      onClick={() => nav(`/run?id=${item.id}`)}
                      className="px-4 py-2 text-xs"
                    >
                      OPEN RUN <Hourglass size={14} />
                    </Btn>
                  )}

                  {item.status === "failed" && (
                    <Btn
                      variant="ghost"
                      onClick={() => handleRetry(item.id)}
                      className="px-4 py-2 text-xs border-gold/40 text-gold hover:bg-gold/10"
                    >
                      <RotateCcw size={14} /> RETRY
                    </Btn>
                  )}

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deletingId === item.id}
                    title="Delete investigation"
                    className="p-2 text-warm hover:text-rose-400 transition"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
