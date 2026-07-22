// Created by: OpenCode (AI-assisted), 2026-07-18
"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const ProductivityPlugin = require("../lib/nexo-productivity.cjs");

test("sanitizes common secret shapes without changing ordinary logs", () => {
  const jwt = `eyJ${"a".repeat(20)}.${"b".repeat(20)}.${"c".repeat(20)}`;
  const bcrypt = `$2b$12$${"a".repeat(53)}`;
  const base64 = "A".repeat(320);
  const source = `ok line\nAuthorization: Bearer abcdefghijklmnop\ntoken=${jwt}\npassword: \"long-password\"\n${bcrypt}\n${base64}`;
  const sanitized = ProductivityPlugin.sanitizeText(source);

  assert.match(sanitized, /^ok line/m);
  assert.match(sanitized, /Bearer \[redacted:bearer\]/);
  assert.match(sanitized, /token=\[redacted:secret\]/);
  assert.match(sanitized, /password: "\[redacted:secret\]"/);
  assert.match(sanitized, /\[redacted:bcrypt\]/);
  assert.match(sanitized, /\[redacted:base64:320chars\]/);
  assert.doesNotMatch(sanitized, /abcdefghijklmnop|long-password|\$2b\$12\$/);
  assert.equal(ProductivityPlugin.sanitizeText("GET /health 200 in 12ms"), "GET /health 200 in 12ms");
});

test("blocks direct sensitive env paths but allows documented templates", () => {
  assert.throws(
    () => ProductivityPlugin.guardSensitiveAccess(
      { tool: "read" },
      { args: { filePath: "/workspace/.env.production" } },
    ),
    /secret guard denied/,
  );
  assert.throws(
    () => ProductivityPlugin.guardSensitiveAccess(
      { tool: "grep" },
      { args: { path: "/workspace", include: ".env" } },
    ),
    /secret guard denied/,
  );
  assert.throws(
    () => ProductivityPlugin.guardSensitiveAccess(
      { tool: "apply_patch" },
      { args: { patchText: "*** Begin Patch\n*** Add File: .env\n+SECRET=x\n*** End Patch" } },
    ),
    /secret guard denied/,
  );
  assert.throws(
    () => ProductivityPlugin.guardSensitiveAccess(
      { tool: "bash" },
      { args: { command: "source ./.env.local" } },
    ),
    /secret guard denied/,
  );
  assert.doesNotThrow(() => ProductivityPlugin.guardSensitiveAccess(
    { tool: "read" },
    { args: { filePath: "/workspace/.env.example" } },
  ));
});

test("keeps Plannotator manual review local and blocks URL retrieval", async () => {
  assert.throws(
    () => ProductivityPlugin.guardPlannotatorUrl({
      command: "plannotator-annotate",
      arguments: "https://example.com/plan.md",
    }),
    /local-only guard denied/,
  );
  assert.doesNotThrow(() => ProductivityPlugin.guardPlannotatorUrl({
    command: "plannotator-annotate",
    arguments: "harness/control/plans/NEXO-0049-opencode2-productivity-observability.md",
  }));
  for (const artifact of [".", ".env", "../outside.md", "/tmp/outside.md"]) {
    assert.throws(
      () => ProductivityPlugin.guardPlannotatorUrl({
        command: "plannotator-annotate",
        arguments: artifact,
      }),
      /project-relative/,
      artifact,
    );
  }
  assert.doesNotThrow(() => ProductivityPlugin.guardPlannotatorUrl({
    command: "plannotator-annotate",
    arguments: "--markdown \"docs/local plan.md\" --no-jina",
  }));
  assert.throws(
    () => ProductivityPlugin.guardPlannotatorUrl({
      command: "plannotator-review",
      arguments: "https://example.com/pull/1",
    }),
    /local-only guard denied/,
  );

  const hooks = await ProductivityPlugin({});
  const output = { env: {} };
  await hooks["shell.env"]({}, output);
  assert.deepEqual(output.env, {
    PLANNOTATOR_SHARE: "disabled",
    PLANNOTATOR_REMOTE: "0",
  });
});

test("sanitizes user text through the OpenCode chat hook", async () => {
  const hooks = await ProductivityPlugin({});
  const output = {
    parts: [
      { type: "text", text: "api_key=1234567890abcdef" },
      { type: "file", text: "token=must-not-be-touched" },
    ],
  };
  await hooks["chat.message"]({}, output);
  assert.equal(output.parts[0].text, "api_key=[redacted:secret]");
  assert.equal(output.parts[1].text, "token=must-not-be-touched");
});
