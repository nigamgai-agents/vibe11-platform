---
description: Vibe11 playbook — record what this session learned into the runbook
---

Run the Vibe11 reflect playbook.

Arguments: $ARGUMENTS (optional free-text note from the human about what
happened or what to remember — treat it as primary source material).

Use the vibe11-reflect agent to update `docs/runbook.md` per its process:
incident log, known quirks, decisions, system map — merge over append,
absolute dates, escalate recurring root causes.

If a fix branch is currently checked out, put the runbook edits on it;
otherwise use a `vibe11/reflect-<date>` branch and open a small PR.
