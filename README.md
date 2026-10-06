# SignalForge

> **Find the signal. Challenge the signal.**

SignalForge is an AI-powered financial research agent designed to discover **non-obvious, evidence-backed financial signals** from fragmented public information.

Built for the **Finding the Next Signal** hackathon by **BITS Pilani, Hyderabad Campus**.

---

## Overview

Financial information is abundant, but the signal is often buried beneath fragmented data, conflicting claims, and competing explanations.

Traditional research often follows:

```text
Search → Read → Summarize
```

SignalForge follows a more rigorous workflow:

```text
Question
   ↓
Hypothesize
   ↓
Research
   ↓
Triangulate
   ↓
Detect Contradictions
   ↓
Self-Falsify
   ↓
Score
   ↓
Discover Signal
```

The goal is not simply to generate an answer.

The goal is to **challenge the answer before presenting it**.

---

# What SignalForge Does

## 1. Question Decomposition

SignalForge breaks a broad financial question into smaller research dimensions.

Example:

```text
Is the current growth trajectory sustainable?

        ↓

Growth
Margins
Demand
Competition
Input Costs
Product Mix
Market Conditions
```

---

## 2. Hypothesis Generation

Instead of assuming one explanation, SignalForge generates competing hypotheses.

Example:

```text
H1 — Growth is volume-led and healthy

H2 — Growth is primarily price/mix-led

H3 — Segment mix is diluting margins

H4 — Input-cost inflation is the main risk

H5 — Competitor pricing may pressure future growth
```

Each hypothesis can subsequently be supported, rejected, revised, or left open.

---

## 3. Evidence Triangulation

SignalForge compares evidence across independent sources.

```text
Company Data
      \
       \
Industry Data → EVIDENCE
       /
      /
Competitor Data
```

The objective is to avoid treating a single source as definitive.

Evidence can be compared across:

- Company filings
- Annual reports
- Quarterly results
- Investor presentations
- Industry data
- Competitor disclosures
- Government/public datasets
- Public news and research

---

## 4. Contradiction Detection

SignalForge explicitly looks for disagreement between sources.

Example:

```text
COMPANY CLAIM

"Demand remains strong."

          VS

EXTERNAL EVIDENCE

"Industry registrations declined."
```

Instead of simply discarding the disagreement, SignalForge turns it into a research question.

Possible explanations may include:

- Company outperforming the broader industry
- Different geographic exposure
- Different product mix
- Different measurement periods

> **Contradictions are not discarded. They become research questions.**

---

## 5. Self-Falsification

SignalForge asks:

> **"What evidence could prove our current thesis wrong?"**

Example thesis:

```text
"Margin expansion is sustainable."
```

Potential falsifiers:

```text
Input costs increase
Competitors cut prices
Volume growth slows
Customer acquisition costs rise
Product mix deteriorates
```

The system then evaluates evidence associated with these potential failure conditions.

The objective is to reduce confirmation bias by actively searching for evidence that challenges the leading hypothesis.

---

## 6. Signal Scoring

The research output is evaluated using multiple dimensions:

| Dimension | Purpose |
|---|---|
| Evidence Strength | How strongly the evidence supports the signal |
| Source Quality | Reliability of the underlying source |
| Cross-Source Agreement | Degree of independent evidence convergence |
| Novelty | How non-obvious the discovered signal is |
| Contradiction Risk | Strength of evidence challenging the signal |

Example demonstration:

```text
Evidence Strength       8.8
Source Quality          9.1
Cross-Source Agreement  7.8
Novelty                 8.9
Contradiction Risk      4.2

Signal Score            8.4 / 10
Confidence              82%
```

---

# Product Workflow

```text
Research Workspace
        ↓
Research Execution
        ↓
Signal Dashboard
        ↓
Evidence Trail
        ↓
Contradictions
        ↓
Self-Falsification
        ↓
Research Graph
        ↓
Final Research Report
```

---

# Key Interface Modules

## Research Workspace

Users provide:

- Company / Industry
- Research Question
- Research Focus

Example:

