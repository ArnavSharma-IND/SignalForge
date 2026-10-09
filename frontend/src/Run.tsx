import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, Loader2 } from "lucide-react";
import demo from "./demo.json";
import { useApp } from "./ctx";
import { Badge, Btn, Card } from "./ui";

// Honest progress: the API returns one completed response, so we show one request state, then what the response contains.
const stages = (r: any): [string, string][] => [
  ["Hypothesis formation", `${r.hypotheses.length} hypotheses returned`],
  ["Evidence collection", `${r.evidence.length} evidence items returned`],
  ["Source triangulation", r.triangulation ? "Triangulation summary returned" : "None returned"],
  ["Contradiction analysis", `${r.contradictions.length} contradictions returned`],
  ["Self-falsification", `${r.falsification.tests.length} falsifier tests returned`],
  ["Signal assessment", `Score components returned (${Object.keys(r.score).length})`],
];
export default function Run() {
  const { form, setD } = useApp();
  const nav = useNavigate();
  const [st, setSt] = useState<"loading" | "done" | "offline">("loading");
  const [res, setRes] = useState<any>(null);
  useEffect(() => {
    const ac = new AbortController();
    const apply = (j: any, s: any) => { setRes(j); setD({ ...j, company: form.company, question: form.question }); setSt(s); };
    fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), signal: ac.signal })
      .then((r) => { if (!r.ok) throw new Error("bad status"); return r.json(); })
      .then((j) => apply(j, "done"))
      .catch((e) => { if (e?.name !== "AbortError") apply(demo, "offline"); });
    return () => ac.abort();
  }, []);
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-4xl">Research run</h1>
      <p className="mb-6 mt-2 text-mute">{form.company}: {form.question}</p>
      <Card className="mb-4 flex items-center gap-3" role="status" aria-live="polite">
        {st === "loading" ? <Loader2 size={18} className="animate-spin text-gold" /> : <Check size={18} className="text-gold" />}
        <span className="text-sm">{st === "loading" ? "Waiting for the research API (single request, no incremental progress is exposed)" : st === "done" ? "Response received from the research API" : "API unreachable. Showing bundled illustrative demo data instead."}</span>
        {st === "offline" && <Badge tone="amber">Demo data</Badge>}
      </Card>
      <Card className="divide-y divide-ivory/10 p-0">
        {(res ? stages(res) : stages(demo).map(([t]) => [t, "Pending response"] as [string, string])).map(([t, sub]) => (
          <div key={t} className="flex items-center gap-4 px-5 py-3">
            {res ? <Check size={16} className="text-gold" /> : <Circle size={16} className="text-warm" />}
            <div className="flex-1"><div className="text-sm">{t}</div><div className="font-mono text-xs text-warm">{sub}</div></div>
          </div>
        ))}
      </Card>
      <Btn className="mt-6" disabled={st === "loading"} onClick={() => nav("/results")}>OPEN RESULTS</Btn>
    </main>
  );
}
