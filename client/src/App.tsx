import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
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
const PitchMatchGame = lazy(() => import("@/pages/games/PitchMatchGame"));
const SameOrDifferentGamePage = lazy(() => import("@/pages/games/SameOrDifferentGamePage"));
const RhythmEchoChallengeGamePage = lazy(() => import("@/pages/games/RhythmEchoChallengeGamePage"));
const MelodyMemoryMatchGamePage = lazy(() => import("@/pages/games/MelodyMemoryMatchGamePage"));
const FastOrSlowRaceGamePage = lazy(() => import("@/pages/games/FastOrSlowRaceGamePage"));
const LoudOrQuietSafariGamePage = lazy(() => import("@/pages/games/LoudOrQuietSafariGamePage"));
const HowManyNotesGamePage = lazy(() => import("@/pages/games/HowManyNotesGamePage"));
const LongOrShortNotesGamePage = lazy(() => import("@/pages/games/LongOrShortNotesGamePage"));
const HappyOrSadMelodiesGamePage = lazy(() => import("@/pages/games/HappyOrSadMelodiesGamePage"));
const PitchLadderJumpGamePage = lazy(() => import("@/pages/games/PitchLadderJumpGamePage"));
const ScaleClimberGamePage = lazy(() => import("@/pages/games/ScaleClimberGamePage"));
const MusicalOppositesGamePage = lazy(() => import("@/pages/games/MusicalOppositesGamePage"));
const FinishTheTuneGamePage = lazy(() => import("@/pages/games/FinishTheTuneGamePage"));
const InstrumentCraneGamePage = lazy(() => import("@/pages/games/InstrumentCraneGamePage"));
const InstrumentDetectiveGamePage = lazy(() => import("@/pages/games/InstrumentDetectiveGamePage"));
const MusicalSimonSaysGamePage = lazy(() => import("@/pages/games/MusicalSimonSaysGamePage"));
const BeatKeeperChallengeGamePage = lazy(() => import("@/pages/games/BeatKeeperChallengeGamePage"));
const SteadyOrBouncyBeatGamePage = lazy(() => import("@/pages/games/SteadyOrBouncyBeatGamePage"));
const MusicalPatternDetectiveGamePage = lazy(() => import("@/pages/games/MusicalPatternDetectiveGamePage"));
const NameThatAnimalTuneGamePage = lazy(() => import("@/pages/games/NameThatAnimalTuneGamePage"));
const RhythmPuzzleBuilderGamePage = lazy(() => import("@/pages/games/RhythmPuzzleBuilderGamePage"));
const HarmonyHelperGamePage = lazy(() => import("@/pages/games/HarmonyHelperGamePage"));
const MusicalFreezeDanceGamePage = lazy(() => import("@/pages/games/MusicalFreezeDanceGamePage"));
const ComposeYourSongGamePage = lazy(() => import("@/pages/games/ComposeYourSongGamePage"));
const EchoLocationChallengeGamePage = lazy(() => import("@/pages/games/EchoLocationChallengeGamePage"));
const MusicalStoryTimeGamePage = lazy(() => import("@/pages/games/MusicalStoryTimeGamePage"));
const ToneColorMatchGamePage = lazy(() => import("@/pages/games/ToneColorMatchGamePage"));
const MusicalMathGamePage = lazy(() => import("@/pages/games/MusicalMathGamePage"));
const RestFinderGamePage = lazy(() => import("@/pages/games/RestFinderGamePage"));
const AnimalOrchestraConductorGamePage = lazy(() => import("@/pages/games/AnimalOrchestraConductorGamePage"));
const PitchPerfectPathGamePage = lazy(() => import("@/pages/games/PitchPerfectPathGamePage"));
const WorldMusicExplorerGamePage = lazy(() => import("@/pages/games/WorldMusicExplorerGamePage"));
const StaffInvadersGamePage = lazy(() => import("@/pages/games/StaffInvadersGamePage"));
const Rhythm006Page = lazy(() => import("@/pages/games/Rhythm006Page"));
const Rhythm007Page = lazy(() => import("@/pages/games/Rhythm007Page"));
const Rhythm002Page = lazy(() => import("@/pages/games/Rhythm002Page"));
const Pitch001Page = lazy(() => import("@/pages/games/Pitch001Page"));
const Pitch003Page = lazy(() => import("@/pages/games/Pitch003Page"));
const Pitch004Page = lazy(() => import("@/pages/games/Pitch004Page"));
const Pitch005Page = lazy(() => import("@/pages/games/Pitch005Page"));
const Pitch006Page = lazy(() => import("@/pages/games/Pitch006Page"));
const Rhythm001Page = lazy(() => import("@/pages/games/Rhythm001Page"));
const Rhythm003Page = lazy(() => import("@/pages/games/Rhythm003Page"));
const Rhythm004Page = lazy(() => import("@/pages/games/Rhythm004Page"));
const Rhythm005Page = lazy(() => import("@/pages/games/Rhythm005Page"));
const Harmony002Page = lazy(() => import("@/pages/games/Harmony002Page"));
const Harmony003Page = lazy(() => import("@/pages/games/Harmony003Page"));
const Harmony004Page = lazy(() => import("@/pages/games/Harmony004Page"));
const Timbre001Page = lazy(() => import("@/pages/games/Timbre001Page"));
const Timbre002Page = lazy(() => import("@/pages/games/Timbre002Page"));
const Timbre003Page = lazy(() => import("@/pages/games/Timbre003Page"));
const Dynamics001Page = lazy(() => import("@/pages/games/Dynamics001Page"));
const Dynamics002Page = lazy(() => import("@/pages/games/Dynamics002Page"));
const Dynamics003Page = lazy(() => import("@/pages/games/Dynamics003Page"));
const Theory001Page = lazy(() => import("@/pages/games/Theory001Page"));
const Theory002Page = lazy(() => import("@/pages/games/Theory002Page"));
const Theory003Page = lazy(() => import("@/pages/games/Theory003Page"));
const Theory004Page = lazy(() => import("@/pages/games/Theory004Page"));
const Compose001Page = lazy(() => import("@/pages/games/Compose001Page"));
const Compose002Page = lazy(() => import("@/pages/games/Compose002Page"));
const Listen001Page = lazy(() => import("@/pages/games/Listen001Page"));
const Listen002Page = lazy(() => import("@/pages/games/Listen002Page"));
const Listen003Page = lazy(() => import("@/pages/games/Listen003Page"));
const Listen004Page = lazy(() => import("@/pages/games/Listen004Page"));
const Cross001Page = lazy(() => import("@/pages/games/Cross001Page"));
const Cross002Page = lazy(() => import("@/pages/games/Cross002Page"));
const Cross003Page = lazy(() => import("@/pages/games/Cross003Page"));
const Advanced001Page = lazy(() => import("@/pages/games/Advanced001Page"));
const Challenge001Page = lazy(() => import("@/pages/games/Challenge001Page"));
const TrebleRunnerGamePage = lazy(() => import("@/pages/games/TrebleRunnerGamePage"));
const PlaceholderGame = lazy(() => import("@/pages/games/PlaceholderGame"));

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



      <Route path="/games/world-music-explorer" component={WorldMusicExplorerGamePage} />
      <Route path="/games/staff-invaders" component={StaffInvadersGamePage} />
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
