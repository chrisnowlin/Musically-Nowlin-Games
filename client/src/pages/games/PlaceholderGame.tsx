import { Link, useRoute } from "wouter";
import { games, getGameById } from "@/config/games";
import { Button } from "@/components/ui/button";

function slugFromRoute(route: string) {
  const parts = route.split("/games");
  return parts[parts.length - 1] || "";
}

function changeIdFromSlug(slug: string) {
  // Mirror our OpenSpec change-ids (add-<slug>)
  return `add-${slug}`;
}

export default function PlaceholderGame() {
  // Determine current path and slug
  const [match, params] = useRoute<{ slug: string }>("/games/:slug");
  const slug = params?.slug ?? "";
  const route = `/games/${slug}`;

  const game = games.find((g) => g.route === route) ?? getGameById(slug);
  const title = game?.title ?? "Music Game";
  const description = game?.description ?? "First-pass implementation placeholder.";
  const changeId = changeIdFromSlug(slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex flex-col items-center">
      <header className="w-full max-w-3xl px-4 py-8 text-center">
        <h1 className="font-fredoka font-bold text-5xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="mt-3 font-nunito text-gray-700 dark:text-gray-300">{description}</p>
      </header>

      <main className="w-full max-w-2xl px-4">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl border-4 border-purple-300 dark:border-purple-700 shadow-xl p-6">
          <h2 className="font-fredoka text-2xl mb-2">First Pass Placeholder</h2>
          <p className="font-nunito text-gray-700 dark:text-gray-300">
            This game is scaffolded per OpenSpec. An initial minimal implementation is pending.
          </p>
          <div className="mt-4 text-sm font-mono">
            <div>OpenSpec Change: <span className="font-semibold">{changeId}</span></div>
            <div>Route: <span className="font-semibold">{route}</span></div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/games">
              <Button className="rounded-full">Back to Games</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

