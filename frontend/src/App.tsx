import { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ArrowRight, Check, ChevronDown, Circle, Download, Loader2 } from "lucide-react";
import demo from "./demo.json";
import { Badge, Btn, Card, cn } from "./ui";

const Ctx = createContext<any>(null);
const useApp = () => useContext(Ctx);

const KEYS = ["Evidence Strength", "Source Quality", "Cross-source Agreement", "Novelty", "Contradiction Risk"];
const W = [0.3, 0.2, 0.15, 0.25, 0.1];
const val = (s: any, k: string) => (k === "Contradiction Risk" ? 10 - s[k] : s[k]);
const total = (s: any) => KEYS.reduce((a, k, i) => a + val(s, k) * W[i], 0);
const clsTone: any = { SUPPORTS: "green", CONTRADICTS: "red", NEUTRAL: "slate" };
const riskTone: any = { Low: "green", Medium: "amber", High: "red" };

const sections = (d: any): [string, string][] => [
  ["Executive Summary", `${d.signal.text} ${d.triangulation}`],
  ["Research Question", `${d.company}: ${d.question}`],
  ["Initial Hypotheses", d.hypotheses.map((h: any) => `• ${h.text} (${h.status}, ${h.conf}%)`).join("\n")],
  ["Key Evidence", d.evidence.slice(0, 4).map((e: any) => `• [${e.cls}] ${e.claim} (${e.source}, ${e.date})`).join("\n")],
  ["Evidence Triangulation", d.triangulation],
  ["Contradictions", d.contradictions.map((c: any) => `• "${c.claim}" vs "${c.external}"`).join("\n")],
  ["Alternative Explanation", d.alternative],
  ["Self-Falsification", d.falsification.assessment],
  ["Final Signal", d.signal.text],
  ["Confidence", `${d.signal.confidence}% confidence, signal score ${total(d.score).toFixed(1)}/10`],
  ["What Could Prove This Wrong?", d.falsification.tests.filter((t: any) => t.risk !== "Low").map((t: any) => `• ${t.name}: ${t.found}`).join("\n")],
  ["What To Monitor Next", d.monitor.map((m: any) => `• ${m.name}: ${m.why}`).join("\n")],
  ["Sources", ([...new Set(d.evidence.map((e: any) => e.source))] as string[]).map((s) => `• ${s}`).join("\n")],
];

