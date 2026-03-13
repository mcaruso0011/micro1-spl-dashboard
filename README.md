# micro1 SPL Dashboard

A working demo of a data operations command center for managing AI training data projects at scale.

At companies like micro1, a Strategic Projects Lead coordinates teams of hundreds of domain experts — PhDs, lawyers, doctors, professors who produce the labeled data that frontier AI labs (OpenAI, Google, and others) use to train their models. The SPL owns quality, delivery, and expert performance across multiple simultaneous client projects. This dashboard is the tool that role needs: not a reporting view, but a decision-support surface that surfaces "this project is going to miss" before it misses — with enough context to act.

![Dashboard preview](dashboard-preview.png)

---

## What this demonstrates

- **Outcome-first health scoring.** A composite health score (pace 40% + quality 40% + expert load 20%) weights the inputs that actually predict delivery failure. Pace and quality are the primary signals; load is a leading indicator surfaced separately so it can be interrogated, not buried in a black box.

- **Separation of display logic from data model.** All derived fields — health score, pace, projected completion date, days to deadline, batch completion % — are computed at render time and never stored. The data model holds raw inputs only. This keeps the source of truth clean and makes it impossible for a stale cached value to contradict the display.

- **A validator that distinguishes blocking errors from judgment calls.** The CSV import modal runs a full validator before confirming: missing required fields and invalid enums block the import entirely; data quality warnings (completion dates after deadline, inconsistent expert domain tags, batch count mismatches) flag but allow. The distinction reflects how real ops data actually arrives — imperfect but usable.

- **Risk visibility at the right layer of abstraction.** The Risk Alerts panel doesn't just show a red number — it identifies the single largest contributing gap (pace, quality, or load) and states it in plain language. The SPL doesn't need to decode a composite score; they need to know what to fix.

- **Export designed for the actual workflow.** The CSV export produces one row per project with 12 columns including projected completion date and average expert load — structured to drop directly into Excel or Sheets for a client status update, not as raw data dump.

- **Progressive disclosure without modals.** Project and expert detail panels expand inline within their table rows. The full context (batches, assigned experts, load, SPL actions) is one click away without navigating away from the list view.

---

## Features

1. **Health Snapshot** — color-coded project cards on the Overview tab with health score, status badge, and days to deadline
2. **Risk Alerts panel** — surfaces at-risk and critical projects with a plain-language reason string derived from the worst sub-score gap
3. **Projects tab** — 9-column table with sortable headers; click any header to sort asc/desc/reset; expanding a row shows batch progress bars and assigned expert load
4. **Expert Roster** — searchable table with accuracy, trend %, and a composite readiness score; experts in review status are hard-capped at 70 regardless of raw score
5. **CSV import** — drag-and-drop upload with a full validation pass (errors block, warnings flag) before a one-click confirm that replaces all dashboard data
6. **CSV export** — downloads a 12-column project summary including projected completion date, health status, and average expert load

---

## How to run it

Open `preview.html` in any browser. No npm, no build step, no setup.

---

## Tech decisions

**Derived fields are computed, never stored.** Health score, pace, projected dates, and expert load are all calculated fresh at render time from raw inputs. This is the correct model for a monitoring tool: there is no sync problem, no stale cache, and no way for a displayed value to contradict the underlying data.

**Single enrichment pass before sort.** When sorting the Projects table, each project is enriched with all derived fields once before the comparator runs. The sort key and the row cells read from the same pre-computed object — `computeHealthScore` is called once per project per render regardless of sort state.

**Import validator uses a two-tier error model.** Hard errors block the import; soft warnings surface for review but allow the import to proceed. This matches real operational data: a missing required field is a data integrity failure; a completion date that slips past a deadline is a flag worth knowing, not a reason to reject the file.

**`{ key, dir }` sort state stored as one atomic object, not two `useState` values.** A single object update is atomic — there is no render between setting the key and setting the direction. Two separate state values would allow a transient render with a mismatched key/direction pair.

---

**Michael Caruso** — Built for the Strategic Projects Lead role at micro1.
