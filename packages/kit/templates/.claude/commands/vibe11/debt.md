---
description: Vibe11 playbook — fix ONE scoped technical-debt hotspot as a reviewable PR
---

Run the Vibe11 debt playbook on this repository.

Arguments: $ARGUMENTS (supports `--dry-run`: scan and rank hotspots, print the
plan for the top one, but change nothing. Also supports a focus hint, e.g.
`/vibe11:debt src/api` to scope the scan).

Steps:
1. Read `docs/runbook.md` (especially Decisions and prior leftover-hotspot
   lists) and the Vibe11 conventions in CLAUDE.md.
2. Use the vibe11-debt agent to pick and fix exactly one hotspot (unless
   --dry-run), with tests pinning preserved behavior.
3. After the PR is open, use the vibe11-reflect agent to update the runbook's
   hotspot list and any decisions made, on the same branch.

Respect all Vibe11 guardrails: PR-only, ~300 changed-line budget,
behavior-preserving only.
