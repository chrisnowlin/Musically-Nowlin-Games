import { Button } from '@/components/ui/button';
import {
  Rabbit,
  Snail,
  Play,
  Repeat,
  Eye,
  Maximize2,
  Minimize2,
  Settings,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface SettingsPanelProps {
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  autoPlay: boolean;
  onAutoPlayToggle: () => void;
  loopMelody: boolean;
  onLoopMelodyToggle: () => void;
  showNoteNames: boolean;
  onShowNoteNamesToggle: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

export function SettingsPanel({
  playbackSpeed,
  onPlaybackSpeedChange,
  autoPlay,
  onAutoPlayToggle,
  loopMelody,
  onLoopMelodyToggle,
  showNoteNames,
  onShowNoteNamesToggle,
  isFullscreen,
  onFullscreenToggle,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSlowMode = playbackSpeed === 0.5;

  return (
    <div className="relative">
      {/* Settings Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm"
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
        aria-expanded={isOpen}
      >
        <Settings className="w-5 h-5" />
        <span className="sr-only md:not-sr-only">Settings</span>
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-label="Game settings"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Slow Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSlowMode ? (
                  <Snail className="w-5 h-5 text-blue-500" />
                ) : (
                  <Rabbit className="w-5 h-5 text-green-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slow Mode
                </span>
              </div>
              <button
                onClick={() => onPlaybackSpeedChange(isSlowMode ? 1.0 : 0.5)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${isSlowMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
                role="switch"
                aria-checked={isSlowMode}
                aria-label="Toggle slow mode"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm
                    ${isSlowMode ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Auto-Play Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-Play
                </span>
              </div>
              <button
                onClick={onAutoPlayToggle}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${autoPlay ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
                role="switch"
                aria-checked={autoPlay}
                aria-label="Toggle auto-play"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm
                    ${autoPlay ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Loop Melody Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loop Melody
                </span>
              </div>
              <button
                onClick={onLoopMelodyToggle}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${loopMelody ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
                role="switch"
                aria-checked={loopMelody}
                aria-label="Toggle loop melody"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm
                    ${loopMelody ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Show Note Names Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Note Names
                </span>
              </div>
              <button
                onClick={onShowNoteNamesToggle}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${showNoteNames ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
                role="switch"
                aria-checked={showNoteNames}
                aria-label="Toggle show note names"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm
                    ${showNoteNames ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fullscreen
                </span>
              </div>
              <button
                onClick={onFullscreenToggle}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${isFullscreen ? 'bg-gray-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
                role="switch"
                aria-checked={isFullscreen}
                aria-label="Toggle fullscreen"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm
                    ${isFullscreen ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keyboard: 1-4 select, Space play, Arrows navigate
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