export default function App() {
  const [form, setForm] = useState({ company: "Reliance Industries", question: "Is the current growth trajectory sustainable?", focus: "Growth sustainability" });
  const [d, setD] = useState<any>(demo);
  return (
    <Ctx.Provider value={{ form, setForm, d, setD }}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-semibold tracking-widest">SIGNALFORGE</Link>
          <nav className="flex gap-6 text-sm text-slate-400">
            <Link to="/research" className="hover:text-white">Research</Link>
            <Link to="/results" className="hover:text-white">Demo</Link>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/research" element={<Research />} />
        <Route path="/run" element={<Run />} />
        <Route element={<Shell />}>
          <Route path="/results" element={<Overview />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/contradictions" element={<Contradictions />} />
          <Route path="/falsification" element={<Falsification />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/report" element={<Report />} />
        </Route>
      </Routes>
      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-slate-500">{demo.disclaimer}</footer>
    </Ctx.Provider>
  );
}

function Landing() {
  const nav = useNavigate();
  const flow = ["Question", "Research", "Evidence", "Contradictions", "Self-Falsification", "Signal"];
  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="fade py-24 text-center">
        <h1 className="text-6xl font-semibold tracking-tight md:text-7xl">SIGNALFORGE</h1>
        <p className="mt-4 text-xl text-indigo-300">Find the signal. Challenge the signal.</p>
        <p className="mx-auto mt-6 max-w-2xl text-slate-400">An AI-powered financial research agent that discovers non-obvious signals, triangulates evidence, detects contradictions, and challenges its own conclusions.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Btn onClick={() => nav("/research")}>START RESEARCH <ArrowRight size={16} /></Btn>
          <Btn variant="ghost" onClick={() => nav("/results")}>VIEW DEMO</Btn>
        </div>
      </section>
      <section className="flex flex-wrap items-center justify-center gap-3 pb-20 text-sm">
        {flow.map((f, i) => (
          <div key={f} className="flex items-center gap-3">
            <span className={cn("rounded border px-3 py-1.5", i === 5 ? "border-indigo-400 bg-indigo-500/20" : "border-white/15 text-slate-300")}>{f}</span>
            {i < 5 && <ArrowRight size={14} className="text-slate-600" />}
          </div>
        ))}
      </section>
      <section className="pb-12">
        <h2 className="mb-6 text-2xl font-semibold">Why SignalForge?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><div className="text-sm text-slate-400">Traditional research</div><div className="mt-3 text-lg">Search → Read → Summarize</div></Card>
          <Card className="border-indigo-400/40"><div className="text-sm text-indigo-300">SignalForge</div><div className="mt-3 text-lg">Question → Hypothesize → Research → Challenge → Discover</div></Card>
        </div>
      </section>
    </main>
  );
}

const inp = "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400";
function Research() {
  const { form, setForm } = useApp();
  const nav = useNavigate();
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-semibold">New research</h1>
      <p className="mt-2 text-slate-400">Define the company and the question to investigate.</p>
      <div className="mt-8 space-y-5">
        <label className="block text-sm">Company / Industry<input className={cn(inp, "mt-1")} value={form.company} onChange={set("company")} /></label>
        <label className="block text-sm">Research question<textarea rows={3} className={cn(inp, "mt-1")} value={form.question} onChange={set("question")} /></label>
        <label className="block text-sm">Research focus
          <select className={cn(inp, "mt-1")} value={form.focus} onChange={set("focus")}>
            {["Growth sustainability", "Market share", "Margin pressure", "Competitive advantage", "Hidden risk", "Custom"].map((o) => <option key={o} className="bg-slate-900">{o}</option>)}
          </select>
        </label>
        <Btn onClick={() => nav("/run")} disabled={!form.company || !form.question}>RUN RESEARCH</Btn>
      </div>
    </main>
  );
}

const STEPS: [string, string][] = [
  ["Parsing question", "Extracting entity, metric and time horizon"],
  ["Decomposing research problem", "Splitting into growth, margin, demand and risk sub-questions"],
  ["Generating hypotheses", "Drafting 5 competing hypotheses"],
  ["Searching sources", "Querying filings, industry data, peer disclosures"],
  ["Extracting evidence", "Tagging claims and linking them to sources"],
  ["Triangulating evidence", "Cross-checking company, industry and competitor data"],
  ["Detecting contradictions", "Comparing management claims with external data"],
  ["Running self-falsification", "Searching for evidence that would disprove the thesis"],
  ["Scoring signal", "Applying the weighted scoring formula"],
  ["Generating report", "Assembling the structured research report"],
];
function Run() {
  const { form, setD } = useApp();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  useEffect(() => {
    let live = true;
    fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      .then((r) => r.json()).catch(() => demo)
      .then((j) => live && setD({ ...j, company: form.company, question: form.question }));
    const t = setInterval(() => setI((x) => x + 1), 900);
    return () => { live = false; clearInterval(t); };
  }, []);
  useEffect(() => {
    if (i > STEPS.length) { const t = setTimeout(() => nav("/results"), 300); return () => clearTimeout(t); }
  }, [i]);
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-2xl font-semibold">Running research</h1>
      <p className="mb-6 mt-1 text-sm text-slate-400">{form.company}: {form.question}</p>
      <Card className="divide-y divide-white/5 p-0">
        {STEPS.map(([t, sub], n) => {
          const s = n < i ? "Complete" : n === i ? "Running" : "Pending";
          return (
            <div key={t} className={cn("flex items-center gap-4 px-5 py-3", s === "Pending" && "opacity-40")}>
              {s === "Complete" ? <Check size={18} className="text-emerald-400" /> : s === "Running" ? <Loader2 size={18} className="animate-spin text-indigo-300" /> : <Circle size={18} />}
              <div className="flex-1"><div className="text-sm">{t}</div><div className="text-xs text-slate-500">{sub}</div></div>
              <span className="text-xs text-slate-400">{s}</span>
            </div>
          );
        })}
      </Card>
    </main>
  );
}

