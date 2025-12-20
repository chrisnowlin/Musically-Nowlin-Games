import { useReducer, useCallback } from 'react';
import type {
  FinishTheTuneState,
  GameAction,
  Question,
  NoteEvent,
  Difficulty,
  PersistedState,
} from '@/components/finish-the-tune/types';
import {
  generateWrongEndings,
  shuffleOptions,
  getRandomPattern,
  DIFFICULTY_CONFIG,
  areEndingsEqual,
} from '@/components/finish-the-tune/finish-the-tune-Logic';
import { checkAchievements } from '@/components/finish-the-tune/finish-the-tune-Achievements';

const TIMED_MODE_DURATION = 60; // 60 seconds

const initialState: FinishTheTuneState = {
  // Core game
  currentQuestion: null,
  shuffledOptions: [],
  score: 0,
  totalQuestions: 0,

  // Playback
  isPlaying: false,
  hasPlayedMelody: false,
  activeNoteIndex: -1,
  playingSequenceId: null,
  selectedOptionIndex: null,
  feedback: null,

  // Gamification
  streak: 0,
  bestStreak: 0,
  completedMelodies: new Set<string>(),
  wrongQuestionQueue: [],
  achievements: [],
  highScore: 0,

  // Settings
  difficulty: 'medium',
  playbackSpeed: 1.0,
  autoPlay: false,
  volume: 70,
  loopMelody: false,
  showNoteNames: false,

  // Timed mode
  timedMode: false,
  timeRemaining: TIMED_MODE_DURATION,

  // Accessibility
  focusedOptionIndex: 0,

  // Compare mode
  compareMode: false,
  compareSelections: [],
};

