# DECISIONS.md — Decision Log

Chronological record of all product and architectural decisions. Entries added by Claude Code at end of each session, and by Brains chat (Claude.ai) for strategic decisions.

Format: `[YYYY-MM-DD] — [Decision] — [Reason / tradeoff]`

---

## Strategic Decisions (from Brains chat)

[2026-02-23] — Dashboard core value proposition defined as "surface problems before they happen, not after" — Distinguishes this from a reporting tool. Every feature prioritized against this framing.

[2026-02-23] — v1 scoped to four views only: Project List, Project Detail, Expert Panel, Risk Alerts — Prevents scope creep. Six mediocre views is worse than three excellent ones for both usability and portfolio impact.

[2026-02-23] — Client-facing export scoped to CSV/Excel only, not a separate dashboard view — CSV drops into any tool (Excel, Sheets, Tableau). HTML export is a dead end for operational data. Primary export is project summary (one row per project), secondary is raw task-level.

[2026-02-23] — Health score formula locked: Pace 40% + Quality 40% + Expert Load 20% — Pace and quality are the core signals. Load is a leading indicator but harder to interpret in isolation, so weighted lower. All three are visible separately so the SPL can interrogate the composite.

[2026-02-23] — Expert load surfaced as visible data point in v1, not baked into health score until v2 — In v2, incorporate with explainability tooltip. Hiding load inside a black-box composite reduces trust for executive users.

[2026-02-23] — Predictive delivery scoring (% probability of on-time delivery) scoped to v2 — Data model designed to support it now. Requires timestamped task completion events, not just status snapshots. Note: store timestamps on all task completions from day one.

[2026-02-23] — Data model hierarchy: Client → Project → Batch → Task, with ExpertProjectAssignment as junction — Batch layer is critical. It's the unit clients actually receive, and it's what makes partial delivery tracking possible.

[2026-02-23] — All derived fields computed at runtime, never stored — Keeps data model clean and synthetic data manageable. health_score, pace, load, projections are all computed fresh on render.

[2026-02-23] — CSV import with validation modal is the v1 ingestion path — No API integrations in v1. Template-based CSV import is what actually gets adopted in real ops tools because it requires no IT involvement. Validator shows errors (block) and warnings (flag but allow) with a preview before commit.

[2026-02-23] — Three-file documentation system adopted: FOUNDATION.md (stable spec) + DECISIONS.md (this file) + CURRENT_SPRINT.md (active scratchpad) — Prevents context window bloat. Claude Code reads FOUNDATION + CURRENT_SPRINT each session. DECISIONS.md is for strategy sessions only.

[2026-02-23] — Domain tags used as filters only in v1, not as behavioral dimensions — Full domain-specific logic (different quality thresholds per domain, domain-specific readiness models) explodes scope. Revisit in v2.

---

## Implementation Decisions (from Claude Code sessions)

[2026-02-23] — Replaced dark theme with warm cream/pastel light palette — Original dark theme (`#0b0f1a`, slate grays) felt generic. Switched to warm cream (`#F5F0E8`), near-white cards (`#FDFAF6`), warm brown text (`#2A2018`), soft pastel accents. Goal: original aesthetic that doesn't read as AI-generated.

[2026-02-23] — Introduced design token object (`const T`) at top of file — All colors and font strings centralized. Makes palette changes a one-place edit. Inferred from code.

