import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import demo from "./demo.json";
import { Btn } from "./ui";

const STEPS: [string, string][] = [
  ["Decompose the question", "A broad question is split into growth, margin, demand and risk sub-questions."],
  ["Form hypotheses", "Competing explanations are written down before any evidence is read."],
  ["Gather evidence", "Claims are extracted from filings, industry data and peer disclosures, each tied to a source."],
  ["Triangulate sources", "Independent sources are compared on the same claim."],
  ["Detect contradictions", "Management statements are checked against external data."],
  ["Attempt to falsify", "The agent searches for evidence that would break its own leading thesis."],
  ["Evaluate the signal", "A transparent weighted score summarises strength, quality, agreement, novelty and contradiction risk."],
];
const DOCS = ["Annual report", "Quarterly results", "Industry data", "Peer filing"];
const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6 } };

function Hero() {
  const [r, setR] = useState({ x: 14, y: -22 });
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-[460px]" style={{ perspective: 1200 }}
      onPointerMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); setR({ x: 14 - ((e.clientY - b.top) / b.height - 0.5) * 12, y: -22 + ((e.clientX - b.left) / b.width - 0.5) * 16 }); }}>
      <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transformStyle: "preserve-3d", transform: `rotateX(${r.x}deg) rotateY(${r.y}deg)` }}>
        {DOCS.map((t, i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i, duration: 0.7 }}
            className="absolute h-52 w-40 rounded-sm bg-paper p-3 text-ink shadow-[0_30px_50px_-20px_rgba(0,0,0,.9)]"
            style={{ left: 30 + i * 70, top: 20 + (i % 2) * 90, transform: `translateZ(${i * 45}px)` }}>
            <div className="font-mono text-[9px] text-brass">{t.toUpperCase()}</div>
            {[90, 70, 85, 60, 75, 50].map((w, k) => <div key={k} className="mt-2 h-1 rounded bg-ink/15" style={{ width: `${w}%` }} />)}
            {i === 2 && <div className="mt-3 h-1.5 w-1/2 rounded bg-gold" />}
          </motion.div>
        ))}
        <div className="absolute left-[62%] top-[44%] h-3 w-3 rounded-full bg-gold shadow-[0_0_24px_6px_rgba(198,166,107,.55)]" style={{ transform: "translateZ(190px)" }} aria-hidden />
      </div>
    </div>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const s = demo.signal;
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <h1 className="text-6xl leading-[1.02] md:text-7xl">Find the signal.<br /><span className="text-gold">Challenge the signal.</span></h1>
          <p className="mt-6 max-w-md text-mute">An AI-powered financial research agent that connects fragmented evidence, challenges assumptions, and uncovers the signals hidden beneath the surface.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn onClick={() => nav("/research")}>Start an investigation</Btn>
            <Btn variant="ghost" onClick={() => document.getElementById("method")?.scrollIntoView({ behavior: "smooth" })}>Explore the methodology</Btn>
          </div>
        </div>
        <Hero />
      </section>

      <motion.section {...rise} className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-4xl md:text-5xl">Information is abundant. Clarity isn’t.</h2>
        <p className="mt-5 text-mute">Filings, call transcripts, industry data and peer disclosures each tell a partial story. A single figure rarely explains a company; the disagreements between sources often do.</p>
      </motion.section>

      <section id="method" className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          {STEPS.map(([t, d], i) => (
            <motion.div key={t} onViewportEnter={() => setStep(i)} viewport={{ amount: 0.6 }} className="flex min-h-[34vh] items-center">
              <div className={i === step ? "" : "opacity-40 transition-opacity"}>
                <div className="font-mono text-xs text-gold">STEP {i + 1} OF 7</div>
                <h3 className="mt-1 font-display text-3xl">{t}</h3><p className="mt-2 max-w-sm text-mute">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="hidden lg:block"><div className="sticky top-32 h-[420px]" style={{ perspective: 1000 }} aria-hidden>
          <div className="relative h-full" style={{ transformStyle: "preserve-3d", transform: "rotateX(52deg) rotateZ(-28deg)" }}>
            {STEPS.map(([t], i) => (
              <motion.div key={t} animate={{ opacity: i <= step ? 1 : 0.08, translateZ: i * 26 }} transition={{ duration: 0.5 }}
                className={`absolute left-10 top-16 h-44 w-72 rounded-sm border p-3 font-mono text-[10px] ${i === step ? "border-gold bg-surf text-gold" : "border-ivory/20 bg-char text-warm"}`}>{t.toUpperCase()}</motion.div>
            ))}
          </div></div></div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {[["Evidence triangulation", "Separate sources are compared on the same claim. Agreement raises confidence; isolated claims do not."], ["Contradictions matter", "When a management claim and external data disagree, SignalForge keeps both and lists the possible reasons instead of picking a winner."], ["Self-falsification", "The leading thesis is tested against specific falsifiers. The assessment records what was searched, what was found, and what remains uncertain."]].map(([t, d]) => (
          <motion.div key={t} {...rise} className="border-t border-gold/60 pt-4"><h3 className="font-display text-2xl">{t}</h3><p className="mt-2 text-sm text-mute">{d}</p></motion.div>
        ))}
      </section>

      <motion.section {...rise} className="mx-auto max-w-3xl px-6 py-16">
        <div className="bg-paper p-8 text-ink shadow-[0_40px_60px_-30px_rgba(0,0,0,.9)]" style={{ transform: "perspective(1200px) rotateX(3deg)" }}>
          <div className="font-mono text-xs text-brass">ILLUSTRATIVE EXAMPLE, SYNTHETIC DATA</div>
          <h2 className="mt-3 text-3xl">{s.text}</h2>
          <p className="mt-3 text-sm text-ink/70">Counterargument: margin dilution may be a temporary cost of scaling new businesses. Limitation: this example is illustrative and not drawn from verified sources.</p>
        </div>
      </motion.section>

      <section className="px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-4xl md:text-5xl">Every signal deserves an argument against it.</h2>
        <Btn className="mt-8" onClick={() => nav("/research")}>Start an investigation</Btn>
      </section>
    </main>
  );
}
