import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Download,
  ExternalLink,
  Loader2,
  User as UserIcon,
  Shield,
  Sparkles,
  History as HistoryIcon,
} from "lucide-react";
import demo from "./demo.json";
import Landing from "./Landing";
import Run from "./Run";
import Graph from "./Graph";
import History from "./History";
import {
  SignInPage,
  RegisterPage,
  PhoneLoginPage,
  ForgotPasswordPage,
  VerifyEmailPage,
  AccountPage,
} from "./AuthPage";
import { useAuth, ProtectedRoute } from "./auth";
import { Ctx, useApp } from "./ctx";
import { Badge, Btn, Card, cn } from "./ui";

const KEYS = ["Evidence Strength", "Source Quality", "Cross-source Agreement", "Novelty", "Contradiction Risk"];
const W = [0.3, 0.2, 0.15, 0.25, 0.1];
const val = (s: any, k: string) => (k === "Contradiction Risk" ? 10 - (s?.[k] ?? 0) : s?.[k] ?? 0);
const total = (s: any) => (s ? KEYS.reduce((a, k, i) => a + val(s, k) * W[i], 0) : 0);
const clsTone: any = { SUPPORTS: "green", CONTRADICTS: "red", NEUTRAL: "slate" };
const riskTone: any = { Low: "green", Medium: "amber", High: "red" };

const sections = (d: any): [string, string][] => [
  ["Executive Summary", `${d.signal?.text || ""} ${d.triangulation || ""}`],
  ["Research Question", `${d.company}: ${d.question}`],
  ["Initial Hypotheses", (d.hypotheses || []).map((h: any) => `• ${h.text} (${h.status}, ${h.conf}%)`).join("\n")],
  ["Key Evidence", (d.evidence || []).slice(0, 4).map((e: any) => `• [${e.cls}] ${e.claim} (${e.source}, ${e.date})`).join("\n")],
  ["Evidence Triangulation", d.triangulation || "No triangulation provided"],
  ["Contradictions", (d.contradictions || []).map((c: any) => `• "${c.claim}" vs "${c.external}"`).join("\n")],
  ["Alternative Explanation", d.alternative || "No alternative provided"],
  ["Self-Falsification", d.falsification?.assessment || "No falsification assessment"],
  ["Final Signal", d.signal?.text || ""],
  ["Confidence", `${d.signal?.confidence ? d.signal.confidence + "% confidence, " : ""}signal score ${total(d.score).toFixed(1)}/10`],
  ["What Could Prove This Wrong?", (d.falsification?.tests || []).filter((t: any) => t.risk !== "Low").map((t: any) => `• ${t.name}: ${t.found}`).join("\n")],
  ["What To Monitor Next", (d.monitor || []).map((m: any) => `• ${m.name}: ${m.why}`).join("\n")],
  ["Sources", ([...new Set((d.evidence || []).map((e: any) => e.source))] as string[]).map((s) => `• ${s}`).join("\n")],
];

