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

[2026-03-29] — E-009 (Dr. Priya Nair) accuracy set to 91.5% deliberately — High enough to avoid triggering v1 expert review flags, low enough to be plausible for a drifting expert. The drift story only becomes visible in IRR week-over-week and gold standard data; surface accuracy is misleading by design. Same principle: trend "down" + trendPct 3.8 gives a faint hint in the Expert Roster but doesn't scream crisis.

[2026-03-29] — E-010 (James Okafor) accuracy set to 88.0% and status "active" — Borderline acceptable overall accuracy that looks manageable. Status stays "active" (not "review") because the calibration problem is invisible in v1 metrics — that's the product point. The gold standard layer is what catches it.

[2026-03-29] — E-010 name collision with E-002 ("Prof. James Okafor") is intentional — Different ID (E-010 vs E-002), domain (Law vs Physics), and university (Columbia vs MIT) distinguish them unambiguously in the data. The name similarity is a deliberate design choice: common names exist in the real world, and the system should route by expert_id, not name string.

[2026-03-29] — IRR_RECORDS structured as 8 pairings × 8 weeks = 64 records — Three pairings for Nair (showing the drift), three for Okafor (showing erratic agreement), two control pairs (Chen+Volkov, Sharma+Al-Hassan, showing healthy consistent IRR). Control group is critical: without it, the charts have no baseline to compare against. 64 records is well over the 40-record minimum needed to make time-series charts readable.

[2026-03-29] — Nair IRR drop engineered to be visible only in weeks 7–8, not earlier — Weeks 1–6 scores stay 0.83–0.87 across all three pairings. Weeks 7–8 drop to 0.71–0.74. The story is: the weekly average would have looked fine until recently. This tests whether the drift visualization actually surfaces a late-breaking problem that overall averages would mask.

[2026-03-29] — Okafor IRR scores are erratic across all 8 weeks, not a clean drop — Scores swing 0.65–0.89 with no stable trend. This is a different failure mode than Nair's drift — it suggests inconsistent calibration to the annotation rubric, not a recent decline. The gold standard data (avg 0.70) tells the definitive story; IRR just shows the symptom.

[2026-03-29] — GOLD_STANDARD_RESULTS limited to 6 experts, not all 10 — Only experts relevant to the QA stories (E-009, E-010) plus four healthy controls (E-001, E-003, E-005, E-007) complete the gold standard items. Adding all 10 experts adds noise without adding story. The control group gives the SPL a visual reference for what passing looks like.

[2026-03-29] — `correct_output` field on GOLD_STANDARD_ITEMS uses full annotation strings — Brief but specific: "Flag as informed consent violation — patient signature predates disclosure document." Real enough to demonstrate that gold standard items are domain-specific, not generic. Not so verbose that they dominate the data file.

[2026-03-30] — IIFE pattern used for QA Governance tab logic instead of extracted component or top-level variables — All filter derivation, filtering, and summary computation for the tab are inside `{activeTab === "qa-governance" && (() => { ... })()}`. Variables stay scoped to the block without polluting Dashboard state or requiring useMemo. Trade-off: unusual pattern that could confuse unfamiliar readers; see tech debt note.

[2026-03-30] — IRRLineChart line color derived from per-pairing average, not per-point score — Each polyline is a single solid color (green/amber/red) based on the average agreement score across all visible weeks. Considered per-point coloring but rejected: a line that changes colors mid-path makes overall pairing health harder to read at a glance.

[2026-03-30] — COLORS rotation array (from plan) dropped in favor of semantic irrColor(avg) — Plan specified an 8-color palette rotation by pairing index. Final implementation uses `avg >= 0.8 → green, avg >= 0.7 → amber, else red` for every line. Semantic colors make the threshold line meaningful without requiring a legend to decode arbitrary palette assignments.

[2026-03-30] — `pairingKey(a, b)` uses pipe-delimited string "E-009|E-003" as canonical pair identifier — Used as React key, filter dropdown value, and Map key throughout. Splitting on `|` recovers individual IDs. Assumes expert_a_id always precedes expert_b_id consistently within IRR_RECORDS — true for synthetic data, fragile if records are ever generated with swapped ordering.

