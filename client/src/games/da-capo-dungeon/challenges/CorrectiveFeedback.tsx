/**
 * CorrectiveFeedback — System 4
 *
 * Replaces the auto-dismiss wrong-answer feedback across all challenge types.
 * Shows an explanation + optional mnemonic, and requires the student to tap
 * "Got it" before proceeding — ensuring they actually read the feedback.
 *
 * Correct answers still auto-dismiss after 800ms (no friction on success).
 */

import React, { useRef, useEffect } from 'react';

interface Props {
  /** The main explanation text (e.g., "forte means Loud"). */
  explanation: string;
  /** Optional memory aid. */
  mnemonic?: string;
  /** Called when student taps "Got it". */
  onDismiss: () => void;
}

const CorrectiveFeedback: React.FC<Props> = ({ explanation, mnemonic, onDismiss }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll feedback into view when it appears — ensures "Got it" button is
  // reachable even when the challenge modal content overflows the viewport.
  useEffect(() => {
    containerRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div ref={containerRef} className="mt-3 rounded-lg bg-red-950/60 border border-red-800/50 px-4 py-3 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
      <p className="text-red-200 text-sm font-medium leading-relaxed">
        {explanation}
      </p>
      {mnemonic && (
        <p className="text-amber-300/90 text-xs italic leading-relaxed">
          {mnemonic}
        </p>
      )}
      <button
        onClick={onDismiss}
        data-testid="got-it-btn"
        className="w-full mt-1 py-2 rounded-lg bg-red-800/70 hover:bg-red-700/80 text-white text-sm font-semibold transition-colors active:scale-95"
      >
        Got it
      </button>
    </div>
  );
};

/** Simple "Correct!" banner — auto-dismiss is handled by the parent. */
export const CorrectBanner: React.FC = () => (
  <p className="font-bold text-lg text-green-400 mt-2">Correct!</p>
);

export default CorrectiveFeedback;
