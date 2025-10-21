#!/usr/bin/env python3
"""
Add back button navigation to ALL screens/return statements in game components.
Specifically handles games with multiple return statements (setup + playing states).
"""
import re
import os

GAMES_TO_FIX = [
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

BACK_BUTTON_HTML = '''<button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
'''

def add_back_button_to_all_returns(game_name):
    """Add back button to all return statements that render full screens."""
    filepath = f"client/src/components/{game_name}.tsx"

    if not os.path.exists(filepath):
        print(f"❌ {filepath} not found")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Pattern to find return statements with div containers (likely full-page renders)
    # We'll look for: return ( <div ... className="...min-h-screen...">

    # Find all return statements
    return_pattern = r'(return\s*\(\s*<div[^>]*className="[^"]*min-h-screen[^"]*"[^>]*>)'

    matches = list(re.finditer(return_pattern, content))

    if not matches:
        print(f"⏭️  {game_name} - no full-screen return statements found")
        return False

    # Process matches in reverse order to preserve positions
    modifications_made = 0
    for match in reversed(matches):
        # Check if this return already has a back button nearby
        start_pos = match.start()
        check_range = content[start_pos:start_pos + 500]

        if 'Main Menu' in check_range and 'ChevronLeft' in check_range:
            continue  # Already has back button

        # Insert back button right after the opening div
        insert_pos = match.end()
        content = content[:insert_pos] + '\n        ' + BACK_BUTTON_HTML + content[insert_pos:]
        modifications_made += 1

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ {game_name} - Added back buttons to {modifications_made} screen(s)")
        return True
    else:
        print(f"⏭️  {game_name} - Already has all back buttons")
        return False

def main():
    print("Adding back buttons to ALL game screens...")
    print("=" * 60)

    success_count = 0
    for game in GAMES_TO_FIX:
        if add_back_button_to_all_returns(game):
            success_count += 1

    print("=" * 60)
    print(f"✅ Successfully updated {success_count} games")
    print(f"⏭️  Skipped {len(GAMES_TO_FIX) - success_count} games (already had back buttons)")

if __name__ == "__main__":
    main()
