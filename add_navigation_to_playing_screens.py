#!/usr/bin/env python3
"""
Add back button to playing screens (second return statement) in games.
"""
import re
import os

GAMES_TO_FIX = [
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

BACK_BUTTON = '''      <button
        onClick={() => setLocation("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>

'''

def add_nav_to_playing_screen(game_name):
    """Add back button to the second (playing) return statement."""
    filepath = f"client/src/components/{game_name}.tsx"

    if not os.path.exists(filepath):
        print(f"❌ {filepath} not found")
        return False

    with open(filepath, 'r') as f:
        lines = f.readlines()

    # Find all lines with "return (" that are full statements (not inside other code)
    return_indices = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == "return (" or stripped.startswith("return ("):
            # Check if this is a component return (not a callback return)
            # Look back to see if it's at function level
            indent = len(line) - len(line.lstrip())
            if indent <= 2:  # Top level return
                return_indices.append(i)

    if len(return_indices) < 2:
        print(f"⏭️  {game_name} - Only {len(return_indices)} return statement(s) found")
        return False

    # We want to add the back button to the second return statement
    second_return_line = return_indices[1]

    # Look for the opening div after the return
    # Usually it's the next line or the line after
    insert_line = None
    for i in range(second_return_line, min(second_return_line + 10, len(lines))):
        if '<div' in lines[i] and ('className=' in lines[i] or 'className={' in lines[i]):
            # Found the opening div, insert after it
            insert_line = i + 1
            break

    if insert_line is None:
        print(f"⏭️  {game_name} - Could not find insertion point")
        return False

    # Check if back button already exists in this section
    check_section = ''.join(lines[second_return_line:min(second_return_line + 20, len(lines))])
    if 'Main Menu' in check_section and 'ChevronLeft' in check_section:
        print(f"⏭️  {game_name} - Back button already exists in playing screen")
        return False

    # Insert the back button
    lines.insert(insert_line, BACK_BUTTON)

    # Write back
    with open(filepath, 'w') as f:
        f.writelines(lines)

    print(f"✅ {game_name} - Added back button to playing screen")
    return True

def main():
    print("Adding back buttons to playing screens...")
    print("=" * 60)

    success_count = 0
    for game in GAMES_TO_FIX:
        if add_nav_to_playing_screen(game):
            success_count += 1

    print("=" * 60)
    print(f"✅ Successfully updated {success_count} games")
    print(f"⏭️  Skipped {len(GAMES_TO_FIX) - success_count} games")

if __name__ == "__main__":
    main()
