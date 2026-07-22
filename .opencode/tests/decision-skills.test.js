// Created by: OpenCode (AI-assisted), 2026-07-18
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../..");
const SKILLS = [
  {
    name: "nexo-select-architecture",
    canonical: "harness/control/skills/nexo-select-architecture.md",
    template: "harness/control/templates/architecture-decision-evaluation.md",
    heading: "Architecture Decision Evaluation",
    manifestField: "architectureDecision",
  },
  {
    name: "nexo-select-dependency",
    canonical: "harness/control/skills/nexo-select-dependency.md",
    template: "harness/control/templates/dependency-decision-evaluation.md",
    heading: "Dependency Decision Evaluation",
    manifestField: "dependencyApproval",
  },
];

async function read(relativePath) {
  return fs.readFile(path.join(ROOT, relativePath), "utf8");
}

test("exposes native OpenCode adapters that defer to canonical Nexo skills", async () => {
  for (const skill of SKILLS) {
    const adapter = await read(`.opencode/skills/${skill.name}/SKILL.md`);
    assert.match(adapter, new RegExp(`^name: ${skill.name}$`, "m"), skill.name);
    assert.match(adapter, /^description: .+$/m, skill.name);
    assert.match(adapter, new RegExp(skill.canonical.replaceAll("/", "\\/")), skill.name);
    assert.match(adapter, /Keep\s+`harness\/control\/` authoritative/, skill.name);
  }
});

test("defines bounded selection procedures and governed outcomes", async () => {
  for (const skill of SKILLS) {
    const canonical = await read(skill.canonical);
    for (const heading of [
      "## Use When",
      "## Do Not Use When",
      "## Required Inputs",
      "## Procedure",
      "## Decision Rules",
      "## Governed Evidence",
      "## Output",
    ]) {
      assert.ok(canonical.includes(heading), `${skill.name}: ${heading}`);
    }
    assert.ok(canonical.includes(skill.template), skill.name);
    assert.ok(canonical.includes(skill.manifestField), skill.name);
    assert.match(canonical, /`approved`/, skill.name);
    assert.match(canonical, /`rejected`/, skill.name);
    assert.match(canonical, /`deferred`/, skill.name);
  }
});

test("provides task-bound templates with one machine-checkable decision field", async () => {
  for (const skill of SKILLS) {
    const template = await read(skill.template);
    assert.match(template, /Task ID: `TASK-ID`/, skill.name);
    assert.ok(template.includes(`## ${skill.heading}`), skill.name);
    assert.equal((template.match(/^- Decision:/gm) || []).length, 1, skill.name);
    assert.match(template, /^- Decision: approved\|rejected\|deferred$/m, skill.name);
  }
});

test("connects planner and manifest documentation to both decision skills", async () => {
  const [planner, orchestrator, manifestDocs] = await Promise.all([
    read("harness/control/agents/nexo-plan.md"),
    read("harness/control/agents/nexo.md"),
    read("harness/control/state/tasks/README.md"),
  ]);
  for (const skill of SKILLS) {
    assert.ok(planner.includes(skill.canonical.split("/").at(-1)), skill.name);
    assert.ok(orchestrator.includes(skill.canonical.split("/").at(-1)), skill.name);
    assert.ok(manifestDocs.includes(`## ${skill.heading}`), skill.name);
  }
});

test("keeps dependency trigger vocabulary aligned with the orchestrator", async () => {
  const [canonical, adapter, orchestrator] = await Promise.all([
    read("harness/control/skills/nexo-select-dependency.md"),
    read(".opencode/skills/nexo-select-dependency/SKILL.md"),
    read("harness/control/agents/nexo.md"),
  ]);
  for (const trigger of ["add", "upgrad", "replac", "remov"]) {
    assert.match(canonical.toLowerCase(), new RegExp(trigger), `canonical: ${trigger}`);
    assert.match(adapter.toLowerCase(), new RegExp(trigger), `adapter: ${trigger}`);
    assert.match(orchestrator.toLowerCase(), new RegExp(trigger), `orchestrator: ${trigger}`);
  }
});
