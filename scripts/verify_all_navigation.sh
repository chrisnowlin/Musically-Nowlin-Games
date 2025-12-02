#!/bin/bash
echo "Checking all game pages for actual components used..."
echo "="*70

missing_nav=()

for page in client/src/pages/games/*Page.tsx; do
  # Extract the component name from the import
  component=$(grep "^import.*from.*@/components" "$page" | sed 's/.*from ".*\/\(.*\)".*/\1/' | head -1)
  
  if [ -n "$component" ]; then
    comp_file="client/src/components/${component}.tsx"
    if [ -f "$comp_file" ]; then
      # Check if component has navigation
      if ! grep -q "Main Menu" "$comp_file" 2>/dev/null; then
        game_name=$(basename "$page" | sed 's/Page\.tsx$//')
        echo "❌ MISSING: $game_name uses $component"
        missing_nav+=("$component")
      fi
    fi
  fi
done

echo ""
echo "="*70
if [ ${#missing_nav[@]} -eq 0 ]; then
  echo "✅ All components have navigation!"
else
  echo "Found ${#missing_nav[@]} components without navigation:"
  printf '%s\n' "${missing_nav[@]}" | sort -u
fi
