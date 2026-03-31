# CURRENT_SPRINT.md — Active Work

*Wipe and rewrite at the start of each new sprint. Claude Code reads this alongside FOUNDATION.md at the start of every session.*

---

## v2 "Gold Camo" Checklist

3 features to ship. When all 3 are checked, v2 is done and shareable.

```
✅ 1. IRR Tracking View         complete — Session 2
⬜ 2. Drift Monitoring          NEXT — data ready
⬜ 3. Gold Standard Tracking    data ready
```

**Progress: 1 of 3 UI features — Sessions 1 + 2 complete and verified**

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
- QA Governance tab — IRR Tracking panel (filter row, summary table, SVG line chart + legend); Drift and Gold Standard panels scaffolded but not yet built

New module-level helpers: `expertLabel(id)`, `pairingKey(a, b)`, `pairingLabel(a, b)`
New component: `IRRLineChart` (pure SVG, receives filtered records, one polyline per pairing)
New state: `irrFilterPair`, `irrFilterTaskType`

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

## Next Up — Session 3: Drift Monitoring

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