const TABS = [["Overview", "/results"], ["Evidence", "/evidence"], ["Contradictions", "/contradictions"], ["Falsification", "/falsification"], ["Research Graph", "/graph"], ["Report", "/report"]];
function Shell() {
  const { d } = useApp();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-xs font-medium text-emerald-400">RESEARCH COMPLETE</div>
      <h1 className="mt-1 text-2xl font-semibold">{d.company}</h1>
      <p className="text-slate-400">{d.question}</p>
      <div className="mt-2"><Badge tone="amber">Illustrative research demonstration</Badge></div>
      <nav className="mb-8 mt-6 flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map(([l, p]) => (
          <NavLink key={p} to={p} className={({ isActive }) => cn("whitespace-nowrap border-b-2 px-4 py-2.5 text-sm", isActive ? "border-indigo-400 text-white" : "border-transparent text-slate-400 hover:text-white")}>{l}</NavLink>
        ))}
      </nav>
      <div className="fade"><Outlet /></div>
    </main>
  );
}

function Overview() {
  const { d } = useApp();
  const s = d.signal, sc = total(d.score);
  const kpis = [["Signal Score", `${sc.toFixed(1)} / 10`], ["Confidence", `${s.confidence}%`], ["Evidence", d.kpi.evidence], ["Contradictions", d.kpi.contradictions]];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map(([l, v]) => <Card key={l}><div className="text-sm text-slate-400">{l}</div><div className="mt-1 text-3xl font-semibold">{v}</div></Card>)}
      </div>
      <Card className="border-indigo-400/40 bg-indigo-500/5 p-8">
        <div className="text-xs font-medium text-indigo-300">DISCOVERED SIGNAL</div>
        <div className="mt-3 text-3xl font-semibold leading-snug">“{s.text}”</div>
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          {[["Signal Strength", s.strength], ["Novelty", s.novelty], ["Confidence", `${s.confidence}%`], ["Contradiction Risk", s.risk]].map(([l, v]) => <div key={l}><div className="text-slate-500">{l}</div><div className="font-medium">{v}</div></div>)}
        </div>
        <p className="mt-5 text-slate-400">SignalForge identified evidence supporting the hypothesis while also finding evidence that challenges it.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Signal scoring</h2>
          <div className="h-56"><ResponsiveContainer><RadarChart data={KEYS.map((k) => ({ k: k === "Contradiction Risk" ? "Low contradiction" : k, v: val(d.score, k) }))}>
            <PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="k" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Radar dataKey="v" stroke="#818cf8" fill="#6366f1" fillOpacity={0.35} />
          </RadarChart></ResponsiveContainer></div>
          <table className="w-full text-sm">
            <tbody>
              {KEYS.map((k, i) => (
                <tr key={k} className="border-t border-white/5"><td className="py-1.5">{k}</td><td className="text-slate-400">{d.score[k]}{k === "Contradiction Risk" && " (inverted: 10 − x)"}</td><td className="text-slate-400">× {W[i].toFixed(2)}</td><td className="text-right">{(val(d.score, k) * W[i]).toFixed(2)}</td></tr>
              ))}
              <tr className="border-t border-white/20 font-semibold"><td colSpan={3} className="py-2">Signal Score</td><td className="text-right">{sc.toFixed(1)} / 10</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">Score = 0.30·Evidence + 0.20·Source Quality + 0.15·Agreement + 0.25·Novelty + 0.10·(10 − Contradiction Risk)</p>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Hypotheses</h2>
          <div className="space-y-3">
            {d.hypotheses.map((h: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between gap-3 text-sm"><span>H{i + 1}. {h.text}</span><Badge tone={{ Supported: "green", Rejected: "red", Revised: "purple", Open: "slate" }[h.status]}>{h.status}</Badge></div>
                <div className="mt-1.5 h-1 rounded bg-white/10"><div className="h-1 rounded bg-indigo-400" style={{ width: `${h.conf}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Evidence() {
  const { d } = useApp();
  const [f, setF] = useState("ALL");
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {["ALL", "SUPPORTS", "CONTRADICTS", "NEUTRAL"].map((x) => <Btn key={x} variant={f === x ? "primary" : "ghost"} className="px-3 py-1.5 text-xs" onClick={() => setF(x)}>{x}</Btn>)}
        <span className="ml-auto self-center text-xs text-slate-500">Showing sample of {d.kpi.evidence} collected items</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {d.evidence.filter((e: any) => f === "ALL" || e.cls === f).map((e: any) => (
          <Card key={e.source}>
            <div className="flex items-start justify-between gap-2"><div><div className="font-medium">{e.source}</div><div className="text-xs text-slate-500">{e.type} · {e.date}</div></div><Badge tone={clsTone[e.cls]}>{e.cls}</Badge></div>
            <div className="mt-3 text-sm font-medium">{e.claim}</div>
            <p className="mt-1 text-sm text-slate-400">{e.evidence}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">Confidence<div className="h-1 flex-1 rounded bg-white/10"><div className="h-1 rounded bg-indigo-400" style={{ width: `${e.conf}%` }} /></div>{e.conf}%</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Contradictions() {
  const { d } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Contradictions detected</h2>
      <div className="space-y-3">
        {d.contradictions.map((c: any, i: number) => (
          <Card key={i} className="p-0">
            <button className="flex w-full items-center gap-4 p-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
              <div className="grid flex-1 gap-3 text-sm md:grid-cols-2">
                <div><div className="text-xs text-slate-500">Company claim</div>“{c.claim}”</div>
                <div><div className="text-xs text-slate-500">External evidence</div>“{c.external}”</div>
              </div>
              <Badge tone={c.status === "Partially explained" ? "blue" : "amber"}>{c.status}</Badge>
              <ChevronDown size={16} className={cn("transition", open === i && "rotate-180")} />
            </button>
            {open === i && (
              <div className="border-t border-white/10 p-5 text-sm">
                <div className="mb-2 text-xs text-slate-500">Possible explanations</div>
                <ol className="list-decimal space-y-1 pl-5 text-slate-300">{c.explanations.map((x: string) => <li key={x}>{x}</li>)}</ol>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Falsification() {
  const { d } = useApp();
  const f = d.falsification;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Try to prove the signal wrong</h2>
      <Card><div className="text-xs text-slate-500">Current thesis</div><div className="mt-1 text-xl">“{f.thesis}”</div></Card>
      <div className="space-y-3">
        {f.tests.map((t: any) => (
          <Card key={t.name} className="grid items-center gap-3 md:grid-cols-[1.2fr_1.2fr_1.5fr_auto]">
            <div><div className="text-xs text-slate-500">Potential falsifier</div>{t.name}</div>
            <div><div className="text-xs text-slate-500">Evidence searched</div><span className="text-sm text-slate-300">{t.searched}</span></div>
            <div><div className="text-xs text-slate-500">Evidence found</div><span className="text-sm text-slate-300">{t.found}</span></div>
            <Badge tone={riskTone[t.risk]}>Risk: {t.risk}</Badge>
          </Card>
        ))}
      </div>
      <Card className="border-indigo-400/40 bg-indigo-500/5"><div className="text-xs font-medium text-indigo-300">UPDATED ASSESSMENT</div><p className="mt-2 text-lg">{f.assessment}</p></Card>
    </div>
  );
}

const NODES: any[] = [
  { id: "Q", x: 70, y: 210, t: "Question", s: "Growth sustainable?", c: "#3b82f6" },
  { id: "H1", x: 230, y: 70, t: "Hypothesis 1", s: "Volume-led", c: "#8b5cf6" },
  { id: "H2", x: 230, y: 210, t: "Hypothesis 2", s: "Price/mix-led", c: "#8b5cf6" },
  { id: "H3", x: 230, y: 350, t: "Hypothesis 3", s: "Mix dilution", c: "#8b5cf6" },
  { id: "S1", x: 410, y: 50, t: "Source", s: "Filings", c: "#64748b" },
  { id: "E1", x: 410, y: 150, t: "Evidence", s: "EBITDA lags revenue", c: "#06b6d4" },
  { id: "E2", x: 410, y: 270, t: "Evidence", s: "Input costs +9%", c: "#06b6d4" },
  { id: "S2", x: 410, y: 370, t: "Source", s: "Commodity index", c: "#64748b" },
  { id: "C1", x: 590, y: 110, t: "Contradiction", s: "Demand vs registrations", c: "#f43f5e" },
  { id: "C2", x: 590, y: 310, t: "Contradiction", s: "Consensus vs costs", c: "#f43f5e" },
  { id: "R", x: 750, y: 210, t: "Revised hypothesis", s: "Unit economics", c: "#a78bfa" },
  { id: "SIG", x: 890, y: 210, t: "Signal", s: "Score 8.4", c: "#10b981" },
];
const EDGES = [["Q", "H1"], ["Q", "H2"], ["Q", "H3"], ["H1", "S1"], ["S1", "E1"], ["H2", "E1"], ["H2", "E2"], ["H3", "E2"], ["S2", "E2"], ["E1", "C1"], ["E2", "C2"], ["H1", "C1"], ["C1", "R"], ["C2", "R"], ["R", "SIG"]];
function Graph() {
  const [hover, setHover] = useState<string | null>(null);
  const n: any = Object.fromEntries(NODES.map((x) => [x.id, x]));
  const path = (a: any, b: any) => {
    if (a.x === b.x) { const dir = b.y > a.y ? 1 : -1; return `M${a.x},${a.y + 20 * dir} L${b.x},${b.y - 20 * dir}`; }
    const x1 = a.x + 65, x2 = b.x - 65, m = (x1 + x2) / 2;
    return `M${x1},${a.y} C${m},${a.y} ${m},${b.y} ${x2},${b.y}`;
  };
  return (
    <Card className="overflow-x-auto">
      <svg viewBox="0 0 960 420" className="min-w-[860px]">
        {EDGES.map(([a, b]) => {
          const on = hover === a || hover === b;
          return <path key={a + b} d={path(n[a], n[b])} fill="none" className="flow" stroke={on ? "#a5b4fc" : "#475569"} strokeWidth={on ? 2 : 1.2} />;
        })}
        {NODES.map((x) => (
          <g key={x.id} onMouseEnter={() => setHover(x.id)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
            <rect x={x.x - 65} y={x.y - 20} width={130} height={40} rx={6} fill="#0f172a" stroke={x.c} strokeWidth={hover === x.id ? 2.5 : 1.5} />
            <text x={x.x} y={x.y - 3} textAnchor="middle" fontSize={10} fontWeight={600} fill={x.c}>{x.t}</text>
            <text x={x.x} y={x.y + 11} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">{x.s}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs text-slate-500">Question → hypotheses → sources and evidence → contradictions → revised hypothesis → signal. Hover a node to highlight its links.</p>
    </Card>
  );
}

function Report() {
  const { d } = useApp();
  const dl = () => {
    const t = `# SignalForge Report: ${d.company}\n_${d.disclaimer}_\n\n` + sections(d).map(([h, b]) => `## ${h}\n${b}`).join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/markdown" }));
    a.download = "signalforge-report.md";
    a.click();
  };
  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold">Research report</h2><Btn onClick={dl}><Download size={16} /> DOWNLOAD REPORT</Btn></div>
      <div className="space-y-6">
        {sections(d).map(([h, b]) => (
          <section key={h}><h3 className="mb-1 text-sm font-semibold text-indigo-300">{h}</h3><p className="whitespace-pre-line text-slate-300">{b}</p></section>
        ))}
      </div>
    </div>
  );
}
