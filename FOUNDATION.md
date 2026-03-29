# FOUNDATION.md — Expert Performance Dashboard

## Product Overview

A Strategic Projects Lead (SPL) dashboard for an AI training data company (reference context: micro1). The SPL manages thousands of domain experts (PhDs, professors, lawyers, doctors, financial analysts) who produce training data for frontier AI labs (OpenAI, Google, Microsoft). They own projects end to end, manage expert teams and their managers, track quality and delivery, communicate directly with AI lab clients, and report to the CEO.

**Core value proposition:** Surface "this project is going to miss" before it misses, and give the SPL enough context to act. This is a decision-support tool, not a reporting tool.

**v2 expanded value proposition:** Surface QA governance problems before they reach the client. IRR degradation, expert drift, and gold standard failures are caught inside the workflow, not discovered after delivery.

---

## v1 Scope (Shipped)

1. Project List — all active projects with health scores at a glance
2. Project Detail — pace vs. projection, quality trend, batch breakdown
3. Expert Panel — load per expert, throughput vs. baseline
4. Risk Alerts — projects flagged at-risk based on current pace
5. CSV import with two-tier validation
6. CSV export (project summary)

---

## v2 Scope

Three features. Same discipline as v1 — build these well before adding more.

1. **IRR Tracking View** — pairwise inter-rater reliability scores across experts, filterable by expert pair, task type, and time window. Visual threshold line at 0.8.
2. **Drift Monitoring** — accuracy metrics broken out by week, not just overall averages. Catches the "91% overall but 78% in recent weeks" problem.
3. **Gold Standard Tracking** — individual expert agreement rates against gold standard items over time. Flags experts below recalibration threshold.

---

## What Was Cut and Why

**Client-facing export (as a separate view):** Cut from v1. Replaced with structured CSV/Excel export. A half-finished client view shows less product thinking than one strong internal view.

**Deep domain modeling:** Scoped to domain tags as filters only. Full domain-specific logic explodes in complexity. Domain is metadata in v1, not a behavioral dimension.

**Audit cadence configuration, calibration session log, recalibration threshold alerts:** Scoped to v2 phase 2. The three core QA features (IRR, drift, gold standard) tell the governance story completely. These three add operational depth but are lower visual impact for a portfolio piece.

---

## Roadmap (Beyond v2)

- **Predictive delivery scoring:** Probability of on-time delivery as a percentage. Data model designed to support this now.
- **Expert load in health score:** Currently a visible data point. Incorporate into composite with explainability tooltip in a future version.
- **Audit cadence configuration:** Settings area where SPL defines sampling rates (e.g. 10% for veterans, 20% for new experts) and audit frequency.
- **Calibration session log:** Record of when calibration sessions happened, who attended, what topics were covered, and what rubric changes resulted. Creates an audit trail.
- **Recalibration threshold alerts:** Predefined triggers (IRR below 0.8, gold standard agreement below 85%) that surface on the dashboard.
- **Direct API integrations:** Jira, Airtable, Notion. v1 uses CSV import. Integrations layer on top of the same data model.
- **Client-facing dashboard view:** Filtered, read-only view for client stakeholders.
- **Expert sentiment signal:** Weekly pulse score (1-5) averaged per project. Low sentiment triggers closer quality review routing, never work restriction.
- **Outcome logging:** When a project closes, log delivery outcome to enable health score weight calibration over time.
- **Health score weight configurability:** Settings panel for SPL to adjust Pace/Quality/Load weighting.
- **Confidence intervals on projections:** Statistical ranges on pace projections once enough velocity history exists.

### A Note on Health Score Validation (The Intervention Paradox)

If the health score works as intended, SPLs always intervene when a project turns red, making failed projects rare and hard to validate against. The solution is counterfactual tracking: log every at-risk flag, what intervention was taken, and the outcome. Outcome logging is the prerequisite and is prioritized in the roadmap above.

### Future Consideration — Pre-Work Readiness Gate

A sentiment check before a work session begins that routes low-sentiment output to closer review. Not on the v2 roadmap. Key open question is how to prevent gaming once experts understand routing implications.

---

## Data Model

### Entity Hierarchy

