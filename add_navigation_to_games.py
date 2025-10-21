#!/usr/bin/env python3
import re
import os

GAMES_WITHOUT_NAV = [
    "AnimalOrchestraConductorGame",
    "BeatKeeperChallengeGame",
    "ComposeYourSongGame",
    "EchoLocationChallengeGame",
    "FastOrSlowRaceGame",
    "FinishTheTuneGame",
    "HappyOrSadMelodiesGame",
    "HarmonyHelperGame",
    "HowManyNotesGame",
    "InstrumentDetectiveGame",
    "LongOrShortNotesGame",
    "LoudOrQuietSafariGame",
    "MelodyMemoryMatchGame",
    "MusicalFreezeDanceGame",
    "MusicalMathGame",
    "MusicalOppositesGame",
    "MusicalPatternDetectiveGame",
    "MusicalSimonSaysGame",
    "MusicalStoryTimeGame",
    "NameThatAnimalTuneGame",
    "PitchLadderJumpGame",
    "PitchPerfectPathGame",
    "RestFinderGame",
    "RhythmEchoChallengeGame",
    "RhythmPuzzleBuilderGame",
    "SameOrDifferentGame",
    "ScaleClimberGame",
    "StaffWarsGame",
    "SteadyOrBouncyBeatGame",
    "ToneColorMatchGame",
    "WorldMusicExplorerGame",
]

def add_navigation(game_name):
    """Add navigation to a single game component."""
    filepath = f"client/src/components/{game_name}.tsx"

    if not os.path.exists(filepath):
        print(f"❌ {filepath} not found")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Step 1: Add imports if not present
    has_chevron = "ChevronLeft" in content
    has_wouter = "useLocation" in content and "wouter" in content

    if not has_chevron or not has_wouter:
        # Find the import section (usually at the top)
        import_pattern = r'(import .+ from ["\']lucide-react["\'];?)'
        lucide_import_match = re.search(import_pattern, content)

        if lucide_import_match and not has_chevron:
            # Add ChevronLeft to existing lucide-react import
            existing_import = lucide_import_match.group(1)
            if "ChevronLeft" not in existing_import:
                # Extract the imported items
                import_match = re.search(r'import \{([^}]+)\}', existing_import)
                if import_match:
                    imports = import_match.group(1)
                    new_imports = imports.strip() + ", ChevronLeft"
                    new_import_line = existing_import.replace(imports, new_imports)
                    content = content.replace(existing_import, new_import_line)
        elif not has_chevron:
            # Add new lucide-react import
            first_import = re.search(r'^import .+$', content, re.MULTILINE)
            if first_import:
                insert_pos = first_import.end()
                content = content[:insert_pos] + '\nimport { ChevronLeft } from "lucide-react";' + content[insert_pos:]

        if not has_wouter:
            # Add wouter import
            first_import = re.search(r'^import .+$', content, re.MULTILINE)
            if first_import:
                insert_pos = first_import.end()
                content = content[:insert_pos] + '\nimport { useLocation } from "wouter";' + content[insert_pos:]

    # Step 2: Add useLocation hook
    if "const [, setLocation] = useLocation();" not in content:
        # Find the component function definition
        func_pattern = r'(export default function \w+\([^)]*\) \{)'
        func_match = re.search(func_pattern, content)

        if func_match:
            insert_pos = func_match.end()
            content = content[:insert_pos] + '\n  const [, setLocation] = useLocation();' + content[insert_pos:]

    # Step 3: Add back button to the UI
    # This is trickier as each game might have different structure
    # Look for common patterns like the title or header
    # We'll add a simple back button at the top of the return statement

    # Find the first div in the return statement
    return_pattern = r'(return \(\s*<div[^>]*>)'
    return_match = re.search(return_pattern, content)

    if return_match and '<ChevronLeft' not in content:
        # Find where to insert the back button
        # Look for the opening div after return
        div_content_start = return_match.end()

        # Add back button
        back_button = '''
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold mb-4"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
'''
        content = content[:div_content_start] + back_button + content[div_content_start:]

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Added navigation to {game_name}")
        return True
    else:
        print(f"⏭️  {game_name} already has navigation or couldn't be modified")
        return False

def main():
    print("Adding navigation to games without it...")
    print("=" * 50)

    success_count = 0
    for game in GAMES_WITHOUT_NAV:
        if add_navigation(game):
            success_count += 1

    print("=" * 50)
    print(f"✅ Successfully added navigation to {success_count} games")
    print(f"⏭️  Skipped {len(GAMES_WITHOUT_NAV) - success_count} games")

if __name__ == "__main__":
    main()
