import { useState, useEffect, useRef } from "react";

// ============================================================
// micro1 SPL Data Operations Dashboard
// A working demo showing how a Strategic Projects Lead
// would monitor expert performance, quality metrics,
// and pipeline health for AI training data projects
// ============================================================

// Design tokens — warm cream palette with soft pastels
const T = {
  pageBg:        "#F5F0E8",
  cardBg:        "#FDFAF6",
  headerBg:      "#FAF7F2",
  inputBg:       "#F7F3EC",
  trackBg:       "#EDE7DC",
  border:        "#E4DAC8",
  borderLight:   "#EDE7DC",
  textPrimary:   "#2A2018",
  textSecondary: "#6B5E52",
  textMuted:     "#A8998A",
  blue:          "#7AA3C7",
  green:         "#6BAF85",
  amber:         "#C9934A",
  red:           "#C47070",
  lavender:      "#9285C2",
  fontBody:      "'Instrument Sans', -apple-system, sans-serif",
  fontMono:      "'Fira Code', monospace",
};

// --- Simulated Data (used as initial state) ---
const EXPERTS = [
  { id: "E-001", name: "Dr. Sarah Chen",       domain: "Mathematics", university: "Stanford",      rating: 4.9, tasksCompleted: 347, avgTime: 22, accuracy: 97.3, status: "active", trend: "up",     trendPct: 2.1 },
  { id: "E-002", name: "Prof. James Okafor",   domain: "Physics",     university: "MIT",           rating: 4.8, tasksCompleted: 289, avgTime: 26, accuracy: 95.1, status: "active", trend: "stable", trendPct: 0.3 },
  { id: "E-003", name: "Dr. Priya Sharma",     domain: "Medicine",    university: "Johns Hopkins", rating: 4.7, tasksCompleted: 412, avgTime: 19, accuracy: 98.2, status: "active", trend: "up",     trendPct: 1.8 },
  { id: "E-004", name: "Dr. Alex Rivera",      domain: "CS / ML",     university: "Berkeley",      rating: 4.6, tasksCompleted: 198, avgTime: 31, accuracy: 93.8, status: "review", trend: "down",   trendPct: 2.4 },
  { id: "E-005", name: "Prof. Elena Volkov",   domain: "Linguistics", university: "Oxford",        rating: 4.9, tasksCompleted: 503, avgTime: 17, accuracy: 99.1, status: "active", trend: "up",     trendPct: 0.8 },
  { id: "E-006", name: "Dr. Marcus Kim",       domain: "Law",         university: "Harvard",       rating: 4.5, tasksCompleted: 156, avgTime: 35, accuracy: 91.4, status: "review", trend: "down",   trendPct: 3.2 },
  { id: "E-007", name: "Dr. Fatima Al-Hassan", domain: "Chemistry",   university: "Caltech",       rating: 4.8, tasksCompleted: 267, avgTime: 24, accuracy: 96.7, status: "active", trend: "stable", trendPct: 0.2 },
  { id: "E-008", name: "Prof. David Tanaka",   domain: "Economics",   university: "Princeton",     rating: 4.7, tasksCompleted: 321, avgTime: 28, accuracy: 94.5, status: "active", trend: "up",     trendPct: 1.4 },
];

const PIPELINE_STAGES = [
  { name: "Ingestion",       tasks: 1247, completed: 1198, errors: 12, throughput: 96.1 },
  { name: "Annotation",      tasks: 1198, completed: 987,  errors: 34, throughput: 82.4 },
  { name: "QA Review",       tasks: 987,  completed: 891,  errors: 8,  throughput: 90.3 },
  { name: "Rhea AI QC",      tasks: 891,  completed: 867,  errors: 3,  throughput: 97.3 },
  { name: "Client Delivery", tasks: 867,  completed: 852,  errors: 0,  throughput: 98.3 },
];

const DAILY_METRICS = [
  { day: "Mon", tasks: 189, quality: 96.2, velocity: 23 },
  { day: "Tue", tasks: 214, quality: 95.8, velocity: 21 },
  { day: "Wed", tasks: 198, quality: 97.1, velocity: 22 },
  { day: "Thu", tasks: 231, quality: 94.3, velocity: 25 },
  { day: "Fri", tasks: 207, quality: 96.9, velocity: 20 },
  { day: "Sat", tasks: 142, quality: 97.8, velocity: 18 },
  { day: "Sun", tasks: 118, quality: 98.1, velocity: 17 },
];

const ALERTS = [
  { type: "warning", message: "Dr. Rivera's accuracy dropped below 94% threshold — recommend paired review", time: "12 min ago" },
  { type: "info",    message: "Annotation stage throughput recovered to 82.4% after overnight backlog clear", time: "1 hr ago" },
  { type: "success", message: "Prof. Volkov hit 500-task milestone with 99.1% accuracy — bonus eligible", time: "2 hrs ago" },
  { type: "warning", message: "Dr. Kim flagged for extended task times (35 min avg vs 25 min target)", time: "3 hrs ago" },
  { type: "info",    message: "Client Lab Alpha requested scope expansion: +200 physics tasks this sprint", time: "5 hrs ago" },
];

// ============================================================
// CSV IMPORT UTILITIES
// ============================================================

