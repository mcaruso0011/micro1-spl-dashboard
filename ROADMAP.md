# ROADMAP.md — v2 and Beyond

This document covers the honest gap between v1 (a working demo with synthetic data) and a production deployment. It includes known limitations, planned v2 features, and architectural considerations for real-world scale.

---

## v2 Gold Camo — In Progress

Three QA governance features that represent the core of what makes training data valuable to frontier AI labs.

```
⬜ 1. IRR Tracking View
⬜ 2. Drift Monitoring
⬜ 3. Gold Standard Tracking
```

### IRR Tracking View
A panel showing inter-rater reliability scores across expert pairs over time. Filterable by expert pair, task type, and time window. Visual threshold line at 0.8 so degradation is immediately visible.

IRR (Inter-Rater Reliability) measures how consistently two experts make the same judgment on the same task. A score of 1.0 is perfect agreement; 0.8 is the widely accepted minimum threshold for quality training data. Below 0.7 typically triggers a calibration session. Thresholds vary by client and task type: legal annotation may demand 0.9+, more subjective tasks may accept 0.75. The SPL negotiates these thresholds with each client at project setup.

### Drift Monitoring
Accuracy metrics broken out by time window rather than overall averages. A line chart showing week-over-week accuracy per expert and per task type. This is the feature that catches the "91% overall but 78% in recent weeks" problem — overall averages hide trends that matter operationally.

### Gold Standard Tracking
Individual expert agreement rates against gold standard items over time. Gold standard items are tasks with known correct outputs, seeded invisibly into the work queue. Experts do not know which tasks are gold standard. Agreement rates below 85% trigger a recalibration flag. This catches individual calibration problems even when peer-to-peer IRR looks acceptable.

---

## v2 Phase 2 (After Gold Camo)

### Audit Cadence Configuration
A settings area where the SPL defines sampling rates (e.g. 10% for veterans, 20% for new experts) and audit frequency (weekly, biweekly). Displays how many annotations were sampled vs. total output per period.

### Calibration Session Log
A record of when calibration sessions happened, who attended, what topics were covered, and what rubric changes resulted. Creates an audit trail showing QA governance is systematic rather than ad hoc.

### Recalibration Threshold Alerts
Predefined triggers (IRR below 0.8, gold standard agreement below 85%) that surface alerts on the dashboard with clear visual indicators. Extension of the v1 Risk Alerts pattern applied to QA signals.

---

## Known Limitations in v1

**Synthetic data only.** All project, expert, batch, and task data is hardcoded. The CSV import replaces the expert and pipeline views but does not update the Projects tab batch detail panels or expert assignment data. A full production implementation would replace all synthetic constants with a real database and API layer.

**No persistent state.** Data resets on every page reload. There is no backend, no database, and no user accounts. Everything lives in browser memory for the session.

**Health score weights are not empirically validated.** The 40/40/20 weighting (pace, quality, load) reflects a reasonable prior, not measured outcomes. Real validation requires months of outcome data and a counterfactual tracking system.

**Batch and assignment data not wired to CSV import.** The Projects tab detail panel draws from synthetic constants that are not replaced on CSV import.

**No per-task time field in import schema.** Average task time and throughput trend cannot be derived from the current CSV format.

**Pipeline Notes section is hardcoded.** Does not update when data changes.

**Single-file React component.** All logic, state, and UI lives in one file. This works for a demo and has real advantages (single developer ownership, no abstraction overhead, easy to delegate). In a larger team context, components would be split into separate files with dedicated controllers. The current structure may also encounter browser-side performance limits at scale since all computation happens client-side.

---

## Further Roadmap

- **Predictive delivery scoring** — probability of on-time delivery as a percentage
- **Expert sentiment signal** — weekly 1-5 pulse score as a quality routing signal (never a work restriction)
- **Outcome logging** — prerequisite for health score weight validation
- **Health score weight configurability** — empirical tuning once outcome data exists
- **Direct API integrations** — Jira, Airtable, Notion replacing CSV import
- **Client-facing dashboard view** — filtered read-only view requiring auth layer
- **Confidence intervals on projections** — statistical ranges on pace projections

---

## Production Architecture Considerations

The following reflects engineering review feedback and represents the real design challenges between this prototype and a production system.

**This is a frontend-only prototype.** A production version requires a backend server, a real database, and an authentication layer. The React frontend would remain as the UI layer but would shift from computing everything locally to consuming an API that handles business logic server-side.

**The SPL should be a consumer of the dashboard, not a data entry clerk.** In production, IRR scores compute automatically when two experts complete the same task. Gold standard results are captured by the task management system the moment an expert submits work on a flagged item. The SPL opens the dashboard and sees the current state. The CSV import in the demo is a data model demonstration, not a realistic depiction of how data gets in.

**The backend design is the hard problem.** Key questions before any backend is built: Does the dashboard need real-time data or is periodic refresh acceptable? If real-time, does it poll a data store every N seconds, consume a real-time data feed, or hold open a WebSocket connection? The answer drives the entire infrastructure design and has significant cost and complexity implications.

**Client-side computation has scale limits.** Currently all health score calculations, sorting, filtering, and projections run in the browser. At scale with hundreds of projects and thousands of experts, computation moves server-side and the frontend receives pre-computed results via API.

**API integration introduces auth and deduplication complexity.** When the dashboard pulls from external tools (Jira, Airtable), every user who opens the page triggers API requests. This creates duplicate requests at scale and requires a centralized auth layer to manage credentials. A backend service that owns the external API connections and caches responses is the standard solution.

**Role-based access control (RBAC) is required before multi-user deployment.** A CEO sees all projects. An SPL sees their assigned projects. An expert sees only their own tasks. The ExpertProjectAssignment junction table is the natural access control boundary.

**Recommended stack for production:**
- Frontend: React (as built)
- Backend: Node.js or Python with FastAPI
- Database: PostgreSQL (entity model in FOUNDATION.md maps directly to relational tables)
- Auth: Auth0 or AWS Cognito
- Hosting: AWS, Vercel, or similar

---

## The Intervention Paradox

If the health score works as intended, SPLs always intervene when a project turns red, making failed projects rare and validation difficult. The solution is counterfactual tracking: log every at-risk flag, what intervention was taken, and the actual outcome. Outcome logging is the prerequisite and is prioritized in the roadmap.

---

## Future Consideration — Pre-Work Readiness Gate

A sentiment check before a work session that routes low-sentiment output to closer review. Not on the v2 roadmap. The core open question is how to prevent gaming once experts understand that low scores trigger additional scrutiny. The weekly sentiment signal is the lower-risk version to build and validate first.
