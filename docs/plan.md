# Vibe11 Product Plan

_Last updated: 2026-07-05_

## Thesis

The founder's manual workflow — Claude Code sessions with MCPs wired to the full
toolchain, CLAUDE.md accumulating project knowledge, post-fix reflection updating
agents and memory — is the validated product. Vibe11 packages that loop so it runs
without a human in the chair.

Reference point: Spotify's Honk. The agent was the easy part; the product was the
dispatch system — triggers, review gates, Slack as the interface, and merge-rate
as the north-star metric.

## Sequencing

| Phase | Shape | Delivers |
|-------|-------|----------|
| **v0** | `vibe11` CLI + maintenance kit, runs locally on the user's own Claude Code | Trust wedge; validates demand; pre-structures repos for hosted product |
| **v0.5** | GitHub App + hosted sandboxed runners on cron | Nightly debt scan → morning PRs + Slack summary ("the marketing terminal, made real") |
| **v1** | Trigger layer (Datadog/Jira webhooks), reflection loop, app.vibe11.ai dashboard | Alert → root cause → fix PR → closed ticket → updated runbook, end to end |

Working assumption: the v0 CLI is a **free trust-builder** feeding the paid hosted
product (classic open-wedge motion; matches "no credit card, just agents").
Revisit before launch if needed.

## Architecture decisions (settled)

1. **Runtime**: local CLI is onboarding, not the product. The product is always-on
   hosted runners (or a self-hosted runner container in the customer's non-prod
   VPC for the security-sensitive). Every run in an isolated microVM-class sandbox
   — running customer tests is arbitrary code execution.
2. **Agent harness**: Claude Agent SDK. We do not build our own loop. Our
   engineering is the layer the SDK deliberately doesn't do: triggers, queue,
   per-tenant credential vault, budget caps per run.
3. **Memory**: repo-specific knowledge lives *in the customer's repo* as versioned
   markdown (CLAUDE.md, runbooks, decision logs) — auditable, portable, and it IS
   the "second brain" credibility story. Hosted layer adds the cross-tool index
   and anonymized cross-customer playbooks (the compounding moat).
4. **Trust boundaries (v1 non-negotiables)**: PR-only, never direct push, no
   auto-merge; write-narrow tokens per integration; per-run budget ceilings;
   earn autonomy later with merge-rate data.
5. **Integrations for the loop**: GitHub, Slack, Datadog, Jira. The other twelve
   on the marketing site wait until someone pays for them.
6. **Memory visibility is a first-class surface** (founder pain point: no view
   into what Claude sessions learn). Because memory is versioned markdown in
   the repo, the "admin interface" is a reader over git — commit history IS
   the learning feed, edits are commits (governance + audit trail for free).
   v0: `vibe11 memory` CLI (show / log / diff). v1: app.vibe11.ai is the
   hosted rendering of the same data via the GitHub API — memory browser,
   learning feed with per-entry provenance (which PR/session taught it),
   agent activity, merge rate, and **memory health** (stale-entry detection,
   near-duplicate merging). Editable memory: correcting the brain is a commit.

## Repo structure (target)

```
vibe11-platform/
  marketing/            # vibe11.ai site (live)
  packages/
    kit/                # THE maintenance kit: prebuilt agents, skills, hooks,
                        #   CLAUDE.md templates, .mcp.json templates
                        #   (distilled from the founder's working sessions)
    cli/                # npm `vibe11`: init (installs kit), doctor, run
    core/               # (later) playbook schema, shared telemetry
  apps/
    orchestrator/       # (v0.5) hosted runner service
    web/                # (v1) app.vibe11.ai
  docs/
    plan.md             # this file
```

## Enterprise expansion — memory as the control plane

The workstation pain ("what is it learning?") generalizes up a ladder:

1. **Dev + repo** (v0): `vibe11 memory` CLI. Built.
2. **Team** (v1): app.vibe11.ai — cross-repo memory browser, learning feed,
   merge rate, memory health.
3. **Enterprise**: a governance control plane for agentic engineering
   knowledge. Requirements:
   - **Hierarchical memory**: org conventions → team → repo runbook, with
     inheritance/overrides (mirrors CLAUDE.md hierarchy). An "org brain" repo
     holds promoted knowledge: the same lesson learned in N repos becomes an
     org convention.
   - **Governance via existing git controls** (no new infra to certify):
     CODEOWNERS on memory files = human review of what agents learn; branch
     protection = approval workflow; signed commits = provenance.
   - **Memory is an attack surface**: a PR that edits the runbook is a prompt
     injection future agents will obey. Review gates + per-entry provenance
     are security controls, not conveniences.
   - **Secrets/PII hygiene**: agents must never write credentials, tokens, or
     customer data into memory files (kit rule from day one, not an
     enterprise add-on).
   - **RBAC, audit export, retention** for the hosted surface (SOC 2 / AI-act
     style documentation of automated actions).
   - **Vendor-neutral system of record**: memory is markdown + git, so Vibe11
     can govern what ANY vendor's agent learns — the literal "System of
     Action" position. Enterprise may buy visibility/governance before
     autonomous fixes; startups buy fixes first. Same surface, two wedges.

## Milestone 1 — "kit extracted, runs on one repo" (~2 weeks)

Goal: `npx vibe11 init` on a real vibe-coded repo, then `vibe11 run deps`
produces a mergeable PR, and the reflection step updates the repo's runbook.

1. **Extract the kit** from the founder's existing working projects — the actual
   CLAUDE.md conventions, subagent definitions, memory/reflection patterns that
   already work. This is the seed IP; everything else is plumbing.
2. **Three playbooks**, no more:
   - `deps` — dependency audit + safe upgrade PR
   - `debt` — scoped refactor of one flagged hotspot
   - `reflect` — post-fix: update runbook/CLAUDE.md with what was learned
3. **CLI** (TypeScript, npm): `init` (detect stack, install kit, write .mcp.json
   templates), `doctor` (verify MCP creds), `run <playbook>` (headless Claude
   Agent SDK session with guardrails: PR-only, `--budget` cap, `--dry-run`).
4. **Distribution**: npm package + Claude Code plugin form (`/plugin install`),
   same kit content in both wrappers.
5. **Memory visibility**: `vibe11 memory show [section]` (rendered runbook),
   `vibe11 memory log` (learning feed from git history of memory files),
   `vibe11 memory diff --since 7d` (what the system learned this week).

**Done when**: run against one real external repo (not the founder's), agent
opens a PR a maintainer actually merges, runbook diff shows learning.

## Milestone 2 preview (v0.5, not yet planned in detail)

GitHub App, sandboxed hosted runs, nightly cron, Slack summary. Planned after
M1 ships and the kit has survived contact with real repos.

## Open items

- [ ] Founder to export current working setup (CLAUDE.md files, agent defs,
      memory conventions from the projects where the loop works) → seed corpus
      for `packages/kit`
- [ ] License / pricing posture for the CLI before public release
- [ ] Name the playbook format (skills? playbooks? runbooks?) — bikeshed later