function gameReducer(state: FinishTheTuneState, action: GameAction): FinishTheTuneState {
  switch (action.type) {
    case 'LOAD_SAVED_STATE': {
      const saved = action.payload;
      return {
        ...state,
        highScore: saved.highScore ?? state.highScore,
        bestStreak: saved.bestStreak ?? state.bestStreak,
        achievements: saved.achievements ?? state.achievements,
        completedMelodies: new Set(saved.completedMelodies ?? []),
        difficulty: saved.settings?.difficulty ?? state.difficulty,
        playbackSpeed: saved.settings?.playbackSpeed ?? state.playbackSpeed,
        autoPlay: saved.settings?.autoPlay ?? state.autoPlay,
        volume: saved.settings?.volume ?? state.volume,
        loopMelody: saved.settings?.loopMelody ?? state.loopMelody,
        showNoteNames: saved.settings?.showNoteNames ?? state.showNoteNames,
      };
    }

    case 'NEW_QUESTION': {
      return {
        ...state,
        currentQuestion: action.payload.question,
        shuffledOptions: action.payload.shuffledOptions,
        feedback: null,
        hasPlayedMelody: false,
        activeNoteIndex: -1,
        playingSequenceId: null,
        selectedOptionIndex: null,
        focusedOptionIndex: 0,
      };
    }

    case 'SELECT_ANSWER': {
      const { index, isCorrect, melodyName } = action.payload;
      const newStreak = isCorrect ? state.streak + 1 : 0;
      const newBestStreak = Math.max(state.bestStreak, newStreak);
      const newScore = isCorrect ? state.score + 1 : state.score;
      const newHighScore = Math.max(state.highScore, newScore);

      // Add to completed melodies
      const newCompletedMelodies = new Set(state.completedMelodies);
      if (isCorrect && melodyName) {
        newCompletedMelodies.add(melodyName);
      }

      // Add to wrong question queue if incorrect
      const newWrongQueue = [...state.wrongQuestionQueue];
      if (!isCorrect && state.currentQuestion) {
        newWrongQueue.push(state.currentQuestion);
      }

      // Check for new achievements
      const tempState = {
        ...state,
        score: newScore,
        streak: newStreak,
        bestStreak: newBestStreak,
        completedMelodies: newCompletedMelodies,
        totalQuestions: state.totalQuestions + 1,
      };
      const newAchievements = checkAchievements(tempState, state.achievements);

      return {
        ...state,
        score: newScore,
        totalQuestions: state.totalQuestions + 1,
        feedback: { show: true, isCorrect },
        selectedOptionIndex: index,
        streak: newStreak,
        bestStreak: newBestStreak,
        highScore: newHighScore,
        completedMelodies: newCompletedMelodies,
        wrongQuestionQueue: newWrongQueue,
        achievements: [...state.achievements, ...newAchievements],
      };
    }

    case 'PLAY_MELODY': {
      return {
        ...state,
        isPlaying: true,
        activeNoteIndex: -1,
        playingSequenceId: action.payload.sequenceId,
      };
    }

    case 'UPDATE_ACTIVE_NOTE': {
      return {
        ...state,
        activeNoteIndex: action.payload,
      };
    }

    case 'STOP_PLAYING': {
      return {
        ...state,
        isPlaying: false,
        activeNoteIndex: -1,
        playingSequenceId: null,
      };
    }

    case 'SET_HAS_PLAYED_MELODY': {
      return {
        ...state,
        hasPlayedMelody: true,
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };
    }

    case 'SET_DIFFICULTY': {
      return {
        ...state,
        difficulty: action.payload,
      };
    }

    case 'SET_PLAYBACK_SPEED': {
      return {
        ...state,
        playbackSpeed: action.payload,
      };
    }

    case 'TOGGLE_AUTO_PLAY': {
      return {
        ...state,
        autoPlay: !state.autoPlay,
      };
    }

    case 'TOGGLE_LOOP_MELODY': {
      return {
        ...state,
        loopMelody: !state.loopMelody,
      };
    }

    case 'TOGGLE_SHOW_NOTE_NAMES': {
      return {
        ...state,
        showNoteNames: !state.showNoteNames,
      };
    }

    case 'TOGGLE_TIMED_MODE': {
      return {
        ...state,
        timedMode: !state.timedMode,
        timeRemaining: TIMED_MODE_DURATION,
      };
    }

    case 'TICK_TIMER': {
      if (!state.timedMode || state.timeRemaining <= 0) {
        return state;
      }
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
      };
    }

    case 'SET_VOLUME': {
      return {
        ...state,
        volume: action.payload,
      };
    }

    case 'SET_FOCUSED_OPTION': {
      return {
        ...state,
        focusedOptionIndex: action.payload,
      };
    }

    case 'CLEAR_FEEDBACK': {
      return {
        ...state,
        feedback: null,
        selectedOptionIndex: null,
      };
    }

    case 'RESET_GAME': {
      return {
        ...initialState,
        // Preserve persisted data
        highScore: state.highScore,
        bestStreak: state.bestStreak,
        achievements: state.achievements,
        completedMelodies: state.completedMelodies,
        // Preserve settings
        difficulty: state.difficulty,
        playbackSpeed: state.playbackSpeed,
        autoPlay: state.autoPlay,
        volume: state.volume,
        loopMelody: state.loopMelody,
        showNoteNames: state.showNoteNames,
        timedMode: state.timedMode,
        timeRemaining: TIMED_MODE_DURATION,
      };
    }

    case 'END_TIMED_GAME': {
      return {
        ...state,
        timedMode: false,
        timeRemaining: 0,
      };
    }

    case 'TOGGLE_COMPARE_MODE': {
      return {
        ...state,
        compareMode: !state.compareMode,
        compareSelections: [],
      };
    }

    case 'ADD_COMPARE_SELECTION': {
      const index = action.payload;
      // If already selected, remove it
      if (state.compareSelections.includes(index)) {
        return {
          ...state,
          compareSelections: state.compareSelections.filter((i) => i !== index),
        };
      }
      // Max 2 selections
      if (state.compareSelections.length >= 2) {
        return state;
      }
      return {
        ...state,
        compareSelections: [...state.compareSelections, index],
      };
    }

    case 'CLEAR_COMPARE_SELECTIONS': {
      return {
        ...state,
        compareSelections: [],
      };
    }

    default:
      return state;
  }
}

