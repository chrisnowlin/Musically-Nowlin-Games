import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from '@/common/query/queryClient';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/common/ui/toaster";
import { TooltipProvider } from "@/common/ui/tooltip";
import ErrorBoundary from "@/common/game-shell/ErrorBoundary";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Get base path from Vite config for deployment flexibility
const base = import.meta.env.BASE_URL;

// Redirect component for wouter
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

// Loading fallback component
function GameLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-purple-800">Loading game...</p>
      </div>
    </div>
  );
}

// Eagerly load landing page (first page users see)
import LandingPage from "@/pages/LandingPage";

// Lazy load all game pages to reduce initial bundle size
const PitchMatchGame = lazy(() => import("@/games/pitch/pitch-match/page"));
const SameOrDifferentGamePage = lazy(() => import("@/games/listen/same-or-different/page"));
const RhythmEchoChallengeGamePage = lazy(() => import("@/games/rhythm/rhythm-echo-challenge/page"));
const MelodyMemoryMatchGamePage = lazy(() => import("@/games/listen/melody-memory-match/page"));
const FastOrSlowRaceGamePage = lazy(() => import("@/games/rhythm/fast-or-slow-race/page"));
const LoudOrQuietSafariGamePage = lazy(() => import("@/games/dynamics/loud-or-quiet-safari/page"));
const HowManyNotesGamePage = lazy(() => import("@/games/listen/how-many-notes/page"));
const LongOrShortNotesGamePage = lazy(() => import("@/games/dynamics/long-or-short-notes/page"));
const HappyOrSadMelodiesGamePage = lazy(() => import("@/games/harmony/happy-or-sad-melodies/page"));
const PitchLadderJumpGamePage = lazy(() => import("@/games/pitch/pitch-ladder-jump/page"));
const ScaleClimberGamePage = lazy(() => import("@/games/pitch/scale-climber/page"));
const MusicalOppositesGamePage = lazy(() => import("@/games/listen/musical-opposites/page"));
const FinishTheTuneGamePage = lazy(() => import("@/pages/games/FinishTheTuneGamePage"));
const InstrumentCraneGamePage = lazy(() => import("@/games/instruments/crane-game/page"));
const InstrumentFamilySorterGamePage = lazy(() => import("@/games/instruments/family-sorter/page"));
const InstrumentDetectiveGamePage = lazy(() => import("@/games/instruments/detective/page"));
const MusicalSimonSaysGamePage = lazy(() => import("@/games/listen/musical-simon-says/page"));
const BeatKeeperChallengeGamePage = lazy(() => import("@/games/rhythm/beat-keeper-challenge/page"));
const SteadyOrBouncyBeatGamePage = lazy(() => import("@/games/rhythm/steady-or-bouncy-beat/page"));
const MusicalPatternDetectiveGamePage = lazy(() => import("@/games/listen/musical-pattern-detective/page"));
const NameThatAnimalTuneGamePage = lazy(() => import("@/games/listen/name-that-animal-tune/page"));
const RhythmPuzzleBuilderGamePage = lazy(() => import("@/games/rhythm/rhythm-puzzle-builder/page"));
const HarmonyHelperGamePage = lazy(() => import("@/games/harmony/harmony-helper/page"));
const MusicalFreezeDanceGamePage = lazy(() => import("@/games/rhythm/musical-freeze-dance/page"));
const ComposeYourSongGamePage = lazy(() => import("@/games/compose/compose-your-song/page"));
const EchoLocationChallengeGamePage = lazy(() => import("@/games/listen/echo-location-challenge/page"));
const MusicalStoryTimeGamePage = lazy(() => import("@/games/cross-curricular/musical-story-time/page"));
const ToneColorMatchGamePage = lazy(() => import("@/games/timbre/tone-color-match/page"));
const MusicalMathGamePage = lazy(() => import("@/games/cross-curricular/musical-math/page"));
const RestFinderGamePage = lazy(() => import("@/games/rhythm/rest-finder/page"));
const AnimalOrchestraConductorGamePage = lazy(() => import("@/pages/games/AnimalOrchestraConductorGamePage"));
const PitchPerfectPathGamePage = lazy(() => import("@/games/pitch/pitch-perfect-path/page"));
const WorldMusicExplorerGamePage = lazy(() => import("@/games/cross-curricular/world-music-explorer/page"));
const StaffInvadersGamePage = lazy(() => import("@/pages/games/StaffInvadersGamePage"));
const Rhythm006Page = lazy(() => import("@/games/rhythm/rhythm-006/page"));
const Rhythm007Page = lazy(() => import("@/games/rhythm/rhythm-007/page"));
const Rhythm002Page = lazy(() => import("@/games/rhythm/rhythm-002/page"));
const Pitch001Page = lazy(() => import("@/games/pitch/pitch-001/page"));
const Pitch003Page = lazy(() => import("@/games/pitch/pitch-003/page"));
const Pitch004Page = lazy(() => import("@/games/pitch/pitch-004/page"));
const Pitch005Page = lazy(() => import("@/games/pitch/pitch-005/page"));
const Pitch006Page = lazy(() => import("@/games/pitch/pitch-006/page"));
const Rhythm001Page = lazy(() => import("@/games/rhythm/rhythm-001/page"));
const Rhythm003Page = lazy(() => import("@/games/rhythm/rhythm-003/page"));
const Rhythm004Page = lazy(() => import("@/games/rhythm/rhythm-004/page"));
const Rhythm005Page = lazy(() => import("@/games/rhythm/rhythm-005/page"));
const Harmony002Page = lazy(() => import("@/games/harmony/harmony-002/page"));
const Harmony003Page = lazy(() => import("@/games/harmony/harmony-003/page"));
const Harmony004Page = lazy(() => import("@/games/harmony/harmony-004/page"));
const Timbre001Page = lazy(() => import("@/games/timbre/timbre-001/page"));
const Timbre002Page = lazy(() => import("@/games/timbre/timbre-002/page"));
const Timbre003Page = lazy(() => import("@/games/timbre/timbre-003/page"));
const Dynamics001Page = lazy(() => import("@/games/dynamics/dynamics-001/page"));
const Dynamics002Page = lazy(() => import("@/games/dynamics/dynamics-002/page"));
const Dynamics003Page = lazy(() => import("@/games/dynamics/dynamics-003/page"));
const Theory001Page = lazy(() => import("@/games/theory/theory-001/page"));
const Theory002Page = lazy(() => import("@/games/theory/theory-002/page"));
const Theory003Page = lazy(() => import("@/games/theory/theory-003/page"));
const Theory004Page = lazy(() => import("@/games/theory/theory-004/page"));
const Compose001Page = lazy(() => import("@/games/compose/compose-001/page"));
const Compose002Page = lazy(() => import("@/games/compose/compose-002/page"));
const Listen001Page = lazy(() => import("@/games/listen/listen-001/page"));
const Listen002Page = lazy(() => import("@/games/listen/listen-002/page"));
const Listen003Page = lazy(() => import("@/games/listen/listen-003/page"));
const Listen004Page = lazy(() => import("@/games/listen/listen-004/page"));
const Cross001Page = lazy(() => import("@/games/cross-curricular/cross-001/page"));
const Cross002Page = lazy(() => import("@/games/cross-curricular/cross-002/page"));
const Cross003Page = lazy(() => import("@/games/cross-curricular/cross-003/page"));
const Advanced001Page = lazy(() => import("@/games/advanced/advanced-001/page"));
const Challenge001Page = lazy(() => import("@/games/advanced/challenge-001/page"));
const TrebleRunnerGamePage = lazy(() => import("@/pages/games/TrebleRunnerGamePage"));
const MelodyDungeonPage = lazy(() => import("@/pages/games/MelodyDungeonPage"));
const CadenceQuestPage = lazy(() => import("@/pages/games/CadenceQuestPage"));
const PlaceholderGame = lazy(() => import("@/pages/games/PlaceholderGame"));
const UnderDevelopmentPage = lazy(() => import("@/pages/UnderDevelopmentPage"));