const TEMPLATE_CSV = [
  "project_id,project_name,client_name,client_quality_threshold,project_domain,project_start_date,project_deadline,project_target_task_count,project_target_quality_score,batch_id,batch_name,batch_due_date,batch_target_task_count,task_id,task_domain,task_status,task_created_date,task_completion_date,task_quality_score,expert_name,expert_seniority,expert_domains,expert_baseline_throughput",
  "P-001,Legal Annotation Q1,Lab Alpha,90,legal,2026-01-01,2026-06-30,500,92,B-001,Batch 1 Legal,2026-03-15,2,T-0001,legal,completed,2026-01-10,2026-01-12,94.5,Dr. Sarah Chen,senior,legal|medical,45",
  "P-001,Legal Annotation Q1,Lab Alpha,90,legal,2026-01-01,2026-06-30,500,92,B-001,Batch 1 Legal,2026-03-15,2,T-0002,legal,in-progress,2026-01-11,,,Prof. James Okafor,mid,legal,38",
  "P-002,Medical QA Sprint,Lab Beta,95,medical,2026-01-15,2026-07-31,300,96,B-002,Medical Batch A,2026-04-01,1,T-0003,medical,completed,2026-01-16,2026-01-18,97.2,Dr. Priya Sharma,principal,medical|engineering,50",
].join("\n");

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else { current += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { fields.push(current); current = ""; }
      else current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(text) {
  const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const lines  = clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCsvLine(lines[i]);
    const row = { _rowNum: i + 1 };
    headers.forEach((h, j) => { row[h] = (values[j] ?? "").trim(); });
    rows.push(row);
  }
  return rows;
}

const REQUIRED_FIELDS = [
  "project_id", "project_name", "client_name", "client_quality_threshold",
  "project_domain", "project_start_date", "project_deadline",
  "project_target_task_count", "project_target_quality_score",
  "batch_id", "batch_name", "batch_due_date", "batch_target_task_count",
  "task_id", "task_domain", "task_status", "task_created_date",
  "expert_name", "expert_seniority", "expert_domains", "expert_baseline_throughput",
];
const DATE_FIELDS          = ["project_start_date", "project_deadline", "batch_due_date", "task_created_date"];
const QUALITY_FIELDS       = ["client_quality_threshold", "project_target_quality_score"];
const VALID_DOMAINS        = ["legal", "medical", "financial", "engineering"];
const VALID_TASK_STATUSES  = ["unassigned", "in-progress", "in-review", "completed"];
const VALID_SENIORITIES    = ["junior", "mid", "senior", "principal"];

function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str));
}

function validateRows(rows) {
  const errors = [];
  const warnings = [];
  const expertDomains = {};
  const batchCounts   = {};

  rows.forEach((row) => {
    const rowNum = row._rowNum;

    // 1. Required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!row[field] || !row[field].trim()) {
        errors.push({ row: rowNum, field, reason: "Required field is missing or empty" });
      }
    });

    // 2. Date format
    DATE_FIELDS.forEach(field => {
      if (row[field] && !isValidDate(row[field])) {
        errors.push({ row: rowNum, field, reason: `Invalid date — expected YYYY-MM-DD, got "${row[field]}"` });
      }
    });
    if (row.task_completion_date && !isValidDate(row.task_completion_date)) {
      errors.push({ row: rowNum, field: "task_completion_date", reason: `Invalid date — expected YYYY-MM-DD, got "${row.task_completion_date}"` });
    }

    // 3. Quality score range
    QUALITY_FIELDS.forEach(field => {
      if (row[field]) {
        const v = parseFloat(row[field]);
        if (isNaN(v) || v < 0 || v > 100)
          errors.push({ row: rowNum, field, reason: `Must be 0–100, got "${row[field]}"` });
      }
    });
    if (row.task_quality_score && row.task_quality_score.trim()) {
      const v = parseFloat(row.task_quality_score);
      if (isNaN(v) || v < 0 || v > 100)
        errors.push({ row: rowNum, field: "task_quality_score", reason: `Must be 0–100, got "${row.task_quality_score}"` });
    }

    // 4. Completed task must have completion date
    if (row.task_status === "completed" && (!row.task_completion_date || !row.task_completion_date.trim())) {
      errors.push({ row: rowNum, field: "task_completion_date", reason: "Task is completed but has no completion date" });
    }

    // 5. Enum fields
    if (row.project_domain && !VALID_DOMAINS.includes(row.project_domain))
      errors.push({ row: rowNum, field: "project_domain", reason: `"${row.project_domain}" is not valid — expected: ${VALID_DOMAINS.join(", ")}` });
    if (row.task_status && !VALID_TASK_STATUSES.includes(row.task_status))
      errors.push({ row: rowNum, field: "task_status", reason: `"${row.task_status}" is not valid — expected: ${VALID_TASK_STATUSES.join(", ")}` });
    if (row.expert_seniority && !VALID_SENIORITIES.includes(row.expert_seniority))
      errors.push({ row: rowNum, field: "expert_seniority", reason: `"${row.expert_seniority}" is not valid — expected: ${VALID_SENIORITIES.join(", ")}` });

    // Warning tracking
    if (row.expert_name && row.expert_domains) {
      if (!expertDomains[row.expert_name]) expertDomains[row.expert_name] = new Set();
      expertDomains[row.expert_name].add(row.expert_domains.trim());
    }
    if (row.batch_id) {
      if (!batchCounts[row.batch_id])
        batchCounts[row.batch_id] = { name: row.batch_name || row.batch_id, target: parseInt(row.batch_target_task_count) || 0, actual: 0 };
      batchCounts[row.batch_id].actual++;
    }

    // Warning: completion date after deadline
    if (row.task_completion_date && row.project_deadline &&
        isValidDate(row.task_completion_date) && isValidDate(row.project_deadline)) {
      if (new Date(row.task_completion_date) > new Date(row.project_deadline)) {
        warnings.push({ row: rowNum, field: "task_completion_date", reason: `Completion date ${row.task_completion_date} is after project deadline ${row.project_deadline}` });
      }
    }
  });

  // Post-loop warnings
  Object.entries(expertDomains).forEach(([name, domains]) => {
    if (domains.size > 1)
      warnings.push({ row: null, field: "expert_domains", reason: `"${name}" has inconsistent domain tags: ${[...domains].join(" vs ")}` });
  });
  Object.entries(batchCounts).forEach(([, { name, target, actual }]) => {
    if (target > 0 && actual !== target)
      warnings.push({ row: null, field: "batch_target_task_count", reason: `Batch "${name}" has ${actual} task row${actual !== 1 ? "s" : ""} but target is ${target}` });
  });

  const uniqueProjects = new Set(rows.map(r => r.project_id).filter(Boolean));
  const uniqueExperts  = new Set(rows.map(r => r.expert_name).filter(Boolean));
  const uniqueTasks    = new Set(rows.map(r => r.task_id).filter(Boolean));
  const dates          = rows.map(r => r.task_created_date).filter(isValidDate).sort();

  return {
    errors,
    warnings,
    summary: {
      projects:  uniqueProjects.size,
      experts:   uniqueExperts.size,
      tasks:     uniqueTasks.size,
      dateRange: dates.length ? `${dates[0]} to ${dates[dates.length - 1]}` : "—",
    },
  };
}