export function useFinishTheTuneGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const loadSavedState = useCallback((savedState: Partial<PersistedState>) => {
    dispatch({ type: 'LOAD_SAVED_STATE', payload: savedState });
  }, []);

  const generateNewQuestion = useCallback((fromRetryQueue: boolean = false) => {
    let question: Question;
    let shuffledOptions: NoteEvent[][];

    // Check if we should use a question from the retry queue
    if (
      fromRetryQueue &&
      state.wrongQuestionQueue.length > 0 &&
      state.streak >= 2 // Only retry after 2+ correct answers
    ) {
      question = state.wrongQuestionQueue[0];
      const wrongCount = DIFFICULTY_CONFIG[state.difficulty].optionCount - 1;
      const wrongEndings = generateWrongEndings(question.correctEnding, wrongCount);
      shuffledOptions = shuffleOptions(question.correctEnding, wrongEndings);
    } else {
      const pattern = getRandomPattern();
      const wrongCount = DIFFICULTY_CONFIG[state.difficulty].optionCount - 1;
      const wrongEndings = generateWrongEndings(pattern.endings.correct, wrongCount);
      shuffledOptions = shuffleOptions(pattern.endings.correct, wrongEndings);

      question = {
        melodyStart: pattern.start,
        correctEnding: pattern.endings.correct,
        wrongEndings,
        description: pattern.endings.name,
        hint: pattern.hint,
      };
    }

    dispatch({
      type: 'NEW_QUESTION',
      payload: { question, shuffledOptions },
    });
  }, [state.difficulty, state.wrongQuestionQueue, state.streak]);

  const selectAnswer = useCallback(
    (selectedEnding: NoteEvent[], index: number) => {
      if (!state.currentQuestion) return;

      const isCorrect = areEndingsEqual(selectedEnding, state.currentQuestion.correctEnding);

      dispatch({
        type: 'SELECT_ANSWER',
        payload: {
          index,
          isCorrect,
          melodyName: state.currentQuestion.description,
        },
      });

      return isCorrect;
    },
    [state.currentQuestion]
  );

  const playMelody = useCallback((sequenceId: string) => {
    dispatch({ type: 'PLAY_MELODY', payload: { sequenceId } });
  }, []);

  const updateActiveNote = useCallback((index: number) => {
    dispatch({ type: 'UPDATE_ACTIVE_NOTE', payload: index });
  }, []);

  const stopPlaying = useCallback(() => {
    dispatch({ type: 'STOP_PLAYING' });
  }, []);

  const setHasPlayedMelody = useCallback(() => {
    dispatch({ type: 'SET_HAS_PLAYED_MELODY' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
  }, []);

  const toggleAutoPlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_PLAY' });
  }, []);

  const toggleLoopMelody = useCallback(() => {
    dispatch({ type: 'TOGGLE_LOOP_MELODY' });
  }, []);

  const toggleShowNoteNames = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHOW_NOTE_NAMES' });
  }, []);

  const toggleTimedMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_TIMED_MODE' });
  }, []);

  const tickTimer = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const setFocusedOption = useCallback((index: number) => {
    dispatch({ type: 'SET_FOCUSED_OPTION', payload: index });
  }, []);

  const clearFeedback = useCallback(() => {
    dispatch({ type: 'CLEAR_FEEDBACK' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });
  }, []);

  const endTimedGame = useCallback(() => {
    dispatch({ type: 'END_TIMED_GAME' });
  }, []);

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMPARE_MODE' });
  }, []);

  const addCompareSelection = useCallback((index: number) => {
    dispatch({ type: 'ADD_COMPARE_SELECTION', payload: index });
  }, []);

  const clearCompareSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARE_SELECTIONS' });
  }, []);

  return {
    state,
    actions: {
      loadSavedState,
      generateNewQuestion,
      selectAnswer,
      playMelody,
      updateActiveNote,
      stopPlaying,
      setHasPlayedMelody,
      setDifficulty,
      setPlaybackSpeed,
      toggleAutoPlay,
      toggleLoopMelody,
      toggleShowNoteNames,
      toggleTimedMode,
      tickTimer,
      setVolume,
      setFocusedOption,
      clearFeedback,
      resetGame,
      unlockAchievement,
      endTimedGame,
      toggleCompareMode,
      addCompareSelection,
      clearCompareSelections,
    },
  };
}

export default useFinishTheTuneGame;
