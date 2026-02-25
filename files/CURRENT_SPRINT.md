# CURRENT_SPRINT.md — Active Work

*Wipe and rewrite at the start of each new sprint. This is the short-term scratchpad Claude Code reads alongside FOUNDATION.md.*

---

## Current State

Four-tab dashboard is built and running:
- ✅ Overview tab — KPI cards, daily charts, pipeline funnel, activity feed (top 3 alerts)
- ✅ Expert Roster tab — searchable table, trend % column, readiness score column, click-to-expand detail panel
- ✅ Pipeline tab — funnel visualization, stage health cards, static notes section
- ✅ Alerts tab — categorized alerts, acknowledge actions, timestamped log
- ✅ CSV import modal — Upload (drag-drop + template download) → Validation (errors block, warnings flag) → Success (auto-closes in 2s). Replaces all dashboard data on confirm.

Theme: warm cream/pastel light. Fonts: Instrument Sans + Fira Code. Design tokens in `const T`.

Both `dashboard.jsx` and `preview.html` are in sync.

---

## In Progress

Nothing currently in progress.

---

## Up Next (Priority Order)

1. **Column sorting on expert table** — click column headers to sort ascending/descending
2. **CSV export** — Project Summary CSV (primary), Raw Task-Level CSV (secondary). See FOUNDATION.md for export schema.
3. **Project switcher** — dropdown to toggle between multiple simulated lab projects

---

## Open Questions

- **`velocity` field in DAILY_METRICS** — computed but never rendered. Surface in a chart or remove?
- **Pipeline Notes section** — currently hardcoded strings. Should this derive from pipeline data, or stay editorial?
- **Expert sparklines** — directional trend % was added instead of sparklines. Are sparklines still wanted as a separate enhancement?
- **Pipeline funnel error threshold (>10)** — currently arbitrary. Should this be configurable per project or per client?

---

## Known Issues / Tech Debt

- Pipeline Notes bottleneck analysis does not update when data changes — hardcoded text
- No "see more" link from Overview activity feed to Alerts tab
- README.md still references old dark theme and DM Sans fonts — needs update

---

## Do Not Do This Sprint

- Do not start on predictive scoring (v2)
- Do not build client-facing view (v2)
- Do not add domain-specific logic beyond filter tags
