# ROADMAP.md — v2 and Beyond

This document covers the honest gap between v1 (a working demo with synthetic data) and a production deployment. It includes known limitations in the current build, planned v2 features, and architectural considerations for real-world scale. The goal is to be direct about what exists and what doesn't.

---

## Known Limitations in v1

**Synthetic data only.** All project, expert, batch, and task data is hardcoded. The CSV import replaces the expert and pipeline views but does not update the Projects tab batch detail panels or expert assignment data — those still render from synthetic constants after an import. A full production implementation would replace all synthetic constants with a real database and API layer.

**No persistent state.** Data resets on every page reload. There is no backend, no database, and no user accounts. Everything lives in browser memory for the duration of the session.

**Health score weights are not empirically validated.** The 40/40/20 weighting (pace, quality, load) reflects a reasonable prior about what predicts delivery failure, not measured outcomes. Real validation requires months of outcome data and a counterfactual tracking system.

**Batch and assignment data not wired to CSV import.** The Projects tab detail panel (batch progress bars, assigned experts) draws from synthetic constants that are not replaced on CSV import. Fixing this requires adding batch and assignment columns to the import schema and a corresponding parser in the import handler.

**No per-task time field in import schema.** Average task time and week-over-week throughput trend cannot be derived from the current CSV format. Imported experts show "—" for Avg Time and a flat trend arrow.

**Pipeline Notes section is hardcoded.** The bottleneck analysis and reallocation recommendation text in the Pipeline tab does not update when data changes. It would need to be generated dynamically from pipeline stage data to be meaningful in a real deployment.

**Single-file React component.** All logic, state, and UI lives in one file. This works for a demo and has real advantages (single developer ownership, no abstraction overhead, easy to delegate). In a larger team context, components would be split into separate files with dedicated controllers for state management. The current structure may also encounter browser-side performance limits as data volume grows, since all computation happens client-side.

---

## v2 Features

### Predictive Delivery Scoring
Probability of on-time delivery expressed as a percentage, computed from expert velocity baselines, current pace trend, and days remaining. The data model is already designed to support this. Task completion events are stored with timestamps rather than status-only flags. The missing piece is enough historical data to establish reliable velocity baselines per expert and domain.

### Expert Sentiment Signal
A weekly pulse score (1-5, self-reported) averaged per project and surfaced alongside the health score. Low sentiment triggers closer quality review routing. If a project is green on health but red on expert sentiment, that is an early warning that pace is being maintained at a human cost.

One design constraint worth stating clearly: sentiment must be a routing signal only, never a work restriction. Restricting access based on self-reported emotional state creates incentives to game the score, which destroys the signal. This is a non-negotiable design rule for any implementation.

### Health Score Weight Configurability
A settings panel where the SPL can adjust the Pace/Quality/Load weighting and see in real time how the score distribution shifts across current projects. This enables empirical tuning once real outcome data exists, and makes the composite score transparent and auditable.

### Outcome Logging
When a project closes, log whether it was delivered on time, over deadline, or under quality threshold, along with any interventions triggered by the health score. This historical record is the prerequisite for validating whether the health score actually predicts failure and for recalibrating weights against real outcomes.

### Direct API Integrations
Replace CSV import with live connections to the tools SPLs actually use: Jira for task tracking, Airtable or Notion for project management, and potentially direct connections to internal tooling. The data model and import schema are already designed as the abstraction layer. Integrations plug into the same normalized structure.

### Client-Facing Dashboard View
A filtered, read-only view scoped to a single client's projects. Shows health scores, delivery projections, and quality trends without exposing internal expert performance data or other clients' projects. Requires an authentication layer and role-based access control before it can be safely deployed.

### Confidence Intervals on Projections
Replace single-point projected completion dates with statistical ranges (e.g., "likely by April 14, worst case April 28") derived from variance in expert velocity over time. Requires a time series of task completion events, which the data model already stores timestamps for.

---

## Production Architecture Considerations

The following reflects feedback from engineering review and represents the real design challenges between this prototype and a production system.

**This is a frontend-only prototype.** A production version requires a backend server, a real database, and an authentication layer. The React frontend would remain as the UI layer but would shift from computing everything locally to consuming an API that handles business logic server-side.

**The backend design is the hard problem.** Key questions that need answers before any backend is built: Does the dashboard need real-time data, or is periodic refresh acceptable? If real-time, does it poll a data store every N seconds, consume a real-time data feed, or hold open a WebSocket connection and listen for events? The answer drives the entire infrastructure design and has significant cost and complexity implications.

**Client-side computation has scale limits.** Currently, all health score calculations, sorting, filtering, and projections run in the browser. This works for a demo with three projects. At scale with hundreds of projects and thousands of experts, computation moves server-side and the frontend receives pre-computed results via API. This also prevents exposing raw formula logic and underlying data to users who should only see derived outputs.

**API integration introduces auth and deduplication complexity.** When the dashboard pulls from external tools (Jira, Airtable, etc.), every user who opens the page triggers API requests to those services. This creates duplicate requests at scale, strains rate limits, and requires a centralized auth layer to manage credentials securely rather than distributing API keys to individual clients. A backend service that owns the external API connections and caches responses is the standard solution.

**Role-based access control (RBAC) is required before multi-user deployment.** At scale, different users need different data access: a CEO sees all projects, an SPL sees their assigned projects, an expert sees only their own tasks. The data model supports this already. The ExpertProjectAssignment junction table is the natural access control boundary. Implementation requires an auth layer that attaches user roles to API requests and filters query results accordingly.

**Recommended stack for production:**
- Frontend: React (as built)
- Backend: Node.js or Python with FastAPI
- Database: PostgreSQL (the entity model in FOUNDATION.md maps directly to relational tables)
- Auth: Auth0 or AWS Cognito
- Hosting: AWS, Vercel, or similar

---

## The Intervention Paradox

If the health score works as intended, SPLs will always intervene when a project turns red. Failed projects become rare, which makes it hard to validate whether the score actually predicted failure or just created busy work.

The solution is counterfactual tracking: log every at-risk flag, what intervention was taken, and the actual outcome. Cases where flags were ignored become the ground truth for validating predictive accuracy. Meaningful validation requires months of real operational data. The Outcome Logging feature above is the prerequisite, which is why it is prioritized in v2.

---

## Future Consideration — Pre-Work Readiness Gate

A sentiment check before a work session begins ("how are you feeling today, 1-5") that routes low-sentiment output to closer review. The instinct is sound: expert state at the start of a session is a plausible predictor of output quality.

This is not on the v2 roadmap because the core design question remains open: how do you prevent gaming once experts understand that low scores trigger additional scrutiny? The weekly sentiment signal above is the lower-risk version to build and validate first.
