// Server-side entry for the nexo-status project plugin.
//
// The user-visible behavior lives in the CLI plugin (./tui). This entry keeps
// the package layout valid and lets OpenCode discover the directory for both
// roles without loading terminal-only APIs in the service process.
export default {
  id: "nexo-status-server",
  setup() {},
};
