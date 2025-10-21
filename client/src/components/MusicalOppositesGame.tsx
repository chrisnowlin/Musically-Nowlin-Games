import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, ArrowUp, ArrowDown, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentChallenge: {
    type: "pitch" | "volume" | "tempo";
    option1: any;
    option2: any;
    question: string;
    correctAnswer: 1 | 2;
  } | null;
  hasPlayed: boolean;
  volume: number;
}

export default function MusicalOppositesGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentChallenge: null,
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentChallenge) {
      generateNewChallenge();
    }
  }, [gameStarted]);

  const playPitchChallenge = useCallback(async (isHigher: boolean) => {
    if (!audioContext.current) return;

    const frequency = isHigher ? 523 : 262; // High C vs Low C
    const duration = 1.0;
    const masterVolume = gameState.volume / 100;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const volume = 0.3 * masterVolume;
    gainNode.gain.setValueAtTime(volume, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000 + 200));
  }, [gameState.volume]);

  const playVolumeChallenge = useCallback(async (isLouder: boolean) => {
    if (!audioContext.current) return;

    const frequency = 440; // A4
    const duration = 1.0;
    const masterVolume = gameState.volume / 100;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const volume = (isLouder ? 0.6 : 0.15) * masterVolume;
    gainNode.gain.setValueAtTime(volume, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000 + 200));
  }, [gameState.volume]);

  const playTempoChallenge = useCallback(async (isFaster: boolean) => {
    if (!audioContext.current) return;

    const frequencies = [262, 294, 330, 349]; // C D E F
    const noteDuration = isFaster ? 0.2 : 0.6; // Fast vs slow
    const masterVolume = gameState.volume / 100;

    for (const freq of frequencies) {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = 0.3 * masterVolume;
      const startTime = audioContext.current.currentTime;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.9);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration * 0.9);

      await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }, [gameState.volume]);

  const generateNewChallenge = useCallback(() => {
    const types: Array<"pitch" | "volume" | "tempo"> = ["pitch", "volume", "tempo"];
    const type = types[Math.floor(Math.random() * types.length)];

    let challenge;
    const randomOrder = Math.random() > 0.5;

    switch (type) {
      case "pitch":
        challenge = {
          type,
          option1: { isHigher: randomOrder },
          option2: { isHigher: !randomOrder },
          question: "Which sound is HIGHER?",
          correctAnswer: (randomOrder ? 1 : 2) as 1 | 2,
        };
        break;
      case "volume":
        challenge = {
          type,
          option1: { isLouder: randomOrder },
          option2: { isLouder: !randomOrder },
          question: "Which sound is LOUDER?",
          correctAnswer: (randomOrder ? 1 : 2) as 1 | 2,
        };
        break;
      case "tempo":
        challenge = {
          type,
          option1: { isFaster: randomOrder },
          option2: { isFaster: !randomOrder },
          question: "Which pattern is FASTER?",
          correctAnswer: (randomOrder ? 1 : 2) as 1 | 2,
        };
        break;
    }

    setGameState(prev => ({
      ...prev,
      currentChallenge: challenge,
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayOption = useCallback(async (option: 1 | 2) => {
    if (!gameState.currentChallenge || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    const optionData = option === 1 ? gameState.currentChallenge.option1 : gameState.currentChallenge.option2;

    switch (gameState.currentChallenge.type) {
      case "pitch":
        await playPitchChallenge(optionData.isHigher);
        break;
      case "volume":
        await playVolumeChallenge(optionData.isLouder);
        break;
      case "tempo":
        await playTempoChallenge(optionData.isFaster);
        break;
    }

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentChallenge, gameState.isPlaying, playPitchChallenge, playVolumeChallenge, playTempoChallenge]);

  const handleAnswer = useCallback((guess: 1 | 2) => {
    if (!gameState.currentChallenge || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = guess === gameState.currentChallenge.correctAnswer;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
    }));

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setTimeout(() => {
      generateNewChallenge();
    }, 2500);
  }, [gameState.currentChallenge, gameState.hasPlayed, gameState.feedback, generateNewChallenge]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
  };

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Musical Opposites
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Match the musical opposites!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-pink-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">↔️</span>
                <span>Listen to two musical sounds by clicking the Play buttons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Identify which sound matches the description (higher, louder, or faster)</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about musical contrasts: pitch, volume, and tempo!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Playing!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
        <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />

        <div className="mt-8 mb-8">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            {gameState.currentChallenge?.question || "Musical Opposites"}
          </h2>
        </div>

        {/* Volume Control */}
        <div className={`w-full max-w-md mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-4 ${playfulShapes.shadows.card}`}>
          <div className="flex items-center gap-4">
            <VolumeX size={20} className="text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        {/* Play Options */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to both sounds, then choose which one matches the description!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={() => handlePlayOption(1)}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} h-24`}
            >
              <Play className="w-6 h-6 mr-2" />
              Play Sound 1
            </Button>
            <Button
              onClick={() => handlePlayOption(2)}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} h-24`}
            >
              <Play className="w-6 h-6 mr-2" />
              Play Sound 2
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer(1)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8 py-8 text-2xl font-bold flex flex-col items-center gap-2"
              >
                Sound 1
              </Button>
              <Button
                onClick={() => handleAnswer(2)}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-8 text-2xl font-bold flex flex-col items-center gap-2"
              >
                Sound 2
              </Button>
            </div>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! Sound {gameState.currentChallenge?.correctAnswer} was the answer!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    Sound {gameState.currentChallenge?.correctAnswer} was the correct answer! Listen again!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Understanding Musical Opposites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
              <p className="font-bold text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-2">
                <ArrowUp size={20} /> <ArrowDown size={20} /> Pitch
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                High vs Low: Pitch refers to how high or low a sound is. Higher frequencies create higher-pitched sounds.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                <Volume2 size={20} /> Volume
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Loud vs Quiet: Volume refers to how loud or soft a sound is. Musicians use dynamics to express emotions.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                Tempo ⏱️
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Fast vs Slow: Tempo refers to the speed of the music. Faster tempos create excitement, slower tempos create calm.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Understanding musical opposites helps you describe and analyze music.
              These contrasts are fundamental elements that composers use to create interesting and expressive music.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
