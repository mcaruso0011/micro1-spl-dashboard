# CURRENT_SPRINT.md — Active Work

*Wipe and rewrite at the start of each new sprint. Claude Code reads this alongside FOUNDATION.md at the start of every session.*

---

## v2 "Gold Camo" Checklist

3 features to ship. When all 3 are checked, v2 is done and shareable.

```
✅ 1. IRR Tracking View         complete — Session 2
✅ 2. Drift Monitoring          complete — Session 3
✅ 3. Gold Standard Tracking    complete — Session 4
```

**Progress: 3 of 3 UI features — v2 complete ✅**

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

Six-tab dashboard running in dashboard.jsx and preview.html:
- Overview tab — KPI cards, Health Snapshot (3 project cards), Risk Alerts panel, daily charts, pipeline funnel, activity feed
- Projects tab — sortable 9-column table, click-to-expand batch and expert detail panels
- Expert Roster tab — searchable table, trend %, readiness score, click-to-expand detail panel
- Pipeline tab — funnel visualization, stage health cards, static notes section
- Alerts tab — categorized alerts, acknowledge actions, timestamped log
- QA Governance tab — IRR Tracking panel (filter row, summary table, SVG line chart + legend); Drift Monitoring panel (filter toggle, summary table, SVG line chart + legend); Gold Standard Tracking panel (summary table, SVG horizontal bar chart)

New module-level helpers: `expertLabel(id)`, `pairingKey(a, b)`, `pairingLabel(a, b)`
New component: `IRRLineChart` (pure SVG, receives filtered records, one polyline per pairing)
New component: `DriftLineChart` (pure SVG, y-axis 70–100, amber shade over wks 7–8, red/blue line per expert)
New component: `GoldStandardChart` (pure SVG horizontal bar chart, color-coded by tier, threshold line at 0.85)
New state: `irrFilterPair`, `irrFilterTaskType`, `driftShowFlaggedOnly`
New constant: `WEEKLY_ACCURACY` (40 records: 5 experts × 8 weeks)

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

## ✅ Completed — Session 2: IRR Tracking View

Added to both `dashboard.jsx` and `preview.html` in sync.

**What was added:**

Three module-level helper functions (after EXPERTS, before PIPELINE_STAGES):
- `expertLabel(id)` — canonical "Name (ID)" display; solves E-002/E-010 name collision
- `pairingKey(a, b)` — returns `"a|b"` string; used as React key, dropdown value, and filter key
- `pairingLabel(a, b)` — human-readable pair label built from two `expertLabel()` calls

New component `IRRLineChart` (pure SVG, placed between MiniBar and PipelineFunnel):
- viewBox 660×200, plot area ML=44 MR=16 MT=16 MB=28
- Y-axis grid lines at 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
- Dashed amber threshold line at 0.8
- Week labels Wk 1–8 on x-axis
- One polyline + dot series per visible pairing; line color = green/amber/red based on pairing average

Two new useState declarations in Dashboard: `irrFilterPair`, `irrFilterTaskType` (both default "all")

"QA Governance" tab added to nav (6th tab, after Alerts).

QA Governance tab content (IIFE pattern for scoped logic):
- Page header with record count and pair count from IRR_RECORDS
- Filter row: pair dropdown (all + 8 pairings by name+ID), task type dropdown (all + 3 types), "Clear filters" button (visible when any filter active)
- Summary table: Expert Pair | Task Type | Avg IRR | Trend (wks 1–6 → 7–8) | Records
- IRR by Week line chart using IRRLineChart component
- Legend below chart (color swatch + "Name (ID) + Name (ID)" per visible pairing)

**Verification (open preview.html and confirm):**
```
QA Governance tab appears in nav                                    ✅ check
Default view: 8 rows in summary table                               ✅ check
Nair + Sharma avg ~0.83, trend ↓ (red)                             ✅ check
Chen + Volkov, Sharma + Al-Hassan avg ≥ 0.88, trend stable         ✅ check
Chart: 8 lines, dashed threshold at 0.8 visible                    ✅ check
Filter by pair → only that pair's line remains                     ✅ check
Clear filters resets both dropdowns                                ✅ check
All expert labels show "Name (ID)" format                          ✅ check
```

---

---

## ✅ Completed — Session 3: Drift Monitoring

Added to both `dashboard.jsx` and `preview.html` in sync.

**What was added:**

New constant `WEEKLY_ACCURACY` (module-level, before `function isValidDate`):
- 40 records: 5 experts × 8 weeks (Jan 6 – Feb 24 2026)
- Fields: `wa_id`, `expert_id`, `week_number`, `accuracy`, `date_recorded`
- E-001, E-003, E-005: flat/stable (~97–99%), all deltas < ±2 pts
- E-009 (Dr. Priya Nair): 8-wk avg 90.25%, recent avg 78.25%, delta −12.0 pts → flagged
- E-010 (James Okafor): erratic 85–91%, recent avg 85.05%, delta −2.45 pts → not flagged