[2026-03-30] — `expertLabel(id)` is the single source of truth for all expert name display in QA tab — Always renders as "Name (ID)" (e.g., "James Okafor (E-010)"). Every pair label, table cell, legend entry, and dropdown option flows through it. This is the canonical solution to the E-002/E-010 "James Okafor" name collision without conditional logic at the render site.

[2026-03-30] — Trend delta thresholds set at < -0.05 (declining) and > +0.02 (improving) — -0.05 requires a meaningful 5-point drop across the early/late window split (wks 1–6 vs wks 7–8). +0.02 is intentionally low to surface genuine upward trends without requiring a large sample. Values between the two thresholds display as "→ stable". Both thresholds are arbitrary and candidates for making configurable.

[2026-03-30] — Filter state (`irrFilterPair`, `irrFilterTaskType`) held at Dashboard component level, not scoped to tab IIFE — State lifts to Dashboard so the selected filters persist if the user navigates to another tab and returns. If state were local to the IIFE it would reset on every tab switch.

[2026-03-30] — IRRLineChart x-axis hardcoded to 8 weeks — Week labels 1–8 are fixed. If filtered data spans fewer weeks the chart still shows all 8 labels; missing weeks simply have no points. Acceptable for the 8-week synthetic dataset. Would need to be data-driven for a variable time window.

[2026-03-30] — DriftLineChart y-axis zoomed to 70–100 instead of 0–100 — On a 0–100 scale, a 12-point drop from 90% to 78% is visually unremarkable (looks like a small dip near the top). Zooming to 70–100 compresses the scale so the same drop uses the full plot height. This is an intentional visual design choice to make the critical signal more dramatic.

[2026-03-30] — Drift flagging threshold set at delta < −10 points — A 10-point gap between overall accuracy and recent-window accuracy was chosen as a meaningful operational threshold. E-009's −12.0 pt drop is flagged; E-010's −2.45 pt erratic swing is not. The threshold is a module-level constant implicitly (via the literal in the flag condition). Candidate for making configurable.

[2026-03-30] — Recent window defined as weeks 7–8 (last 2 of 8) for drift computation — Both `driftSummaries` computation and `DriftLineChart` shading use `week_number >= 7`. This is the same late-window split used for IRR trend delta (wks 7–8 vs 1–6). Consistent framing across both panels; "recent" always means the same thing on the QA Governance tab.

[2026-03-30] — `driftShowFlaggedOnly` filter state held at Dashboard level — Same rationale as `irrFilterPair`/`irrFilterTaskType`: persists across tab switches. A user who toggles "Show flagged only", goes to Projects tab, and returns should still see the filtered view.

[2026-03-30] — Drift summary table rows sorted by delta ascending (most drifted first) — `sort((a, b) => a.delta - b.delta)` puts the most negative delta at the top. E-009 (−12.0) always appears first. This matches the operational priority: most concerning experts should be immediately visible without scrolling.

[2026-04-06] — Gold Standard panel uses a horizontal bar chart instead of a line chart — No time dimension in the data (all 60 results share a single date range). A line chart would have no meaningful x-axis. A horizontal bar chart shows relative standing at a glance and makes the threshold line's position immediately scannable left-to-right.

[2026-04-06] — GoldStandardChart left margin set to ML=180, wider than other charts — Expert labels ("Prof. Elena Volkov (E-005)") are significantly longer than the y-axis tick labels on line charts. ML=180 provides enough space at fontSize 9 without truncation.

[2026-04-06] — Gold Standard tracking uses two severity tiers below threshold: Monitor (0.75–0.84) and Recalibrate (<0.75) — Matches FOUNDATION.md quality thresholds exactly. A single "flagged" state would mask the difference between Nair (0.82, borderline) and Okafor (0.70, systematic failure). The two-tier system gives the SPL actionable signal: monitor vs. pull from rotation.

[2026-04-06] — No filter toggle on Gold Standard panel — Unlike Drift (which has "Show flagged only"), the Gold Standard panel always shows all 6 experts. With only 6 rows sorted worst-first, the two flagged experts are immediately at the top. A filter adds UI complexity without meaningful navigation benefit at this table size.

[2026-04-06] — Gold Standard rows sorted by avg ascending (lowest first) — Same rationale as Drift delta sort: most concerning expert (Okafor, 0.70) appears at the top of both the table and the bar chart without any interaction. Operational priority drives visual priority.
