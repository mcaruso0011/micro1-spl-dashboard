# CURRENT_SPRINT.md — Active Work

*Wipe and rewrite at the start of each new sprint. This is the short-term scratchpad Claude Code reads alongside FOUNDATION.md.*

---

## v1 "Gold Camo" Completion Checklist

7 features to ship. When all 7 are checked, v1 is done and shareable.

```
✅ 1. CSV import modal          DONE
⬜ 2. Health score display      IN PROGRESS (see below)
⬜ 3. Risk alerts panel         IN PROGRESS (see below)
⬜ 4. Project switcher          Thursday
⬜ 5. Column sorting            Friday
⬜ 6. CSV export                Friday
⬜ 7. README polish + share     Weekend
```

**Progress: 1 of 7 — 14% to gold camo**

---

## Current State

Four-tab dashboard is built and running:
- ✅ Overview tab — KPI cards, daily charts, pipeline funnel, activity feed (top 3 alerts)
- ✅ Expert Roster tab — searchable table, trend % column, readiness score column, click-to-expand detail panel
- ✅ Pipeline tab — funnel visualization, stage health cards, static notes section
- ✅ Alerts tab — categorized alerts, acknowledge actions, timestamped log
- ✅ CSV import modal — Upload → Validation → Success. Replaces all dashboard data on confirm.

Theme: warm cream/pastel light. Fonts: Instrument Sans + Fira Code. Design tokens in `const T`.

---

## Next Up — Step 1: Synthetic Data Design (DO THIS BEFORE UI WORK)

Before building health score display or risk alerts, Claude Code must first build out the synthetic data layer. The data needs to tell a story — three distinct project health states must be visible the moment someone opens the dashboard.

### Required synthetic projects (minimum 3):

**Project 1 — Healthy (🟢)**
- Client: OpenAI
- Domain: Legal
- Pace on track, quality above threshold, experts lightly loaded
- Health score should compute to ≥ 85

**Project 2 — At Risk (🟡)**
- Client: Google
- Domain: Medical
- Pace slightly behind, quality borderline, one expert overloaded
- Health score should compute to 70–84

**Project 3 — Critical (🔴)**
- Client: Microsoft
- Domain: Financial
- Pace significantly behind deadline, quality below threshold
- Health score should compute to < 70

### Each project needs:
- At least 2 batches with realistic task distributions
- 3–5 assigned experts pulled from the existing expert roster
- Enough completed tasks with quality scores to make the rolling average meaningful
- Timestamped task completion dates spread across the last 2–3 weeks (not all on the same day)
- ExpertProjectAssignment records so load is computable

### Data must support these computed fields (see FOUNDATION.md for formulas):
- `health_score` — weighted composite (Pace 40% + Quality 40% + Load 20%)
- `pace_score` — current completion rate vs required rate to hit deadline
- `quality_score` — rolling avg of last 20 tasks vs project target
- `load_score` — inverse of avg active project count across assigned experts
- `days_to_deadline` — computed from deadline date
- `projected_completion_date` — based on current pace

---

## Next Up — Step 2: Health Score Display (after data is ready)

Two components, built in sequence:

**A. Overview tab — Health Snapshot section**
- New section added to existing Overview tab
- Row of project cards, one per active project
- Each card: project name, client, health score number, color-coded status badge, days to deadline
- Scannable in one glance — this is the 30-second executive view
- No drill-down from here

**B. New "Projects" tab — Project List view**
- Full dedicated tab added to the dashboard nav
- One row per project with: health score, pace vs projection, quality score, expert count, days to deadline, status badge
- Click a row to expand a detail panel showing batch breakdown and assigned experts
- This is where the SPL actually works day to day

---

## Next Up — Step 3: Risk Alerts Panel (after health score is built)

- Surfaces only at-risk (🟡) and critical (🔴) projects
- Each alert shows project name, client, status, and one-line reason
- Example: "Microsoft Financial Batch 2 — pace 34% below required rate"
- Lives on the Overview tab as a dedicated section below the Health Snapshot
- Alerts are computed from the same health score data, not hardcoded

---

## Open Questions

- **`velocity` field in DAILY_METRICS** — computed but never rendered. Surface in a chart or remove?
- **Pipeline Notes section** — currently hardcoded strings. Should this derive from pipeline data, or stay editorial?
- **Expert sparklines** — directional trend % was added instead of sparklines. Still wanted?
- **Pipeline funnel error threshold (>10)** — arbitrary. Make configurable per project?

---

## Known Issues / Tech Debt

- Pipeline Notes bottleneck analysis does not update when data changes — hardcoded text
- No "see more" link from Overview activity feed to Alerts tab
- README.md needs update once v1 features are complete

---

## Do Not Do This Sprint

- Do not start on predictive scoring (v2)
- Do not build client-facing view (v2)
- Do not add domain-specific logic beyond filter tags
- Do not build column sorting or CSV export until features 2 and 3 are done