```text
Company:
Reliance Industries

Question:
Is the current growth trajectory sustainable?

Focus:
Growth Sustainability
```

---

## Research Execution

The research workflow is represented as a sequence of stages:

```text
✓ Parsing question
✓ Decomposing research problem
✓ Generating hypotheses
✓ Searching sources
✓ Extracting evidence
✓ Triangulating evidence
✓ Detecting contradictions
✓ Running self-falsification
✓ Scoring signal
✓ Generating report
```

---

## Signal Dashboard

The dashboard summarizes the investigation through:

- Signal Score
- Confidence
- Evidence Count
- Contradiction Count
- Discovered Signal
- Hypotheses
- Signal Scoring

Example demonstration:

> **"Revenue growth may be masking deteriorating unit economics."**

---

## Evidence Trail

Evidence is organized by:

- Source
- Source type
- Date
- Claim
- Evidence
- Classification
- Confidence

Evidence can be classified as:

```text
SUPPORTS
CONTRADICTS
NEUTRAL
```

---

## Contradiction Engine

The contradiction interface compares competing claims and evidence.

Each contradiction can include:

- Company claim
- External evidence
- Contradiction status
- Possible explanations

---

## Self-Falsification

The falsification interface shows:

```text
Current Thesis
       ↓
Potential Falsifier
       ↓
Evidence Searched
       ↓
Evidence Found
       ↓
Risk Assessment
       ↓
Updated Assessment
```

---

## Research Graph

The research graph connects:

```text
Question
   ↓
Hypotheses
   ↓
Sources
   ↓
Evidence
   ↓
Contradictions
   ↓
Revised Hypothesis
   ↓
Signal
```

This creates a visual evidence trail through the investigation.

---

# System Architecture

```text
                    USER
                      │
                      ▼
             ┌─────────────────┐
             │ Question Parser │
             └────────┬────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Hypothesis Engine│
             └────────┬─────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Research Agent│
              └───────┬───────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │ Public Information       │
        │                          │
        │ Financial Filings        │
        │ Industry Data            │
        │ Competitor Data          │
        │ Public Sources           │
        └────────────┬─────────────┘
                     │
                     ▼
             ┌───────────────┐
             │Evidence Engine│
             └───────┬───────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ Evidence             │
          │ Triangulation        │
          └──────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Contradiction Detection│
        └────────────┬───────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ Self-Falsification│
           └─────────┬────────┘
                     │
                     ▼
              ┌────────────┐
              │Signal Engine│
              └──────┬─────┘
                     │
                     ▼
                FINAL SIGNAL
```

---

# Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts

## Backend

- Python
- FastAPI

## Intelligence Layer

- LLM-based research reasoning
- Hypothesis generation
- Evidence analysis
- Contradiction detection
- Self-falsification
- Signal scoring

## Data Sources

The system is designed around publicly available information such as:

- Annual reports
- Quarterly results
- Investor presentations
- Regulatory filings
- Industry data
- Competitor disclosures
- Government datasets
- Public news and research

---

# Current MVP Status

## Implemented

- [x] SignalForge landing page
- [x] Research workspace
- [x] Research execution workflow
- [x] Signal dashboard
- [x] Hypothesis visualization
- [x] Evidence trail
- [x] Evidence classification
- [x] Contradiction interface
- [x] Self-falsification interface
- [x] Research graph
- [x] Final research report
- [x] Signal scoring visualization
- [x] Responsive presentation-ready UI

---

## Final Development & UI/UX Refinement

The current version is an **MVP/prototype** developed to validate the core research workflow, product concept, and overall user experience.

Further **UI/UX modifications and refinements will be made in the final version** based on testing, usability feedback, and the requirements of the final product.

Planned refinements include:

- Improved visual hierarchy
- Refined information architecture
- Enhanced dashboard layouts
- Improved research workflow interactions
- More polished evidence visualizations
- Improved contradiction and falsification views
- Enhanced research graph interactions
- Improved accessibility
- Improved responsiveness
- Refined navigation
- Consistent visual design across all modules
- Additional interaction states
- Micro-interactions and transitions
- Overall production-level visual refinement

