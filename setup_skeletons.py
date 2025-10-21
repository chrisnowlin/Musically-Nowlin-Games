#!/usr/bin/env python3
"""
Setup skeleton implementations for all unimplemented games
"""

import json
import os

# List of implemented games
IMPLEMENTED_GAMES = {
    "animal-orchestra-conductor", "beat-keeper-challenge", "compose-your-song",
    "echo-location-challenge", "fast-or-slow-race", "finish-the-tune",
    "happy-or-sad-melodies", "harmony-helper", "how-many-notes",
    "instrument-detective", "long-or-short-notes", "loud-or-quiet-safari",
    "melody-memory-match", "musical-freeze-dance", "musical-math",
    "musical-opposites", "musical-pattern-detective", "musical-simon-says",
    "musical-story-time", "name-that-animal-tune", "pitch-ladder-jump",
    "pitch-match", "pitch-perfect-path", "rest-finder",
    "rhythm-echo-challenge", "rhythm-puzzle-builder", "same-or-different",
    "scale-climber", "staff-wars", "steady-or-bouncy-beat",
    "tone-color-match", "world-music-explorer",
}

def to_component_name(game_id):
    """Convert game ID to component name"""
    return "".join(word.capitalize() for word in game_id.split("-"))

def load_games():
    """Load refined games"""
    with open("games_refined_cohesive.json", "r") as f:
        return json.load(f)["games"]

def create_component(game):
    """Create React component"""
    name = to_component_name(game["id"])
    title = game["title"]
    modes = game.get("modes", [])
    modes_list = ", ".join(f'"{m}"' for m in modes)
    default_mode = modes[0] if modes else "default"

    component = 'import React, { useState } from "react";\n'
    component += 'import { ChevronLeft } from "lucide-react";\n'
    component += 'import { useNavigate } from "react-router-dom";\n\n'
    component += 'interface GameState {\n'
    component += '  currentMode: string;\n'
    component += '  score: number;\n'
    component += '  round: number;\n'
    component += '}\n\n'
    component += f'export const {name}Game: React.FC = () => {{\n'
    component += '  const navigate = useNavigate();\n'
    component += '  const [gameState, setGameState] = useState<GameState>({\n'
    component += f'    currentMode: "{default_mode}",\n'
    component += '    score: 0,\n'
    component += '    round: 1,\n'
    component += '  });\n\n'
    component += f'  const modes = [{modes_list}];\n\n'
    component += '  const handleModeChange = (mode: string) => {\n'
    component += '    setGameState(prev => ({ ...prev, currentMode: mode, score: 0, round: 1 }));\n'
    component += '  };\n\n'
    component += '  const handleAnswer = (correct: boolean) => {\n'
    component += '    setGameState(prev => ({\n'
    component += '      ...prev,\n'
    component += '      score: correct ? prev.score + 1 : prev.score,\n'
    component += '      round: prev.round + 1,\n'
    component += '    }));\n'
    component += '  };\n\n'
    component += '  return (\n'
    component += '    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4">\n'
    component += '      <div className="flex items-center justify-between mb-6">\n'
    component += '        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold">\n'
    component += '          <ChevronLeft size={24} />\n'
    component += '          Back\n'
    component += '        </button>\n'
    component += f'        <h1 className="text-3xl font-bold text-purple-900">{title}</h1>\n'
    component += '        <div className="text-xl font-bold text-purple-700">Score: {gameState.score}</div>\n'
    component += '      </div>\n\n'
    component += '      {modes.length > 1 && (\n'
    component += '        <div className="mb-6 flex flex-wrap gap-2 justify-center">\n'
    component += '          {modes.map(mode => (\n'
    component += '            <button\n'
    component += '              key={mode}\n'
    component += '              onClick={() => handleModeChange(mode)}\n'
    component += '              className={gameState.currentMode === mode ? "px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white shadow-lg" : "px-4 py-2 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"}\n'
    component += '            >\n'
    component += '              {mode.replace(/-/g, " ").toUpperCase()}\n'
    component += '            </button>\n'
    component += '          ))}\n'
    component += '        </div>\n'
    component += '      )}\n\n'
    component += '      <div className="max-w-2xl mx-auto">\n'
    component += '        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">\n'
    component += '          <div className="text-center mb-6">\n'
    component += '            <p className="text-gray-600 mb-2">Round {gameState.round}</p>\n'
    component += '            <p className="text-lg font-semibold text-purple-700">Mode: {gameState.currentMode.replace(/-/g, " ").toUpperCase()}</p>\n'
    component += '          </div>\n'
    component += '          <div className="bg-purple-50 rounded-lg p-8 text-center mb-6">\n'
    component += '            <p className="text-gray-500 mb-4">Game content for {gameState.currentMode} mode</p>\n'
    component += '            <p className="text-sm text-gray-400">Skeleton implementation - add game logic here</p>\n'
    component += '          </div>\n'
    component += '          <div className="flex gap-4 justify-center">\n'
    component += '            <button onClick={() => handleAnswer(true)} className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Correct</button>\n'
    component += '            <button onClick={() => handleAnswer(false)} className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Incorrect</button>\n'
    component += '          </div>\n'
    component += '        </div>\n'
    component += '        <div className="bg-white rounded-lg shadow-lg p-6">\n'
    component += '          <h3 className="font-bold text-lg mb-4">Stats</h3>\n'
    component += '          <div className="grid grid-cols-2 gap-4">\n'
    component += '            <div><p className="text-gray-600">Round</p><p className="text-2xl font-bold text-purple-600">{gameState.round}</p></div>\n'
    component += '            <div><p className="text-gray-600">Score</p><p className="text-2xl font-bold text-purple-600">{gameState.score}</p></div>\n'
    component += '          </div>\n'
    component += '        </div>\n'
    component += '      </div>\n'
    component += '    </div>\n'
    component += '  );\n'
    component += '};\n'
    return component

