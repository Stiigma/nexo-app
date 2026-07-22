#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const INFRA_ENV = resolve(ROOT, "infra", ".env");

const text = readFileSync(INFRA_ENV, "utf8");
const updated = text.replace(
  /^NGROK_AUTHTOKEN=.*$/m,
  "NGROK_AUTHTOKEN=33dD1rhAiaR5NKELsThmJMKGTwU_63BnfJutvRzDKsvtVvEY9"
);
writeFileSync(INFRA_ENV, updated, "utf8");
process.exit(0);
