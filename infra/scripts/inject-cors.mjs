#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const INFRA_ENV = resolve(ROOT, "infra", ".env");

const CORS_DOMAINS = [
  "http://localhost:5173",
  "https://nexo-app-git-main-nexoensshop.vercel.app",
  "https://nexo-1tmh1wc25-nexoensshop.vercel.app",
  "https://nexo-app-blond.vercel.app",
].join(",");

const text = readFileSync(INFRA_ENV, "utf8");

// Replace existing CORS_ORIGIN or inject after NGROK_AUTHTOKEN
let updated;
if (text.includes("CORS_ORIGIN=")) {
  updated = text.replace(/^CORS_ORIGIN=.*$/m, `CORS_ORIGIN=${CORS_DOMAINS}`);
} else {
  // Inject after NGROK_AUTHTOKEN line
  updated = text.replace(
    /^(NGROK_AUTHTOKEN=.*)$/m,
    `$1\nCORS_ORIGIN=${CORS_DOMAINS}`
  );
}

writeFileSync(INFRA_ENV, updated, "utf8");
process.exit(0);