[2026-02-23] — Swapped DM Sans → Instrument Sans, JetBrains Mono → Fira Code — Common defaults read as generic. Instrument Sans (Figma's design system font) has more distinctive letterforms. Fira Code is warmer at data sizes. Both via Google Fonts.

[2026-02-23] — Logo mark gradient changed to lavender → dusty blue — Follows new palette: lavender (`#9285C2`) primary, dusty blue (`#7AA3C7`) secondary. Inferred from code.

[2026-02-23] — Added `preview.html` for zero-install browser preview — dashboard.jsx requires a React build environment. preview.html uses React UMD + Babel standalone, opens directly in any browser without npm.

[2026-02-23] — Added `trendPct` field to expert records — Trend was direction-only. Added week-over-week accuracy change percentage (e.g., `trendPct: 2.1`) so Trend column shows both arrow and numeric value. Values are simulated.

[2026-02-23] — Added Readiness score column to Expert Roster — Composite 0–100% from accuracy (stepped, ~60% weight), task volume vs. 500-task ceiling (~25%), task time efficiency vs. 25-minute target (~15%). Review status hard-capped at 70.

[2026-02-23] — Accuracy thresholds use stepped scoring, not linear — Assigns 60/55/48/38/25/10 points for bands ≥99/97/95/93/91/below. Non-linear reflects that 91→93% is more operationally meaningful than 97→99%.

[2026-02-23] — Review status caps readiness at 70, not 0 — Expert has real performance data; cap at 70 reflects close-to-qualified with active concern, not disqualified.

[2026-02-23] — Accuracy color thresholds: ≥96% green, ≥93% amber, <93% red — Pipeline uses different thresholds (≥95%/≥85%). Readiness uses a third set (≥85%/≥65%). Context-specific thresholds are intentional.

[2026-02-23] — Pipeline funnel bar: >10 errors triggers amber→red gradient — ≤10 errors = blue→lavender. Threshold is arbitrary, candidate for making configurable. Inferred from code.

[2026-02-23] — Overview activity feed shows top 3 alerts only — Full list in Alerts tab. No "see more" link currently. Inferred from code.

[2026-02-23] — Expert detail panel is click-toggled inline on table row — State in `selectedExpert`. No modal or drawer. Inferred from code.

[2026-02-23] — `velocity` field in DAILY_METRICS is computed but not rendered — Candidate for surfacing in a chart or removing. Inferred from code.

[2026-02-23] — Pipeline Notes section is static hardcoded text — Bottleneck analysis and reallocation recommendation are literal strings, not generated from data. Must be kept in sync manually. Inferred from code.

[2026-02-23] — Live clock updates every 60 seconds via setInterval — Interval cleaned up on unmount via useEffect return. Inferred from code.

[2026-02-23] — Fade-in animation on mount via opacity transition — `animateIn` state flips in useEffect, triggers 0.6s opacity transition on root div. Purely cosmetic. Inferred from code.

[2026-02-24] — CSV import modal implemented as a three-stage flow: Upload → Validation → Success — Stage 1 has drag-drop zone and template download. Stage 2 runs full FOUNDATION.md validator (errors block, warnings flag) and shows a confirm button. Stage 3 auto-closes after 2 seconds. Replaces all dashboard state on confirm.

[2026-02-24] — `ImportModal` defined as top-level function outside `Dashboard()`, not nested inside it — Nested component definitions cause React to treat them as new component types on every parent re-render, forcing full remount and destroying internal state (drag-over, file input ref). Top-level definition with props passed in avoids this.

[2026-02-24] — Auto-dismiss useEffect placed in `Dashboard`, not in `ImportModal` — Placing it in `ImportModal` risks stale closure reads of `importStage`. Dashboard reads its own state directly, so the cleanup always fires against the current value.

[2026-02-24] — `parseDateLocal(str)` uses `new Date(y, m-1, d)` instead of `new Date(str)` — ISO strings parsed by `new Date()` are treated as UTC midnight, shifting `getDay()` in UTC+ timezones. Local constructor guarantees correct day-of-week bucketing for daily metrics.

[2026-02-24] — `MiniBar` gets `|| 1` zero-max guard and a "No data" empty state — When all values are 0 (e.g., no completed tasks in imported CSV), `Math.max(...) === 0` causes NaN bar heights. Guard prevents broken rendering without hiding the component.

[2026-02-24] — `calcReadiness` gets null guard for `accuracy` — Imported experts may have no quality scores, so `accuracy` is `null`. The stepped comparison chain fails silently on null. Guard returns 0 rather than crashing.

[2026-02-24] — Four module-level constants (EXPERTS, PIPELINE_STAGES, DAILY_METRICS, ALERTS) promoted to `useState` initial values — Dashboard now holds live data in state, replaceable by CSV import without a page reload. Module-level constants remain as seed values only.

[2026-02-24] — avgTime and trendPct cannot be derived from import schema; default to null and 0 — Import schema has no per-task time field. All import-derived experts show "—" in Avg Time column and a stable trend arrow. Documented as known limitation.

[2026-02-24] — Pipeline stages synthesized from task status distribution after import — Five named stages (Ingestion → Client Delivery) are computed proportionally from task statuses rather than stored explicitly. Throughput = completed/tasks * 100, guarded against divide-by-zero.

[2026-02-24] — Excel BOM stripping added to `parseCSV` — Excel-generated CSVs prepend `\uFEFF` (UTF-8 BOM), corrupting the first column name. Stripped in `parseCSV` with `text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text`.

[2026-02-28] — CLIENTS and PROJECTS added as module-level constants, not useState — No UI reads them yet. Keeping them as constants until the project switcher is built next session; promoting to state at that point avoids premature wiring.

[2026-02-28] — Project lifecycle `status` ("active") is separate from computed health `status` ("healthy"/"at-risk"/"critical") — PROJECTS[n].status is the operational lifecycle field per FOUNDATION.md. computeHealthScore returns its own status field. No field name collision; different objects.

[2026-02-28] — quality_score capped at 100 in computeHealthScore — FOUNDATION.md does not explicitly cap it, but scores above 100 distort the composite. P-001 would compute 104.9 uncapped. Cap applied with Math.min(..., 100).

[2026-02-28] — computeHealthScore takes allProjects as second argument rather than reading module-level PROJECTS — Keeps it a pure function with no external dependencies, consistent with calcReadiness(expert). Enables unit testing and future state-based calls without refactoring.

[2026-02-28] — Clients changed from OpenAI/Google/Microsoft to Lab Alpha/Lab Beta/NovaMed AI — Plan originally used real company names as placeholders. Switched to fictional names to avoid implying real partnerships in a portfolio demo.

[2026-03-03] — BATCHES added as module-level constant (not useState) — Same rationale as CLIENTS/PROJECTS: no CSV import path updates them yet. 8 records across 3 projects; completed_tasks values sum to each project's completed_tasks field so batch-level and project-level totals stay consistent.

[2026-03-03] — Projects tab uses React.Fragment per row to allow the detail panel to render as a sibling <tr> — A detail panel that spans all 9 columns must be a <tr> child of <tbody>. React.Fragment is the only way to return two <tr> elements from a single .map() iteration without introducing an extra DOM wrapper that would break table structure.

[2026-03-03] — Expert load in Projects tab detail panel computed inline from PROJECTS.filter() — No stored load field. Count of PROJECTS where assigned_expert_ids.includes(eid) is the correct derived value per FOUNDATION.md data model. Consistent with the load_score formula in computeHealthScore.

[2026-03-03] — Batch progress bar color: green at 100%, amber if in progress, track color if 0% — 0% renders as an invisible fill (same color as track) rather than a colored sliver, which would falsely imply progress. Green only when fully complete — amber for any partial state.

[2026-03-03] — Projects tab placed second in nav (after Overview) — It is the primary working view for the SPL; Overview is the quick-glance summary. Positioning reflects usage frequency: scan Overview first, then drill into Projects.
