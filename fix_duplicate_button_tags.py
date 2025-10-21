#!/usr/bin/env python3
"""Fix duplicate closing button tags in consolidated game files."""

import re
from pathlib import Path

# List of files with the issue at line 43
files_at_line_43 = [
    "Pitch001Game.tsx",
    "Pitch002Game.tsx",
    "Pitch003Game.tsx",
    "Pitch004Game.tsx",
    "Pitch005Game.tsx",
    "Pitch006Game.tsx",
    "Rhythm001Game.tsx",
    "Rhythm003Game.tsx",
    "Rhythm004Game.tsx",
    "Rhythm005Game.tsx",
    "Harmony001Game.tsx",
    "Harmony002Game.tsx",
    "Harmony003Game.tsx",
    "Harmony004Game.tsx",
    "Timbre001Game.tsx",
    "Timbre002Game.tsx",
    "Timbre003Game.tsx",
    "Theory001Game.tsx",
    "Theory002Game.tsx",
    "Theory003Game.tsx",
    "Theory004Game.tsx",
    "Compose002Game.tsx",
    "Listen001Game.tsx",
    "Listen002Game.tsx",
    "Listen003Game.tsx",
    "Listen004Game.tsx",
    "Cross001Game.tsx",
]

# Files at different line numbers (we'll handle these separately)
special_files = {
    "Rhythm002Game.tsx": 94,
    "Rhythm006Game.tsx": 146,
    "Rhythm007Game.tsx": 85,
}

components_dir = Path("client/src/components")
fixed_count = 0

# Fix files at line 43
for filename in files_at_line_43:
    filepath = components_dir / filename
    if not filepath.exists():
        print(f"Skipping {filename} - file not found")
        continue

    content = filepath.read_text()
    lines = content.split('\n')

    # Check if line 42 (0-indexed) has the duplicate
    if len(lines) > 42 and lines[42].strip() == "</button>":
        # Remove the duplicate closing tag
        lines.pop(42)

        # Write back
        filepath.write_text('\n'.join(lines))
        print(f"✓ Fixed {filename}")
        fixed_count += 1
    else:
        print(f"✗ Pattern not found in {filename} at line 43")

# Fix special files
for filename, line_num in special_files.items():
    filepath = components_dir / filename
    if not filepath.exists():
        print(f"Skipping {filename} - file not found")
        continue

    content = filepath.read_text()
    lines = content.split('\n')

    # Check if the specified line (0-indexed) has the duplicate
    idx = line_num - 1
    if len(lines) > idx and lines[idx].strip() == "</button>":
        # Remove the duplicate closing tag
        lines.pop(idx)

        # Write back
        filepath.write_text('\n'.join(lines))
        print(f"✓ Fixed {filename} at line {line_num}")
        fixed_count += 1
    else:
        print(f"✗ Pattern not found in {filename} at line {line_num}")

print(f"\nFixed {fixed_count} files total")
