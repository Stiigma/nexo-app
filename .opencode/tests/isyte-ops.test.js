"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const IsyteOpsPlugin = require("../lib/isyte-ops.cjs");

async function makeRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "isyte-ops-"));
  const control = path.join(root, "harness/control");
  await fs.mkdir(path.join(control, "state"), { recursive: true });
  await fs.mkdir(path.join(control, "ecosystem"), { recursive: true });
  await fs.writeFile(
    path.join(control, "state/workspace-map.json"),
    JSON.stringify({ repos: [{ id: "CEF", name: "CEF", canonicalProfile: "projects/CEF/profile.md", path: "../CEF" }] }),
  );
  await fs.writeFile(
    path.join(control, "state/project-policy.json"),
    JSON.stringify({ taskPrefix: "FIAD" }),
  );
  await fs.writeFile(path.join(control, "ecosystem/overview.md"), "FIAD overview.");
  await fs.writeFile(path.join(control, "ecosystem/integrations.md"), "FIAD integrations.");
  return root;
}

test("ordinary Nexo sessions receive no FIAD system or compaction context", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const hooks = await IsyteOpsPlugin({ directory: root });

  const system = { system: [] };
  await hooks["experimental.chat.system.transform"]({ sessionID: "nexo-1" }, system);
  const compaction = { context: [] };
  await hooks["experimental.session.compacting"]({ sessionID: "nexo-1" }, compaction);

  assert.deepEqual(system.system, []);
  assert.deepEqual(compaction.context, []);
});

test("FIAD commands mark a session and preserve context through compaction", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const hooks = await IsyteOpsPlugin({ directory: root });
  const commandOutput = { parts: [] };

  await hooks["command.execute.before"](
    { command: "fiad:resume", sessionID: "fiad-1", arguments: "" },
    commandOutput,
  );
  const system = { system: [] };
  await hooks["experimental.chat.system.transform"]({ sessionID: "fiad-1" }, system);
  const compaction = { context: [] };
  await hooks["experimental.session.compacting"]({ sessionID: "fiad-1" }, compaction);

  assert.equal(commandOutput.parts.length, 1);
  assert.match(commandOutput.parts[0].text, /FIAD canonical context/);
  assert.equal(system.system.length, 1);
  assert.match(system.system[0], /FIAD canonical context/);
  assert.equal(compaction.context.length, 1);
  assert.match(compaction.context[0], /FIAD canonical context/);
});

test("FIAD markers survive plugin reload and a Nexo command clears them", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const first = await IsyteOpsPlugin({ directory: root });
  await first["command.execute.before"](
    { command: "isyte:resume", sessionID: "switchable", arguments: "" },
    { parts: [] },
  );

  const reloaded = await IsyteOpsPlugin({ directory: root });
  const beforeSwitch = { system: [] };
  await reloaded["experimental.chat.system.transform"](
    { sessionID: "switchable" },
    beforeSwitch,
  );
  assert.equal(beforeSwitch.system.length, 1);

  await reloaded["command.execute.before"](
    { command: "nexo:resume", sessionID: "switchable", arguments: "" },
    { parts: [] },
  );
  const afterSwitch = { system: [] };
  await reloaded["experimental.chat.system.transform"](
    { sessionID: "switchable" },
    afterSwitch,
  );
  assert.deepEqual(afterSwitch.system, []);
});
