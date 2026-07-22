// Created by: OpenCode (AI-assisted), 2026-07-18
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../..");
const SPECIALISTS = [
  "nexo-resume",
  "nexo-spec",
  "nexo-plan",
  "nexo-design",
  "nexo-build",
  "nexo-qa",
  "nexo-infra",
  "nexo-security",
];

async function readAgent(name) {
  return fs.readFile(path.join(ROOT, ".opencode/agents", `${name}.md`), "utf8");
}

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, "agent must define frontmatter");
  return match[1];
}

function modeOf(markdown) {
  return frontmatter(markdown).match(/^mode:\s*(\w+)$/m)?.[1];
}

function taskRules(markdown) {
  const lines = frontmatter(markdown).split("\n");
  const start = lines.indexOf("  task:");
  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("    ")) break;
    block.push(line);
  }
  return new Map(
    block.map((line) => {
      const match = line.match(/^    ([^:]+):\s*(allow|ask|deny)$/);
      assert.ok(match, `invalid task permission rule: ${line}`);
      return [match[1].replaceAll('"', ""), match[2]];
    }),
  );
}

test("exposes one Nexo primary with an explicit specialist allowlist", async () => {
  const names = ["nexo", ...SPECIALISTS];
  const agents = new Map(await Promise.all(names.map(async (name) => [name, await readAgent(name)])));
  const primaries = names.filter((name) => modeOf(agents.get(name)) === "primary");
  assert.deepEqual(primaries, ["nexo"]);

  const rules = taskRules(agents.get("nexo"));
  assert.equal(rules.get("*"), "deny");
  assert.deepEqual(
    new Set([...rules].filter(([, action]) => action === "allow").map(([name]) => name)),
    new Set(SPECIALISTS),
  );
});

test("keeps every Nexo specialist hidden and unable to delegate", async () => {
  for (const name of SPECIALISTS) {
    const markdown = await readAgent(name);
    const metadata = frontmatter(markdown);
    assert.equal(modeOf(markdown), "subagent", name);
    assert.match(metadata, /^hidden:\s*true$/m, name);
    assert.deepEqual([...taskRules(markdown)], [["*", "deny"]], name);
  }
});

test("keeps non-implementation specialists inside their document scopes", async () => {
  const spec = frontmatter(await readAgent("nexo-spec"));
  const design = frontmatter(await readAgent("nexo-design"));
  assert.match(spec, /^  bash:\s*deny$/m);
  assert.match(spec, /^    "docs\/spec\/\*\*":\s*allow$/m);
  assert.match(design, /^  bash:\s*deny$/m);
  assert.match(design, /^    "docs\/design\/\*\*":\s*allow$/m);
});

test("reserves governed task manifest mutation for planner and orchestrator", async () => {
  for (const name of ["nexo-spec", "nexo-design", "nexo-build", "nexo-qa", "nexo-infra", "nexo-security"]) {
    const metadata = frontmatter(await readAgent(name));
    assert.match(
      metadata,
      /^    "harness\/control\/state\/tasks\/\*\*":\s*deny$/m,
      name,
    );
  }
  const planner = frontmatter(await readAgent("nexo-plan"));
  assert.doesNotMatch(planner, /"harness\/control\/state\/tasks\/\*\*":\s*deny/);
});

test("routes every Nexo command through the orchestrator", async () => {
  const config = JSON.parse(await fs.readFile(path.join(ROOT, "opencode.json"), "utf8"));
  assert.equal(config.agent.build.disable, true);
  assert.equal(config.agent.plan.disable, true);

  const commands = Object.entries(config.command).filter(([name]) => name.startsWith("nexo:"));
  assert.ok(commands.length > 0);
  for (const [name, command] of commands) {
    assert.equal(command.agent, "nexo", name);
  }
  assert.equal(config.command["fiad:plan"].agent, "fiad-plan");
});

test("connects governed build and review commands to the control engine", async () => {
  const config = JSON.parse(await fs.readFile(path.join(ROOT, "opencode.json"), "utf8"));
  assert.match(config.command["nexo:build"].template, /control-engine\.mjs gate .* --name build/);
  assert.match(config.command["nexo:qa"].template, /control-engine\.mjs gate .* --name qa/);
  assert.match(config.command["nexo:security"].template, /control-engine\.mjs gate .* --name security/);
  assert.match(config.command["nexo:close"].template, /control-engine\.mjs transition .* --to closed/);
});
