// graphify V2 port (OpenCode 2.x) — optional plugin, install explicitly in
// .opencode/plugins/ (copy or symlink) only for graph-assisted sessions.
//
// V1 counterpart: ./graphify.js (named export, V1 runtime only).
// Keep the reminder string free of backticks and $(...) constructs: it is
// prepended inside a double-quoted echo.

import { existsSync } from "node:fs";
import path from "node:path";

export default {
  id: "graphify",
  async setup(ctx) {
    let reminded = false;
    await ctx.tool.hook("execute.before", async (event) => {
      if (reminded) return;
      if (event.tool !== "shell" && event.tool !== "bash") return;
      if (!existsSync(path.join(ctx.location.directory, "graphify-out", "graph.json"))) return;
      const input = event.input;
      if (!input || typeof input !== "object") return;
      const command = input.command;
      if (typeof command !== "string" || !command) return;
      input.command =
        'echo "[graphify] knowledge graph at graphify-out/. For focused questions, run graphify query with your question (scoped subgraph, usually much smaller than GRAPH_REPORT.md) instead of grepping raw files. Read GRAPH_REPORT.md only for broad architecture context." ; ' +
        command;
      reminded = true;
    });
  },
};
