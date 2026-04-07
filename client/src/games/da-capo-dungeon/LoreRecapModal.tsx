/**
 * LoreRecapModal — Quick-review summary shown when a player starts at a
 * floor deeper than 1.  Presents all lore lessons from earlier floors in a
 * scrollable list so the student can catch up (or skip entirely).
 */

import React from 'react';
import type { LoreLesson } from './logic/loreData';

interface Props {
  lessons: LoreLesson[];
  startFloor: number;
  onClose: () => void;
}

const LoreRecapModal: React.FC<Props> = ({ lessons, startFloor, onClose }) => {
  if (lessons.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/90 to-gray-900/95 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center p-5 pb-2 shrink-0">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50 mb-2 inline-block">
            LORE RECAP
          </span>
          <h2 className="text-lg font-bold text-blue-200">
            Starting at B{startFloor}F
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Here&apos;s what you missed from earlier floors. Scroll to review, or skip to jump right in!
          </p>
        </div>

        {/* Scrollable lesson list */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 min-h-0">
          {lessons.map((lesson) => {
            const teachStep = lesson.steps.find(s => s.type === 'teach');
            return (
              <div
                key={lesson.id}
                className="rounded-lg bg-blue-900/30 border border-blue-800/40 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-blue-400 font-mono">B{lesson.gateFloor}F</span>
                  <h3 className="text-sm font-semibold text-blue-100">{lesson.title}</h3>
                </div>
                {teachStep && (
                  <p className="text-gray-300 text-xs leading-relaxed">{teachStep.body}</p>
                )}
                {teachStep?.detail && (
                  <p className="text-blue-300/70 text-xs italic mt-1">{teachStep.detail}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold text-sm transition-colors active:scale-95"
          >
            Got it — Enter the Dungeon!
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 py-1.5 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoreRecapModal;
