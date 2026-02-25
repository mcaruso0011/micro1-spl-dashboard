# FOUNDATION.md — Expert Performance Dashboard

## Product Overview

A Strategic Projects Lead (SPL) dashboard for an AI training data company (reference context: micro1). The SPL manages thousands of domain experts (PhDs, professors, lawyers, doctors, financial analysts) who produce training data for frontier AI labs (OpenAI, Google, Microsoft). They own projects end to end, manage expert teams and their managers, track quality and delivery, communicate directly with AI lab clients, and report to the CEO.

**Core value proposition:** Surface "this project is going to miss" before it misses — and give the SPL enough context to act. This is a decision-support tool, not a reporting tool.

---

## v1 Scope — What to Build

Four views, no more:

1. **Project List** — all active projects with health scores at a glance
2. **Project Detail** — pace vs. projection, quality trend, batch breakdown
3. **Expert Panel** — load per expert, throughput vs. baseline
4. **Risk Alerts** — projects flagged at-risk based on current pace

---

## What Was Cut and Why

**Client-facing export (as a separate view):** Cut from v1. Replaced with structured CSV/Excel export — one row per project, key metrics, importable anywhere. A half-finished client view shows less product thinking than one strong internal view.

**Deep domain modeling:** Scoped to domain tags as filters only. Full domain-specific logic explodes in complexity. Domain is metadata in v1, not a behavioral dimension.

---

## Roadmap (Not v1)

- **Predictive delivery scoring:** Probability of on-time delivery as a percentage, using expert velocity baselines, pace trend, and days remaining. Data model is designed to support this now — requires timestamped task completion event history.
- **Expert load in health score:** Currently surfaced as a visible data point. In v2, incorporate into composite with explainability tooltip showing the math.
- **Direct API integrations:** Jira, Airtable, Notion. v1 uses CSV import. Integrations layer on top of the same data model.
- **Client-facing dashboard view:** Filtered, read-only view for client stakeholders.
- **Confidence intervals on projections:** Layer statistical ranges onto pace projections once enough historical velocity data exists.

---

## Data Model

### Entity Hierarchy

```
Client → Project → Batch → Task → Expert
                                ↑
                    ExpertProjectAssignment
```

### Entities

**Client**
- `client_id`
- `name`
- `industry`
- `quality_threshold` — minimum acceptable average quality score (0–100)
- `active` (boolean)

**Project**
- `project_id`
- `client_id` (FK)
- `name`
- `domain` — legal | medical | financial | engineering
- `start_date`
- `deadline`
- `target_task_count`
- `target_quality_score` (0–100)
- `status` — active | at-risk | completed | paused
- `health_score` — **derived, never stored**

**Batch**
- `batch_id`
- `project_id` (FK)
- `name`
- `due_date`
- `target_task_count`
- `completion_pct` — **derived**

*A batch is a discrete deliverable chunk within a project — e.g., "Week 2 Legal Annotation Set." This is the unit the client typically receives.*

**Task**
- `task_id`
- `batch_id` (FK)
- `domain` — can differ from project-level domain for mixed projects
- `expert_id` (FK)
- `status` — unassigned | in-progress | in-review | completed
- `created_date`
- `completion_date` (nullable) — **must be timestamped, not just a status flag, to enable future prediction features**
- `quality_score` (nullable until reviewed, 0–100)

**Expert**
- `expert_id`
- `name`
- `seniority` — junior | mid | senior | principal
- `domain_tags` (array) — an expert can span multiple domains
- `baseline_throughput` — tasks per week, from historical data
- `active` (boolean)

**ExpertProjectAssignment** *(junction)*
- `expert_id` (FK)
- `project_id` (FK)
- `assigned_date`
- `role` — lead | contributor | reviewer

*Count of active assignments per expert = load. This is what makes overload visible.*

---

### Derived Fields (computed at runtime, never stored)

| Field | Computation |
|---|---|
| Project health score | Weighted composite (see formula below) |
| Batch completion % | Completed tasks / target task count |
| Expert current load | Count of active ExpertProjectAssignments |
| Expert pace vs. baseline | Current weekly task rate / baseline_throughput |
| Project pace vs. projection | Current completion rate / required rate to hit deadline |
| Projected completion date | Deadline estimate based on current pace |
| Days to deadline | Deadline − today |

---

## Health Score Formula

Three components, weighted. Score range 0–100.

### Pace Score (40%)
```
pace_score = min((completed_tasks / elapsed_days) / (target_task_count / total_days), 1) × 100
```

### Quality Score (40%)
```
quality_score = (rolling_avg_quality_last_20_tasks / project_target_quality_score) × 100
```

