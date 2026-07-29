# Nexo Agent Behavior Evaluations

These scenarios provide deterministic contract smoke checks for planner,
builder, and QA responses. They are provider-neutral and do not call a model.
Regex matching proves only that required decision vocabulary is present; human
review remains responsible for correctness and judgment.

Periodically compare outcomes that matter:

- QA rework per completed task;
- missed acceptance criteria;
- escaped defects;
- successful cross-chat resumes;
- token and artifact volume per completed task.

Do not collect prompt, tool, source-code, secret, or user-content telemetry for
these metrics. Prefer aggregate counts from existing task evidence.

