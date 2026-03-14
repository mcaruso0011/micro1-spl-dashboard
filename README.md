# micro1 SPL Dashboard

A working demo of a data operations command center for managing AI training data projects at scale.

At companies like micro1, a Strategic Projects Lead coordinates teams of hundreds of domain experts (PhDs, lawyers, doctors, and professors) who produce the labeled data that frontier AI labs use to train their models. The SPL owns quality, delivery, and expert performance across multiple simultaneous client projects. This dashboard is built for that role: a decision-support surface that surfaces "this project is going to miss" before it misses, with enough context to act.

![Dashboard Overview](dashboard-preview.png)

---

## How to run it

1. Download or clone this repo
2. Open `preview.html` in any browser

No npm. No build step. No setup. It runs immediately.

---

## What this demonstrates

- **Outcome-first health scoring.** A composite health score (pace 40% + quality 40% + expert load 20%) weights the inputs that actually predict delivery failure. Pace and quality are the primary signals; load is a leading indicator surfaced separately so the SPL can interrogate each component rather than trust a single number.

- **Risk visibility at the right layer of abstraction.** The Risk Alerts panel identifies the single largest contributing gap (pace, quality, or load) and states it in plain language. The SPL sees what to fix, not just that something is wrong.

- **Separation of display logic from data model.** All derived fields (health score, pace, projected completion date, days to deadline, batch completion %) are computed at render time and never stored. The data model holds raw inputs only, eliminating stale cache and sync problems entirely.

- **A validator that distinguishes blocking errors from judgment calls.** The CSV import modal runs a full validator before confirming. Missing required fields block the import; data quality warnings (completion dates after deadline, inconsistent expert domain tags) flag but allow. This reflects how real operational data actually arrives.

- **Export designed for the actual workflow.** The CSV export produces one row per project with 12 columns including projected completion date and average expert load, structured to drop directly into Excel or Sheets for a client update.

- **Progressive disclosure without modals.** Project and expert detail panels expand inline within their table rows. Full context (batches, assigned experts, load) is one click away without navigating away from the list view.

---

## Features

1. **Health Snapshot** — color-coded project cards on the Overview tab with composite health score, status badge, and live days-to-deadline countdown
2. **Risk Alerts panel** — surfaces only at-risk and critical projects with a plain-language reason string derived from the worst sub-score gap; shows "All projects healthy" when clear
3. **Projects tab** — 9-column sortable table; click any header to sort asc / desc / reset; expanding a row shows batch progress bars and assigned expert load
4. **Expert Roster** — searchable table with accuracy %, week-over-week trend, and a composite readiness score; experts in review status hard-capped at 70 regardless of raw score
5. **CSV import** — drag-and-drop upload with full validation (errors block, warnings flag) and a confirmation preview before data is replaced
6. **CSV export** — downloads a 12-column project summary including projected completion date, health status, and average expert load

---

## Tech decisions worth noting

**Derived fields are computed, never stored.** Health score, pace, projected dates, and expert load are calculated fresh at render time from raw inputs. There is no sync problem and no stale cache.

**Single enrichment pass before sort.** When sorting the Projects table, each project is enriched with all derived fields once before the comparator runs. The sort key and the row cells read from the same pre-computed object, so `computeHealthScore` is called once per project per render regardless of sort state.

**Two-tier import validator.** Hard errors block the import; soft warnings surface for review but allow it to proceed. A missing required field is a data integrity failure. A completion date past a deadline is a flag worth knowing, not a reason to reject the file.

**Atomic sort state.** Sort key and direction are stored as one `{ key, dir }` object rather than two separate `useState` values, eliminating any transient render with a mismatched key/direction pair.

---

## Project structure

```
micro1-spl-dashboard/
├── dashboard.jsx          ← Main React component (all logic and UI)
├── preview.html           ← Zero-install browser preview
├── FOUNDATION.md          ← Product spec, data model, health score formula
├── DECISIONS.md           ← Full dated decision log
├── CURRENT_SPRINT.md      ← Sprint scratchpad (active work and open questions)
├── ROADMAP.md             ← v2 features, known limitations, production considerations
├── RESEARCH.md            ← micro1 context and role research
└── README.md              ← You are here
```

---

## What's next

This is v1, a working demo with synthetic data. See [ROADMAP.md](ROADMAP.md) for the full gap analysis between this and a production deployment, including known limitations, v2 features, and backend architecture considerations.

---

**Michael Caruso** — Built for the Strategic Projects Lead role at micro1.