```
Client → Project → Batch → Task → Expert
                                ↑
                    ExpertProjectAssignment

IRR_Record (Expert_A × Expert_B × Task)
GoldStandardItem (Task with known correct output)
GoldStandardResult (Expert × GoldStandardItem)
```

### Core Entities (v1, unchanged)

**Client**
- `client_id`
- `name`
- `industry`
- `quality_threshold` — minimum acceptable average quality score (0-100)
- `active` (boolean)

**Project**
- `project_id`
- `client_id` (FK)
- `name`
- `domain` — legal | medical | financial | engineering
- `start_date`
- `deadline`
- `target_task_count`
- `target_quality_score` (0-100)
- `status` — active | at-risk | completed | paused
- `health_score` — **derived, never stored**

**Batch**
- `batch_id`
- `project_id` (FK)
- `name`
- `due_date`
- `target_task_count`
- `completion_pct` — **derived**

**Task**
- `task_id`
- `batch_id` (FK)
- `domain`
- `expert_id` (FK)
- `status` — unassigned | in-progress | in-review | completed
- `created_date`
- `completion_date` (nullable, timestamped)
- `quality_score` (nullable until reviewed, 0-100)

**Expert**
- `expert_id`
- `name`
- `seniority` — junior | mid | senior | principal
- `domain_tags` (array)
- `baseline_throughput` — tasks per week
- `active` (boolean)

**ExpertProjectAssignment** (junction)
- `expert_id` (FK)
- `project_id` (FK)
- `assigned_date`
- `role` — lead | contributor | reviewer

---

### New Entities (v2)

