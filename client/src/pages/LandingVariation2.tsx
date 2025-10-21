import { Link } from "wouter";
import { games } from "@/config/games";
import { Button } from "@/components/ui/button";
import { Music, Star, Sparkles, Lock, Play } from "lucide-react";
import { useState } from "react";

/**
 * Variation 2: Playful Dashboard
 * 
 * Design Philosophy:
 * - Fun, whimsical, child-friendly interface
 * - Interactive hover effects and animations
 * - Bright colors and playful typography
 * - Character-driven design with mascot elements
 * - Emphasis on joy and discovery
 */
export default function LandingVariation2() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-pulse delay-75" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-300/30 rounded-full blur-xl animate-pulse delay-150" />
      
      {/* Hero Section with Mascot */}
      <header className="py-8 px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Animated Stars */}
          <div className="flex justify-center gap-4 mb-4">
            <Star className="w-8 h-8 text-yellow-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <Star className="w-10 h-10 text-pink-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <Star className="w-8 h-8 text-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          
          <h1 className="font-fredoka font-bold text-6xl md:text-8xl mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Let's Play Music!
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Music className="w-12 h-12 text-purple-600 animate-pulse" />
            <p className="font-fredoka text-2xl md:text-3xl text-purple-800 dark:text-purple-200">
              Pick Your Adventure
            </p>
            <Music className="w-12 h-12 text-pink-600 animate-pulse" />
          </div>
          
          <p className="font-nunito text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            🎵 Tap on any game to start learning! 🎵
          </p>
        </div>
      </header>

      {/* Games Dashboard */}
      <main className="max-w-6xl mx-auto px-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {games
            .slice()
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((game, index) => {
            const Icon = game.icon;
            const isAvailable = game.status === "available";
            const isLocked = game.status === "locked";
            const isHovered = hoveredGame === game.id;
            
            return (
              <div
                key={game.id}
                className="relative"
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Floating Card */}
                <div
                  className={`
                    bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl 
                    transition-all duration-300 overflow-hidden border-4
                    ${isAvailable ? "border-green-400 hover:border-green-500" : "border-gray-300"}
                    ${isHovered && isAvailable ? "scale-105 -rotate-1" : ""}
                    ${!isAvailable ? "opacity-75" : ""}
                  `}
                >
                  {/* Sparkle Effect for Available Games */}
                  {isAvailable && isHovered && (
                    <div className="absolute top-2 right-2 z-20">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                  )}

                  {/* Icon Circle */}
                  <div className="relative pt-8 pb-4">
                    <div
                      className={`
                        w-24 h-24 mx-auto rounded-full flex items-center justify-center
                        ${game.color} shadow-lg
                        ${isHovered && isAvailable ? "animate-bounce" : ""}
                      `}
                    >
                      {isLocked ? (
                        <Lock className="w-12 h-12 text-white" />
                      ) : (
                        <Icon className="w-12 h-12 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-6 text-center">
                    {/* Title */}
                    <h2 className="font-fredoka font-bold text-2xl md:text-3xl text-foreground mb-2">
                      {game.title}
                    </h2>

                    {/* Age Badge */}
                    {game.ageRange && (
                      <div className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-nunito text-sm font-semibold mb-3">
                        Ages {game.ageRange}
                      </div>
                    )}

                    {/* Description */}
                    <p className="font-nunito text-muted-foreground mb-4 min-h-[4.5rem] text-sm md:text-base">
                      {game.description}
                    </p>

                    {/* Status Indicator */}
                    {isAvailable ? (
                      <Link href={game.route}>
                        <Button
                          className="w-full font-fredoka text-xl py-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                          size="lg"
                        >
                          <Play className="w-6 h-6 mr-2" />
                          Let's Play!
                        </Button>
                      </Link>
                    ) : isLocked ? (
                      <div className="w-full py-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-fredoka text-xl flex items-center justify-center gap-2">
                        <Lock className="w-5 h-5" />
                        Coming Later
                      </div>
                    ) : (
                      <div className="w-full py-6 rounded-full bg-gradient-to-r from-orange-200 to-yellow-200 dark:from-orange-900 dark:to-yellow-900 text-orange-800 dark:text-orange-200 font-fredoka text-xl flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Coming Soon!
                      </div>
                    )}
                  </div>
                </div>

                {/* Difficulty Stars */}
                {game.difficulty && (
                  <div className="flex justify-center gap-1 mt-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          (game.difficulty === "easy" && i === 0) ||
                          (game.difficulty === "medium" && i <= 1) ||
                          (game.difficulty === "hard" && i <= 2)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Fun Footer */}
      <footer className="py-8 px-4 text-center relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl max-w-2xl mx-auto py-6 px-8 shadow-lg border-4 border-purple-300">
          <p className="font-fredoka text-xl text-purple-800 dark:text-purple-200 mb-2">
            🌟 New games every month! 🌟
          </p>
          <p className="font-nunito text-muted-foreground">
            Keep practicing and become a music superstar!
          </p>
        </div>
      </footer>
    </div>
  );
}

