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

[2026-03-29] — v2 scope locked to three QA governance features: IRR Tracking, Drift Monitoring, Gold Standard Tracking — These three tell the QA governance story completely and are the highest visual impact for a portfolio piece. Audit cadence configuration, calibration session log, and recalibration threshold alerts scoped to v2 phase 2.

[2026-03-29] — Two new synthetic experts added specifically for QA pattern demonstration — Dr. Priya Nair (drift pattern: healthy overall metrics masking recent decline) and James Okafor (calibration pattern: acceptable overall accuracy masking systematic gold standard failures). Existing eight experts unchanged to preserve v1 dashboard behavior.

[2026-03-29] — QA data modeled as three new module-level constants: IRR_RECORDS, GOLD_STANDARD_ITEMS, GOLD_STANDARD_RESULTS — Same rationale as CLIENTS/PROJECTS/BATCHES in v1. No useState until UI is wired. Module-level constants keep data design separate from render logic.

[2026-03-29] — SPL positioned as consumer of dashboard, not data entry clerk — Documented in FOUNDATION.md as a core product principle. CSV import is a data model demonstration for the portfolio piece, not a realistic production ingestion path. In production, IRR scores compute automatically from task completions; gold standard results are captured by the task management system.

[2026-03-29] — Import validator extended with context-level warnings — In addition to field-level errors and warnings, a third tier of dataset-level context checks added: project ID reconciliation, expert name fuzzy matching, date range sanity check, and volume anomaly detection. These catch "wrong dataset uploaded" scenarios before data goes live.

[2026-03-29] — IRR threshold documented as 0.8 with client/task-type variability noted — 0.8 is the widely used convention but legal annotation may demand 0.9+, subjective tasks may accept 0.75. SPL would negotiate thresholds with each client at project setup. Dashboard threshold line is configurable per QA_ThresholdConfig in the data model.