**IRR_Record** — pairwise agreement between two experts on the same task
- `irr_id`
- `task_id` (FK)
- `expert_a_id` (FK)
- `expert_b_id` (FK)
- `agreement_score` (0-1, Cohen's Kappa)
- `task_type` — matches task domain
- `date_recorded`

*Aggregating IRR_Records gives IRR by expert pair, by task type, and by time window. The threshold for acceptable IRR is 0.8. Below 0.7 typically triggers a calibration session. Note: thresholds may vary by client and task type — legal annotation may demand 0.9+, more subjective tasks may accept 0.75.*

**GoldStandardItem** — a task with a known correct output, seeded invisibly into the work queue
- `gs_item_id`
- `task_id` (FK)
- `correct_output` (string descriptor)
- `domain`
- `date_created`

**GoldStandardResult** — recorded when an expert completes a gold standard item
- `gs_result_id`
- `gs_item_id` (FK)
- `expert_id` (FK)
- `expert_output` (string descriptor)
- `agreement_score` (0-1)
- `date_completed`

*Aggregating GoldStandardResults gives per-expert gold standard accuracy over time. The recalibration threshold is 85% agreement. Experts below this threshold are flagged.*

**QA_ThresholdConfig** — SPL-defined trigger points per project
- `project_id` (FK)
- `irr_threshold` (default 0.8)
- `gold_standard_threshold` (default 0.85)
- `audit_rate_veteran` (default 0.10)
- `audit_rate_new_expert` (default 0.20)
- `audit_frequency` — weekly | biweekly

---

### v2 Synthetic Expert Design

Two new experts added specifically to exhibit QA patterns. Existing eight experts are unchanged.

**Expert 9 — "Drift Expert"**
- Strong overall accuracy (91-93% average) that masks a declining recent trend
- IRR with peers is healthy (0.83-0.87) in weeks 1-6
- Weeks 7-8 show IRR dropping to 0.71-0.74 and accuracy dropping to 78%
- Gold standard agreement is borderline (82%, just below 85% threshold)
- Story: looks fine on overall averages, caught by drift monitoring and gold standard tracking

**Expert 10 — "Calibration Expert"**
- Consistent gold standard failures (68-72% agreement, well below 85% threshold)
- IRR with peers is erratic (ranges from 0.65 to 0.89 depending on task type)
- Overall accuracy looks acceptable (88%) because easy tasks inflate the average
- Story: overall metrics obscure a systematic calibration problem only visible through gold standard tracking

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
| Days to deadline | Deadline minus today |
| IRR by expert pair | Mean agreement_score across IRR_Records for that pair |
| IRR by time window | Mean agreement_score filtered by date_recorded range |
| Gold standard accuracy | Mean agreement_score across GoldStandardResults per expert |
| Drift delta | Recent window accuracy minus overall accuracy |

---

## Health Score Formula (v1, unchanged)

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

### Composite
```
health_score = (pace_score × 0.4) + (quality_score × 0.4) + (load_score × 0.2)
```

### Thresholds
| Score | Status |
|---|---|
| ≥ 85 | Healthy |
| 70-84 | At Risk |
| < 70 | Critical |

---

## IRR Thresholds

| Score | Status |
|---|---|
| ≥ 0.8 | Acceptable |
| 0.7-0.79 | Monitor |
| < 0.7 | Calibration required |

---

## Quality Score Thresholds (Expert Level)

| Context | Green | Amber | Red |
|---|---|---|---|
| Expert accuracy | ≥ 96% | 93-95.9% | < 93% |
| Pipeline throughput | ≥ 95% | 85-94.9% | < 85% |
| Readiness score | ≥ 85% | 65-84.9% | < 65% |
| Gold standard agreement | ≥ 85% | 75-84.9% | < 75% |

---

## Readiness Score (Expert Level)

Composite 0-100% from three weighted inputs:
- **Accuracy** (~60% weight) — stepped scoring: 60/55/48/38/25/10 points for bands ≥99/97/95/93/91/below
- **Task volume vs. 500-task ceiling** (~25% weight)
- **Task time efficiency vs. 25-minute target** (~15% weight)

Experts in "review" status hard-capped at 70 regardless of raw score.

---

## Import Schema

One flat CSV. Client info denormalized into every row, normalized on ingest.

| Column | Type | Required | Notes |
|---|---|---|---|
| `project_id` | string | ✅ | |
| `project_name` | string | ✅ | |
| `client_name` | string | ✅ | |
| `client_quality_threshold` | number (0-100) | ✅ | |
| `project_domain` | string | ✅ | legal \| medical \| financial \| engineering |
| `project_start_date` | date (YYYY-MM-DD) | ✅ | |
| `project_deadline` | date (YYYY-MM-DD) | ✅ | |
| `project_target_task_count` | integer | ✅ | |
| `project_target_quality_score` | number (0-100) | ✅ | |
| `batch_id` | string | ✅ | |
| `batch_name` | string | ✅ | |
| `batch_due_date` | date (YYYY-MM-DD) | ✅ | |
| `batch_target_task_count` | integer | ✅ | |
| `task_id` | string | ✅ | |
| `task_domain` | string | ✅ | |
| `task_status` | string | ✅ | unassigned \| in-progress \| in-review \| completed |
| `task_created_date` | date (YYYY-MM-DD) | ✅ | |
| `task_completion_date` | date (YYYY-MM-DD) | ❌ | Blank if not completed |
| `task_quality_score` | number (0-100) | ❌ | Blank if not reviewed |
| `expert_name` | string | ✅ | |
| `expert_seniority` | string | ✅ | junior \| mid \| senior \| principal |
| `expert_domains` | string | ✅ | Pipe-delimited: legal\|medical |
| `expert_baseline_throughput` | number | ✅ | Tasks per week |

### Validator Rules

**Errors (block import):**
- Missing required fields
- Dates that do not parse as YYYY-MM-DD
- Quality scores outside 0-100
- Tasks with status `completed` but no `task_completion_date`
- Unknown values in enum fields

**Warnings (flag but allow import):**
- Completion dates after project deadline
- Expert names with inconsistent domain tags across rows
- Batches where target task count does not reconcile with task rows

**Context warnings (dataset-level checks, flag before confirm):**
- Project IDs in the file that do not match any active project in the dashboard
- Expert names that do not fuzzy-match any existing expert in the system
- All task dates falling outside active project timelines
- Import volume dramatically larger or smaller than previous imports for the same project

---

## Export Schema

**Primary — Project Summary CSV** (one row per project):

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
- **Time series:** Task completion events stored with timestamps for future predictive features.
- **Preview:** `preview.html` uses React CDN + Babel standalone for zero-install browser preview.
- **SPL as consumer, not data entry clerk:** In production, IRR scores are computed automatically when two experts complete the same task. Gold standard results are captured by the task management system. The SPL opens the dashboard and sees current state. CSV import in the demo is a data model demonstration, not a realistic depiction of production ingestion.
