# CLAUDE.md — Claude Code Context

## Project
Data Operations Quality Dashboard demo for the Strategic Projects Lead (SPL) role at micro1. Single-file React component. All data is synthetic. See `FOUNDATION.md` for full product spec, data model, and architecture decisions.

---

## How We Work

### Learning Gate
Before applying any code changes:
1. Summarize what you are about to change in plain language (no code blocks, just concepts)
2. Ask me: "In your own words, what is this change doing and why does it matter?"
3. Wait for my response before proceeding
4. If my explanation is incomplete or off-base, correct me and ask again
5. Only proceed once I've demonstrated I understand what's being changed and why

Skip only for trivial changes (typos, variable renames).

### When I Don't Understand Something
Explain using a real-world analogy first, then connect it to the code. Don't just show the code again.

### Claude.ai Learning Prompts
After explaining a non-trivial concept, generate a ready-to-paste prompt formatted like this:

---
**Claude.ai Learning Prompt — [Topic]**

Paste this into a new Claude.ai chat:

> I'm building a React dashboard project and just encountered [concept]. Here's the context: [what we were doing]. Explain this assuming I'm new to frontend development. Use real-world analogies, then show me a simple isolated example. After explaining, quiz me with 2-3 questions.
---

Generate these automatically — don't ask if I want them.

---

## Tech Stack
- Single-file React component (`dashboard.jsx`)
- Inline styles, no external CSS
- Fonts: Instrument Sans (body) + Fira Code (mono/data) via Google Fonts
- No build step — runs as Claude artifact or wrapped in a simple React app
- `preview.html` — zero-install browser preview using React CDN + Babel standalone

## File Structure
```
micro1-spl-dashboard/
├── dashboard.jsx          ← Main dashboard application
├── preview.html           ← Zero-install browser preview
├── CLAUDE.md              ← This file (Claude Code directives)
├── FOUNDATION.md          ← Product spec, data model, architecture
├── DECISIONS.md           ← Full dated decision log
├── CURRENT_SPRINT.md      ← Active work, open questions, what's next
├── ROADMAP.md             ← Feature backlog
├── RESEARCH.md            ← micro1 context and role research
├── README.md              ← Project overview
└── CLAUDE_CODE_GUIDE.md   ← Beginner guide for using Claude Code
```

---

## Implementation Rules

These are non-negotiable. Do not deviate without flagging it explicitly.

- `health_score` is never stored in state — always computed at render time
- All other derived fields (pace, load, projections) follow the same rule — compute, never store
- `expert_domains` parses from pipe-delimited string on CSV import
- Validator warnings do not block import — errors do
- Task completion events must store timestamps, not just status flags
- Design token object (`const T`) holds all colors and font strings — no hardcoded color values outside of it
- Pipeline funnel bar: ≤10 errors = blue→lavender gradient, >10 errors = amber→red gradient
- Readiness score: review status hard-caps at 70 regardless of raw score

---

## Current Theme & Tokens
- Page background: `#F5F0E8` (warm cream)
- Card background: `#FDFAF6` (near-white)
- Body text: `#2A2018` (warm brown)
- Accents: dusty blue `#7AA3C7`, sage green `#6BAF85`, warm amber `#C9934A`, dusty rose `#C47070`, lavender `#9285C2`
- Body font: Instrument Sans
- Mono/data font: Fira Code

---

## End of Session Protocol
Before closing any Claude Code session:
1. Update `DECISIONS.md` with any architectural or product decisions made during the session
2. Update `CURRENT_SPRINT.md` to reflect current state, what's in progress, and what's next
3. Flag anything that contradicts `FOUNDATION.md` so it can be reconciled in the Brains chat
