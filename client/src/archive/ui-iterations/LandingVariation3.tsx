import { Link } from "wouter";
import { games } from "@/config/games";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Music, ChevronRight, Lock, Clock } from "lucide-react";

/**
 * Variation 3: Minimal List View
 * 
 * Design Philosophy:
 * - Clean, focused, distraction-free interface
 * - List-based layout for quick scanning
 * - Emphasis on clarity and simplicity
 * - Fast navigation with minimal clicks
 * - Professional, modern aesthetic
 * - Less visual clutter, more content focus
 */
export default function LandingVariation3() {
  const availableGames = games.filter(g => g.status === "available");
  const upcomingGames = games.filter(g => g.status === "coming-soon");
  const lockedGames = games.filter(g => g.status === "locked");

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Music className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-fredoka font-bold text-4xl text-foreground">
                Music Learning Games
              </h1>
              <p className="font-nunito text-muted-foreground">
                Select a game to begin
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Available Games Section */}
        {availableGames.length > 0 && (
          <section className="mb-12">
            <h2 className="font-fredoka font-semibold text-2xl text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Available Now
            </h2>
            
            <div className="space-y-3">
              {availableGames.map((game) => {
                const Icon = game.icon;
                
                return (
                  <Link key={game.id} href={game.route}>
                    <div className="group bg-card border rounded-2xl p-6 hover:shadow-lg hover:border-primary transition-all duration-200 cursor-pointer">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`${game.color} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-fredoka font-bold text-xl text-foreground mb-1">
                            {game.title}
                          </h3>
                          <p className="font-nunito text-muted-foreground text-sm line-clamp-2">
                            {game.description}
                          </p>
                          
                          {/* Meta Info */}
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground font-nunito">
                            {game.difficulty && (
                              <span className="capitalize">• {game.difficulty}</span>
                            )}
                            {game.ageRange && (
                              <span>• {game.ageRange}</span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Coming Soon Section */}
        {upcomingGames.length > 0 && (
          <section className="mb-12">
            <h2 className="font-fredoka font-semibold text-2xl text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Coming Soon
            </h2>
            
            <div className="space-y-3">
              {upcomingGames.map((game) => {
                const Icon = game.icon;
                
                return (
                  <div key={game.id} className="bg-card border rounded-2xl p-6 opacity-75">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`${game.color} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 opacity-60`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-fredoka font-bold text-xl text-foreground">
                            {game.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-nunito font-semibold">
                            <Clock className="w-3 h-3" />
                            Soon
                          </span>
                        </div>
                        <p className="font-nunito text-muted-foreground text-sm line-clamp-2">
                          {game.description}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground font-nunito">
                          {game.difficulty && (
                            <span className="capitalize">• {game.difficulty}</span>
                          )}
                          {game.ageRange && (
                            <span>• {game.ageRange}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Locked Games Section */}
        {lockedGames.length > 0 && (
          <section>
            <h2 className="font-fredoka font-semibold text-2xl text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              Future Updates
            </h2>
            
            <div className="space-y-3">
              {lockedGames.map((game) => {
                const Icon = game.icon;
                
                return (
                  <div key={game.id} className="bg-card border border-dashed rounded-2xl p-6 opacity-50">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="bg-gray-300 dark:bg-gray-700 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lock className="w-8 h-8 text-gray-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-fredoka font-bold text-xl text-foreground mb-1">
                          {game.title}
                        </h3>
                        <p className="font-nunito text-muted-foreground text-sm line-clamp-2">
                          {game.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="font-nunito text-sm text-muted-foreground text-center">
            New games are added regularly. Check back soon for more musical learning adventures!
          </p>
        </div>
      </footer>
    </div>
  );
}

