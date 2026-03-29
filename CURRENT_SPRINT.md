# CURRENT_SPRINT.md — Active Work

*Wipe and rewrite at the start of each new sprint. Claude Code reads this alongside FOUNDATION.md at the start of every session.*

---

## v2 "Gold Camo" Checklist

3 features to ship. When all 3 are checked, v2 is done and shareable.

```
⬜ 1. IRR Tracking View         NEXT — data ready
⬜ 2. Drift Monitoring          data ready
⬜ 3. Gold Standard Tracking    data ready
```

**Progress: 0 of 3 UI features — Session 1 (data layer) complete and verified**

---

## v1 Status (Complete)

All v1 features shipped:
- CSV import modal with two-tier validation
- Synthetic data layer (CLIENTS, PROJECTS, BATCHES, computeHealthScore)
- Health Snapshot on Overview tab
- Projects tab with sortable table and detail panels
- Risk Alerts panel
- CSV export (12-column project summary)
- Column sorting on Projects tab

---

## Current State of Codebase

Five-tab dashboard running in dashboard.jsx and preview.html:
- Overview tab — KPI cards, Health Snapshot (3 project cards), Risk Alerts panel, daily charts, pipeline funnel, activity feed
- Projects tab — sortable 9-column table, click-to-expand batch and expert detail panels
- Expert Roster tab — searchable table, trend %, readiness score, click-to-expand detail panel
- Pipeline tab — funnel visualization, stage health cards, static notes section
- Alerts tab — categorized alerts, acknowledge actions, timestamped log

Theme: warm cream/pastel light. Fonts: Instrument Sans + Fira Code. Design tokens in `const T`.

---

## ✅ Completed — Session 1: QA Synthetic Data Layer

Data only. No UI changes. No new tabs. Both `dashboard.jsx` and `preview.html` updated in sync.

**What was added:**

Two new experts appended to EXPERTS array:
- `E-009` Dr. Priya Nair — Medicine, UCSF, accuracy 91.5%, trend "down" trendPct 3.8. Surface metrics look borderline acceptable; drift only visible in IRR week-over-week and gold standard data.
- `E-010` James Okafor — Law, Columbia, accuracy 88.0%, status "active". Overall metrics look manageable; systematic calibration failure only visible in gold standard results.

Three new module-level constants (not useState — same pattern as CLIENTS/PROJECTS/BATCHES):
- `IRR_RECORDS` — 64 records: 8 expert pairings × 8 weeks (Jan 6 – Feb 24, 2026)
- `GOLD_STANDARD_ITEMS` — 10 items: 5 medical (GS-001–005), 5 legal (GS-006–010)
- `GOLD_STANDARD_RESULTS` — 60 records: 6 experts × 10 items

**Verification checks (all passed):**
```
IRR_RECORDS.length                          → 64   (required: ≥ 40) ✅
Nair (E-009) gold standard avg              → 0.82 (required: < 0.85) ✅
Okafor (E-010) gold standard avg            → 0.70 (required: < 0.75) ✅
Nair IRR early (wks 1–6) / late (wks 7–8)  → [0.848, 0.723] — clear drop visible ✅
```

---

## Next Up — Session 2: IRR Tracking View

### Two new experts to add to the EXPERTS array

**Expert 9 — "Dr. Priya Nair" (Drift Expert)**
- Seniority: senior
- Domain: medical
- Overall accuracy looks acceptable (91-93% average)
- IRR with peers: healthy (0.83-0.87) in weeks 1-6, drops to 0.71-0.74 in weeks 7-8
- Recent accuracy (weeks 7-8): 78%, down from 93% in weeks 1-4
- Gold standard agreement: 82% (just below 85% recalibration threshold)
- Story: overall averages look fine, drift monitoring and gold standard tracking catch the problem

**Expert 10 — "James Okafor" (Calibration Expert)**
- Seniority: mid
- Domain: legal
- Overall accuracy: 88% (looks acceptable, inflated by easy tasks)
- IRR with peers: erratic, ranges 0.65-0.89 depending on task type
- Gold standard agreement: 68-72% (well below 85% threshold)
- Story: overall metrics obscure a systematic calibration problem

### Three new constants to add (module-level, not useState)

**IRR_RECORDS** — array of pairwise agreement records
Each record: `{ irr_id, expert_a_id, expert_b_id, agreement_score, task_type, week_number, date_recorded }`

Minimum records needed:
- Dr. Nair paired with 2-3 existing experts across 8 weeks (show healthy trend then drop)
- James Okafor paired with 2-3 existing experts showing erratic scores
- 2-3 existing expert pairs showing healthy consistent IRR (control group)
- Minimum 40 records total to make charts meaningful

**GOLD_STANDARD_ITEMS** — array of gold standard task definitions
Each item: `{ gs_item_id, task_id, correct_output, domain, date_created }`
Minimum 10 items across legal and medical domains.

**GOLD_STANDARD_RESULTS** — array of expert results on gold standard items
Each result: `{ gs_result_id, gs_item_id, expert_id, agreement_score, date_completed }`

Design so that:
- Dr. Nair scores 82% average agreement (just below threshold)
- James Okafor scores 70% average agreement (well below threshold)
- 3-4 existing experts score 88-95% (healthy, control group)

### Verification before closing session
After adding data, verify in browser console:
- IRR_RECORDS.length >= 40
- GOLD_STANDARD_RESULTS filtered to expert_id of Dr. Nair average below 0.85
- GOLD_STANDARD_RESULTS filtered to expert_id of James Okafor average below 0.75
- At least one expert pair shows IRR drop from weeks 1-6 to weeks 7-8

---

## Features 2 and 3 — Defined, Not Yet Started

### IRR Tracking View (Session 2, after data is ready)
- New tab in dashboard nav: "QA Governance"
- IRR panel showing pairwise scores across expert pairs
- Filterable by expert pair, task type, time window
- Visual threshold line at 0.8 on all IRR charts
- Color coding: green ≥ 0.8, amber 0.7-0.79, red < 0.7

### Drift Monitoring (Session 3)
- Lives inside QA Governance tab as a second panel
- Accuracy broken out by week, not just overall average
- Line chart per expert showing week-over-week trend
- Highlights experts whose recent window diverges from overall average by more than 10 points

### Gold Standard Tracking (Session 4)
- Lives inside QA Governance tab as a third panel
- Per-expert agreement rate against gold standard items over time
- Recalibration threshold line at 85%
- Flags experts below threshold with a clear visual indicator

---

## Open Questions (Carried from v1)

- `velocity` field in DAILY_METRICS computed but never rendered. Surface or remove?
- Pipeline Notes section is hardcoded strings. Derive from data or keep editorial?
- Expert sparklines still wanted as a separate enhancement?
- Pipeline funnel error threshold (>10) is arbitrary. Make configurable?

---

## Known Tech Debt (Carried from v1)

- BATCHES not wired to CSV import
- assigned_expert_ids on PROJECTS not updated by CSV import
- Pipeline Notes bottleneck analysis does not update when data changes
- No "see more" link from Overview activity feed to Alerts tab

---

## Do Not Do This Sprint

- Do not build UI before Session 1 data is verified
- Do not start audit cadence configuration or calibration session log (v2 phase 2)
- Do not start predictive scoring (future roadmap)
- Do not build client-facing view (future roadmap)
