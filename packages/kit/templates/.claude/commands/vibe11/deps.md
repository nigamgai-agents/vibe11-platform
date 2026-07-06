---
description: Vibe11 playbook — audit dependencies and open a safe-upgrade PR
---

Run the Vibe11 dependency playbook on this repository.

Arguments: $ARGUMENTS (supports `--dry-run`: produce the full audit and the
plan, but make no edits and open no PR — print what WOULD be done instead).

Steps:
1. Read `docs/runbook.md` and the Vibe11 conventions in CLAUDE.md.
2. Use the vibe11-deps agent to perform the audit and (unless --dry-run) the
   safe upgrades, tests, and PR.
3. After the PR is open, use the vibe11-reflect agent to record anything
   learned (new quirks, deferred majors) in the runbook on the same branch.

Respect all Vibe11 guardrails: PR-only, one concern per PR, tests green.
