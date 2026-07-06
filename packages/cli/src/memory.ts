import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/** Files that constitute the repo's memory. */
const MEMORY_PATHS = ["docs/runbook.md", "CLAUDE.md", ".claude"];

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function git(args: string): string {
  return execSync(`git ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function existingMemoryPaths(cwd: string): string[] {
  return MEMORY_PATHS.filter((p) => fs.existsSync(path.join(cwd, p)));
}

/** `vibe11 memory show [section]` — render the runbook, optionally one section. */
export function memoryShow(section?: string): void {
  const runbookPath = path.join(process.cwd(), "docs", "runbook.md");
  if (!fs.existsSync(runbookPath)) {
    console.error("vibe11: no docs/runbook.md here. Run `vibe11 init` first.");
    process.exitCode = 1;
    return;
  }
  const content = fs.readFileSync(runbookPath, "utf8");

  let body = content;
  if (section) {
    const lines = content.split("\n");
    const needle = section.toLowerCase();
    const out: string[] = [];
    let capturing = false;
    for (const line of lines) {
      const heading = /^#{1,3}\s+(.*)$/.exec(line);
      if (heading) {
        capturing = heading[1].toLowerCase().includes(needle);
      }
      if (capturing) out.push(line);
    }
    if (out.length === 0) {
      console.error(`vibe11: no runbook section matching "${section}".`);
      process.exitCode = 1;
      return;
    }
    body = out.join("\n");
  }

  // minimal terminal rendering: bold headings, dim italics-only lines
  for (const line of body.split("\n")) {
    if (/^#{1,3}\s/.test(line)) {
      console.log(`${BOLD}${line.replace(/^#+\s*/, "")}${RESET}`);
    } else if (/^_\(.*\)_$/.test(line.trim())) {
      console.log(`${DIM}${line.trim().slice(1, -1)}${RESET}`);
    } else {
      console.log(line);
    }
  }
}

/** `vibe11 memory log` — the learning feed: commits that touched memory files. */
export function memoryLog(opts: { limit?: string }): void {
  const paths = existingMemoryPaths(process.cwd());
  if (paths.length === 0) {
    console.error("vibe11: no memory files here. Run `vibe11 init` first.");
    process.exitCode = 1;
    return;
  }
  const n = opts.limit ?? "20";
  let out: string;
  try {
    out = git(
      `log -n ${n} --date=short --pretty=format:"%h  %ad  %s" -- ${paths.map((p) => `"${p}"`).join(" ")}`
    );
  } catch (e) {
    console.error(`vibe11: git log failed: ${(e as Error).message}`);
    process.exitCode = 1;
    return;
  }
  if (!out) {
    console.log("No memory commits yet — the learning feed starts after the first reflect run.");
    return;
  }
  console.log(`${BOLD}learning feed${RESET} ${DIM}(commits touching memory files, newest first)${RESET}\n`);
  console.log(out);
}

/** Convert shorthand like 7d / 2w / 3m / 1y into a git-approxidate string. */
function sinceToApproxidate(since: string): string | null {
  const m = /^(\d+)([dwmy])$/.exec(since);
  if (!m) return null;
  const units: Record<string, string> = { d: "days", w: "weeks", m: "months", y: "years" };
  return `${m[1]} ${units[m[2]]} ago`;
}

/** `vibe11 memory diff --since 7d|<ref>` — what the system learned since then. */
export function memoryDiff(opts: { since?: string }): void {
  const cwd = process.cwd();
  const paths = existingMemoryPaths(cwd);
  if (paths.length === 0) {
    console.error("vibe11: no memory files here. Run `vibe11 init` first.");
    process.exitCode = 1;
    return;
  }
  const since = opts.since ?? "7d";
  const approx = sinceToApproxidate(since);

  let base: string;
  try {
    if (approx) {
      base = git(`rev-list -1 --until="${approx}" HEAD`);
      if (!base) {
        // repo younger than the window — diff from its first commit
        base = git("rev-list --max-parents=0 HEAD").split("\n")[0];
        console.log(`${DIM}repo is younger than ${since}; diffing from the first commit${RESET}\n`);
      }
    } else {
      base = git(`rev-parse --verify "${since}"`); // treat as a ref
    }
  } catch {
    console.error(`vibe11: could not resolve "${since}" as a time window (7d, 2w, 3m) or git ref.`);
    process.exitCode = 1;
    return;
  }

  let out: string;
  try {
    out = execSync(
      `git diff ${base} -- ${paths.map((p) => `"${p}"`).join(" ")}`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();
  } catch (e) {
    console.error(`vibe11: git diff failed: ${(e as Error).message}`);
    process.exitCode = 1;
    return;
  }

  if (!out) {
    console.log(`No memory changes since ${approx ?? since}.`);
    return;
  }
  console.log(`${BOLD}memory diff${RESET} ${DIM}(since ${approx ?? since}, includes uncommitted changes)${RESET}\n`);
  console.log(out);
}
