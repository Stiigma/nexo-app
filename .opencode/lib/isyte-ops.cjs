"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const LIMIT = 2800;
const SESSION_STATE = ".opencode/state/fiad-sessions.json";
const MAX_SESSION_MARKERS = 500;

function trim(text, limit = LIMIT) {
  if (!text || text.length <= limit) return text || "";
  return `${text.slice(0, limit - 80)}\n...[truncated by isyte-ops context guard]`;
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function readText(file, limit = 1200) {
  try {
    return trim(await fs.readFile(file, "utf8"), limit);
  } catch {
    return "";
  }
}

async function buildContext(rootDir) {
  const control = path.join(rootDir, "harness/control");
  const workspaceMap = await readJson(path.join(control, "state/workspace-map.json"));
  const policy = await readJson(path.join(control, "state/project-policy.json"));
  const overview = await readText(path.join(control, "ecosystem/overview.md"), 1200);
  const integrations = await readText(path.join(control, "ecosystem/integrations.md"), 900);
  const profileRefs = (workspaceMap?.repos || [])
    .map((repo) => `- ${repo.id}: ${repo.name}; profile=${repo.canonicalProfile}; path=${repo.path}`)
    .join("\n");

  return trim([
    "FIAD canonical context:",
    `Task prefix: ${policy?.taskPrefix || "FIAD"}`,
    "Entry points:",
    "- harness/control/ecosystem/overview.md",
    "- harness/control/ecosystem/integrations.md",
    "- harness/control/ecosystem/local-dotnet-service-playbook.md",
    "- harness/control/ecosystem/credential-map.md",
    "- harness/control/projects/<Project>/profile.md",
    "",
    "Workspace map:",
    profileRefs,
    "",
    "Overview excerpt:",
    overview,
    "",
    "Integrations excerpt:",
    integrations,
    "",
    "Sensitive file rule: do not open or write real .env, SQL dumps, XLSX, PDFs, service account JSON, secret files, passwords, tokens, hashes, or connection strings unless explicitly authorized.",
  ].join("\n"));
}

async function IsyteOpsPlugin(input = {}) {
  const rootDir = input.directory || process.cwd();
  const stateFile = path.join(rootDir, SESSION_STATE);
  let stateQueue = Promise.resolve();

  async function readSessionState() {
    const state = await readJson(stateFile);
    if (!state || typeof state !== "object" || typeof state.sessions !== "object") {
      return { version: 1, sessions: {} };
    }
    return { version: 1, sessions: state.sessions };
  }

  async function writeSessionState(state) {
    await fs.mkdir(path.dirname(stateFile), { recursive: true });
    const entries = Object.entries(state.sessions)
      .sort((left, right) => String(right[1]?.updatedAt || "").localeCompare(String(left[1]?.updatedAt || "")))
      .slice(0, MAX_SESSION_MARKERS);
    const next = { version: 1, sessions: Object.fromEntries(entries) };
    const temporary = `${stateFile}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`);
    await fs.rename(temporary, stateFile);
  }

  async function setSessionMode(sessionID, mode) {
    if (!sessionID) return;
    stateQueue = stateQueue.catch(() => {}).then(async () => {
      const state = await readSessionState();
      if (mode === "fiad") {
        state.sessions[sessionID] = {
          mode,
          updatedAt: new Date().toISOString(),
        };
      } else {
        delete state.sessions[sessionID];
      }
      await writeSessionState(state);
    });
    await stateQueue;
  }

  async function isFiadSession(sessionID) {
    if (!sessionID) return false;
    const state = await readSessionState();
    return state.sessions[sessionID]?.mode === "fiad";
  }

  async function inject(output, sessionID) {
    if (!(await isFiadSession(sessionID))) return false;
    output.context = output.context || [];
    output.context.push(await buildContext(rootDir));
    return true;
  }

  return {
    async "experimental.session.compacting"(hookInput, output) {
      await inject(output, hookInput.sessionID);
    },
    async "experimental.chat.system.transform"(hookInput, output) {
      if (!(await isFiadSession(hookInput.sessionID))) return;
      output.system = output.system || [];
      output.system.push(await buildContext(rootDir));
    },
    async "command.execute.before"(commandInput, output) {
      const command = commandInput.command || "";
      if (command.startsWith("nexo:")) {
        await setSessionMode(commandInput.sessionID, "nexo");
        return;
      }
      if (!command.startsWith("fiad:") && !command.startsWith("isyte:")) return;
      await setSessionMode(commandInput.sessionID, "fiad");
      output.parts = output.parts || [];
      output.parts.push({
        type: "text",
        text: await buildContext(rootDir),
        synthetic: true,
      });
    },
  };
}

IsyteOpsPlugin.id = "isyte-ops";
IsyteOpsPlugin.server = IsyteOpsPlugin;
IsyteOpsPlugin._private = {
  buildContext,
  SESSION_STATE,
};

module.exports = IsyteOpsPlugin;
module.exports.default = IsyteOpsPlugin;
module.exports.server = IsyteOpsPlugin;
module.exports._private = IsyteOpsPlugin._private;
