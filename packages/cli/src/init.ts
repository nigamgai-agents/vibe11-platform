import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { kitTemplatesDir } from "./kit.js";

interface InitOptions {
  force?: boolean;
}

const VIBE11_BEGIN = "<!-- vibe11:begin";
const VIBE11_END = "<!-- vibe11:end -->";

function detectStack(cwd: string): string[] {
  const stacks: Array<[string, string]> = [
    ["package.json", "node"],
    ["pyproject.toml", "python"],
    ["requirements.txt", "python"],
    ["go.mod", "go"],
    ["Cargo.toml", "rust"],
    ["Gemfile", "ruby"],
    ["pom.xml", "java"],
    ["composer.json", "php"],
  ];
  const found = new Set<string>();
  for (const [file, stack] of stacks) {
    if (fs.existsSync(path.join(cwd, file))) found.add(stack);
  }
  return [...found];
}

function isGitRepo(cwd: string): boolean {
  try {
    execSync("git rev-parse --git-dir", { cwd, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** Recursively copy template files, skipping ones that already exist (unless force). */
function copyTree(
  srcDir: string,
  destDir: string,
  force: boolean,
  created: string[],
  skipped: string[],
  destRoot: string
): void {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyTree(src, dest, force, created, skipped, destRoot);
    } else {
      const rel = path.relative(destRoot, dest);
      if (fs.existsSync(dest) && !force) {
        skipped.push(rel);
      } else {
        fs.copyFileSync(src, dest);
        created.push(rel);
      }
    }
  }
}

/** Strip "comment" keys from the MCP template before writing a real .mcp.json. */
function stripComments(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripComments);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "comment") continue;
      out[k] = stripComments(v);
    }
    return out;
  }
  return value;
}

export function init(opts: InitOptions): void {
  const cwd = process.cwd();
  const templates = kitTemplatesDir();
  const force = Boolean(opts.force);

  if (!isGitRepo(cwd)) {
    console.error("vibe11: this is not a git repository. Run `git init` first — Vibe11 works PR-first.");
    process.exitCode = 1;
    return;
  }

  const created: string[] = [];
  const skipped: string[] = [];

  // 1. .claude/ tree (agents, commands, hooks, settings)
  copyTree(
    path.join(templates, ".claude"),
    path.join(cwd, ".claude"),
    force,
    created,
    skipped,
    cwd
  );

  // Hook must be executable
  const hookPath = path.join(cwd, ".claude", "hooks", "vibe11-guard-push.sh");
  if (fs.existsSync(hookPath)) fs.chmodSync(hookPath, 0o755);

  // 2. docs/runbook.md
  const runbookDest = path.join(cwd, "docs", "runbook.md");
  if (fs.existsSync(runbookDest) && !force) {
    skipped.push("docs/runbook.md");
  } else {
    fs.mkdirSync(path.dirname(runbookDest), { recursive: true });
    fs.copyFileSync(path.join(templates, "docs", "runbook.md"), runbookDest);
    created.push("docs/runbook.md");
  }

  // 3. CLAUDE.md — append the vibe11 section, preserving an existing one
  const claudeMdPath = path.join(cwd, "CLAUDE.md");
  const section = fs.readFileSync(path.join(templates, "CLAUDE.vibe11.md"), "utf8");
  if (!fs.existsSync(claudeMdPath)) {
    fs.writeFileSync(claudeMdPath, section);
    created.push("CLAUDE.md");
  } else {
    const existing = fs.readFileSync(claudeMdPath, "utf8");
    if (existing.includes(VIBE11_BEGIN)) {
      if (force) {
        const start = existing.indexOf(VIBE11_BEGIN);
        const end = existing.indexOf(VIBE11_END);
        if (end !== -1) {
          const updated =
            existing.slice(0, start) + section.trimEnd() + existing.slice(end + VIBE11_END.length);
          fs.writeFileSync(claudeMdPath, updated);
          created.push("CLAUDE.md (vibe11 section replaced)");
        } else {
          skipped.push("CLAUDE.md (begin marker without end marker — fix manually)");
        }
      } else {
        skipped.push("CLAUDE.md (vibe11 section already present)");
      }
    } else {
      fs.writeFileSync(claudeMdPath, existing.trimEnd() + "\n\n" + section);
      created.push("CLAUDE.md (vibe11 section appended)");
    }
  }

  // 4. .mcp.json — only if absent; never overwrite live MCP config
  const mcpPath = path.join(cwd, ".mcp.json");
  if (fs.existsSync(mcpPath)) {
    skipped.push(".mcp.json (exists — merge servers from the kit template manually if wanted)");
  } else {
    const template = JSON.parse(
      fs.readFileSync(path.join(templates, "mcp.template.json"), "utf8")
    );
    fs.writeFileSync(mcpPath, JSON.stringify(stripComments(template), null, 2) + "\n");
    created.push(".mcp.json");
  }

  // Report
  const stacks = detectStack(cwd);
  console.log(`\nvibe11 init — ${path.basename(cwd)}${stacks.length ? ` (${stacks.join(", ")})` : ""}\n`);
  for (const f of created) console.log(`  + ${f}`);
  for (const f of skipped) console.log(`  = ${f} (kept existing)`);
  console.log(`
Next steps:
  1. Set credentials for the MCP servers you use (see .mcp.json):
     GITHUB_TOKEN, SLACK_BOT_TOKEN, SLACK_TEAM_ID, DATADOG_API_KEY, DATADOG_APP_KEY
     (remove servers you don't need)
  2. vibe11 doctor           # verify the setup
  3. vibe11 run deps --dry-run   # first audit, no changes
`);
}