function parseDateLocal(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function normalizeData(rows) {
  // --- Experts ---
  const expertMap = {};
  rows.forEach(row => {
    if (!row.expert_name) return;
    if (!expertMap[row.expert_name]) {
      const rawDomain = row.expert_domains ? row.expert_domains.split("|")[0].trim() : "—";
      expertMap[row.expert_name] = {
        name: row.expert_name,
        domain: rawDomain.charAt(0).toUpperCase() + rawDomain.slice(1),
        tasksCompleted: 0,
        qualityScores: [],
      };
    }
    if (row.task_status === "completed") {
      expertMap[row.expert_name].tasksCompleted++;
      if (row.task_quality_score && row.task_quality_score.trim())
        expertMap[row.expert_name].qualityScores.push(parseFloat(row.task_quality_score));
    }
  });

  const experts = Object.values(expertMap).map((e, i) => ({
    id:             `E-${String(i + 1).padStart(3, "0")}`,
    name:           e.name,
    domain:         e.domain,
    university:     "—",
    rating:         "—",
    tasksCompleted: e.tasksCompleted,
    avgTime:        null,
    accuracy:       e.qualityScores.length > 0
                      ? parseFloat((e.qualityScores.reduce((a, b) => a + b, 0) / e.qualityScores.length).toFixed(1))
                      : null,
    status:         "active",
    trend:          "stable",
    trendPct:       0,
  }));

  // --- Pipeline Stages ---
  const total     = rows.length;
  const annotated = rows.filter(r => ["in-progress", "in-review", "completed"].includes(r.task_status)).length;
  const inReview  = rows.filter(r => ["in-review", "completed"].includes(r.task_status)).length;
  const scored    = rows.filter(r => r.task_status === "completed" && r.task_quality_score && r.task_quality_score.trim()).length;
  const delivered = rows.filter(r => r.task_status === "completed").length;
  const tp = (a, b) => b === 0 ? 0 : parseFloat((a / b * 100).toFixed(1));

  const pipelineStages = [
    { name: "Ingestion",       tasks: total,     completed: total,     errors: 0, throughput: 100 },
    { name: "Annotation",      tasks: total,     completed: annotated, errors: 0, throughput: tp(annotated, total) },
    { name: "QA Review",       tasks: annotated, completed: inReview,  errors: 0, throughput: tp(inReview, annotated) },
    { name: "Rhea AI QC",      tasks: inReview,  completed: scored,    errors: 0, throughput: tp(scored, inReview) },
    { name: "Client Delivery", tasks: scored,    completed: delivered, errors: 0, throughput: tp(delivered, scored) },
  ];

  // --- Daily Metrics ---
  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DOW_MAP   = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Sun" };
  const buckets   = {};
  DAY_ORDER.forEach(d => { buckets[d] = { tasks: 0, qualitySum: 0, qualityCount: 0 }; });

  rows.forEach(row => {
    if (row.task_status === "completed" && isValidDate(row.task_completion_date)) {
      const dt    = parseDateLocal(row.task_completion_date);
      const label = DOW_MAP[dt.getDay()];
      buckets[label].tasks++;
      if (row.task_quality_score && row.task_quality_score.trim()) {
        buckets[label].qualitySum   += parseFloat(row.task_quality_score);
        buckets[label].qualityCount += 1;
      }
    }
  });

  const dailyMetrics = DAY_ORDER.map(day => ({
    day,
    tasks:    buckets[day].tasks,
    quality:  buckets[day].qualityCount > 0
                ? parseFloat((buckets[day].qualitySum / buckets[day].qualityCount).toFixed(1))
                : 0,
    velocity: 0,
  }));

  // --- Alerts ---
  const genAlerts = [];
  experts.forEach(expert => {
    if (expert.accuracy === null) return;
    const row = rows.find(r => r.expert_name === expert.name);
    const threshold = parseFloat(row?.client_quality_threshold || "0");
    if (threshold > 0 && expert.accuracy < threshold)
      genAlerts.push({ type: "warning", message: `${expert.name}'s accuracy (${expert.accuracy}%) is below the ${threshold}% client threshold — recommend review`, time: "just now" });
  });

  const now = new Date();
  const seenProjects = new Set();
  rows.forEach(row => {
    if (!row.project_id || seenProjects.has(row.project_id)) return;
    seenProjects.add(row.project_id);
    if (isValidDate(row.project_deadline)) {
      const daysLeft = Math.round((parseDateLocal(row.project_deadline) - now) / (1000 * 60 * 60 * 24));
      if (daysLeft >= 0 && daysLeft <= 14)
        genAlerts.push({ type: "warning", message: `${row.project_name} deadline in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}: ${row.project_deadline}`, time: "just now" });
    }
  });

  const topExpert = [...experts].sort((a, b) => b.tasksCompleted - a.tasksCompleted)[0];
  if (topExpert && topExpert.tasksCompleted > 0)
    genAlerts.push({ type: "success", message: `${topExpert.name} leads with ${topExpert.tasksCompleted} completed task${topExpert.tasksCompleted !== 1 ? "s" : ""} this sprint`, time: "just now" });

  const uniqueProjectCount = new Set(rows.map(r => r.project_id).filter(Boolean)).size;
  genAlerts.push({ type: "info", message: `CSV import completed: ${rows.length} tasks across ${uniqueProjectCount} project${uniqueProjectCount !== 1 ? "s" : ""} loaded`, time: "just now" });

  return { experts, pipelineStages, dailyMetrics, alerts: genAlerts };
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "spl-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// --- Utility Components ---
const StatusDot = ({ status }) => {
  const colors = { active: T.green, review: T.amber, inactive: T.textMuted };
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      backgroundColor: colors[status] || T.textMuted, marginRight: 6,
      boxShadow: status === "active" ? `0 0 6px ${T.green}60` : "none",
    }} />
  );
};

