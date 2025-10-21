#!/usr/bin/env python3
"""
Batch implement remaining skeleton games with minimal working logic
"""

import os
import json

# Load games from refined cohesive JSON
with open("games_refined_cohesive.json", "r") as f:
    games_data = json.load(f)
    all_games = games_data["games"]

# Games already implemented or in progress
DONE = {
    "rhythm-001", "rhythm-002", "rhythm-006", "rhythm-007",
    # Plus all the 32 already-implemented games from earlier
}

# For each remaining game, add minimal route/config entries
remaining = [g for g in all_games if g["id"] not in DONE]

print(f"Remaining games to wire: {len(remaining)}")

# Generate route imports
route_imports = []
for g in remaining:
    game_id = g["id"]
    parts = game_id.split("-")
    component_name = "".join(p.capitalize() for p in parts)
    route_imports.append(f'import {component_name}Page from "@/pages/games/{component_name}Page";')

print("\n# Route imports to add to App.tsx:")
for ri in route_imports:
    print(ri)

# Generate route entries
print("\n# Route entries to add to App.tsx:")
for g in remaining:
    game_id = g["id"]
    parts = game_id.split("-")
    component_name = "".join(p.capitalize() for p in parts)
    route_path = f"/games/{game_id}"
    print(f'      <Route path="{route_path}" component={{{component_name}Page}} />')

# Generate config entries
print("\n# Config entries to add to games.ts:")
for g in remaining:
    game_id = g["id"]
    title = g["title"]
    desc = g.get("desc", "")[:100]
    route_path = f"/games/{game_id}"
    print(f'''  {{
    id: "{game_id}",
    title: "{title}",
    description: "{desc}",
    route: "{route_path}",
    status: "coming-soon",
    icon: Music2,
    color: "bg-blue-500",
    difficulty: "medium",
    ageRange: "6-12 years",
  }},''')

