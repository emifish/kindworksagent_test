const stageContainer = document.getElementById("stages");
const summary = document.getElementById("summary");

for (let i = 1; i <= 7; i += 1) {
  const wrapper = document.createElement("div");
  wrapper.className = "stage";
  wrapper.innerHTML = `
    <h3>Stage ${i}</h3>
    <label>Stage name <input type="text" id="stage${i}Name" /></label>
    <label>Touchpoints (systems/people/things) <textarea id="stage${i}Touchpoints"></textarea></label>
    <label>Wants & needs (personas) <textarea id="stage${i}Needs"></textarea></label>
    <label>Moments of truth / confusion points <textarea id="stage${i}Truth"></textarea></label>
  `;
  stageContainer.appendChild(wrapper);
}

function readValue(id) {
  return document.getElementById(id).value.trim();
}

function readRating(id) {
  const raw = readValue(id);
  if (!raw) return null;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;
  return Math.max(1, Math.min(5, parsed));
}

function gradeFromChecks() {
  const checks = Array.from(document.querySelectorAll(".grade-input"));
  const checked = checks.filter((item) => item.checked).length;
  const pct = Math.round((checked / checks.length) * 100);

  if (pct >= 85) return { grade: "A", pct, next: "Scale AI pilots and optimize measurement." };
  if (pct >= 70) return { grade: "B", pct, next: "Prioritize two high-value automation opportunities." };
  if (pct >= 55) return { grade: "C", pct, next: "Standardize data and document workflows before automation." };
  if (pct >= 40) return { grade: "D", pct, next: "Create a digital foundation and identify manual bottlenecks." };
  return { grade: "F", pct, next: "Start with process mapping, shared tools, and baseline metrics." };
}

function playbookFromSeverity(severity) {
  if (severity >= 4.2) {
    return [
      "Days 1-30: Deep discovery, baseline metrics, and root-cause validation.",
      "Days 31-60: Pilot one redesigned workflow and automation quick win.",
      "Days 61-90: Expand pilot, train team, and define implementation roadmap."
    ];
  }
  if (severity >= 3.2) {
    return [
      "Days 1-30: Validate priorities and map current/future-state workflow.",
      "Days 31-60: Remove top friction points and implement lightweight tooling changes.",
      "Days 61-90: Measure outcomes and create a phased improvement backlog."
    ];
  }
  return [
    "Days 1-30: Confirm opportunity areas and align stakeholders.",
    "Days 31-60: Improve process clarity, documentation, and ownership.",
    "Days 61-90: Identify automation-ready tasks and prepare next pilot."
  ];
}

function collectStages() {
  const results = [];
  for (let i = 1; i <= 7; i += 1) {
    const name = readValue(`stage${i}Name`);
    const touchpoints = readValue(`stage${i}Touchpoints`);
    const needs = readValue(`stage${i}Needs`);
    const truth = readValue(`stage${i}Truth`);
    if (name || touchpoints || needs || truth) {
      results.push({ i, name, touchpoints, needs, truth });
    }
  }
  return results;
}

function formatPersona([alias, desc], idx) {
  const name = alias || "Unnamed";
  const description = desc || "No description";
  return `- Persona ${idx + 1}: ${name} (${description})`;
}

function formatStage(stage) {
  return [
    `- Stage ${stage.i}: ${stage.name || "Unnamed"}`,
    `  Touchpoints: ${stage.touchpoints || "N/A"}`,
    `  Wants/Needs: ${stage.needs || "N/A"}`,
    `  Moment of truth: ${stage.truth || "N/A"}`
  ].join("\n");
}

document.getElementById("generate").addEventListener("click", () => {
  const ratings = ["impactClient", "timeToTask", "emotionClient", "emotionWorker", "costOfDelay"]
    .map((id) => readRating(id))
    .filter((rating) => rating !== null);
  const severity = ratings.length
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : 0;
  const grade = gradeFromChecks();
  const stages = collectStages();
  const stageCountNote =
    stages.length >= 5 && stages.length <= 7
      ? "Workflow stage depth looks on target (5-7 stages)."
      : "Add/adjust stages to target 5-7 core workflow stages.";

  const personas = [
    [readValue("persona1Alias"), readValue("persona1Desc")],
    [readValue("persona2Alias"), readValue("persona2Desc")],
    [readValue("persona3Alias"), readValue("persona3Desc")]
  ].filter(([alias, desc]) => alias || desc);

  const summaryText = [
    `Organization: ${readValue("orgName") || "N/A"}`,
    `Mission focus: ${readValue("mission") || "N/A"}`,
    "",
    "Prioritized problem",
    `- Problem: ${readValue("coreProblem") || "N/A"}`,
    `- Description: ${readValue("problemDescription") || "N/A"}`,
    `- Root cause: ${readValue("rootCause") || "N/A"}`,
    `- Composite severity score: ${severity.toFixed(1)} / 5`,
    "",
    "Personas",
    personas.length
      ? personas.map((persona, idx) => formatPersona(persona, idx)).join("\n")
      : "- No personas entered",
    "",
    "Workflow stages and moments of truth",
    stages.length
      ? stages.map((stage) => formatStage(stage)).join("\n")
      : "- No stage details entered",
    `- ${stageCountNote}`,
    "",
    "Suggested 90-day playbook",
    ...playbookFromSeverity(severity).map((line) => `- ${line}`),
    "",
    "Technology and AI readiness",
    `- Grade: ${grade.grade} (${grade.pct}%)`,
    `- Next step: ${grade.next}`,
    "",
    "Consultant prompts for deeper discovery",
    "- Which client-facing pain point creates the highest social impact risk today?",
    "- What data is missing that blocks faster decision-making?",
    "- Which manual activity can be piloted for automation in under 30 days?",
    "- What governance is needed before introducing AI into this workflow?"
  ].join("\n");

  summary.textContent = summaryText;
});