def create_page(game):
    """Create page component"""
    name = to_component_name(game["id"])
    page = 'import React from "react";\n'
    page += f'import {{ {name}Game }} from "@/components/{name}Game";\n\n'
    page += f'export const {name}Page: React.FC = () => {{\n'
    page += f'  return <{name}Game />;\n'
    page += '};\n'
    return page

def create_logic(game):
    """Create game logic"""
    game_id = game["id"]
    modes = game.get("modes", [])
    modes_list = ", ".join(f'"{m}"' for m in modes)
    title = game["title"]
    unified_skill = game.get("unified_skill", "N/A")

    logic = '/**\n'
    logic += f' * Game Logic for {title}\n'
    logic += f' * ID: {game_id}\n'
    logic += f' * Unified Skill: {unified_skill}\n'
    logic += ' */\n\n'
    logic += 'export interface GameRound {\n'
    logic += '  id: string;\n'
    logic += '  mode: string;\n'
    logic += '  question: string;\n'
    logic += '  answer: string;\n'
    logic += '  difficulty: number;\n'
    logic += '}\n\n'
    logic += f'const MODES = [{modes_list}];\n\n'
    logic += 'export function generateRound(mode: string, difficulty: number): GameRound {\n'
    logic += '  return {\n'
    logic += '    id: `round-${Date.now()}`,\n'
    logic += '    mode,\n'
    logic += '    question: "TODO: Generate question",\n'
    logic += '    answer: "TODO: Generate answer",\n'
    logic += '    difficulty,\n'
    logic += '  };\n'
    logic += '}\n\n'
    logic += 'export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {\n'
    logic += '  return userAnswer === correctAnswer;\n'
    logic += '}\n\n'
    logic += 'export function calculateScore(correct: boolean, timeSpent: number, difficulty: number): number {\n'
    logic += '  if (!correct) return 0;\n'
    logic += '  const baseScore = 100 * difficulty;\n'
    logic += '  const timeBonus = Math.max(0, 50 - timeSpent / 100);\n'
    logic += '  return Math.round(baseScore + timeBonus);\n'
    logic += '}\n'
    return logic

def main():
    """Setup skeletons"""
    print("\n" + "=" * 70)
    print("SETTING UP SKELETON IMPLEMENTATIONS")
    print("=" * 70 + "\n")
    
    games = load_games()
    unimplemented = [g for g in games if g["id"] not in IMPLEMENTED_GAMES]
    
    print(f"Total games: {len(games)}")
    print(f"Implemented: {len(IMPLEMENTED_GAMES)}")
    print(f"Unimplemented: {len(unimplemented)}\n")
    
    os.makedirs("client/src/components", exist_ok=True)
    os.makedirs("client/src/pages/games", exist_ok=True)
    os.makedirs("client/src/lib/gameLogic", exist_ok=True)
    
    created = 0
    for game in unimplemented:
        try:
            game_id = game["id"]
            name = to_component_name(game_id)
            
            with open(f"client/src/components/{name}Game.tsx", "w") as f:
                f.write(create_component(game))
            
            with open(f"client/src/pages/games/{name}Page.tsx", "w") as f:
                f.write(create_page(game))
            
            with open(f"client/src/lib/gameLogic/{game_id}Logic.ts", "w") as f:
                f.write(create_logic(game))
            
            created += 1
            print(f"✅ {game['title']} ({game_id})")
        except Exception as e:
            print(f"❌ {game_id}: {e}")
    
    print("\n" + "=" * 70)
    print(f"✅ CREATED {created} SKELETON IMPLEMENTATIONS")
    print("=" * 70)
    print(f"\nNext steps:")
    print(f"  1. Add routes to client/src/App.tsx")
    print(f"  2. Add games to client/src/config/games.ts")
    print(f"  3. Implement game logic in each file")

if __name__ == "__main__":
    main()

