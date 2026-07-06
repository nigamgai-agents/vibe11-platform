#!/usr/bin/env node
import { Command } from "commander";
import { init } from "./init.js";
import { doctor } from "./doctor.js";
import { run } from "./run.js";
import { memoryShow, memoryLog, memoryDiff } from "./memory.js";

const program = new Command();

program
  .name("vibe11")
  .description("Vibe11 — autonomous maintenance agents for AI-built products")
  .version("0.0.1");

program
  .command("init")
  .description("Install the Vibe11 maintenance kit into this repository")
  .option("-f, --force", "overwrite kit files that already exist")
  .action((opts) => init(opts));

program
  .command("doctor")
  .description("Verify the Vibe11 setup: kit files, CLIs, credentials")
  .action(() => doctor());

program
  .command("run <playbook>")
  .description("Run a maintenance playbook (deps | debt | reflect) via Claude Code")
  .option("--dry-run", "audit and plan only — no edits, no PR")
  .option("--budget <turns>", "max agent turns for this run", "50")
  .option("--args <text>", "extra instructions passed to the playbook")
  .action((playbook, opts) => run(playbook, opts));

const memory = program
  .command("memory")
  .description("Inspect what the system has learned (the repo's second brain)");

memory
  .command("show [section]")
  .description("Render the runbook, or one section of it (e.g. `memory show quirks`)")
  .action((section) => memoryShow(section));

memory
  .command("log")
  .description("Learning feed: commits that touched memory files")
  .option("-n, --limit <count>", "number of entries", "20")
  .action((opts) => memoryLog(opts));

memory
  .command("diff")
  .description("What changed in memory since a time window or ref")
  .option("--since <window>", "7d, 2w, 3m, or a git ref", "7d")
  .action((opts) => memoryDiff(opts));

program.parse();
