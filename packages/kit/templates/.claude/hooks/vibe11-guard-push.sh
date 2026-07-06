#!/bin/bash
# Vibe11 guardrail: block direct pushes to the default branch.
# Installed as a PreToolUse hook on Bash by vibe11 init.
# Reads the tool input JSON on stdin; exits 2 to block with a message.

input=$(cat)
cmd=$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')

case "$cmd" in
  *"git push"*)
    default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@.*/@@')
    default_branch=${default_branch:-main}
    if printf '%s' "$cmd" | grep -qE "(origin[[:space:]]+)?(${default_branch}|master)([[:space:]]|:|$)" \
       || printf '%s' "$cmd" | grep -q -- "--force"; then
      echo "vibe11 guardrail: direct/force push to the default branch is blocked. Push a vibe11/* branch and open a PR." >&2
      exit 2
    fi
    ;;
esac
exit 0
