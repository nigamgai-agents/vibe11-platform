# vibe11-platform

Vibe11 — autonomous engineering agents for AI-built products. **https://vibe11.ai**

## Layout

- [`marketing/`](marketing/) — the marketing site (static HTML/CSS/JS, deployed on Vercel). See its README for deploy instructions.
- [`packages/kit/`](packages/kit/) — the Vibe11 maintenance kit: prebuilt agents, playbooks, guardrail hooks, and memory conventions that `vibe11 init` installs into a repo.
- [`packages/cli/`](packages/cli/) — the `vibe11` CLI (`init` / `doctor` / `run <playbook>`), built on Claude Code.
- [`docs/plan.md`](docs/plan.md) — product plan: architecture decisions, v0 → v1 sequencing, milestones.

## Quickstart (v0, local)

```sh
npm install && npm run build
cd /path/to/your/repo
node <this-repo>/packages/cli/dist/index.js init
vibe11 doctor
vibe11 run deps --dry-run
```