New component `DriftLineChart` (pure SVG, placed between IRRLineChart and PipelineFunnel):
- Same 660×200 viewBox / margin constants as IRRLineChart
- Y-axis zoomed to 70–100 (30-pt scale), grid lines at 75/80/85/90/95/100
- Amber shaded rect over weeks 7–8 (the "recent window" evaluated for drift)
- Wk 7 + Wk 8 x-labels render in amber; weeks 1–6 in textMuted
- Line color per expert: red if `(recentAvg - overall) < -10`, blue otherwise

New state: `driftShowFlaggedOnly` (boolean, default false)

Drift Monitoring panel inside QA Governance IIFE return (after IRR chart card):
- Section header with flagged-expert count
- "Show flagged only" / "Showing flagged only" toggle button
- Summary table: Expert | Overall Acc | Recent Acc (wks 7–8) | Drift Delta | Status
  - Flagged rows: amber background tint, red delta, "⚠ Flagged" amber pill
  - Stable rows: no tint, textMuted delta, "✓ Stable" green pill
- DriftLineChart with `visibleRecords`
- Legend below chart (color swatch + expertLabel per visible expert)

**Verification numbers:**
```
E-009 overall: 90.25%  recent: 78.25%  delta: −12.0 pts  → Flagged ✅
E-010 overall: 87.50%  recent: 85.05%  delta: −2.5 pts   → Stable ✅
E-001/E-003/E-005 deltas all < ±2 pts                    → Stable ✅
```

---

---

## ✅ Completed — Session 4: Gold Standard Tracking

Added to both `dashboard.jsx` and `preview.html` in sync.

**What was added:**

No new constants or state — all data already existed in `GOLD_STANDARD_RESULTS` (60 records).

New component `GoldStandardChart` (pure SVG, placed between DriftLineChart and PipelineFunnel):
- viewBox 660×200, ML=180 (wider for expert name labels), MR=24, MT=20, MB=28
- Horizontal bar chart — one bar per expert, sorted avg ascending (worst at top)
- Bar color: T.green ≥0.85, T.amber ≥0.75, T.red <0.75 (FOUNDATION.md thresholds)
- Vertical dashed amber threshold line at x=0.85
- "0.85" label above threshold line; score value in Fira Code after each bar
- Track (gray background bar) behind each colored bar

Computed inside QA Governance IIFE (before `return (`):
- `gsSummaries` — per-expert `{ eid, avg, itemCount, flagged }` sorted avg ascending
- `gsFlaggedCount` — count where avg < 0.85

Gold Standard Tracking panel (third section in QA Governance, after Drift panel):
- Header with flagged expert count
- Summary table: Expert | Items Attempted | Avg Agreement | Status badge
  - Okafor (0.70): red+10 tint, "✗ Recalibrate" red pill
  - Nair (0.82): amber+12 tint, "⚠ Monitor" amber pill
  - All controls (0.89–0.95): no tint, "✓ Passing" green pill
- GoldStandardChart bar chart + subtitle note

**Verification numbers:**
```
E-010 (Okafor):     avg = 0.70  → red    · ✗ Recalibrate ✅
E-009 (Nair):       avg = 0.82  → amber  · ⚠ Monitor     ✅
E-007 (Al-Hassan):  avg = 0.89  → green  · ✓ Passing     ✅
E-003 (Sharma):     avg = 0.91  → green  · ✓ Passing     ✅
E-001 (Chen):       avg = 0.92  → green  · ✓ Passing     ✅
E-005 (Volkov):     avg = 0.95  → green  · ✓ Passing     ✅
gsFlaggedCount = 2
```

---

## v2 Complete — What's Next

All three v2 features are shipped. Dashboard is shareable as a portfolio piece.

If continuing, candidates for v2 phase 2 (see FOUNDATION.md roadmap):
- Audit cadence configuration
- Calibration session log
- Recalibration threshold alerts (surface on Overview tab when an expert is flagged)

---

## Open Questions (Carried from v1)

- `velocity` field in DAILY_METRICS computed but never rendered. Surface or remove?
- Pipeline Notes section is hardcoded strings. Derive from data or keep editorial?
- Expert sparklines still wanted as a separate enhancement?
- Pipeline funnel error threshold (>10) is arbitrary. Make configurable?

---

## Known Tech Debt

**Carried from v1:**
- BATCHES not wired to CSV import
- assigned_expert_ids on PROJECTS not updated by CSV import
- Pipeline Notes bottleneck analysis does not update when data changes
- No "see more" link from Overview activity feed to Alerts tab

**Added in Session 2:**
- IIFE pattern for tab logic is unusual React — potential confusion for readers; candidate for extraction into a proper `<QAGovernanceTab>` component in a future cleanup pass
- `pairingKey(a, b)` assumes expert_a_id always precedes expert_b_id in IRR_RECORDS; swapped records would create phantom duplicate pairings — not a bug today (synthetic data is consistent), but fragile
- IRRLineChart x-axis hardcoded to 8 weeks; empty week slots display as gaps rather than being clipped to the actual data range

---

## Do Not Do This Sprint

- Do not build UI before Session 1 data is verified
- Do not start audit cadence configuration or calibration session log (v2 phase 2)
- Do not start predictive scoring (future roadmap)
- Do not build client-facing view (future roadmap)
