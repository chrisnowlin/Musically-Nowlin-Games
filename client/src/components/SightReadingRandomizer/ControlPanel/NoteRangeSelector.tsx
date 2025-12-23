/**
 * Note Range Selector Component
 * Grid of toggleable notes for selecting available pitch range
 * Shows notes based on current clef (Treble: C4-A5, Bass: E2-C4)
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClefType } from '@/lib/rhythmRandomizer/types';

export type NotePitch = string; // e.g., 'C4', 'D#4', 'Eb5'

interface NoteRangeSelectorProps {
  clef: ClefType;
  selectedNotes: NotePitch[];
  onNotesChange: (notes: NotePitch[]) => void;
}

interface NoteOption {
  pitch: NotePitch;
  displayName: string;
  vexflowKey: string;
  isDiatonic: boolean; // true for natural notes in C major
}

// Treble clef range: C4 to A5
const TREBLE_NOTES: NoteOption[] = [
  // C4 octave
  { pitch: 'C4', displayName: 'C4', vexflowKey: 'c/4', isDiatonic: true },
  { pitch: 'C#4', displayName: 'C#4 / Db4', vexflowKey: 'c#/4', isDiatonic: false },
  { pitch: 'D4', displayName: 'D4', vexflowKey: 'd/4', isDiatonic: true },
  { pitch: 'D#4', displayName: 'D#4 / Eb4', vexflowKey: 'd#/4', isDiatonic: false },
  { pitch: 'E4', displayName: 'E4', vexflowKey: 'e/4', isDiatonic: true },
  { pitch: 'F4', displayName: 'F4', vexflowKey: 'f/4', isDiatonic: true },
  { pitch: 'F#4', displayName: 'F#4 / Gb4', vexflowKey: 'f#/4', isDiatonic: false },
  { pitch: 'G4', displayName: 'G4', vexflowKey: 'g/4', isDiatonic: true },
  { pitch: 'G#4', displayName: 'G#4 / Ab4', vexflowKey: 'g#/4', isDiatonic: false },
  { pitch: 'A4', displayName: 'A4', vexflowKey: 'a/4', isDiatonic: true },
  { pitch: 'A#4', displayName: 'A#4 / Bb4', vexflowKey: 'a#/4', isDiatonic: false },
  { pitch: 'B4', displayName: 'B4', vexflowKey: 'b/4', isDiatonic: true },
  // C5 octave
  { pitch: 'C5', displayName: 'C5', vexflowKey: 'c/5', isDiatonic: true },
  { pitch: 'C#5', displayName: 'C#5 / Db5', vexflowKey: 'c#/5', isDiatonic: false },
  { pitch: 'D5', displayName: 'D5', vexflowKey: 'd/5', isDiatonic: true },
  { pitch: 'D#5', displayName: 'D#5 / Eb5', vexflowKey: 'd#/5', isDiatonic: false },
  { pitch: 'E5', displayName: 'E5', vexflowKey: 'e/5', isDiatonic: true },
  { pitch: 'F5', displayName: 'F5', vexflowKey: 'f/5', isDiatonic: true },
  { pitch: 'F#5', displayName: 'F#5 / Gb5', vexflowKey: 'f#/5', isDiatonic: false },
  { pitch: 'G5', displayName: 'G5', vexflowKey: 'g/5', isDiatonic: true },
  { pitch: 'G#5', displayName: 'G#5 / Ab5', vexflowKey: 'g#/5', isDiatonic: false },
  { pitch: 'A5', displayName: 'A5', vexflowKey: 'a/5', isDiatonic: true },
];

// Bass clef range: E2 to C4
const BASS_NOTES: NoteOption[] = [
  // E2 to B2
  { pitch: 'E2', displayName: 'E2', vexflowKey: 'e/2', isDiatonic: true },
  { pitch: 'F2', displayName: 'F2', vexflowKey: 'f/2', isDiatonic: true },
  { pitch: 'F#2', displayName: 'F#2 / Gb2', vexflowKey: 'f#/2', isDiatonic: false },
  { pitch: 'G2', displayName: 'G2', vexflowKey: 'g/2', isDiatonic: true },
  { pitch: 'G#2', displayName: 'G#2 / Ab2', vexflowKey: 'g#/2', isDiatonic: false },
  { pitch: 'A2', displayName: 'A2', vexflowKey: 'a/2', isDiatonic: true },
  { pitch: 'A#2', displayName: 'A#2 / Bb2', vexflowKey: 'a#/2', isDiatonic: false },
  { pitch: 'B2', displayName: 'B2', vexflowKey: 'b/2', isDiatonic: true },
  // C3 octave
  { pitch: 'C3', displayName: 'C3', vexflowKey: 'c/3', isDiatonic: true },
  { pitch: 'C#3', displayName: 'C#3 / Db3', vexflowKey: 'c#/3', isDiatonic: false },
  { pitch: 'D3', displayName: 'D3', vexflowKey: 'd/3', isDiatonic: true },
  { pitch: 'D#3', displayName: 'D#3 / Eb3', vexflowKey: 'd#/3', isDiatonic: false },
  { pitch: 'E3', displayName: 'E3', vexflowKey: 'e/3', isDiatonic: true },
  { pitch: 'F3', displayName: 'F3', vexflowKey: 'f/3', isDiatonic: true },
  { pitch: 'F#3', displayName: 'F#3 / Gb3', vexflowKey: 'f#/3', isDiatonic: false },
  { pitch: 'G3', displayName: 'G3', vexflowKey: 'g/3', isDiatonic: true },
  { pitch: 'G#3', displayName: 'G#3 / Ab3', vexflowKey: 'g#/3', isDiatonic: false },
  { pitch: 'A3', displayName: 'A3', vexflowKey: 'a/3', isDiatonic: true },
  { pitch: 'A#3', displayName: 'A#3 / Bb3', vexflowKey: 'a#/3', isDiatonic: false },
  { pitch: 'B3', displayName: 'B3', vexflowKey: 'b/3', isDiatonic: true },
  // C4
  { pitch: 'C4', displayName: 'C4', vexflowKey: 'c/4', isDiatonic: true },
];

export function NoteRangeSelector({ clef, selectedNotes, onNotesChange }: NoteRangeSelectorProps) {
  const availableNotes = clef === 'treble' ? TREBLE_NOTES : BASS_NOTES;

  const handleNoteToggle = (pitch: NotePitch) => {
    if (selectedNotes.includes(pitch)) {
      // Don't allow deselecting the last note
      if (selectedNotes.length > 1) {
        onNotesChange(selectedNotes.filter((n) => n !== pitch));
      }
    } else {
      onNotesChange([...selectedNotes, pitch]);
    }
  };

  const handleSelectAll = () => {
    onNotesChange(availableNotes.map((n) => n.pitch));
  };

  const handleClear = () => {
    // Keep at least one note selected (first note)
    onNotesChange([availableNotes[0].pitch]);
  };

  const handleDiatonicOnly = () => {
    const diatonicNotes = availableNotes.filter((n) => n.isDiatonic).map((n) => n.pitch);
    onNotesChange(diatonicNotes);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Note Range ({clef === 'treble' ? 'C4-A5' : 'E2-C4'})</Label>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="h-7 text-xs px-2"
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiatonicOnly}
            className="h-7 text-xs px-2"
          >
            Diatonic
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="h-7 text-xs px-2"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Note grid - 3 columns for better visibility */}
      <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto p-1">
        {availableNotes.map((note) => {
          const isSelected = selectedNotes.includes(note.pitch);
          const isAccidental = !note.isDiatonic;

          return (
            <label
              key={note.pitch}
              className={`
                flex items-center gap-1.5 p-1.5 rounded border cursor-pointer transition-colors text-xs
                ${
                  isSelected
                    ? isAccidental
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleNoteToggle(note.pitch)}
                className="h-3 w-3"
              />
              <span className="font-medium truncate">{note.displayName}</span>
            </label>
          );
        })}
      </div>

      {/* Selected count indicator */}
      <div className="text-xs text-gray-500 text-center">
        {selectedNotes.length} of {availableNotes.length} notes selected
      </div>
    </div>
  );
}
