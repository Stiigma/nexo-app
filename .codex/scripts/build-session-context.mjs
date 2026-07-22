#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import * as compiler from "../../harness/control/scripts/build-session-context.mjs";

export const DEFAULT_MAX_CHARS = compiler.DEFAULT_MAX_CHARS;
export const DEFAULT_FOCUS_PATH = compiler.DEFAULT_FOCUS_PATH;
export const DEFAULT_OUTPUT_PATH = ".codex/state/session-context.json";
export const sha256 = compiler.sha256;
export const parseTaskRows = compiler.parseTaskRows;
export const compileSessionContext = compiler.compileSessionContext;
export const parseCliArguments = compiler.parseCliArguments;

export function buildSessionContext(options = {}) {
  return compiler.buildSessionContext({
    outputPath: DEFAULT_OUTPUT_PATH,
    ...options,
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await compiler.runSessionContextCli(process.argv.slice(2), {
    outputPath: DEFAULT_OUTPUT_PATH,
  });
}
