#!/bin/bash

echo "Games WITHOUT navigation:"
echo "========================="
for file in client/src/components/*Game.tsx; do
  if ! grep -q "useLocation" "$file" 2>/dev/null || ! grep -q "ChevronLeft" "$file" 2>/dev/null; then
    # Exclude Game.tsx itself
    if [ "$(basename "$file")" != "Game.tsx" ]; then
      basename "$file"
    fi
  fi
done | sort