const TrendArrow = ({ trend, pct }) => {
  if (trend === "up")   return <span style={{ color: T.green,    fontSize: 12, fontWeight: 600, fontFamily: T.fontMono }}>↑ +{pct}%</span>;
  if (trend === "down") return <span style={{ color: T.red,      fontSize: 12, fontWeight: 600, fontFamily: T.fontMono }}>↓ −{pct}%</span>;
  return                       <span style={{ color: T.textMuted, fontSize: 12, fontFamily: T.fontMono }}>→ {pct > 0 ? `+${pct}` : pct}%</span>;
};

const calcReadiness = (expert) => {
  if (expert.accuracy === null) return 0;
  const accScore  = expert.accuracy >= 99 ? 60 : expert.accuracy >= 97 ? 55 : expert.accuracy >= 95 ? 48 : expert.accuracy >= 93 ? 38 : expert.accuracy >= 91 ? 25 : 10;
  const volScore  = Math.min(expert.tasksCompleted / 500 * 25, 25);
  const timeScore = expert.avgTime === null ? 0 : expert.avgTime <= 20 ? 15 : expert.avgTime <= 25 ? 12 : expert.avgTime <= 30 ? 8 : expert.avgTime <= 35 ? 4 : 0;
  const raw = Math.round(accScore + volScore + timeScore);
  return expert.status === "review" ? Math.min(raw, 70) : raw;
};

const AlertIcon = ({ type }) => {
  const icons  = { warning: "⚠", info: "ℹ", success: "✓" };
  const colors = { warning: T.amber, info: T.blue, success: T.green };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 24, height: 24, borderRadius: 6, fontSize: 12, fontWeight: 700,
      backgroundColor: colors[type] + "22", color: colors[type], flexShrink: 0,
    }}>{icons[type]}</span>
  );
};

// --- Mini Bar Chart ---
const MiniBar = ({ data, dataKey, color, height = 80 }) => {
  const max = Math.max(...data.map(d => d[dataKey])) || 1;
  if (data.every(d => d[dataKey] === 0)) return (
    <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 12, color: T.textMuted }}>No data</span>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, padding: "0 2px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", maxWidth: 28, borderRadius: 4,
            height: `${(d[dataKey] / max) * 100}%`, minHeight: 4,
            backgroundColor: color, opacity: 0.72,
            transition: "height 0.5s ease",
          }} />
          <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.02em", fontFamily: T.fontMono }}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- Pipeline Funnel ---
