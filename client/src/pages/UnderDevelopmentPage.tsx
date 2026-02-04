import { Link } from "wouter";
import {
  getUnderDevelopmentGames,
  UNDER_DEVELOPMENT_PASSCODE,
  UNDER_DEVELOPMENT_SESSION_KEY,
} from "@/config/games";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Play, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function UnderDevelopmentPage() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(UNDER_DEVELOPMENT_SESSION_KEY) === "true");
  }, []);

  const underDevelopmentGames = getUnderDevelopmentGames();

  const handlePasscodeSubmit = () => {
    if (passcodeInput === UNDER_DEVELOPMENT_PASSCODE) {
      sessionStorage.setItem(UNDER_DEVELOPMENT_SESSION_KEY, "true");
      setPasscodeInput("");
      setPasscodeError(false);
      setUnlocked(true);
    } else {
      setPasscodeError(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden flex flex-col items-center justify-center px-4">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-pulse delay-75" />

        <Link href="/games">
          <Button
            variant="ghost"
            className="absolute top-6 left-4 font-fredoka text-lg text-purple-800 dark:text-purple-200 hover:bg-white/50 dark:hover:bg-black/20 z-10"
          >
            <ChevronLeft className="w-6 h-6 mr-2" />
            Back to Games
          </Button>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border-4 border-amber-400 p-8 max-w-md w-full relative z-10">
          <h1 className="font-fredoka font-bold text-2xl md:text-3xl text-amber-800 dark:text-amber-200 mb-2 text-center">
            Under Development
          </h1>
          <p className="font-nunito text-gray-700 dark:text-gray-300 mb-6 text-center">
            Enter the passcode to view games in development.
          </p>
          <Input
            type="password"
            placeholder="Enter passcode..."
            value={passcodeInput}
            onChange={(e) => {
              setPasscodeInput(e.target.value);
              setPasscodeError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handlePasscodeSubmit()}
            className={`font-nunito text-lg py-6 text-center rounded-xl mb-4 ${
              passcodeError ? "border-red-500 border-2" : ""
            }`}
            autoFocus
          />
          {passcodeError && (
            <p className="text-red-500 text-center font-nunito text-sm mb-4">
              Incorrect passcode. Please try again.
            </p>
          )}
          <Button
            onClick={handlePasscodeSubmit}
            className="w-full font-fredoka text-xl py-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
            size="lg"
          >
            <Play className="w-6 h-6 mr-2" />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-pulse delay-75" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-300/30 rounded-full blur-xl animate-pulse delay-150" />

      <header className="py-6 px-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/games">
            <Button
              variant="ghost"
              className="font-fredoka text-lg text-purple-800 dark:text-purple-200 hover:bg-white/50 dark:hover:bg-black/20"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16 relative z-10">
        <section>
          <div className="text-center mb-8">
            <h1 className="font-fredoka font-bold text-4xl md:text-5xl text-orange-800 dark:text-orange-200 mb-2">
              Under Development
            </h1>
            <p className="font-nunito text-lg text-gray-700 dark:text-gray-300">
              🚧 Coming soon! 🚧
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {underDevelopmentGames.map((game, index) => {
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
                  <div
                    className={`
                      bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl 
                      transition-all duration-300 overflow-hidden border-4
                      ${isAvailable ? "border-green-400 hover:border-green-500" : "border-gray-300"}
                      ${isHovered && isAvailable ? "scale-105 -rotate-1" : ""}
                      ${!isAvailable ? "opacity-75" : ""}
                    `}
                  >
                    {isAvailable && isHovered && (
                      <div className="absolute top-2 right-2 z-20">
                        <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                      </div>
                    )}

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

                    <div className="px-6 pb-6 text-center">
                      <h2 className="font-fredoka font-bold text-2xl md:text-3xl text-foreground mb-2">
                        {game.title}
                      </h2>
                      <p className="font-nunito text-muted-foreground mb-4 min-h-[4.5rem] text-sm md:text-base">
                        {game.description}
                      </p>

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
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
