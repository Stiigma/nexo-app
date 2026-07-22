"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../..");
const SOL = "openai/gpt-5.6-sol";

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

test("uses Sol with low verbosity and risk-tiered agent variants", async () => {
  const config = await readJson(path.join(ROOT, "opencode.json"));
  assert.equal(config.model, SOL);
  const expected = {
    nexo: "medium",
    "nexo-resume": "medium",
    "nexo-plan": "high",
    "nexo-build": "high",
    "nexo-spec": "high",
    "nexo-design": "high",
    "nexo-qa": "high",
    "nexo-infra": "high",
    "nexo-security": "xhigh",
    summary: "medium",
    compaction: "medium",
  };
  for (const [agent, variant] of Object.entries(expected)) {
    assert.equal(config.agent[agent].model, SOL, agent);
    assert.equal(config.agent[agent].variant, variant, agent);
    assert.equal(config.agent[agent].options.textVerbosity, "low", agent);
  }
});

test("configured Sol variants exist in the local OpenCode model registry", async (t) => {
  const registryFile = path.join(os.homedir(), ".cache/opencode/models.json");
  let registry;
  try {
    registry = await readJson(registryFile);
  } catch (error) {
    if (error?.code === "ENOENT") {
      t.skip("local OpenCode model registry is unavailable");
      return;
    }
    throw error;
  }
  const sol = registry.openai?.models?.["gpt-5.6-sol"];
  assert.ok(sol, "openai/gpt-5.6-sol is absent from the local registry");
  const supported = new Set(
    (sol.reasoning_options || [])
      .filter((option) => option.type === "effort")
      .flatMap((option) => option.values || []),
  );
  for (const variant of ["medium", "high", "xhigh"]) {
    assert.ok(supported.has(variant), `${variant} is not supported by local Sol metadata`);
  }
});

test("relies on project plugin auto-discovery without duplicate paths", async () => {
  const nested = await readJson(path.join(ROOT, ".opencode/opencode.json"));
  assert.equal(nested.plugin, undefined);
});

test("loads both local plugins and exposes scoped lifecycle hooks", async () => {
  const BudgetPlugin = require(path.join(ROOT, ".opencode/lib/nexo-budget-guard.cjs"));
  const IsytePlugin = require(path.join(ROOT, ".opencode/lib/isyte-ops.cjs"));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-plugin-load-"));
  try {
    const budget = await BudgetPlugin({ directory: temporary, client: {} });
    const isyte = await IsytePlugin({ directory: temporary });
    assert.equal(typeof budget.event, "function");
    assert.equal(typeof budget["command.execute.before"], "function");
    assert.equal(typeof budget["tool.execute.before"], "function");
    assert.equal(typeof budget["tool.execute.after"], "function");
    assert.equal(typeof budget["experimental.session.compacting"], "function");
    assert.equal(typeof isyte["command.execute.before"], "function");
    assert.equal(typeof isyte["experimental.chat.system.transform"], "function");
    assert.equal(typeof isyte["experimental.session.compacting"], "function");
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
});

test("uses single-function ESM adapters for the OpenCode2 plugin loader", async () => {
  const adapters = {
    "nexo-budget-guard.mjs": "NexoBudgetGuardPlugin",
    "nexo-productivity.mjs": "NexoProductivityPlugin",
    "isyte-ops.mjs": "IsyteOpsPlugin",
  };
  for (const [file, exported] of Object.entries(adapters)) {
    const module = await import(path.join(ROOT, ".opencode/plugins", file));
    assert.deepEqual(Object.keys(module), [exported]);
    assert.equal(typeof module[exported], "function");
  }
});