const PipelineFunnel = ({ stages }) => {
  const maxTasks = stages[0].tasks || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {stages.map((stage, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 110, fontSize: 12, color: T.textMuted, textAlign: "right", fontFamily: T.fontMono }}>
            {stage.name}
          </span>
          <div style={{ flex: 1, height: 28, backgroundColor: T.trackBg, borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 6,
              width: `${(stage.completed / maxTasks) * 100}%`,
              background: stage.errors > 10
                ? `linear-gradient(90deg, ${T.amber}, ${T.red})`
                : `linear-gradient(90deg, ${T.blue}, ${T.lavender})`,
              transition: "width 0.8s ease",
              display: "flex", alignItems: "center", paddingLeft: 10,
            }}>
              <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: T.fontMono }}>
                {stage.completed.toLocaleString()}
              </span>
            </div>
            {stage.errors > 0 && (
              <span style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                fontSize: 10, color: stage.errors > 10 ? T.amber : T.textMuted,
                fontFamily: T.fontMono,
              }}>
                {stage.errors} err
              </span>
            )}
          </div>
          <span style={{
            width: 48, fontSize: 12, fontWeight: 600, textAlign: "right",
            color: stage.throughput >= 95 ? T.green : stage.throughput >= 85 ? T.amber : T.red,
            fontFamily: T.fontMono,
          }}>
            {stage.throughput}%
          </span>
        </div>
      ))}
    </div>
  );
};

