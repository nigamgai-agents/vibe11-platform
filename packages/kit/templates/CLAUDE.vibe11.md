<!-- vibe11:begin (managed by vibe11 — edit between markers and `vibe11 init` will preserve your changes) -->
# Vibe11 Maintenance Conventions

This repository is maintained with Vibe11 agents. These rules apply to every
maintenance session, human- or agent-driven.

## Guardrails (non-negotiable)

- Every change lands as a pull request from a `vibe11/<playbook>-<short-slug>` branch.
  Never commit to the default branch directly. Never force-push.
- One concern per PR. Minimal, reviewable diffs — no drive-by refactors, no
  reformatting of untouched code.
- Never touch without explicit human instruction: secrets, `.env*`, CI/CD
  pipeline definitions, infrastructure state, billing/payment code, database
  migrations that drop or rewrite data.
- If the repo has tests, they must pass locally before a PR is opened. If the
  area you changed has no test, add one smoke test covering your change.
- If you are uncertain whether a change is safe, stop and write the question
  into the PR description instead of guessing.

## Memory

- Project knowledge lives in `docs/runbook.md`. **Read it before starting any
  maintenance task** — it records this repo's quirks, past incidents, and
  decisions that are not derivable from the code.
- After every completed fix, run the reflect playbook (`/vibe11:reflect`):
  record what broke, the root cause, the fix, and a prevention note.
- Update existing runbook entries rather than appending near-duplicates. The
  runbook is a living document, not a log file.

## Style

- This is maintenance, not a rewrite. Match the existing code style, naming,
  and idioms of each file you touch — even where you'd personally choose
  differently.
- PR descriptions are written for the repo owner, not for another agent:
  plain English, what/why/risk, and how to verify.
<!-- vibe11:end -->
