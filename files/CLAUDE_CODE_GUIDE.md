# Claude Code Guide — For Beginners

This guide walks you through using **Claude Code** to continue building the micro1 SPL Dashboard. No prior coding experience required.

---

## What is Claude Code?

Claude Code is a command-line tool that lets you talk to Claude directly from your terminal. Instead of copy-pasting code, you describe what you want and Claude writes, edits, and runs it for you.

## Getting Started

### 1. Install Claude Code

Open your terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and run:

```bash
npm install -g @anthropic-ai/claude-code
```

> **Note**: You need Node.js installed first. Download it from https://nodejs.org if you don't have it.

### 2. Set Up Your Project

```bash
# Create a project folder
mkdir micro1-spl-dashboard
cd micro1-spl-dashboard

# Copy in the files from this project
# (or clone from wherever you've stored them)
```

### 3. Launch Claude Code

```bash
claude
```

That's it — you're now talking to Claude in your terminal.

## How to Work With Claude Code

### The Basics

Just type what you want in natural language:

```
> Hey Claude, can you look at dashboard.jsx and add a feature where I can
  sort the expert table by clicking column headers?
```

Claude will:
1. Read the file
2. Understand the current code
3. Make the changes
4. Show you what changed

### Useful Commands

| What you want | What to type |
|---|---|
| Start Claude Code | `claude` |
| Point it at your project | `claude` (run from your project folder) |
| Ask Claude to read a file | "Read dashboard.jsx" |
| Ask for changes | "Add [feature] to [file]" |
| Ask for explanations | "Explain how the pipeline funnel works" |
| Fix something broken | "The expert table isn't filtering, can you fix it?" |

### Tips for Beginners

1. **Be specific about what you want** — "Add a button that exports expert data as CSV" is better than "make it better"
2. **One feature at a time** — Don't ask for 5 things at once
3. **Describe the behavior you want** — "When I click a column header, the table should sort by that column"
4. **Reference the files** — "In dashboard.jsx, change the accent color from purple to blue"
5. **Ask questions** — "What would be the best way to add real-time data updates?"

## Feature Building Prompts

Here are ready-to-use prompts for features from the ROADMAP. Just paste these into Claude Code:

### Add Column Sorting
```
In dashboard.jsx, add the ability to sort the expert roster table by clicking
on column headers. It should toggle between ascending and descending. Show a
small arrow indicator next to the active sort column.
```

### Add a Dark/Light Theme Toggle
```
Add a theme toggle button to the dashboard header that switches between dark
mode (current) and a light mode. Store the preference in component state.
Use CSS variables for the theme colors.
```

### Add Expert Performance Sparklines
```
In the expert roster table, add a small sparkline chart in the Trend column
that shows the last 7 days of accuracy data. Generate realistic simulated
data for each expert. Keep it simple — just a small SVG line chart.
```

### Add CSV Export
```
Add an "Export CSV" button to the expert roster that downloads the current
filtered expert data as a CSV file. Include all visible columns.
```

### Add a Project Switcher
```
Add a dropdown in the header that lets the SPL switch between different
simulated projects (Lab Alpha, Lab Beta, Enterprise Gamma). Each project
should have different expert teams and metrics. Generate the simulated data.
```

## Project Context

When working with Claude Code on this project, it helps to give Claude context.
You can start a session with something like:

```
I'm building a demo dashboard for a Strategic Projects Lead role at micro1.
micro1 manages teams of PhDs and professors who generate training data for
AI labs. The dashboard helps SPLs track expert performance, pipeline health,
and quality metrics. The current app is a single React file (dashboard.jsx).
I want to keep it as a single file for now.
```

## Troubleshooting

**"npm not found"** → Install Node.js from https://nodejs.org

**Claude Code won't start** → Make sure you have an Anthropic API key configured, or are logged in via `claude login`

**Changes look wrong** → Tell Claude: "That broke the layout, can you revert and try a different approach?"

**Want to undo** → If you're using git: `git checkout -- dashboard.jsx`

---

## Next Steps

1. Pick a feature from `ROADMAP.md`
2. Open Claude Code in your project folder
3. Use one of the prompts above (or write your own)
4. Iterate — ask Claude to refine until it looks right
5. Have fun with it!