// --- Import Modal ---
function ImportModal({ importStage, importFile, importResult, onFileSelect, onConfirm, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const hasErrors = importResult && importResult.errors.length > 0;
  const canConfirm = importResult && !hasErrors;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      backgroundColor: "rgba(42,32,24,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: T.cardBg, borderRadius: 18,
        width: 560, maxWidth: "calc(100vw - 48px)",
        border: `1px solid ${T.border}`,
        boxShadow: "0 24px 64px rgba(42,32,24,0.18)",
        overflow: "hidden",
        fontFamily: T.fontBody,
      }}>

        {/* Modal header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${T.borderLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
            {importStage === "upload" ? "Import CSV Data" :
             importStage === "validation" ? "Review & Confirm" : "Import Complete"}
          </span>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 20, color: T.textMuted, lineHeight: 1, padding: "0 2px",
          }}>×</button>
        </div>

        {/* ── Stage 1: Upload ── */}
        {importStage === "upload" && (
          <div style={{ padding: 28 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? T.lavender : T.border}`,
                borderRadius: 12, padding: "44px 24px", textAlign: "center",
                backgroundColor: dragOver ? T.lavender + "12" : T.inputBg,
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12, color: T.textMuted }}>↑</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>
                Drop your CSV file here
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 18 }}>or</div>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                style={{
                  padding: "8px 22px", fontSize: 12, fontWeight: 500,
                  border: `1px solid ${T.border}`, borderRadius: 6,
                  background: T.cardBg, color: T.textSecondary,
                  cursor: "pointer", fontFamily: T.fontBody,
                }}
              >
                Browse Files
              </button>
            </div>
            <input
              ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }}
            />
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: T.textMuted }}>
              Don't have the template?{" "}
              <button onClick={downloadTemplate} style={{
                background: "none", border: "none", cursor: "pointer",
                color: T.lavender, fontFamily: T.fontBody, fontSize: 12,
                fontWeight: 600, padding: 0, textDecoration: "underline",
              }}>
                Download Template
              </button>
            </div>
          </div>
        )}

        {/* ── Stage 2: Validation ── */}
        {importStage === "validation" && (
          <div style={{ padding: 24 }}>

            {/* Analyzing placeholder */}
            {!importResult && (
              <div style={{ textAlign: "center", padding: "36px 0", color: T.textMuted, fontSize: 13 }}>
                Analyzing {importFile?.name}…
              </div>
            )}

            {importResult && (
              <>
                {/* Filename */}
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14, fontFamily: T.fontMono }}>
                  {importFile?.name}
                </div>

                {/* Summary chips */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    `${importResult.summary.projects} project${importResult.summary.projects !== 1 ? "s" : ""}`,
                    `${importResult.summary.experts} expert${importResult.summary.experts !== 1 ? "s" : ""}`,
                    `${importResult.summary.tasks} task${importResult.summary.tasks !== 1 ? "s" : ""}`,
                    importResult.summary.dateRange,
                  ].map((chip, i) => (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: 20,
                      background: T.trackBg, color: T.textSecondary,
                      fontSize: 11, fontFamily: T.fontMono,
                    }}>{chip}</span>
                  ))}
                </div>

                {/* Replace warning banner */}
                <div style={{
                  padding: "9px 14px", borderRadius: 8, marginBottom: 16,
                  background: T.amber + "18", border: `1px solid ${T.amber}35`,
                  fontSize: 12, color: T.amber, fontWeight: 500,
                }}>
                  ⚠ This will replace your current data.
                </div>

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: T.red,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "6px 10px", background: T.red + "14", borderRadius: 6, marginBottom: 8,
                    }}>
                      Errors ({importResult.errors.length}) — Import blocked
                    </div>
                    <div style={{ maxHeight: 180, overflowY: "auto", border: `1px solid ${T.borderLight}`, borderRadius: 8 }}>
                      {importResult.errors.map((err, i) => (
                        <div key={i} style={{
                          padding: "8px 12px", display: "flex", gap: 10, alignItems: "flex-start",
                          borderBottom: i < importResult.errors.length - 1 ? `1px solid ${T.borderLight}` : "none",
                        }}>
                          <span style={{
                            fontFamily: T.fontMono, fontSize: 10, background: T.trackBg,
                            color: T.textMuted, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1,
                          }}>row {err.row}</span>
                          <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.red, fontWeight: 600, flexShrink: 0 }}>
                            {err.field}
                          </span>
                          <span style={{ fontSize: 12, color: T.textSecondary }}>{err.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: T.amber,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "6px 10px", background: T.amber + "14", borderRadius: 6, marginBottom: 8,
                    }}>
                      Warnings ({importResult.warnings.length}) — Will import, flagged
                    </div>
                    <div style={{ maxHeight: 140, overflowY: "auto", border: `1px solid ${T.borderLight}`, borderRadius: 8 }}>
                      {importResult.warnings.map((w, i) => (
                        <div key={i} style={{
                          padding: "8px 12px", display: "flex", gap: 10, alignItems: "flex-start",
                          borderBottom: i < importResult.warnings.length - 1 ? `1px solid ${T.borderLight}` : "none",
                        }}>
                          {w.row && (
                            <span style={{
                              fontFamily: T.fontMono, fontSize: 10, background: T.trackBg,
                              color: T.textMuted, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1,
                            }}>row {w.row}</span>
                          )}
                          <span style={{ fontSize: 12, color: T.textSecondary }}>{w.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All clear */}
                {importResult.errors.length === 0 && importResult.warnings.length === 0 && (
                  <div style={{
                    padding: "9px 14px", borderRadius: 8, marginBottom: 16,
                    background: T.green + "18", border: `1px solid ${T.green}35`,
                    fontSize: 12, color: T.green, fontWeight: 500,
                  }}>
                    ✓ No issues found. Ready to import.
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 10,
              paddingTop: 16, borderTop: `1px solid ${T.borderLight}`,
            }}>
              <button onClick={onClose} style={{
                padding: "8px 20px", fontSize: 12, fontWeight: 500,
                border: `1px solid ${T.border}`, borderRadius: 8,
                background: "transparent", color: T.textSecondary,
                cursor: "pointer", fontFamily: T.fontBody,
              }}>Cancel</button>
              <button
                onClick={onConfirm}
                disabled={!canConfirm}
                style={{
                  padding: "8px 22px", fontSize: 12, fontWeight: 600,
                  border: "none", borderRadius: 8, fontFamily: T.fontBody,
                  cursor: canConfirm ? "pointer" : "not-allowed",
                  background: canConfirm ? T.lavender : T.trackBg,
                  color: canConfirm ? "#fff" : T.textMuted,
                  transition: "all 0.15s ease",
                }}
              >
                Confirm Import
              </button>
            </div>
          </div>
        )}

        {/* ── Stage 3: Success ── */}
        {importStage === "success" && (
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: T.green + "22", border: `2px solid ${T.green}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 22, color: T.green,
            }}>✓</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, marginBottom: 8 }}>
              Import successful
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>
              {importResult?.summary.tasks} task{importResult?.summary.tasks !== 1 ? "s" : ""} across{" "}
              {importResult?.summary.projects} project{importResult?.summary.projects !== 1 ? "s" : ""} loaded successfully
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>Dashboard updated</div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function Dashboard() {
  const [activeTab,       setActiveTab]       = useState("overview");
  const [selectedExpert,  setSelectedExpert]  = useState(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [currentTime,     setCurrentTime]     = useState(new Date());
  const [animateIn,       setAnimateIn]       = useState(false);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStage,     setImportStage]     = useState("upload");
  const [importFile,      setImportFile]      = useState(null);
  const [importResult,    setImportResult]    = useState(null);

  // Data state (initialized from hardcoded constants, replaceable via import)
  const [experts,        setExperts]        = useState(EXPERTS);
  const [pipelineStages, setPipelineStages] = useState(PIPELINE_STAGES);
  const [dailyMetrics,   setDailyMetrics]   = useState(DAILY_METRICS);
  const [alerts,         setAlerts]         = useState(ALERTS);

  useEffect(() => {
    setAnimateIn(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss success stage after 2 seconds
  useEffect(() => {
    if (importStage === "success" && showImportModal) {
      const t = setTimeout(() => {
        setShowImportModal(false);
        setImportStage("upload");
        setImportFile(null);
        setImportResult(null);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [importStage, showImportModal]);

  function handleImportClose() {
    setShowImportModal(false);
    setImportStage("upload");
    setImportFile(null);
    setImportResult(null);
  }

  function handleFileSelect(file) {
    if (!file?.name.toLowerCase().endsWith(".csv")) return;
    setImportFile(file);
    setImportStage("validation");
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows   = parseCSV(e.target.result);
      const result = validateRows(rows);
      result._rows = rows;
      setImportResult(result);
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    const { experts: e, pipelineStages: p, dailyMetrics: d, alerts: a } = normalizeData(importResult._rows);
    setExperts(e);
    setPipelineStages(p);
    setDailyMetrics(d);
    setAlerts(a);
    setSelectedExpert(null);
    setImportStage("success");
  }

  const filteredExperts = experts.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTasks    = experts.reduce((a, e) => a + e.tasksCompleted, 0);
  const avgAccuracy   = experts.some(e => e.accuracy !== null)
    ? (experts.filter(e => e.accuracy !== null).reduce((a, e) => a + e.accuracy, 0) / experts.filter(e => e.accuracy !== null).length).toFixed(1)
    : "—";
  const avgTime       = experts.some(e => e.avgTime !== null)
    ? Math.round(experts.filter(e => e.avgTime !== null).reduce((a, e) => a + e.avgTime, 0) / experts.filter(e => e.avgTime !== null).length)
    : null;
  const activeExperts = experts.filter(e => e.status === "active").length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "experts",  label: "Expert Roster" },
    { id: "pipeline", label: "Pipeline" },
    { id: "alerts",   label: `Alerts (${alerts.length})` },
  ];

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: T.pageBg,
      fontFamily: T.fontBody, color: T.textPrimary,
      opacity: animateIn ? 1 : 0, transition: "opacity 0.6s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fira+Code:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D4CAB8; border-radius: 3px; }
        input::placeholder { color: ${T.textMuted}; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "16px 28px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `linear-gradient(180deg, ${T.headerBg} 0%, ${T.pageBg} 100%)`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.lavender}, ${T.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em",
          }}>m1</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: T.textPrimary }}>
              Data Ops Dashboard
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
              Project: Lab Alpha — RLHF Sprint 14
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontMono }}>
            {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            {" · "}
            {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={() => { setShowImportModal(true); setImportStage("upload"); }}
            style={{
              padding: "7px 16px", fontSize: 12, fontWeight: 600, fontFamily: T.fontBody,
              background: T.lavender + "22", color: T.lavender,
              border: `1px solid ${T.lavender}44`, borderRadius: 8, cursor: "pointer",
            }}
          >
            Import CSV
          </button>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.amber}, ${T.red})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>MK</div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{
        display: "flex", gap: 0, padding: "0 28px",
        borderBottom: `1px solid ${T.border}`, background: T.pageBg,
        position: "sticky", top: 65, zIndex: 99,
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "12px 20px", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? T.textPrimary : T.textMuted,
            background: "none", border: "none", cursor: "pointer",
            borderBottom: activeTab === tab.id ? `2px solid ${T.lavender}` : "2px solid transparent",
            transition: "all 0.2s ease", fontFamily: "inherit",
          }}>
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: 28, maxWidth: 1200, margin: "0 auto" }}>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Total Tasks",    value: totalTasks.toLocaleString(),                sub: "this sprint",            accent: T.blue },
                { label: "Avg Accuracy",   value: avgAccuracy === "—" ? "—" : `${avgAccuracy}%`, sub: "across all experts",  accent: T.green },
                { label: "Avg Task Time",  value: avgTime === null ? "—" : `${avgTime} min`,  sub: "target: 25 min",         accent: avgTime === null ? T.textMuted : avgTime <= 25 ? T.green : T.amber },
                { label: "Active Experts", value: `${activeExperts}/${experts.length}`,        sub: `${experts.length - activeExperts} in review`, accent: T.lavender },
              ].map((kpi, i) => (
                <div key={i} style={{
                  background: T.cardBg, borderRadius: 14, padding: "20px 22px",
                  border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <span style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
                    {kpi.label}
                  </span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: kpi.accent, letterSpacing: "-0.02em", fontFamily: T.fontMono }}>
                    {kpi.value}
                  </span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{kpi.sub}</span>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: T.cardBg, borderRadius: 14, padding: 22, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: T.textPrimary }}>Daily Task Volume</div>
                <MiniBar data={dailyMetrics} dataKey="tasks" color={T.lavender} height={100} />
              </div>
              <div style={{ background: T.cardBg, borderRadius: 14, padding: 22, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: T.textPrimary }}>Daily Quality Score</div>
                <MiniBar data={dailyMetrics} dataKey="quality" color={T.green} height={100} />
              </div>
            </div>

            {/* Pipeline Quick View */}
            <div style={{ background: T.cardBg, borderRadius: 14, padding: 22, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: T.textPrimary, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Pipeline Health
                <span style={{ fontSize: 11, color: T.green, background: T.green + "1E", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                  All systems operational
                </span>
              </div>
              <PipelineFunnel stages={pipelineStages} />
            </div>

            {/* Recent Activity */}
            <div style={{ background: T.cardBg, borderRadius: 14, padding: 22, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: T.textPrimary }}>Recent Activity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.slice(0, 3).map((alert, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${T.borderLight}` : "none" }}>
                    <AlertIcon type={alert.type} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{alert.message}</div>
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== EXPERTS TAB ===== */}
        {activeTab === "experts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary }}>Expert Roster</div>
              <input
                type="text"
                placeholder="Search by name or domain..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, color: T.textPrimary, width: 260,
                  fontFamily: "inherit", outline: "none",
                }}
              />
            </div>

            <div style={{ background: T.cardBg, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["Status", "Expert", "Domain", "Tasks", "Avg Time", "Accuracy", "Trend", "Readiness"].map((h, i) => (
                      <th key={i} style={{
                        padding: "12px 16px", fontSize: 10, fontWeight: 600, color: T.textMuted,
                        textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredExperts.map((expert) => {
                    const readiness = calcReadiness(expert);
                    const rColor = readiness >= 85 ? T.green : readiness >= 65 ? T.amber : T.red;
                    return (
                      <tr key={expert.id}
                        onClick={() => setSelectedExpert(selectedExpert?.id === expert.id ? null : expert)}
                        style={{
                          borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer",
                          background: selectedExpert?.id === expert.id ? "#EDE7DC" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "12px 16px" }}><StatusDot status={expert.status} /></td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary }}>{expert.name}</div>
                          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{expert.university}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: T.textSecondary }}>{expert.domain}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: T.fontMono, fontWeight: 500, color: T.textPrimary }}>
                          {expert.tasksCompleted}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: T.fontMono,
                          color: expert.avgTime === null ? T.textMuted : expert.avgTime <= 25 ? T.green : T.amber,
                        }}>
                          {expert.avgTime === null ? "—" : `${expert.avgTime}m`}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: T.fontMono, fontWeight: 600,
                          color: expert.accuracy === null ? T.textMuted : expert.accuracy >= 96 ? T.green : expert.accuracy >= 93 ? T.amber : T.red,
                        }}>
                          {expert.accuracy === null ? "—" : `${expert.accuracy}%`}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <TrendArrow trend={expert.trend} pct={expert.trendPct} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 56, height: 4, backgroundColor: T.trackBg, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${readiness}%`, height: "100%", backgroundColor: rColor, borderRadius: 2, transition: "width 0.6s ease" }} />
                            </div>
                            <span style={{ fontSize: 12, fontFamily: T.fontMono, fontWeight: 600, color: rColor }}>{readiness}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expert Detail Panel */}
            {selectedExpert && (
              <div style={{
                background: T.cardBg, borderRadius: 14, padding: 24, border: `1px solid ${T.border}`,
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20,
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: T.textPrimary }}>{selectedExpert.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{selectedExpert.domain} · {selectedExpert.university}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                    ID: {selectedExpert.id} · Rating: {typeof selectedExpert.rating === "number" ? `⭐ ${selectedExpert.rating}` : selectedExpert.rating}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Performance</div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>
                    Accuracy: <strong style={{ color: selectedExpert.accuracy === null ? T.textMuted : selectedExpert.accuracy >= 96 ? T.green : T.amber }}>
                      {selectedExpert.accuracy === null ? "—" : `${selectedExpert.accuracy}%`}
                    </strong>
                  </div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>
                    Speed: <strong style={{ color: selectedExpert.avgTime === null ? T.textMuted : selectedExpert.avgTime <= 25 ? T.green : T.amber }}>
                      {selectedExpert.avgTime === null ? "—" : `${selectedExpert.avgTime} min/task`}
                    </strong>
                  </div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>
                    Volume: <strong style={{ color: T.textPrimary }}>{selectedExpert.tasksCompleted} tasks</strong>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>SPL Actions</div>
                  {["Schedule 1:1 Review", "Assign to Priority Queue", "Flag for Bonus Review"].map((action, i) => (
                    <button key={i} style={{
                      padding: "6px 12px", fontSize: 11, fontWeight: 500, border: `1px solid ${T.border}`,
                      borderRadius: 6, background: "transparent", color: T.textSecondary, cursor: "pointer",
                      textAlign: "left", fontFamily: "inherit", transition: "all 0.15s ease",
                    }}>{action}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PIPELINE TAB ===== */}
        {activeTab === "pipeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary }}>Data Pipeline</div>

            <div style={{ background: T.cardBg, borderRadius: 14, padding: 24, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: T.textPrimary }}>Task Flow Funnel</div>
              <PipelineFunnel stages={pipelineStages} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {pipelineStages.map((stage, i) => (
                <div key={i} style={{
                  background: T.cardBg, borderRadius: 14, padding: 18, border: `1px solid ${T.border}`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, fontWeight: 500 }}>{stage.name}</div>
                  <div style={{
                    fontSize: 24, fontWeight: 700, fontFamily: T.fontMono,
                    color: stage.throughput >= 95 ? T.green : stage.throughput >= 85 ? T.amber : T.red,
                  }}>{stage.throughput}%</div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>throughput</div>
                  <div style={{
                    fontSize: 10, marginTop: 8, padding: "3px 8px", borderRadius: 10, display: "inline-block",
                    background: stage.errors === 0 ? T.green + "1E" : stage.errors > 10 ? T.red + "1E" : T.amber + "1E",
                    color:      stage.errors === 0 ? T.green       : stage.errors > 10 ? T.red       : T.amber,
                    fontFamily: T.fontMono,
                  }}>{stage.errors} errors</div>
                </div>
              ))}
            </div>

            <div style={{ background: T.cardBg, borderRadius: 14, padding: 22, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: T.textPrimary }}>Pipeline Notes</div>
              <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.75 }}>
                The annotation stage is the current bottleneck at 82.4% throughput — primarily driven by the scope expansion from Lab Alpha (+200 physics tasks).
                Recommendation: reallocate 2 experts from Linguistics to Physics annotation for the remainder of Sprint 14.
                Rhea AI QC continues to perform well with only 3 structural errors caught this cycle, all auto-resolved.
              </div>
            </div>
          </div>
        )}

        {/* ===== ALERTS TAB ===== */}
        {activeTab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary }}>Activity & Alerts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.map((alert, i) => (
                <div key={i} style={{
                  background: T.cardBg, borderRadius: 14, padding: "16px 20px",
                  border: `1px solid ${T.border}`,
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}>
                  <AlertIcon type={alert.type} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{alert.message}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{alert.time}</div>
                  </div>
                  <button style={{
                    padding: "5px 12px", fontSize: 11, border: `1px solid ${T.border}`,
                    borderRadius: 6, background: "transparent", color: T.textMuted,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                  }}>Acknowledge</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: "16px 28px", borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 11, color: T.textMuted,
      }}>
        <span>micro1 Data Ops Dashboard · Built by Mike K. · Strategic Projects Lead Demo</span>
        <span>Simulated data for demonstration purposes</span>
      </footer>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          importStage={importStage}
          importFile={importFile}
          importResult={importResult}
          onFileSelect={handleFileSelect}
          onConfirm={handleConfirmImport}
          onClose={handleImportClose}
        />
      )}
    </div>
  );
}
