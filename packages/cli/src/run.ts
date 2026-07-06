import { spawn } from "node:child_process";

const PLAYBOOKS = ["deps", "debt", "reflect"] as const;
type Playbook = (typeof PLAYBOOKS)[number];

interface RunOptions {
  dryRun?: boolean;
  budget?: string;
  args?: string;
}

export function run(playbook: string, opts: RunOptions): void {
  if (!PLAYBOOKS.includes(playbook as Playbook)) {
    console.error(`vibe11: unknown playbook "${playbook}". Available: ${PLAYBOOKS.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const parts = [`/vibe11:${playbook}`];
  if (opts.args) parts.push(opts.args);
  if (opts.dryRun) parts.push("--dry-run");
  const prompt = parts.join(" ");

  const budget = opts.budget ?? "50";
  // v0: default text output (quiet until done). TODO: parse stream-json for a live activity feed.
  const claudeArgs = [
    "-p",
    prompt,
    "--permission-mode",
    "acceptEdits",
    "--max-turns",
    budget,
  ];

  console.log(`vibe11 run ${playbook}${opts.dryRun ? " (dry-run)" : ""} — budget ${budget} turns`);
  console.log(`> claude ${claudeArgs.map((a) => (a.includes(" ") ? JSON.stringify(a) : a)).join(" ")}\n`);

  const child = spawn("claude", claudeArgs, { stdio: "inherit" });
  child.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "ENOENT") {
      console.error(
        "vibe11: `claude` not found on PATH. Install Claude Code: https://claude.com/claude-code"
      );
    } else {
      console.error(`vibe11: failed to launch claude: ${err.message}`);
    }
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 0;
  });
}
