#!/usr/bin/env python3
"""
Create complete 500-game database from GAME_IDEAS.md
"""

import json
import re

# Parse GAME_IDEAS.md to extract all 500 games
def parse_game_ideas():
    """Extract all games from GAME_IDEAS.md"""
    
    games = []
    
    # Read the file
    with open("openspec/changes/add-500-music-games-batch-1/GAME_IDEAS.md", "r") as f:
        content = f.read()
    
    # Extract games using regex
    # Pattern: **game-XXX: Title** - Description
    pattern = r'\*\*(\w+-\d{3}): ([^*]+)\*\* - ([^\n]+)'
    
    matches = re.findall(pattern, content)
    
    for game_id, title, description in matches:
        # Determine category from ID
        prefix = game_id.split('-')[0]
        category_map = {
            'pitch': 'Pitch & Melody',
            'rhythm': 'Rhythm & Timing',
            'harmony': 'Harmony & Intervals',
            'timbre': 'Timbre & Instruments',
            'dynamics': 'Dynamics & Expression',
            'tempo': 'Tempo & Meter',
            'theory': 'Music Theory',
            'compose': 'Composition & Creation',
            'listen': 'Listening & Analysis',
            'cross': 'Cross-Curricular',
            'advanced': 'Advanced Concepts',
            'challenge': 'Gamified Challenges'
        }
        
        category = category_map.get(prefix, 'Other')
        
        # Determine difficulty from description
        if any(word in description.lower() for word in ['hard', 'advanced', 'complex', 'difficult']):
            difficulty = 'hard'
        elif any(word in description.lower() for word in ['medium', 'moderate', 'intermediate']):
            difficulty = 'medium'
        else:
            difficulty = 'easy'
        
        # Determine age range
        if prefix in ['pitch', 'rhythm', 'dynamics', 'tempo']:
            age = '5-8'
        elif prefix in ['harmony', 'timbre', 'theory', 'compose', 'listen']:
            age = '7-10'
        elif prefix in ['advanced', 'challenge']:
            age = '9-12'
        else:
            age = '6-10'
        
        # Determine mechanic
        mechanic_map = {
            'detector': 'Detection',
            'matcher': 'Matching',
            'identifier': 'Identification',
            'analyzer': 'Analysis',
            'reader': 'Reading',
            'creator': 'Creation',
            'builder': 'Building',
            'tracker': 'Tracking',
            'explorer': 'Exploration',
            'challenge': 'Challenge'
        }
        
        mechanic = 'Interaction'
        for key, value in mechanic_map.items():
            if key in description.lower():
                mechanic = value
                break
        
        games.append({
            "id": game_id,
            "title": title.strip(),
            "desc": description.strip(),
            "difficulty": difficulty,
            "age": age,
            "mechanic": mechanic,
            "category": category
        })
    
    return games

def main():
    """Generate full database"""
    
    print("Parsing GAME_IDEAS.md...")
    games = parse_game_ideas()
    
    print(f"Found {len(games)} games")
    
    # Save to JSON
    data = {"games": games}
    
    with open("games_database_full.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Saved {len(games)} games to games_database_full.json")
    
    # Print summary
    categories = {}
    for game in games:
        cat = game['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\nCategory breakdown:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")

if __name__ == "__main__":
    main()

