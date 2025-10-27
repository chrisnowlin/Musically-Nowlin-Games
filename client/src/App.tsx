import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Get base path from Vite config for GitHub Pages
const base = import.meta.env.BASE_URL;
import LandingPage from "@/pages/LandingPage";
import PitchMatchGame from "@/pages/games/PitchMatchGame";
import SameOrDifferentGamePage from "@/pages/games/SameOrDifferentGamePage";
import RhythmEchoChallengeGamePage from "@/pages/games/RhythmEchoChallengeGamePage";
import MelodyMemoryMatchGamePage from "@/pages/games/MelodyMemoryMatchGamePage";
import FastOrSlowRaceGamePage from "@/pages/games/FastOrSlowRaceGamePage";
import LoudOrQuietSafariGamePage from "@/pages/games/LoudOrQuietSafariGamePage";
import HowManyNotesGamePage from "@/pages/games/HowManyNotesGamePage";
import LongOrShortNotesGamePage from "@/pages/games/LongOrShortNotesGamePage";
import HappyOrSadMelodiesGamePage from "@/pages/games/HappyOrSadMelodiesGamePage";
import PitchLadderJumpGamePage from "@/pages/games/PitchLadderJumpGamePage";
import ScaleClimberGamePage from "@/pages/games/ScaleClimberGamePage";
import MusicalOppositesGamePage from "@/pages/games/MusicalOppositesGamePage";
import FinishTheTuneGamePage from "@/pages/games/FinishTheTuneGamePage";
import InstrumentDetectiveGamePage from "@/pages/games/InstrumentDetectiveGamePage";
import MusicalSimonSaysGamePage from "@/pages/games/MusicalSimonSaysGamePage";
import BeatKeeperChallengeGamePage from "@/pages/games/BeatKeeperChallengeGamePage";
import SteadyOrBouncyBeatGamePage from "@/pages/games/SteadyOrBouncyBeatGamePage";
import MusicalPatternDetectiveGamePage from "@/pages/games/MusicalPatternDetectiveGamePage";
import NameThatAnimalTuneGamePage from "@/pages/games/NameThatAnimalTuneGamePage";
import RhythmPuzzleBuilderGamePage from "@/pages/games/RhythmPuzzleBuilderGamePage";
import HarmonyHelperGamePage from "@/pages/games/HarmonyHelperGamePage";
import MusicalFreezeDanceGamePage from "@/pages/games/MusicalFreezeDanceGamePage";
import ComposeYourSongGamePage from "@/pages/games/ComposeYourSongGamePage";
import EchoLocationChallengeGamePage from "@/pages/games/EchoLocationChallengeGamePage";
import MusicalStoryTimeGamePage from "@/pages/games/MusicalStoryTimeGamePage";
import ToneColorMatchGamePage from "@/pages/games/ToneColorMatchGamePage";
import MusicalMathGamePage from "@/pages/games/MusicalMathGamePage";
import RestFinderGamePage from "@/pages/games/RestFinderGamePage";
import AnimalOrchestraConductorGamePage from "@/pages/games/AnimalOrchestraConductorGamePage";
import PitchPerfectPathGamePage from "@/pages/games/PitchPerfectPathGamePage";
import WorldMusicExplorerGamePage from "@/pages/games/WorldMusicExplorerGamePage";
import StaffWarsGamePage from "@/pages/games/StaffWarsGamePage";
import StaffRunnerGamePage from "@/pages/games/StaffRunnerGamePage";
import Rhythm006Page from "@/pages/games/Rhythm006Page";
import Rhythm007Page from "@/pages/games/Rhythm007Page";
import Rhythm002Page from "@/pages/games/Rhythm002Page";
import Pitch001Page from "@/pages/games/Pitch001Page";
import Pitch002Page from "@/pages/games/Pitch002Page";
import Pitch003Page from "@/pages/games/Pitch003Page";
import Pitch004Page from "@/pages/games/Pitch004Page";
import Pitch005Page from "@/pages/games/Pitch005Page";
import Pitch006Page from "@/pages/games/Pitch006Page";
import Rhythm001Page from "@/pages/games/Rhythm001Page";
import Rhythm003Page from "@/pages/games/Rhythm003Page";
import Rhythm004Page from "@/pages/games/Rhythm004Page";
import Rhythm005Page from "@/pages/games/Rhythm005Page";
import Harmony001Page from "@/pages/games/Harmony001Page";
import Harmony002Page from "@/pages/games/Harmony002Page";
import Harmony003Page from "@/pages/games/Harmony003Page";
import Harmony004Page from "@/pages/games/Harmony004Page";
import Timbre001Page from "@/pages/games/Timbre001Page";
import Timbre002Page from "@/pages/games/Timbre002Page";
import Timbre003Page from "@/pages/games/Timbre003Page";
import Dynamics001Page from "@/pages/games/Dynamics001Page";
import Dynamics002Page from "@/pages/games/Dynamics002Page";
import Dynamics003Page from "@/pages/games/Dynamics003Page";
import Theory001Page from "@/pages/games/Theory001Page";
import Theory002Page from "@/pages/games/Theory002Page";
import Theory003Page from "@/pages/games/Theory003Page";
import Theory004Page from "@/pages/games/Theory004Page";
import Compose001Page from "@/pages/games/Compose001Page";
import Compose002Page from "@/pages/games/Compose002Page";
import Listen001Page from "@/pages/games/Listen001Page";
import Listen002Page from "@/pages/games/Listen002Page";
import Listen003Page from "@/pages/games/Listen003Page";
import Listen004Page from "@/pages/games/Listen004Page";
import Cross001Page from "@/pages/games/Cross001Page";
import Cross002Page from "@/pages/games/Cross002Page";
import Cross003Page from "@/pages/games/Cross003Page";
import Advanced001Page from "@/pages/games/Advanced001Page";
import Challenge001Page from "@/pages/games/Challenge001Page";



import PlaceholderGame from "@/pages/games/PlaceholderGame";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
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
      <Route path="/games/pitch-002" component={Pitch002Page} />
      <Route path="/games/pitch-003" component={Pitch003Page} />
      <Route path="/games/pitch-004" component={Pitch004Page} />
      <Route path="/games/pitch-005" component={Pitch005Page} />
      <Route path="/games/pitch-006" component={Pitch006Page} />
      <Route path="/games/rhythm-002" component={Rhythm002Page} />
      <Route path="/games/rhythm-003" component={Rhythm003Page} />
      <Route path="/games/rhythm-004" component={Rhythm004Page} />
      <Route path="/games/rhythm-005" component={Rhythm005Page} />
      <Route path="/games/harmony-001" component={Harmony001Page} />
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



      <Route path="/games/world-music-explorer" component={WorldMusicExplorerGamePage} />
      <Route path="/games/staff-wars" component={StaffWarsGamePage} />
      <Route path="/games/staff-runner" component={StaffRunnerGamePage} />
      <Route path="/games/:slug" component={PlaceholderGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WouterRouter base={base}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