// Tools
const RhythmRandomizerPage = lazy(() => import("@/pages/tools/RhythmRandomizerPage"));
const SightReadingRandomizerPage = lazy(() => import("@/pages/tools/SightReadingRandomizerPage"));

function Router() {
  return (
    <Suspense fallback={<GameLoadingFallback />}>
      <Switch>
      {/* Redirect root to /games */}
      <Route path="/"><Redirect to="/games" /></Route>
      {/* Landing page routes */}
      <Route path="/home" component={LandingPage} />
      <Route path="/games" component={LandingPage} />
      {/* Game routes */}
      <Route path="/games/pitch-match" component={PitchMatchGame} />
      <Route path="/games/same-or-different" component={SameOrDifferentGamePage} />
      <Route path="/games/rhythm-echo-challenge" component={RhythmEchoChallengeGamePage} />
      <Route path="/games/melody-memory-match" component={MelodyMemoryMatchGamePage} />
      <Route path="/games/fast-or-slow-race" component={FastOrSlowRaceGamePage} />
      <Route path="/games/loud-or-quiet-safari" component={LoudOrQuietSafariGamePage} />
      <Route path="/games/how-many-notes" component={HowManyNotesGamePage} />
      <Route path="/games/long-or-short-notes" component={LongOrShortNotesGamePage} />
      <Route path="/games/happy-or-sad-melodies" component={HappyOrSadMelodiesGamePage} />
      <Route path="/games/pitch-ladder-jump" component={PitchLadderJumpGamePage} />
      <Route path="/games/scale-climber" component={ScaleClimberGamePage} />
      <Route path="/games/musical-opposites" component={MusicalOppositesGamePage} />
      <Route path="/games/finish-the-tune" component={FinishTheTuneGamePage} />
      <Route path="/games/instrument-crane" component={InstrumentCraneGamePage} />
      <Route path="/games/instrument-family-sorter" component={InstrumentFamilySorterGamePage} />
      <Route path="/games/instrument-detective" component={InstrumentDetectiveGamePage} />
      <Route path="/games/musical-simon-says" component={MusicalSimonSaysGamePage} />
      <Route path="/games/beat-keeper-challenge" component={BeatKeeperChallengeGamePage} />
      <Route path="/games/steady-or-bouncy-beat" component={SteadyOrBouncyBeatGamePage} />
      <Route path="/games/musical-pattern-detective" component={MusicalPatternDetectiveGamePage} />
      <Route path="/games/name-that-animal-tune" component={NameThatAnimalTuneGamePage} />
      <Route path="/games/rhythm-puzzle-builder" component={RhythmPuzzleBuilderGamePage} />
      <Route path="/games/harmony-helper" component={HarmonyHelperGamePage} />
      <Route path="/games/musical-freeze-dance" component={MusicalFreezeDanceGamePage} />
      <Route path="/games/compose-your-song" component={ComposeYourSongGamePage} />
      <Route path="/games/echo-location-challenge" component={EchoLocationChallengeGamePage} />
      <Route path="/games/musical-story-time" component={MusicalStoryTimeGamePage} />
      <Route path="/games/tone-color-match" component={ToneColorMatchGamePage} />
      <Route path="/games/musical-math" component={MusicalMathGamePage} />
      <Route path="/games/rest-finder" component={RestFinderGamePage} />
      <Route path="/games/animal-orchestra-conductor" component={AnimalOrchestraConductorGamePage} />
      <Route path="/games/pitch-perfect-path" component={PitchPerfectPathGamePage} />
      <Route path="/games/beat-and-pulse-trainer" component={Rhythm006Page} />
      <Route path="/games/tempo-conducting-studio" component={Rhythm007Page} />
      <Route path="/games/tempo-and-pulse-master" component={Rhythm002Page} />
      <Route path="/games/rhythm-master" component={Rhythm001Page} />
      <Route path="/games/pitch-001" component={Pitch001Page} />
      <Route path="/games/pitch-003" component={Pitch003Page} />
      <Route path="/games/pitch-004" component={Pitch004Page} />
      <Route path="/games/pitch-005" component={Pitch005Page} />
      <Route path="/games/pitch-006" component={Pitch006Page} />
      <Route path="/games/rhythm-002" component={Rhythm002Page} />
      <Route path="/games/rhythm-003" component={Rhythm003Page} />
      <Route path="/games/rhythm-004" component={Rhythm004Page} />
      <Route path="/games/rhythm-005" component={Rhythm005Page} />
      <Route path="/games/harmony-002" component={Harmony002Page} />
      <Route path="/games/harmony-003" component={Harmony003Page} />
      <Route path="/games/harmony-004" component={Harmony004Page} />
      <Route path="/games/timbre-001" component={Timbre001Page} />
      <Route path="/games/timbre-002" component={Timbre002Page} />
      <Route path="/games/timbre-003" component={Timbre003Page} />
      <Route path="/games/dynamics-001" component={Dynamics001Page} />
      <Route path="/games/dynamics-002" component={Dynamics002Page} />
      <Route path="/games/dynamics-003" component={Dynamics003Page} />
      <Route path="/games/theory-001" component={Theory001Page} />
      <Route path="/games/theory-002" component={Theory002Page} />
      <Route path="/games/theory-003" component={Theory003Page} />
      <Route path="/games/theory-004" component={Theory004Page} />
      <Route path="/games/compose-001" component={Compose001Page} />
      <Route path="/games/compose-002" component={Compose002Page} />
      <Route path="/games/listen-001" component={Listen001Page} />
      <Route path="/games/listen-002" component={Listen002Page} />
      <Route path="/games/listen-003" component={Listen003Page} />
      <Route path="/games/listen-004" component={Listen004Page} />
      <Route path="/games/cross-001" component={Cross001Page} />
      <Route path="/games/cross-002" component={Cross002Page} />
      <Route path="/games/cross-003" component={Cross003Page} />
      <Route path="/games/advanced-001" component={Advanced001Page} />
      <Route path="/games/challenge-001" component={Challenge001Page} />
      <Route path="/games/treble-runner" component={TrebleRunnerGamePage} />
      <Route path="/games/under-development" component={UnderDevelopmentPage} />

      <Route path="/games/world-music-explorer" component={WorldMusicExplorerGamePage} />
      <Route path="/games/staff-invaders" component={StaffInvadersGamePage} />
      <Route path="/games/melody-dungeon" component={MelodyDungeonPage} />
      <Route path="/games/cadence-quest" component={CadenceQuestPage} />
      <Route path="/games/:slug" component={PlaceholderGame} />
      {/* Tools */}
      <Route path="/tools/rhythm-randomizer" component={RhythmRandomizerPage} />
      <Route path="/tools/sight-reading-randomizer" component={SightReadingRandomizerPage} />
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={base}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
