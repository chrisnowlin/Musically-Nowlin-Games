#!/usr/bin/env python3
"""
Update navigation buttons in consolidated games to use consistent styling and "Main Menu" text.
"""
import re
import os

GAMES_TO_UPDATE = [
    "Advanced001Game",
    "Challenge001Game",
    "Compose001Game",
    "Compose002Game",
    "Cross001Game",
    "Cross002Game",
    "Cross003Game",
    "Dynamics001Game",
    "Dynamics002Game",
    "Dynamics003Game",
    "Harmony001Game",
    "Harmony002Game",
    "Harmony003Game",
    "Harmony004Game",
    "Listen001Game",
    "Listen002Game",
    "Listen003Game",
    "Listen004Game",
    "Pitch001Game",
    "Pitch002Game",
    "Pitch003Game",
    "Pitch004Game",
    "Pitch005Game",
    "Pitch006Game",
    "Rhythm001Game",
    "Rhythm002Game",
    "Rhythm003Game",
    "Rhythm004Game",
    "Rhythm005Game",
    "Rhythm006Game",
    "Rhythm007Game",
    "Theory001Game",
    "Theory002Game",
    "Theory003Game",
    "Theory004Game",
    "Timbre001Game",
    "Timbre002Game",
    "Timbre003Game",
]

# Pattern to find the old back button
OLD_BUTTON_PATTERN = r'<button\s+onClick=\{\(\) => setLocation\("/"\)\}\s+className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold">\s*<ChevronLeft size=\{24\} />\s*Back\s*</button>'

# New button with absolute positioning and "Main Menu" text
NEW_BUTTON = '''<button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>'''

def update_game_navigation(game_name):
    """Update navigation button in a consolidated game."""
    filepath = f"client/src/components/{game_name}.tsx"

    if not os.path.exists(filepath):
        print(f"❌ {filepath} not found")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    # Check if the old pattern exists
    if 'Back\n        </button>' not in content and 'Back</button>' not in content:
        print(f"⏭️  {game_name} - Back button pattern not found")
        return False

    # Replace the old button - need to handle multiline
    # Find the button pattern more flexibly
    lines = content.split('\n')
    new_lines = []
    i = 0
    found = False

    while i < len(lines):
        line = lines[i]

        # Look for the start of the back button
        if 'onClick={() => setLocation("/")}' in line and 'className="flex items-center gap-2' in line:
            # This is likely our back button - check next lines
            if i + 2 < len(lines):
                next_line1 = lines[i + 1].strip()
                next_line2 = lines[i + 2].strip()

                if '<ChevronLeft' in next_line1 and 'Back' in next_line2:
                    # Found it! Replace these 3 lines with new button
                    # Add proper indentation based on original line
                    indent = len(line) - len(line.lstrip())
                    indented_button = '\n'.join([(' ' * (indent - 8) if idx > 0 else ' ' * indent) + btn_line
                                                 for idx, btn_line in enumerate(NEW_BUTTON.split('\n'))])
                    new_lines.append(indented_button)
                    i += 3  # Skip the next 2 lines
                    found = True
                    continue

        # Also check for single-line pattern
        if '<button onClick={() => setLocation("/")} className="flex items-center gap-2' in line:
            # Check if it's a back button on single or few lines
            combined = line
            j = i + 1
            while j < min(i + 5, len(lines)) and '</button>' not in combined:
                combined += ' ' + lines[j].strip()
                j += 1

            if 'Back</button>' in combined or 'Back\n' in combined:
                # Single/multi-line back button found
                indent = len(line) - len(line.lstrip())
                indented_button = '\n'.join([(' ' * (indent - 8) if idx > 0 else ' ' * indent) + btn_line
                                             for idx, btn_line in enumerate(NEW_BUTTON.split('\n'))])
                new_lines.append(indented_button)
                # Skip lines until we find </button>
                while i < len(lines) and '</button>' not in lines[i]:
                    i += 1
                i += 1  # Skip the </button> line
                found = True
                continue

        new_lines.append(line)
        i += 1

    if not found:
        print(f"⏭️  {game_name} - Could not locate back button to replace")
        return False

    # Also need to add 'relative' to parent div if not present
    # The parent is usually something like: <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4">
    new_content = '\n'.join(new_lines)

    # Find the main container div and add 'relative' if needed
    if 'min-h-screen' in new_content and 'relative' not in new_content:
        # Add 'relative' to the main container
        new_content = re.sub(
            r'(<div className="min-h-screen [^"]+)"',
            r'\1 relative"',
            new_content
        )

    with open(filepath, 'w') as f:
        f.write(new_content)

    print(f"✅ {game_name} - Updated back button to Main Menu with absolute positioning")
    return True

def main():
    print("Updating consolidated games navigation...")
    print("=" * 70)

    success_count = 0
    for game in GAMES_TO_UPDATE:
        if update_game_navigation(game):
            success_count += 1

    print("=" * 70)
    print(f"✅ Successfully updated {success_count} games")
    print(f"⏭️  Skipped {len(GAMES_TO_UPDATE) - success_count} games")

if __name__ == "__main__":
    main()
