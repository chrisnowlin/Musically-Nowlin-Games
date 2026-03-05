/**
 * LoreModal — System 3
 *
 * A multi-step teaching modal that walks the student through:
 *  1. Teach steps: concept explanation with optional details
 *  2. Practice steps: low-stakes MC questions (no HP loss, retry on wrong)
 *
 * Appears at tier boundary floors and optionally as random special rooms.
 */

import React, { useState, useCallback } from 'react';
import type { LoreLesson, LoreStep } from './logic/loreData';

interface Props {
  lesson: LoreLesson;
  onComplete: () => void;
}

const LoreModal: React.FC<Props> = ({ lesson, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setStepIndex(i => i + 1);
    }
  }, [isLastStep, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50 mb-2 inline-block">
            LORE ROOM
          </span>
          <h2 className="text-lg font-bold text-blue-200">{lesson.title}</h2>
          <div className="flex justify-center gap-1 mt-2">
            {lesson.steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === stepIndex ? 'bg-blue-400' : i < stepIndex ? 'bg-blue-700' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step.type === 'teach' ? (
          <TeachStepView step={step} onNext={handleNext} isLastStep={isLastStep} />
        ) : (
          <PracticeStepView step={step} onNext={handleNext} isLastStep={isLastStep} />
        )}
      </div>
    </div>
  );
};

// ── Teach Step ──────────────────────────────────────────────

const TeachStepView: React.FC<{ step: LoreStep; onNext: () => void; isLastStep: boolean }> = ({ step, onNext, isLastStep }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-blue-100">{step.heading}</h3>
      <p className="text-gray-200 text-sm leading-relaxed">{step.body}</p>
      {step.detail && (
        <p className="text-blue-300/80 text-xs italic leading-relaxed">{step.detail}</p>
      )}
      <button
        onClick={onNext}
        className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold text-sm transition-colors active:scale-95"
      >
        {isLastStep ? 'Enter the Dungeon!' : 'Continue'}
      </button>
    </div>
  );
};

// ── Practice Step ───────────────────────────────────────────

const PracticeStepView: React.FC<{ step: LoreStep; onNext: () => void; isLastStep: boolean }> = ({ step, onNext, isLastStep }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleChoice = useCallback((choice: string) => {
    if (isCorrect === true) return; // Already answered correctly
    const correct = choice === step.correctAnswer;
    setSelected(choice);
    setIsCorrect(correct);
    // If wrong, allow retry (don't auto-advance)
  }, [step.correctAnswer, isCorrect]);

  const handleContinue = useCallback(() => {
    if (isCorrect) {
      onNext();
    }
  }, [isCorrect, onNext]);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-blue-100">{step.heading}</h3>
      {step.body && <p className="text-gray-300 text-sm">{step.body}</p>}
      <p className="text-gray-200 text-sm font-medium">{step.question}</p>

      <div className="grid grid-cols-1 gap-2">
        {(step.choices ?? []).map((choice) => {
          const isThisCorrect = choice === step.correctAnswer;
          const wasSelected = selected === choice;

          return (
            <button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={isCorrect === true}
              data-testid="lore-practice-btn"
              className={`
                px-4 py-2.5 rounded-lg font-medium text-sm text-left transition-all
                ${isCorrect === true && isThisCorrect
                  ? 'bg-green-600 text-white scale-[1.02]'
                  : isCorrect === true
                    ? 'bg-gray-700 text-gray-400'
                    : wasSelected && !isThisCorrect
                      ? 'bg-red-800/60 text-red-200 border border-red-600/50'
                      : 'bg-blue-700 hover:bg-blue-600 text-white active:scale-95'}
                disabled:cursor-default
              `}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {isCorrect === false && (
        <p className="text-amber-300 text-xs text-center">Not quite — try again!</p>
      )}
      {isCorrect === true && (
        <>
          <p className="text-green-400 text-sm font-bold text-center">Correct!</p>
          <button
            onClick={handleContinue}
            className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold text-sm transition-colors active:scale-95"
          >
            {isLastStep ? 'Enter the Dungeon!' : 'Continue'}
          </button>
        </>
      )}
    </div>
  );
};

export default LoreModal;