export default function App() {
  const [form, setForm] = useState({
    company: "Reliance Industries",
    question: "Is the current growth trajectory sustainable?",
    focus: "Growth sustainability",
  });
  const [d, setD] = useState<any>({ ...demo, isLive: false });
  const { user, isAuthDisabled } = useAuth();
  const nav = useNavigate();

  const handleOpenDemo = () => {
    setD({ ...demo, isLive: false });
    setForm({
      company: demo.company,
      question: demo.question,
      focus: "Growth sustainability",
    });
    nav("/results");
  };

  return (
    <Ctx.Provider value={{ form, setForm, d, setD }}>
      <header className="sticky top-0 z-20 border-b border-ivory/10 bg-ink/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="font-display text-2xl tracking-wide flex items-center gap-2">
            <span className="text-gold">⚡</span> SIGNALFORGE
          </Link>

          <nav className="flex items-center gap-5 text-sm text-mute">
            <Link to="/research" className="hover:text-white transition">Research</Link>
            <Link to="/history" className="hover:text-white transition flex items-center gap-1.5">
              <HistoryIcon size={14} /> History
            </Link>
            <a href="/#method" className="hover:text-white transition">Methodology</a>
            <button onClick={handleOpenDemo} className="hover:text-gold transition text-xs font-mono border border-gold/30 px-2 py-0.5 rounded text-gold bg-gold/5">
              View Demo
            </button>

            {user || isAuthDisabled ? (
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-full border border-ivory/15 bg-surf/80 px-3 py-1 text-xs text-ivory hover:border-gold transition"
              >
                <UserIcon size={13} className="text-gold" />
                <span className="max-w-[120px] truncate">{user?.displayName || user?.email?.split("@")[0] || "Analyst"}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-sm bg-gold px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-ivory transition"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

        {/* Auth routes */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/phone-login" element={<PhoneLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute requireVerified={false}>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        {/* Protected app routes */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/research"
          element={
            <ProtectedRoute>
              <Research />
            </ProtectedRoute>
          }
        />
        <Route
          path="/run"
          element={
            <ProtectedRoute>
              <Run />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demo"
          element={<DemoRedirect />}
        />

        {/* Investigation Results Shell */}
        <Route element={<Shell />}>
          <Route path="/results" element={<Overview />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/contradictions" element={<Contradictions />} />
          <Route path="/falsification" element={<Falsification />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/report" element={<Report />} />
        </Route>
      </Routes>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-warm border-t border-ivory/5 mt-16 flex flex-wrap items-center justify-between gap-4">
        <span>{d.disclaimer || demo.disclaimer}</span>
        <span className="font-mono text-[10px] text-warm/60">SignalForge Institutional Intelligence</span>
      </footer>
    </Ctx.Provider>
  );
}

function DemoRedirect() {
  const { setD, setForm } = useApp();
  const nav = useNavigate();
  useEffect(() => {
    setD({ ...demo, isLive: false });
    setForm({
      company: demo.company,
      question: demo.question,
      focus: "Growth sustainability",
    });
    nav("/results", { replace: true });
  }, []);
  return null;
}

const inp = "w-full rounded-sm border border-ivory/15 bg-surf/80 px-3.5 py-2.5 text-sm outline-none transition focus:border-gold";

function Research() {
  const { form, setForm } = useApp();
  const nav = useNavigate();
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider mb-2">
        <Sparkles size={14} /> New Adversarial Investigation
      </div>
      <h1 className="font-display text-4xl">Configure Research Query</h1>
      <p className="mt-2 text-mute text-sm">
        Define the company and specific thesis or inquiry. SignalForge will decompose the question, extract verifiable evidence, and attempt to falsify its conclusions.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-medium text-mute mb-1">Company / Asset / Industry</label>
          <input
            className={inp}
            placeholder="e.g. Reliance Industries, Tesla, Nvidia"
            value={form.company}
            onChange={set("company")}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-mute mb-1">Research Question</label>
          <textarea
            rows={3}
            className={inp}
            placeholder="e.g. Is revenue growth sustainable over the next four quarters?"
            value={form.question}
            onChange={set("question")}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-mute mb-1">Primary Analytical Focus</label>
          <select className={inp} value={form.focus} onChange={set("focus")}>
            {[
              "Growth sustainability",
              "Margin & pricing power",
              "Market share & competition",
              "Unit economics",
              "Balance sheet & capital allocation",
              "Custom thesis",
            ].map((o) => (
              <option key={o} className="bg-char text-ivory">
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <Btn
            onClick={() => nav("/run")}
            disabled={!form.company || form.question.length < 5}
            className="px-6"
          >
            LAUNCH INVESTIGATION <ArrowRight size={15} />
          </Btn>
          <Link to="/history" className="text-xs text-mute hover:text-white">
            or view past research →
          </Link>
        </div>
      </div>
    </main>
  );
}

const TABS = [
  ["Overview", "/results"],
  ["Evidence", "/evidence"],
  ["Contradictions", "/contradictions"],
  ["Falsification", "/falsification"],
  ["Research Graph", "/graph"],
  ["Report", "/report"],
];

function Shell() {
  const { d } = useApp();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-medium text-gold uppercase tracking-wider">
            INVESTIGATION DOSSIER
          </div>
          <h1 className="mt-1 font-display text-3xl">{d.company}</h1>
          <p className="text-mute text-sm">{d.question}</p>
        </div>

        <div className="flex items-center gap-3">
          {d.isLive ? (
            <Badge tone="green" className="px-3 py-1 text-xs">
              ● Live research
            </Badge>
          ) : (
            <Badge tone="amber" className="px-3 py-1 text-xs">
              Illustrative research demonstration (Demo)
            </Badge>
          )}
        </div>
      </div>

      <nav className="mb-8 mt-6 flex gap-1 overflow-x-auto border-b border-ivory/10">
        {TABS.map(([l, p]) => (
          <NavLink
            key={p}
            to={p}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition",
                isActive ? "border-gold text-white" : "border-transparent text-mute hover:text-white"
              )
            }
          >
            {l}
          </NavLink>
        ))}
      </nav>

      <div className="fade">
        <Outlet />
      </div>
    </main>
  );
}

function Overview() {
  const { d } = useApp();
  const s = d.signal || {}, sc = total(d.score);
  const kpis = [
    ["Signal Score", `${sc.toFixed(1)} / 10`],
    ["Confidence", s.confidence ? `${s.confidence}%` : "Multi-source"],
    ["Evidence Items", d.kpi?.evidence ?? d.evidence?.length ?? 0],
    ["Contradictions", d.kpi?.contradictions ?? d.contradictions?.length ?? 0],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map(([l, v]) => (
          <Card key={l}>
            <div className="text-xs text-mute">{l}</div>
            <div className="mt-1 text-3xl font-semibold font-display text-ivory">{v}</div>
          </Card>
        ))}
      </div>

      <Card className="border-gold/40 bg-gold/5 p-8 shadow-2xl">
        <div className="text-xs font-mono font-medium text-gold uppercase">DISCOVERED SIGNAL</div>
        <div className="mt-3 font-display text-3xl leading-snug text-ivory">“{s.text}”</div>
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          {[
            ["Signal Strength", s.strength || "Strong"],
            ["Novelty", s.novelty || "High"],
            ["Confidence", s.confidence ? `${s.confidence}%` : "Heuristic"],
            ["Contradiction Risk", s.risk || "Medium"],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-xs text-warm">{l}</div>
              <div className="font-medium mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        {d.triangulation && (
          <p className="mt-5 text-sm text-mute leading-relaxed border-t border-gold/20 pt-4">
            <strong className="text-ivory">Triangulation:</strong> {d.triangulation}
          </p>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-lg">Signal scoring</h2>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <RadarChart
                data={KEYS.map((k) => ({
                  k: k === "Contradiction Risk" ? "Low contradiction" : k,
                  v: val(d.score, k),
                }))}
              >
                <PolarGrid stroke="#3a3832" />
                <PolarAngleAxis dataKey="k" tick={{ fill: "#B8B3A8", fontSize: 11 }} />
                <Radar dataKey="v" stroke="#C6A66B" fill="#C6A66B" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <table className="w-full text-sm mt-3">
            <tbody>
              {KEYS.map((k, i) => (
                <tr key={k} className="border-t border-ivory/10">
                  <td className="py-2 text-xs">{k}</td>
                  <td className="text-mute font-mono text-xs">
                    {d.score?.[k] ?? 0}
                    {k === "Contradiction Risk" && " (inv: 10−x)"}
                  </td>
                  <td className="text-mute font-mono text-xs">× {W[i].toFixed(2)}</td>
                  <td className="text-right font-mono text-xs font-medium">
                    {(val(d.score, k) * W[i]).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-ivory/20 font-semibold">
                <td colSpan={3} className="py-2.5">Final Signal Score</td>
                <td className="text-right text-gold font-mono">{sc.toFixed(1)} / 10</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-warm leading-relaxed">
            {d.score_method || "Score = 0.30·Evidence + 0.20·Source Quality + 0.15·Agreement + 0.25·Novelty + 0.10·(10 − Contradiction Risk)"}
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-lg">Hypotheses Evaluated</h2>
          <div className="space-y-4">
            {(d.hypotheses || []).map((h: any, i: number) => (
              <div key={i} className="rounded bg-surf/80 p-3.5 border border-ivory/5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ivory">H{i + 1}. {h.text}</span>
                  <Badge tone={{ Supported: "green", Rejected: "red", Revised: "purple", Open: "slate" }[h.status] || "slate"}>
                    {h.status}
                  </Badge>
                </div>
                <div className="mt-2.5 flex items-center gap-3 text-xs text-warm">
                  <div className="h-1.5 flex-1 rounded bg-ivory/10 overflow-hidden">
                    <div className="h-full bg-gold transition-all duration-500" style={{ width: `${h.conf}%` }} />
                  </div>
                  <span className="font-mono">{h.conf}%</span>
                </div>
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
  const evidenceList = d.evidence || [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {["ALL", "SUPPORTS", "CONTRADICTS", "NEUTRAL"].map((x) => (
            <Btn
              key={x}
              variant={f === x ? "primary" : "ghost"}
              className="px-3 py-1.5 text-xs"
              onClick={() => setF(x)}
            >
              {x}
            </Btn>
          ))}
        </div>
        <span className="text-xs text-warm font-mono">
          Showing {evidenceList.filter((e: any) => f === "ALL" || e.cls === f).length} of {evidenceList.length} verifiable items
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {evidenceList
          .filter((e: any) => f === "ALL" || e.cls === f)
          .map((e: any, idx: number) => (
            <Card key={idx} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {e.url ? (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gold hover:underline inline-flex items-center gap-1.5 group"
                      >
                        <span>{e.source}</span>
                        <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 transition" />
                      </a>
                    ) : (
                      <div className="font-medium text-ivory">{e.source}</div>
                    )}
                    <div className="text-xs text-warm mt-0.5">
                      {e.type} · {e.date}
                    </div>
                  </div>
                  <Badge tone={clsTone[e.cls]}>{e.cls}</Badge>
                </div>

                <div className="mt-3 text-sm font-medium text-ivory/95">{e.claim}</div>
                <p className="mt-2 text-xs text-mute font-mono bg-char/80 p-2.5 rounded border border-ivory/5 leading-relaxed">
                  "{e.evidence}"
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-warm pt-2 border-t border-ivory/5">
                <span>Domain Quality</span>
                <div className="h-1 flex-1 rounded bg-ivory/10">
                  <div className="h-1 rounded bg-gold" style={{ width: `${e.conf}%` }} />
                </div>
                <span className="font-mono">{e.conf}%</span>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

function Contradictions() {
  const { d } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const contradictions = d.contradictions || [];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Contradictions Detected</h2>
        <p className="text-xs text-mute mt-1">
          Where company disclosures and external empirical findings clash directly
        </p>
      </div>

      {contradictions.length === 0 ? (
        <Card className="p-8 text-center text-mute text-sm">
          No direct contradictions detected in this investigation.
        </Card>
      ) : (
        <div className="space-y-3">
          {contradictions.map((c: any, i: number) => (
            <Card key={i} className="p-0 overflow-hidden">
              <button
                className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-surf"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="grid flex-1 gap-4 text-sm md:grid-cols-2">
                  <div className="rounded bg-char/60 p-3 border border-ivory/5">
                    <div className="text-[11px] font-mono text-warm uppercase mb-1">Company Claim</div>
                    “{c.claim}”
                  </div>
                  <div className="rounded bg-rose-500/5 p-3 border border-rose-500/20">
                    <div className="text-[11px] font-mono text-rose-300 uppercase mb-1">External Reality</div>
                    “{c.external}”
                  </div>
                </div>
                <Badge tone={c.status === "Partially explained" ? "blue" : "amber"}>
                  {c.status}
                </Badge>
                <ChevronDown size={16} className={cn("transition shrink-0", open === i && "rotate-180")} />
              </button>

              {open === i && (
                <div className="border-t border-ivory/10 bg-char/80 p-5 text-sm">
                  <div className="mb-2 text-xs font-mono text-gold uppercase">Plausible Explanations & Divergence Factors</div>
                  <ol className="list-decimal space-y-1.5 pl-5 text-ivory/80 text-xs leading-relaxed">
                    {(c.explanations || []).map((x: string, idx: number) => (
                      <li key={idx}>{x}</li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Falsification() {
  const { d } = useApp();
  const f = d.falsification || { thesis: "", tests: [], assessment: "" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Self-Falsification Suite</h2>
        <p className="text-xs text-mute mt-1">
          Adversarially challenging the primary investment thesis with disconfirming tests
        </p>
      </div>

      <Card>
        <div className="text-xs font-mono text-warm uppercase">Tested Leading Thesis</div>
        <div className="mt-1.5 font-display text-2xl text-ivory">“{f.thesis}”</div>
      </Card>

      <div className="space-y-3">
        {(f.tests || []).map((t: any, idx: number) => (
          <Card key={idx} className="grid items-center gap-3 md:grid-cols-[1.2fr_1.2fr_1.5fr_auto]">
            <div>
              <div className="text-xs text-warm">Potential Falsifier</div>
              <div className="font-medium text-sm mt-0.5">{t.name}</div>
            </div>
            <div>
              <div className="text-xs text-warm">Search Query</div>
              <span className="text-xs font-mono text-ivory/80">{t.searched}</span>
            </div>
            <div>
              <div className="text-xs text-warm">Evidence Found</div>
              <span className="text-xs text-ivory/90 leading-relaxed">{t.found}</span>
            </div>
            <Badge tone={riskTone[t.risk] || "slate"}>Risk: {t.risk}</Badge>
          </Card>
        ))}
      </div>

      <Card className="border-gold/40 bg-gold/5">
        <div className="text-xs font-mono font-medium text-gold uppercase">SYNTHESIZED ASSESSMENT</div>
        <p className="mt-2 text-base text-ivory/95 leading-relaxed">{f.assessment}</p>
      </Card>
    </div>
  );
}

function Report() {
  const { d } = useApp();

  const dl = () => {
    const t =
      `# SignalForge Report: ${d.company}\n_${d.disclaimer || ""}_\n\n` +
      sections(d)
        .map(([h, b]) => `## ${h}\n${b}`)
        .join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/markdown" }));
    a.download = `signalforge-${(d.company || "report").toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
  };

  return (
    <div className="max-w-3xl bg-paper p-8 text-ink shadow-2xl rounded-sm print:shadow-none mx-auto">
      <div className="mb-6 flex items-center justify-between border-b border-ink/10 pb-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">Institutional Research Dossier</h2>
          <div className="text-xs text-brass font-mono mt-0.5">GENERATED BY SIGNALFORGE</div>
        </div>
        <Btn onClick={dl} className="text-xs">
          <Download size={14} /> DOWNLOAD REPORT
        </Btn>
      </div>

      <div className="space-y-6">
        {sections(d).map(([h, b]) => (
          <section key={h}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brass font-mono">
              {h}
            </h3>
            <p className="whitespace-pre-line text-sm text-ink/85 leading-relaxed">{b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
