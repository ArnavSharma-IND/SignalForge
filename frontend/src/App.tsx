import { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ArrowRight, Check, ChevronDown, Circle, Download, Loader2 } from "lucide-react";
import demo from "./demo.json";
import Landing from "./Landing";
import Run from "./Run";
import Graph from "./Graph";
import { Ctx, useApp } from "./ctx";
import { Badge, Btn, Card, cn } from "./ui";


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
      <header className="sticky top-0 z-20 border-b border-ivory/10 bg-ink/70 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-2xl">SIGNALFORGE</Link>
          <nav className="flex gap-6 text-sm text-mute">
            <Link to="/research" className="hover:text-white">Research</Link>
            <a href="/#method" className="hover:text-white">Methodology</a>
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
      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-warm">{demo.disclaimer}</footer>
    </Ctx.Provider>
  );
}

const inp = "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-gold";
function Research() {
  const { form, setForm } = useApp();
  const nav = useNavigate();
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-semibold">New research</h1>
      <p className="mt-2 text-mute">Define the company and the question to investigate.</p>
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

const TABS = [["Overview", "/results"], ["Evidence", "/evidence"], ["Contradictions", "/contradictions"], ["Falsification", "/falsification"], ["Research Graph", "/graph"], ["Report", "/report"]];
function Shell() {
  const { d } = useApp();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-xs font-medium text-gold">RESEARCH COMPLETE</div>
      <h1 className="mt-1 text-2xl font-semibold">{d.company}</h1>
      <p className="text-mute">{d.question}</p>
      <div className="mt-2"><Badge tone="amber">Illustrative research demonstration</Badge></div>
      <nav className="mb-8 mt-6 flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map(([l, p]) => (
          <NavLink key={p} to={p} className={({ isActive }) => cn("whitespace-nowrap border-b-2 px-4 py-2.5 text-sm", isActive ? "border-gold text-white" : "border-transparent text-mute hover:text-white")}>{l}</NavLink>
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
        {kpis.map(([l, v]) => <Card key={l}><div className="text-sm text-mute">{l}</div><div className="mt-1 text-3xl font-semibold">{v}</div></Card>)}
      </div>
      <Card className="border-gold/40 bg-gold/5 p-8">
        <div className="text-xs font-medium text-gold">DISCOVERED SIGNAL</div>
        <div className="mt-3 text-3xl font-semibold leading-snug">“{s.text}”</div>
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          {[["Signal Strength", s.strength], ["Novelty", s.novelty], ["Confidence", `${s.confidence}%`], ["Contradiction Risk", s.risk]].map(([l, v]) => <div key={l}><div className="text-warm">{l}</div><div className="font-medium">{v}</div></div>)}
        </div>
        <p className="mt-5 text-mute">SignalForge identified evidence supporting the hypothesis while also finding evidence that challenges it.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Signal scoring</h2>
          <div className="h-56"><ResponsiveContainer><RadarChart data={KEYS.map((k) => ({ k: k === "Contradiction Risk" ? "Low contradiction" : k, v: val(d.score, k) }))}>
            <PolarGrid stroke="#3a3832" /><PolarAngleAxis dataKey="k" tick={{ fill: "#B8B3A8", fontSize: 11 }} />
            <Radar dataKey="v" stroke="#C6A66B" fill="#C6A66B" fillOpacity={0.35} />
          </RadarChart></ResponsiveContainer></div>
          <table className="w-full text-sm">
            <tbody>
              {KEYS.map((k, i) => (
                <tr key={k} className="border-t border-white/5"><td className="py-1.5">{k}</td><td className="text-mute">{d.score[k]}{k === "Contradiction Risk" && " (inverted: 10 − x)"}</td><td className="text-mute">× {W[i].toFixed(2)}</td><td className="text-right">{(val(d.score, k) * W[i]).toFixed(2)}</td></tr>
              ))}
              <tr className="border-t border-white/20 font-semibold"><td colSpan={3} className="py-2">Signal Score</td><td className="text-right">{sc.toFixed(1)} / 10</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-warm">Score = 0.30·Evidence + 0.20·Source Quality + 0.15·Agreement + 0.25·Novelty + 0.10·(10 − Contradiction Risk)</p>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Hypotheses</h2>
          <div className="space-y-3">
            {d.hypotheses.map((h: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between gap-3 text-sm"><span>H{i + 1}. {h.text}</span><Badge tone={{ Supported: "green", Rejected: "red", Revised: "purple", Open: "slate" }[h.status]}>{h.status}</Badge></div>
                <div className="mt-1.5 h-1 rounded bg-white/10"><div className="h-1 rounded bg-gold" style={{ width: `${h.conf}%` }} /></div>
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
        <span className="ml-auto self-center text-xs text-warm">Showing sample of {d.kpi.evidence} collected items</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {d.evidence.filter((e: any) => f === "ALL" || e.cls === f).map((e: any) => (
          <Card key={e.source}>
            <div className="flex items-start justify-between gap-2"><div><div className="font-medium">{e.source}</div><div className="text-xs text-warm">{e.type} · {e.date}</div></div><Badge tone={clsTone[e.cls]}>{e.cls}</Badge></div>
            <div className="mt-3 text-sm font-medium">{e.claim}</div>
            <p className="mt-1 text-sm text-mute">{e.evidence}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-warm">Confidence<div className="h-1 flex-1 rounded bg-white/10"><div className="h-1 rounded bg-gold" style={{ width: `${e.conf}%` }} /></div>{e.conf}%</div>
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
                <div><div className="text-xs text-warm">Company claim</div>“{c.claim}”</div>
                <div><div className="text-xs text-warm">External evidence</div>“{c.external}”</div>
              </div>
              <Badge tone={c.status === "Partially explained" ? "blue" : "amber"}>{c.status}</Badge>
              <ChevronDown size={16} className={cn("transition", open === i && "rotate-180")} />
            </button>
            {open === i && (
              <div className="border-t border-white/10 p-5 text-sm">
                <div className="mb-2 text-xs text-warm">Possible explanations</div>
                <ol className="list-decimal space-y-1 pl-5 text-ivory/80">{c.explanations.map((x: string) => <li key={x}>{x}</li>)}</ol>
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
      <Card><div className="text-xs text-warm">Current thesis</div><div className="mt-1 text-xl">“{f.thesis}”</div></Card>
      <div className="space-y-3">
        {f.tests.map((t: any) => (
          <Card key={t.name} className="grid items-center gap-3 md:grid-cols-[1.2fr_1.2fr_1.5fr_auto]">
            <div><div className="text-xs text-warm">Potential falsifier</div>{t.name}</div>
            <div><div className="text-xs text-warm">Evidence searched</div><span className="text-sm text-ivory/80">{t.searched}</span></div>
            <div><div className="text-xs text-warm">Evidence found</div><span className="text-sm text-ivory/80">{t.found}</span></div>
            <Badge tone={riskTone[t.risk]}>Risk: {t.risk}</Badge>
          </Card>
        ))}
      </div>
      <Card className="border-gold/40 bg-gold/5"><div className="text-xs font-medium text-gold">UPDATED ASSESSMENT</div><p className="mt-2 text-lg">{f.assessment}</p></Card>
    </div>
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
    <div className="max-w-3xl bg-paper p-8 text-ink shadow-2xl print:shadow-none">
      <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold">Research report</h2><Btn onClick={dl}><Download size={16} /> DOWNLOAD REPORT</Btn></div>
      <div className="space-y-6">
        {sections(d).map(([h, b]) => (
          <section key={h}><h3 className="mb-1 text-sm font-semibold text-brass">{h}</h3><p className="whitespace-pre-line text-ink/85">{b}</p></section>
        ))}
      </div>
    </div>
  );
}
