<div align="center">

# ⚡ SignalForge

**Find the signal. Challenge the signal.**

*An AI-powered financial research intelligence system that connects fragmented evidence, detects contradictions, and subjects emerging theses to rigorous self-falsification.*

---

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.142-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)

**Repository**: [https://github.com/ArnavSharma-IND/SignalForge](https://github.com/ArnavSharma-IND/SignalForge)

</div>

---

## 🏆 Built For
**Finding the Next Signal Challenge**  
**BITS Pilani — Hyderabad Campus**

---

## 📖 Executive Overview

In equity and financial intelligence, **information is abundant, but clarity is scarce**. Analysts drown in hundreds of pages of 10-K/annual filings, earnings call transcripts, industry trackers, customer panel data, and peer reports. Most AI tools summarize individual documents in isolation, amplifying confirmation bias without challenging management claims.

**SignalForge** reimagines equity research as an adversarial, hypothesis-driven intelligence pipeline:

```text
SEARCH ➔ UNDERSTAND ➔ COMPARE ➔ CHALLENGE ➔ FALSIFY ➔ DISCOVER
```

Rather than simply summarizing text, SignalForge actively surfaces discrepancies between management commentary and empirical external data, attempts to falsify its own leading theses, and computes a transparent, weighted signal score.

---

## 🏛️ The 7-Step Methodology

SignalForge structures institutional investigations through an epistemic framework:

```mermaid
flowchart LR
    A["1. Decompose Question"] --> B["2. Form Hypotheses"]
    B --> C["3. Gather Evidence"]
    C --> D["4. Triangulate Sources"]
    D --> E["5. Detect Contradictions"]
    E --> F["6. Attempt Falsification"]
    F --> G["7. Synthesize Signal & Score"]
```

1. **Decompose the Question**: Dissects broad inquiries into focused vectors across growth sustainability, margins, competitive dynamics, demand patterns, and structural risk.
2. **Form Hypotheses**: Drafts competing explanatory theses *before* digesting evidence to mitigate confirmation bias.
3. **Gather Evidence**: Extracts atomic claims across company filings, third-party benchmarks, peer disclosures, and alternative data with source attribution.
4. **Triangulate Sources**: Measures convergence and divergence across independent sources evaluating the same claim.
5. **Detect Contradictions**: Surfaces discrepancies where management commentary directly clashes with empirical market data.
6. **Attempt to Falsify**: Stress-tests the leading thesis by actively querying for falsifiers and disconfirming evidence.
7. **Evaluate the Signal**: Computes a multi-dimensional weighted score across strength, source quality, cross-source agreement, novelty, and contradiction risk.

---

## 🧮 Signal Scoring Engine

The SignalForge score ($S \in [0, 10]$) provides an interpretable quantitative evaluation of thesis credibility:

$$\text{Signal Score} = 0.30 \cdot E + 0.20 \cdot Q + 0.15 \cdot A + 0.25 \cdot N + 0.10 \cdot (10 - C)$$

| Dimension | Weight | Description |
| :--- | :---: | :--- |
| **Evidence Strength ($E$)** | `30%` | Depth, granularity, and empirical backing of collected observations. |
| **Source Quality ($Q$)** | `20%` | Reliability hierarchy (Audited Filings > Regulatory Data > Industry Reports > Sell-Side). |
| **Cross-Source Agreement ($A$)** | `15%` | Degree of corroboration between independent third-party sources. |
| **Novelty ($N$)** | `25%` | Information edge not yet broadly priced into sell-side consensus. |
| **Contradiction Inversion ($10 - C$)** | `10%` | Resilience against unresolved contradictory empirical data points. |

---

## 💡 Demo Investigation: Reliance Industries

The project includes an illustrative research demonstration analyzing **Reliance Industries**:

### Core Question
> *"Is the current growth trajectory sustainable?"*

### Hypotheses Explored
- **H1**: Growth is volume-led and healthy *(Status: Rejected, 31% conf)*
- **H2**: Growth is price/mix-led and masks weaker unit economics *(Status: Supported, 82% conf)*
- **H3**: Segment mix shift dilutes consolidated margins *(Status: Revised, 68% conf)*
- **H4**: Input-cost inflation is the main margin threat *(Status: Supported, 71% conf)*
- **H5**: Competitor pricing erodes share gains *(Status: Open, 55% conf)*

### Synthesized Signal
> **"Revenue growth may be masking deteriorating unit economics."**  
> *(Signal Strength: Strong | Novelty: High | Confidence: 82% | Score: 7.9/10)*

---

## 🎯 Hackathon Alignment Matrix

| Challenge Requirement | SignalForge Module / Implementation |
| :--- | :--- |
| **Non-obvious financial insight** | Discovered Signal & Multi-dimensional Scoring |
| **Evidence-backed research** | Granular Evidence Matrix with source attribution |
| **Structured research workflow** | 7-Step Institutional Research Pipeline |
| **Evidence triangulation** | Cross-source corroboration and divergence engine |
| **Contradiction detection** | Side-by-side Company Claim vs. Empirical Reality explorer |
| **Self-falsification** | Adversarial stress testing with explicit risk ratings |
| **Counterargument inclusion** | Alternative explanations & risk monitoring register |
| **Evidence trail visualization** | Interactive SVG bezier Topological Research Graph |
| **Working application** | High-performance React 18 + Vite + FastAPI workspace |

---

## ✨ Features & Interface Modules

- 🌌 **Cinematic 3D Interactive Hero**: Interactive isometric document stack reacting dynamically to cursor perspective.
- 🔬 **Research Query Studio**: Configure targeted investigations with company parameters, custom research questions, and focus areas.
- 📡 **Live Run Pipeline**: Progress tracking that transitions seamlessly between live API telemetry and bundled offline datasets.
- 📊 **Signal Radar & KPI Center**: High-density interactive Recharts radar chart mapping all 5 scoring dimensions alongside active hypothesis confidence gauges.
- 📑 **Evidence Matrix**: Filterable claim feed (`SUPPORTS`, `CONTRADICTS`, `NEUTRAL`) with confidence meters and origin attribution.
- ⚡ **Contradiction Explorer**: Accordion analysis comparing company statements directly with external market signals and plausible explanations.
- 🛡️ **Self-Falsification Suite**: Direct stress-testing of the core investment thesis with potential falsifiers, evidence found, and risk ratings.
- 🕸️ **Topological Research Graph**: Custom interactive SVG bezier node-link visualization connecting research questions, hypotheses, contradictions, evidence nodes, and final signals.
- 📑 **Dossier & Markdown Report Export**: One-click generation and download of formatted, auditable research memos.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (TypeScript)
- **Bundler & Dev Server**: Vite 5
- **Styling**: Tailwind CSS v4, custom theme variables, luxury dark editorial palette
- **Motion & 3D**: Motion (formerly Framer Motion)
- **Data Visualization**: Recharts (Radar, multi-axis polar charts) & Interactive SVG Graph
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Validation**: Pydantic v2
- **CORS & Proxy**: Configured for local cross-origin development and seamless reverse proxy

---

## 🗂️ Repository Architecture

```
SignalForge/
├── backend/
│   ├── main.py              # FastAPI server & DemoAgent research pipeline
│   ├── requirements.txt     # Python backend dependencies
│   └── .venv/               # Python virtual environment
├── frontend/
│   ├── index.html           # HTML entry point with luxury typography imports
│   ├── package.json         # React 18, Vite 5, Tailwind v4, Motion, Lucide, Recharts
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration with backend /api proxy
│   └── src/
│       ├── main.tsx         # Application entry point & router setup
│       ├── App.tsx          # Main shell, navigation tabs, Overview, Evidence, Reports
│       ├── Landing.tsx      # Interactive landing page & 3D methodology stack
│       ├── Run.tsx          # Research execution & live pipeline tracker
│       ├── Graph.tsx        # Topological SVG node-link research graph
│       ├── ctx.ts           # Global application state & context
│       ├── ui.tsx           # Shared design tokens, badges, cards, and buttons
│       ├── index.css        # Tailwind v4 theme tokens & editorial styling
│       └── demo.json        # Structured research dataset & single source of truth
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Python**: v3.10 or later

---

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The FastAPI backend will be available at [http://localhost:8000](http://localhost:8000) (Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)).*

---

### 2. Frontend Setup (React + Vite)

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend will launch at [http://localhost:5173](http://localhost:5173).*

> [!NOTE]
> Vite is pre-configured to reverse-proxy `/api/*` requests directly to `http://localhost:8000`. If the backend is not running, the frontend gracefully falls back to bundled illustrative research datasets.

---

### 3. Production Build

To test or generate the production bundle:

```bash
cd frontend
npm run build
npm run preview
```

---

## 🔌 Extending to Live AI / Web Search

`backend/main.py` provides a modular `DemoAgent` interface designed to plug in live multi-agent LLM orchestrators (e.g., Google Gemini, OpenAI, Claude, LangGraph, AutoGen) and live search/financial APIs (SEC EDGAR, Tavily, Bloomberg, Alpha Vantage):

```python
class ResearchAgent:
    async def plan(self, q: Query):
        """Decompose query into sub-questions using an LLM."""
        ...

    async def collect(self, subquestions):
        """Query SEC EDGAR, Google Search API, Bloomberg/FactSet, or Tavily."""
        ...

    async def triangulate_and_falsify(self, evidence):
        """Run contradiction detection & adversary falsification passes."""
        ...

    async def score(self, findings) -> dict:
        """Compute final 5-axis signal scores and return structured JSON."""
        ...
```

---

## 🗺️ Product Roadmap

- [x] **Phase 1 — Research MVP**: Structured research workflow, evidence matrix, contradiction engine, and research graph.
- [ ] **Phase 2 — Live Financial Search**: Direct connectors for SEC EDGAR 10-K/10-Q filings, transcripts, and press releases.
- [ ] **Phase 3 — Autonomous Contradiction Detection**: Real-time cross-document validation between earnings audio transcripts and audited notes.
- [ ] **Phase 4 — Historical Signal Backtesting**: Evaluate previous signal accuracy against subsequent quarterly earnings surprises.
- [ ] **Phase 5 — Multi-Company & Sector Comparison**: Simultaneous triangulation across entire industry verticals.

---

## ⚖️ Disclaimer

*SignalForge is an illustrative research demonstration created for the Finding the Next Signal hackathon. All figures, quotes, company names, and data points included in the demo datasets are synthetic and for demonstration purposes only. They do not constitute financial advice or investment recommendations.*

---

<div align="center">
<b>SignalForge</b> — Find the signal. Challenge the signal.
</div>
