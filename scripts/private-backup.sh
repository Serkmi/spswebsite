#!/usr/bin/env bash
#
# Back up the private companion files to github.com/Serkmi/spswebsite-private.
#
# These files are gitignored in the public repo (it is public; they quote
# private notes), so the public repo's history cannot recover them. Revs 1 and
# 2 of the design system were lost exactly that way. This is their only backup.
#
#   ./scripts/private-backup.sh                 # commit + push, timestamped
#   ./scripts/private-backup.sh "message"       # commit + push, your message
#   ./scripts/private-backup.sh --status        # what would be backed up
#
# Mechanism: a second git repo sharing this work tree, with its own git dir at
# .private.git (ignored by the public repo). Adds are explicit and forced,
# because the shared .gitignore hides these paths by design.

set -euo pipefail

cd "$(dirname "$0")/.."
GIT_DIR_PRIVATE=".private.git"

if [ ! -d "$GIT_DIR_PRIVATE" ]; then
  echo "error: $GIT_DIR_PRIVATE not found — private backup repo is not set up." >&2
  exit 1
fi

pgit() { git --git-dir="$GIT_DIR_PRIVATE" --work-tree=. "$@"; }

# Everything private worth keeping. Regenerable material (content/_inbox) and
# editor lock files are deliberately absent.
PATHS=(
  DESIGN.md
  VOICE.md
  design
  design-preview.html
)
# Working notes and design reference images, if present.
while IFS= read -r -d '' f; do PATHS+=("$f"); done < <(
  find . -maxdepth 1 \( -name '*.odt' -o -name '*.png' -o -name '*.jpg' \) \
    -not -name '.~lock.*' -printf '%P\0' 2>/dev/null
)

# -f is required: the shared .gitignore hides these paths from both repos.
for p in "${PATHS[@]}"; do
  [ -e "$p" ] && pgit add -f -- "$p"
done

if [ "${1:-}" = "--status" ]; then
  echo "Tracked files in the private backup:"
  pgit ls-files | sed 's/^/  /'
  echo
  echo "Staged but not yet committed:"
  pgit diff --cached --stat | sed 's/^/  /' || true
  exit 0
fi

if pgit diff --cached --quiet && pgit rev-parse HEAD >/dev/null 2>&1; then
  echo "No changes to back up. Everything is already pushed."
  exit 0
fi

MSG="${1:-Backup $(date '+%Y-%m-%d %H:%M')}"
pgit commit -q -m "$MSG"
pgit push -q -u origin main
echo "Backed up to github.com/Serkmi/spswebsite-private"
pgit log --oneline -1 | sed 's/^/  /'
