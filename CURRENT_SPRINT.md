# CURRENT_SPRINT.md — Active Work

*Wipe and rewrite at the start of each new sprint. This is the short-term scratchpad Claude Code reads alongside FOUNDATION.md.*

---

## v1 "Gold Camo" Completion Checklist

7 features to ship. When all 7 are checked, v1 is done and shareable.

```
✅ 1.  CSV import modal          DONE
✅ 1a. Synthetic data layer      DONE — CLIENTS, PROJECTS, BATCHES, computeHealthScore
✅ 2a. Health Snapshot           DONE — Overview tab, 3 color-coded project cards
✅ 2b. Projects tab              DONE — full table + click-to-expand detail panels
✅ 3.  Risk alerts panel         DONE — Overview tab, between Health Snapshot and charts
⬜ 4.  Project switcher          NEXT
⬜ 5.  Column sorting            after #4
⬜ 6.  CSV export                after #5
⬜ 7.  README polish + share     Weekend
```

**Progress: 5 of 7 milestones — Risk Alerts panel complete, Project Switcher is next**

---

## Current State

Five-tab dashboard is built and running:
- ✅ Overview tab — KPI cards, Health Snapshot (3 project cards), daily charts, pipeline funnel, activity feed
- ✅ Projects tab — table with health/pace/quality/deadline columns, click-to-expand batch + expert detail panels (sorting is feature #5)
- ✅ Expert Roster tab — searchable table, trend % column, readiness score column, click-to-expand detail panel
- ✅ Pipeline tab — funnel visualization, stage health cards, static notes section
- ✅ Alerts tab — categorized alerts, acknowledge actions, timestamped log
- ✅ CSV import modal — Upload → Validation → Success. Replaces all dashboard data on confirm.

Theme: warm cream/pastel light. Fonts: Instrument Sans + Fira Code. Design tokens in `const T`.

---

## ✅ Completed This Session — Risk Alerts Panel (Step 3)

Risk Alerts panel added to Overview tab, between Health Snapshot cards and daily bar charts.

- Scans all PROJECTS at render time via `computeHealthScore` — no new state
- Filters to `status !== "healthy"` (at-risk + critical only)
- Per-row reason string: computes gap from 100 for each sub-score (pace, quality, load), sorts descending, takes the worst — gives the single most actionable explanation
- Header badge: red if any critical, amber if any at-risk, green if all clear
- Empty state: green dot + "All projects healthy" when no alerts
- Matched card style (borderRadius 14, padding 22) and badge pill style (`color + "1E"` alpha bg) from existing patterns
- Author byline updated: "Mike K." → "Michael Caruso" in dashboard footer, preview footer, and README

Expected output with current synthetic data:
- Medical QA Sprint → At Risk (amber) → "Expert load: avg 1.8 projects per person"
- Engineering Data Batch → Critical (red) → "Pace at 50% of required rate"
- Badge reads "2 need attention" in red

Both `dashboard.jsx` and `preview.html` updated in sync. Committed and pushed.

---

## ✅ Completed Previous Session — Projects Tab (Step 2b)

**Bug fixed:** Health Snapshot was rendering blank project and client names because the implementation used `project.project_name` and `client.client_name` — the actual data fields are `.name` for both. Fixed in both `dashboard.jsx` and `preview.html`.

**BATCHES constant added** — 8 batch records across 3 projects. Completed task counts sum to match each project's `completed_tasks` field:
- P-001: Contracts Set A (100%), Contracts Set B (44%), Regulations Set (0%)
- P-002: Diagnostic QA (70%), Treatment QA (0%)
- P-003: Systems Batch 1 (60%), Systems Batch 2 (40%), Systems Batch 3 (0%)

**Projects tab** — second in nav (Overview | Projects | Expert Roster | Pipeline | Alerts):
- 9-column table: Project, Client, Domain, Health, Pace, Quality, Experts, Deadline, Status
- All values computed at render time from PROJECTS, CLIENTS, BATCHES, computeHealthScore, experts state
- Pace and Health scores color-coded green/amber/red using T tokens
- Deadline turns red when < 7 days out
- Click a row → inline detail panel expands below it (React.Fragment pattern)
- Detail panel: left column = batch list with progress bars, right column = assigned experts with load count
- Click same row again → collapses (toggle via `selectedProject` state)

Expected table values (today ~2026-03-03):
| Project | Health | Pace | Quality | Deadline |
|---|---|---|---|---|
| Legal Annotation Q1 | 91.7 green | 96% | 96.5 | ~43d |
| Medical QA Sprint | 77.5 amber | 70% | 90.5 | ~2d over |
| Engineering Data Batch | 65.8 red | 50% | 79.0 | ~14d |

---

## Next Up — Step 4: Project Switcher

- Dropdown or tab control on the Overview tab to scope KPI cards and charts to a single project
- Requires promoting PROJECTS to useState so selection can drive filtered views
- Health Snapshot cards may become the selector (click a card → filters Overview)
- Design TBD — align with Brains chat before building

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
- BATCHES is not wired to CSV import — after a CSV import, the Projects tab detail panel still shows synthetic batch data. Batch-level import requires adding batch columns to the import schema and a BATCHES parser in the import handler.
- assigned_expert_ids on PROJECTS is not updated by CSV import either — expert panel in Projects tab detail will revert to synthetic expert IDs after import. Same fix scope as BATCHES.

---

## Do Not Do This Sprint

- Do not start on predictive scoring (v2)
- Do not build client-facing view (v2)
- Do not add domain-specific logic beyond filter tags
- Do not build column sorting or CSV export until features 2 and 3 are done
