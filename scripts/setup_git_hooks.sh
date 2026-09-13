#!/usr/bin/env bash
# Wire repo git hooks (no global git config). Re-run after fresh clone.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS="$ROOT/.githooks"
GIT_HOOKS="$ROOT/.git/hooks"
mkdir -p "$GIT_HOOKS"
for hook in prepare-commit-msg; do
  install -m 755 "$HOOKS/$hook" "$GIT_HOOKS/$hook"
done
echo "Installed: $GIT_HOOKS/$hook"
