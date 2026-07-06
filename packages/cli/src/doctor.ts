import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function check(label: string, ok: boolean, hint?: string): boolean {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${!ok && hint ? `\n      → ${hint}` : ""}`);
  return ok;
}

function has(cmd: string): boolean {
  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function doctor(): void {
  const cwd = process.cwd();
  console.log("\nvibe11 doctor\n");

  let ok = true;
  ok = check("git repository", has("git rev-parse --git-dir"), "run `git init`") && ok;
  ok = check(
    "claude CLI installed",
    has("claude --version"),
    "install Claude Code: https://claude.com/claude-code"
  ) && ok;
  ok = check(
    "gh CLI authenticated (needed to open PRs)",
    has("gh auth status"),
    "install GitHub CLI and run `gh auth login`"
  ) && ok;
  ok = check(
    "kit installed (.claude/agents/vibe11-deps.md)",
    fs.existsSync(path.join(cwd, ".claude", "agents", "vibe11-deps.md")),
    "run `vibe11 init`"
  ) && ok;
  ok = check(
    "runbook present (docs/runbook.md)",
    fs.existsSync(path.join(cwd, "docs", "runbook.md")),
    "run `vibe11 init`"
  ) && ok;

  const hookPath = path.join(cwd, ".claude", "hooks", "vibe11-guard-push.sh");
  const hookOk =
    fs.existsSync(hookPath) && (fs.statSync(hookPath).mode & 0o111) !== 0;
  ok = check("push guardrail hook executable", hookOk, "run `vibe11 init`") && ok;

  // MCP env vars: find ${VAR} placeholders in .mcp.json and check the environment
  const mcpPath = path.join(cwd, ".mcp.json");
  if (fs.existsSync(mcpPath)) {
    const raw = fs.readFileSync(mcpPath, "utf8");
    const vars = [...new Set([...raw.matchAll(/\$\{(\w+)\}/g)].map((m) => m[1]))];
    for (const v of vars) {
      // env vars are optional per-integration; report without failing doctor
      check(`env ${v}`, Boolean(process.env[v]), `export ${v}=... (or remove that server from .mcp.json)`);
    }
  } else {
    check(".mcp.json present", false, "run `vibe11 init` (optional if you configure MCP globally)");
  }

  console.log(ok ? "\nAll required checks passed.\n" : "\nSome required checks failed — see hints above.\n");
  if (!ok) process.exitCode = 1;
}
