# micro1 SPL Data Ops Dashboard

A working demo of a **Data Operations Quality Dashboard** — the kind of tool a Strategic Projects Lead at [micro1](https://micro1.ai) would use to manage expert teams, monitor training data quality, and optimize pipeline throughput for AI lab clients.

## Why This Exists

Built as a demonstration for the **Strategic Projects Lead** role at micro1. Shows operational thinking about core SPL responsibilities:

- **Expert Performance Management** — tracking accuracy, velocity, readiness, and quality across a team of PhDs and domain experts
- **Pipeline Health Monitoring** — visualizing task flow from ingestion → annotation → QA → AI QC → delivery
- **Quality Metrics** — surfacing data integrity signals that matter for frontier model training
- **Alert & Action System** — enabling fast response to bottlenecks and performance issues

## Project Structure

```
micro1-spl-dashboard/
├── dashboard.jsx          ← Main dashboard application
├── preview.html           ← Zero-install browser preview
├── CLAUDE.md              ← Claude Code directives and implementation rules
├── FOUNDATION.md          ← Product spec, data model, architecture decisions
├── DECISIONS.md           ← Full dated decision log
├── CURRENT_SPRINT.md      ← Active work and open questions
├── ROADMAP.md             ← Feature backlog
├── RESEARCH.md            ← micro1 context and role research
├── README.md              ← You are here
└── CLAUDE_CODE_GUIDE.md   ← Beginner guide for using Claude Code
```

## Tech Stack

- **React** (single-file component, no build step needed)
- **Inline styles** with centralized design tokens (`const T`)
- **Fonts**: Instrument Sans + Fira Code (Google Fonts)
- **No external dependencies** beyond React

## Quick Start

Open `preview.html` directly in any browser — no npm, no build step, no setup.

To continue building with Claude Code:
1. Open Claude Code in your terminal
2. Read `CLAUDE_CODE_GUIDE.md` for step-by-step instructions
3. Pick a feature from `CURRENT_SPRINT.md` or `ROADMAP.md`

## Current Features

### Overview Tab
- KPI cards: total tasks, average accuracy, task time, active experts
- Daily task volume and quality score charts
- Pipeline funnel visualization
- Recent activity feed (top 3 alerts)

### Expert Roster Tab
- Searchable expert table with status, domain, performance metrics
- Trend % column (week-over-week accuracy delta)
- Readiness score column (composite 0–100%, color-coded)
- Click-to-expand detail panel with SPL action buttons

### Pipeline Tab
- Task flow funnel with throughput percentages
- Stage-by-stage health cards with error counts
- Color-coded stage health (blue→lavender healthy, amber→red degraded)

### Alerts Tab
- Categorized alerts (warning, info, success)
- Acknowledge actions
- Timestamped activity log

## Author

**Michael Caruso** — Built as part of exploring the Strategic Projects Lead role at micro1.
