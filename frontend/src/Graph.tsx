import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./ctx";
import { Btn, Card } from "./ui";

// Edges come only from fields in the data: hypothesis status -> signal, evidence classification -> signal.
// The data has no evidence->hypothesis mapping, so none is drawn.
export default function Graph() {
  const { d } = useApp();
  const nav = useNavigate();
  const [sel, setSel] = useState<string | null>(null);
  const rows = Math.max(d.hypotheses.length, d.evidence.length, d.contradictions.length);
  const H = rows * 48 + 40;
  const lay = (a: any[], x: number, kind: string, page: string) =>
    a.map((o, i) => ({ id: kind + i, x, y: 30 + (i + (rows - a.length) / 2) * 48, kind, page, o, label: o.text || o.claim || o.source || "" }));
  const hyp = lay(d.hypotheses, 270, "Hypothesis", "/results"), con = lay(d.contradictions, 530, "Contradiction", "/contradictions"), ev = lay(d.evidence, 790, "Evidence", "/evidence");
  const q = { id: "q", x: 80, y: H / 2, kind: "Question", page: "/research", o: d, label: d.question };
  const sig = { id: "sig", x: 1010, y: H / 2, kind: "Signal", page: "/report", o: d.signal, label: d.signal.text };
  const nodes = [q, ...hyp, ...con, ...ev, sig];
  const edges: any[] = [...hyp.map((h) => [q, h, "solid"]), ...hyp.filter((h) => ["Supported", "Revised"].includes(h.o.status)).map((h) => [h, sig, "solid"]),
    ...ev.map((e) => [e, sig, e.o.cls === "SUPPORTS" ? "solid" : e.o.cls === "CONTRADICTS" ? "4 3" : "1 4"])];
  const path = (a: any, b: any) => { const x1 = a.x + 75, x2 = b.x - 75, m = (x1 + x2) / 2; return `M${x1},${a.y} C${m},${a.y} ${m},${b.y} ${x2},${b.y}`; };
  const s = nodes.find((n) => n.id === sel);
  const detail = (n: any) => n.kind === "Evidence" ? [n.o.source, `${n.o.type}, ${n.o.date}`, n.o.evidence, `Classification: ${n.o.cls}`] : n.kind === "Hypothesis" ? [n.o.text, `Status: ${n.o.status}, ${n.o.conf}%`] : n.kind === "Contradiction" ? [`Claim: ${n.o.claim}`, `External: ${n.o.external}`, n.o.status] : [n.label];
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card className="overflow-x-auto" style={{ perspective: 1400 }}>
        <svg viewBox={`0 0 1100 ${H}`} className="min-w-[900px]" style={{ transform: "rotateX(6deg)", transformOrigin: "50% 100%" }} role="group" aria-label="Research graph">
          {edges.map(([a, b, dash]: any, i) => {
            const on = sel === a.id || sel === b.id;
            return <path key={i} d={path(a, b)} fill="none" stroke={on ? "#C6A66B" : "#5b5850"} strokeWidth={on ? 2 : 1} strokeDasharray={dash === "solid" ? undefined : dash} opacity={sel && !on ? 0.25 : 0.9} />;
          })}
          {nodes.map((n) => (
            <g key={n.id} tabIndex={0} role="button" aria-label={`${n.kind}: ${n.label}`} onClick={() => setSel(n.id)} onKeyDown={(e) => e.key === "Enter" && setSel(n.id)} className="cursor-pointer">
              <rect x={n.x - 75} y={n.y - 18} width={150} height={36} rx={3} fill={n.id === sel ? "#2a261c" : "#111110"} stroke={n.kind === "Signal" || n.id === sel ? "#C6A66B" : "#8C8981"} strokeWidth={n.id === sel ? 2 : 1} />
              <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize={8.5} fill="#C6A66B" fontFamily="monospace">{n.kind.toUpperCase()}</text>
              <text x={n.x} y={n.y + 9} textAnchor="middle" fontSize={9.5} fill="#F3F0E8">{n.label.length > 25 ? n.label.slice(0, 24) + "…" : n.label}</text>
            </g>
          ))}
        </svg>
        <p className="mt-2 text-xs text-warm">Solid edge: supports or supported. Dashed: contradicts. Dotted: neutral. Edges use only fields present in the data.</p>
      </Card>
      <Card aria-live="polite">
        {s ? (<><div className="font-mono text-xs text-gold">{s.kind.toUpperCase()}</div>{detail(s).map((t: string, i: number) => <p key={i} className="mt-2 text-sm text-ivory/85">{t}</p>)}
          <div className="mt-4 flex gap-2"><Btn className="px-3 py-1.5 text-xs" onClick={() => nav(s.page)}>OPEN VIEW</Btn><Btn variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setSel(null)}>RESET</Btn></div></>)
          : <p className="text-sm text-mute">Select a node to see its details and highlight its relationships.</p>}
      </Card>
    </div>
  );
}