The core research architecture and workflow will remain consistent while the interface is progressively refined.

---

## Planned / Next Stage

- [ ] Live public-source retrieval
- [ ] Automated web research
- [ ] Real financial filing ingestion
- [ ] Automated source verification
- [ ] Production-grade evidence extraction
- [ ] Live contradiction detection
- [ ] Historical signal backtesting
- [ ] Continuous signal monitoring
- [ ] Final UI/UX refinement
- [ ] Production-ready deployment

---

# Demo

## Live Application

**[ADD YOUR DEPLOYED APPLICATION URL]**

## GitHub Repository

**[ADD YOUR GITHUB REPOSITORY URL]**

---

# Demo Investigation

The current MVP includes an illustrative research demonstration using **Reliance Industries**.

### Research Question

> **Is the current growth trajectory sustainable?**

The demonstration follows:

```text
Research Question
        ↓
Competing Hypotheses
        ↓
Evidence
        ↓
Contradictions
        ↓
Self-Falsification
        ↓
Revised Assessment
        ↓
Final Signal
```

### Illustrative Signal

> **Revenue growth may be masking deteriorating unit economics.**

The current demonstration is intended to showcase the research workflow, product interface, and evidence-analysis concept.

---

# Important Disclaimer

The current MVP contains **illustrative / synthetic research data** for demonstration purposes.

Figures, claims, quotes, confidence values, source labels, and example signals shown in the current demonstration should **not** be interpreted as verified financial data, investment research, or investment advice.

The production research pipeline is intended to use independently verifiable public sources and preserve an evidence trail back to the original source.

---

# Hackathon Alignment

SignalForge is designed around the requirements of the **Finding the Next Signal** challenge.

| Challenge Requirement | SignalForge |
|---|---|
| Non-obvious financial insight | Signal Discovery |
| Evidence-backed research | Evidence Trail |
| Research workflow | Structured Research Pipeline |
| Evidence triangulation | Multi-source Evidence Engine |
| Contradiction detection | Contradiction Engine |
| Self-falsification | Falsification Engine |
| Counterargument | Alternative Explanations |
| Evidence trail | Research Graph |
| Working application | SignalForge MVP |
| Completed discovery | End-to-End Research Demonstration |

---

# Project Structure

```text
signalforge/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── services/
│   ├── models/
│   └── ...
│
├── mockups/
│   ├── landing-page.png
│   ├── research-workspace.png
│   ├── research-execution.png
│   ├── signal-dashboard.png
│   ├── evidence-trail.png
│   ├── contradictions.png
│   ├── self-falsification.png
│   ├── research-graph.png
│   └── research-report.png
│
├── screenshots/
│   ├── dashboard.png
│   ├── evidence.png
│   ├── contradictions.png
│   └── report.png
│
├── docs/
│   └── SignalForge_Round1.pdf
│
├── public/
│
├── README.md
├── package.json
├── requirements.txt
└── ...
```

> Update the structure above to match the actual repository structure before publishing.

---

# Roadmap

## Phase 1 — Research MVP

Structured research workflow and evidence visualization.

## Phase 2 — Live Research

Connect real public financial and industry sources.

## Phase 3 — Evidence Intelligence

Automate:

- Claim extraction
- Source evaluation
- Evidence matching
- Contradiction detection

## Phase 4 — Signal Intelligence

Introduce:

- Historical backtesting
- Sector-specific research agents
- Multi-company comparison
- Signal monitoring

## Phase 5 — Research Platform

Build:

- Persistent research workspaces
- Saved investigations
- Collaborative research
- Continuous signal tracking
- Automated research reports

---

# Why SignalForge?

> **Most tools help you find information. SignalForge is designed to challenge it.**

```text
SEARCH
  ↓
UNDERSTAND
  ↓
COMPARE
  ↓
CHALLENGE
  ↓
FALSIFY
  ↓
DISCOVER
```

---

# Built For

**Finding the Next Signal**  
**BITS Pilani — Hyderabad Campus**

### SignalForge

**Find the signal. Challenge the signal.**

---
signal-detection
self-falsification
```