### Expert Load Score (20%)
```
load_score = (1 / avg_active_project_count_across_assigned_experts) × 100
```
One project = 100, five projects = 20. Averaged across all assigned experts.

### Composite
```
health_score = (pace_score × 0.4) + (quality_score × 0.4) + (load_score × 0.2)
```

### Thresholds

| Score | Status |
|---|---|
| ≥ 85 | 🟢 Healthy |
| 70–84 | 🟡 At Risk |
| < 70 | 🔴 Critical |

*Thresholds are configurable and could eventually be client-specific.*

---

## Quality Score Thresholds (Expert Level)

Context-specific thresholds are intentional — different views use different scales:

| Context | Green | Amber | Red |
|---|---|---|---|
| Expert accuracy | ≥ 96% | 93–95.9% | < 93% |
| Pipeline throughput | ≥ 95% | 85–94.9% | < 85% |
| Readiness score | ≥ 85% | 65–84.9% | < 65% |

---

## Readiness Score (Expert Level)

Composite 0–100% from three weighted inputs:

- **Accuracy** (~60% weight) — stepped scoring: 60/55/48/38/25/10 points for bands ≥99/97/95/93/91/below. Non-linear because the difference between 91% and 93% is more operationally meaningful than 97% to 99%.
- **Task volume vs. 500-task ceiling** (~25% weight)
- **Task time efficiency vs. 25-minute target** (~15% weight)

Experts in "review" status are hard-capped at 70 regardless of raw score. Reflects that they have real performance data but an active concern requiring oversight.

---

## Import Schema

One flat CSV. Client info is denormalized into every row and normalized on ingest.

| Column | Type | Required | Notes |
|---|---|---|---|
| `project_id` | string | ✅ | |
| `project_name` | string | ✅ | |
| `client_name` | string | ✅ | Denormalized, normalized on ingest |
| `client_quality_threshold` | number (0–100) | ✅ | |
| `project_domain` | string | ✅ | legal \| medical \| financial \| engineering |
| `project_start_date` | date (YYYY-MM-DD) | ✅ | |
| `project_deadline` | date (YYYY-MM-DD) | ✅ | |
| `project_target_task_count` | integer | ✅ | |
| `project_target_quality_score` | number (0–100) | ✅ | |
| `batch_id` | string | ✅ | |
| `batch_name` | string | ✅ | |
| `batch_due_date` | date (YYYY-MM-DD) | ✅ | |
| `batch_target_task_count` | integer | ✅ | |
| `task_id` | string | ✅ | |
| `task_domain` | string | ✅ | Can differ from project_domain |
| `task_status` | string | ✅ | unassigned \| in-progress \| in-review \| completed |
| `task_created_date` | date (YYYY-MM-DD) | ✅ | |
| `task_completion_date` | date (YYYY-MM-DD) | ❌ | Blank if not completed |
| `task_quality_score` | number (0–100) | ❌ | Blank if not reviewed |
| `expert_name` | string | ✅ | |
| `expert_seniority` | string | ✅ | junior \| mid \| senior \| principal |
| `expert_domains` | string | ✅ | Pipe-delimited: `legal\|medical` |
| `expert_baseline_throughput` | number | ✅ | Tasks per week |

### Validator Rules

**Errors (block import):**
- Missing required fields
- Dates that don't parse as YYYY-MM-DD
- Quality scores outside 0–100
- Tasks with status `completed` but no `task_completion_date`
- Unknown values in enum fields

**Warnings (flag but allow import):**
- Completion dates after project deadline
- Expert names with inconsistent domain tags across rows
- Batches where target task count doesn't reconcile with task rows

---

## Export Schema

**Primary — Project Summary CSV** (one row per project, drops cleanly into Excel/Sheets):

| Column | Description |
|---|---|
| `project_name` | |
| `client_name` | |
| `domain` | |
| `deadline` | |
| `days_to_deadline` | Computed |
| `health_score` | Computed composite |
| `health_status` | Healthy / At Risk / Critical |
| `task_completion_pct` | Completed / target |
| `avg_quality_score` | Rolling average |
| `projected_completion_date` | Based on current pace |
| `expert_count` | Assigned experts |
| `avg_expert_load` | Avg active project count across experts |

**Secondary — Raw Task-Level CSV:** Full task list with all fields, for deep analysis.

---

## Technical Constraints

- **Stack:** React, single-file component
- **Data:** Synthetic/mock pre-loaded at launch. CSV import populates the same data model.
- **Derived fields:** Always computed at render time, never written back to data store.
- **Time series:** Task completion events stored with timestamps (not just current status) — required for future predictive features.
- **Preview:** `preview.html` uses React CDN + Babel standalone for zero-install browser preview.
