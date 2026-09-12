// Created by: OpenCode (AI-assisted), 2026-07-18
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../..");

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function request(server, options = {}) {
  const address = server.address();
  return new Promise((resolve, reject) => {
    const incoming = http.request({
      hostname: "127.0.0.1",
      port: address.port,
      path: options.path || "/",
      method: options.method || "GET",
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ response, body }));
    });
    incoming.on("error", reject);
    incoming.end();
  });
}

test("pins one manual visual dependency and native bounded context controls", async () => {
  const config = await readJson(path.join(ROOT, "opencode.json"));
  assert.equal(config.share, "disabled");
  assert.equal(config.autoupdate, false);
  assert.deepEqual(
    config.plugin.filter((entry) => Array.isArray(entry)),
    [["@plannotator/opencode@0.23.1", { workflow: "manual" }]],
  );
  assert.deepEqual(config.tool_output, { max_lines: 800, max_bytes: 32768 });
  assert.deepEqual(config.compaction, {
    auto: true,
    keep: { tokens: 24000 },
    prune: true,
    tail_turns: 4,
    preserve_recent_tokens: 24000,
    reserved: 12000,
  });
  assert.deepEqual(
    Object.keys(config.command).filter((name) => name.startsWith("plannotator-")).sort(),
    ["plannotator-annotate", "plannotator-last", "plannotator-review"],
  );
  for (const name of ["plannotator-annotate", "plannotator-last", "plannotator-review"]) {
    assert.equal(config.command[name].agent, "nexo");
  }
  assert.doesNotMatch(
    JSON.stringify(config.plugin),
    /(?:opencode-dcp|\bsnip\b|memory|swarm|auto-review)/i,
  );
});

test("configures privacy-safe TUI attention and the local status footer", async () => {
  const tui = await readJson(path.join(ROOT, "tui.json"));
  assert.deepEqual(tui.plugin, ["./.opencode/tui/nexo-status.tsx"]);
  assert.equal(tui.attention.enabled, true);
  assert.equal(tui.attention.notifications, true);
  assert.equal(tui.attention.sound, true);
  assert.ok(tui.attention.volume >= 0 && tui.attention.volume <= 1);
  const source = await fs.readFile(path.join(ROOT, ".opencode/tui/nexo-status.tsx"), "utf8");
  assert.match(source, /sidebar_footer/);
  assert.match(source, /budget-ledger\.json/);
  assert.doesNotMatch(source, /message|prompt|output\.parts/i);
});

test("doctor detects the two CLIs and approved project controls deterministically", async (t) => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-runtime-doctor-"));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const bin = path.join(temporary, "bin");
  await fs.mkdir(path.join(temporary, ".opencode"), { recursive: true });
  await fs.mkdir(bin);
  for (const name of ["opencode", "opencode2"]) {
    const executable = path.join(bin, name);
    await fs.writeFile(executable, "#!/bin/sh\nprintf 'opencode v2.0.2\\n'\n");
    await fs.chmod(executable, 0o755);
  }
  await fs.writeFile(path.join(temporary, ".opencode/package.json"), JSON.stringify({
    dependencies: { "@opencode/plugin": "2.0.2" },
  }));
  await fs.writeFile(path.join(temporary, ".opencode/opencode.json"), JSON.stringify({
    mcp: {
      vercel: {
        environment: {
          VERCEL_API_TOKEN: "{env:VERCEL_API_TOKEN}",
        },
      },
    },
  }));
  await fs.writeFile(path.join(temporary, "opencode.json"), JSON.stringify({
    model: "openai/gpt-5.6-sol",
    default_agent: "nexo",
    subagent_depth: 1,
    experimental: { subagent_depth: 1 },
    share: "disabled",
    plugin: [["@plannotator/opencode@0.23.1", { workflow: "manual" }]],
    plugins: [{ package: "@plannotator/opencode@0.27.14", options: { workflow: "manual" } }],
    tool_output: { max_lines: 800, max_bytes: 32768 },
    compaction: { auto: true, keep: { tokens: 24000 }, prune: true, tail_turns: 4, preserve_recent_tokens: 24000, reserved: 12000 },
  }));
  await fs.writeFile(path.join(temporary, "tui.json"), JSON.stringify({
    plugin: ["./.opencode/tui/nexo-status.tsx"],
    attention: { enabled: true, notifications: true },
  }));
  const v2Files = [
    ".opencode/lib/v2-plugin-adapter.mjs",
    ".opencode/plugins/nexo-productivity-v2.js",
    ".opencode/plugins/nexo-budget-guard-v2.js",
    ".opencode/plugins/isyte-ops-v2.js",
    ".opencode/plugins/nexo-status/index.js",
    ".opencode/plugins/nexo-status/tui.tsx",
    ".opencode/plugins/nexo-status/package.json",
    ".opencode/optional-plugins/graphify-v2.js",
  ];
  const v1Files = [
    ".opencode/plugins/nexo-productivity.mjs",
    ".opencode/plugins/nexo-budget-guard.mjs",
    ".opencode/plugins/isyte-ops.mjs",
    ".opencode/tui/nexo-status.tsx",
    ".opencode/optional-plugins/graphify.js",
  ];
  for (const relative of [...v2Files, ...v1Files]) {
    await fs.mkdir(path.dirname(path.join(temporary, relative)), { recursive: true });
    await fs.writeFile(path.join(temporary, relative), "// synthetic\n");
  }

  const { inspectRuntime } = await import("../scripts/opencode2-doctor.mjs");
  const result = await inspectRuntime(temporary, { path: bin });
  assert.equal(result.ok, true);
  assert.equal(result.commands.opencode2.version, "opencode v2.0.2");
  assert.equal(result.pluginApi, "2.0.2");
  assert.deepEqual(result.blockers, []);
  assert.ok(result.warnings.includes("Graphify is available locally but is not loaded by default"));
  assert.ok(!result.warnings.some((warning) => warning.includes("compaction")));
});

test("serves read-only status on an explicit non-product loopback port", async (t) => {
  const { createStatusServer, DEFAULT_HOST, DEFAULT_PORT, resolveStatusPort } = await import("../scripts/serve-harness-status.mjs");
  assert.equal(DEFAULT_HOST, "127.0.0.1");
  assert.equal(DEFAULT_PORT, 41749);
  assert.equal(resolveStatusPort(), 41749);
  assert.throws(() => resolveStatusPort("5173"), /other than 5173/);

  const server = createStatusServer({ rootDir: ROOT });
  await new Promise((resolve) => server.listen(0, DEFAULT_HOST, resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const page = await request(server);
  assert.equal(page.response.statusCode, 200);
  assert.match(page.body, /Nexo Control Room/);
  assert.match(page.response.headers["content-security-policy"], /default-src 'none'/);
  assert.equal(page.response.headers["referrer-policy"], "no-referrer");

  const api = await request(server, { path: "/api/status" });
  assert.equal(api.response.statusCode, 200);
  assert.equal(JSON.parse(api.body).focus.taskId, "NEXO-0036");

  const write = await request(server, { method: "POST" });
  assert.equal(write.response.statusCode, 405);
  assert.equal(write.response.headers.allow, "GET, HEAD");
});
