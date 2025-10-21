import { Link } from "wouter";
import { games } from "@/config/games";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, Lock, ArrowRight } from "lucide-react";

/**
 * Variation 1: Classic Grid Layout
 * 
 * Design Philosophy:
 * - App store inspired card-based grid
 * - Large, prominent game cards with clear visual hierarchy
 * - Status badges to distinguish available vs coming soon games
 * - Professional yet playful aesthetic
 * - Emphasis on imagery and clear CTAs
 */
export default function LandingVariation1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Hero Section */}
      <header className="py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-16 h-16 text-primary" />
            <h1 className="font-fredoka font-bold text-6xl md:text-7xl text-primary">
              Music Games
            </h1>
          </div>
          <p className="font-nunito text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Learn music through play! Choose a game below to start your musical journey.
          </p>
        </div>
      </header>

      {/* Games Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            const isAvailable = game.status === "available";
            const isLocked = game.status === "locked";
            
            return (
              <div
                key={game.id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header with Icon */}
                <div className={`${game.color} p-8 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  <Icon className="w-20 h-20 text-white relative z-10 mx-auto" />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="mb-3">
                    {isAvailable && (
                      <Badge className="bg-green-500 text-white hover:bg-green-600">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Play Now
                      </Badge>
                    )}
                    {game.status === "coming-soon" && (
                      <Badge variant="secondary">
                        Coming Soon
                      </Badge>
                    )}
                    {isLocked && (
                      <Badge variant="outline" className="border-gray-400">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  {/* Game Title */}
                  <h2 className="font-fredoka font-bold text-2xl text-foreground mb-2">
                    {game.title}
                  </h2>

                  {/* Game Description */}
                  <p className="font-nunito text-muted-foreground mb-4 min-h-[4rem]">
                    {game.description}
                  </p>

                  {/* Game Meta Info */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {game.difficulty && (
                      <Badge variant="outline" className="font-nunito text-xs">
                        {game.difficulty}
                      </Badge>
                    )}
                    {game.ageRange && (
                      <Badge variant="outline" className="font-nunito text-xs">
                        {game.ageRange}
                      </Badge>
                    )}
                  </div>

                  {/* CTA Button */}
                  {isAvailable ? (
                    <Link href={game.route}>
                      <Button 
                        className="w-full font-fredoka text-lg group-hover:scale-105 transition-transform"
                        size="lg"
                      >
                        Play Game
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full font-fredoka text-lg"
                      size="lg"
                      disabled
                      variant="outline"
                    >
                      {isLocked ? "Unlock Soon" : "Coming Soon"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <p className="font-nunito text-muted-foreground">
          More games coming soon! Check back often for new musical adventures.
        </p>
      </footer>
    </div>
  );
}

