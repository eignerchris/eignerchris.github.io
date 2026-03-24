#!/usr/bin/env bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: ./new-post.sh \"My Blog Post Title\""
  exit 1
fi

TITLE="$1"
DATE=$(date +%Y-%m-%d)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
FILENAME="_posts/${DATE}-${SLUG}.md"

if [ -f "$FILENAME" ]; then
  echo "Error: $FILENAME already exists."
  exit 1
fi

cat > "$FILENAME" <<EOF
---
title: "${TITLE}"
layout: post
background: "/assets/images/hero.jpg"
---

EOF

echo "Created $FILENAME"
