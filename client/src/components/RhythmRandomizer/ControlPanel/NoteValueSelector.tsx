/**
 * Note Value Selector Component
 * Checkbox grid for selecting allowed note values and rest values
 * Uses Bravura font with SMuFL codepoints for consistent music notation display
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NoteValue, RestValue } from '@/lib/rhythmRandomizer/types';

interface NoteValueSelectorProps {
  selectedValues: NoteValue[];
  selectedRestValues: RestValue[];
  onNoteValuesChange: (values: NoteValue[]) => void;
  onRestValuesChange: (values: RestValue[]) => void;
}

interface NoteOption {
  value: NoteValue;
  label: string;
  symbol: string;
  beats: string;
}

interface RestOption {
  value: RestValue;
  label: string;
  symbol: string;
  beats: string;
}

// SMuFL codepoints for Bravura font
// Individual notes range: U+E1D0-U+E1EF
// Rests range: U+E4E0-U+E4FF
// Text-combining beamed notes: U+E1F0-U+E20A
// Structure: firstNote + continuingBeam(s) + lastNoteWithFractionalBeam
const NOTE_OPTIONS: NoteOption[] = [
  { value: 'whole', label: 'Whole', symbol: '\uE1D2', beats: '4 beats' },              // noteWhole
  { value: 'half', label: 'Half', symbol: '\uE1D3', beats: '2 beats' },                // noteHalfUp
  { value: 'quarter', label: 'Quarter', symbol: '\uE1D5', beats: '1 beat' },           // noteQuarterUp
  { value: 'eighth', label: 'Eighth', symbol: '\uE1D7', beats: '½ beat' },             // note8thUp
  // Two eighths: blackNote + cont8thBeam + fractional8th (long stems)
  { value: 'twoEighths', label: '2 Eighths', symbol: '\uE1F1\uE1F8\uE1F3', beats: '1 beat' },
  { value: 'sixteenth', label: 'Sixteenth', symbol: '\uE1D9', beats: '¼ beat' },       // note16thUp
  // Two 16ths: Try simpler sequence - blackNote + cont16thBeam + fractional16th
  { value: 'twoSixteenths', label: '2 Sixteenths', symbol: '\uE1F1\uE1FA\uE1F5', beats: '½ beat' },
  // Four 16ths: blackNote + beams + fractional, repeated
  { value: 'fourSixteenths', label: '4 Sixteenths', symbol: '\uE1F1\uE1FA\uE1F5\uE1F1\uE1FA\uE1F5', beats: '1 beat' },
  { value: 'dottedHalf', label: 'Dotted Half', symbol: '\uE1D3\uE1E7', beats: '3 beats' },     // noteHalfUp + augmentationDot
  { value: 'dottedQuarter', label: 'Dotted Quarter', symbol: '\uE1D5\uE1E7', beats: '1½ beats' },
  { value: 'dottedEighth', label: 'Dotted Eighth', symbol: '\uE1D7\uE1E7', beats: '¾ beat' },
];

const REST_OPTIONS: RestOption[] = [
  { value: 'wholeRest', label: 'Whole Rest', symbol: '\uE4E3', beats: '4 beats' },     // restWhole
  { value: 'halfRest', label: 'Half Rest', symbol: '\uE4E4', beats: '2 beats' },       // restHalf
  { value: 'quarterRest', label: 'Quarter Rest', symbol: '\uE4E5', beats: '1 beat' },  // restQuarter
  { value: 'eighthRest', label: 'Eighth Rest', symbol: '\uE4E6', beats: '½ beat' },    // rest8th
  { value: 'sixteenthRest', label: 'Sixteenth Rest', symbol: '\uE4E7', beats: '¼ beat' }, // rest16th
];

export function NoteValueSelector({
  selectedValues,
  selectedRestValues,
  onNoteValuesChange,
  onRestValuesChange
}: NoteValueSelectorProps) {
  const handleNoteToggle = (noteValue: NoteValue) => {
    if (selectedValues.includes(noteValue)) {
      // Don't allow deselecting the last note value
      if (selectedValues.length > 1) {
        onNoteValuesChange(selectedValues.filter((v) => v !== noteValue));
      }
    } else {
      onNoteValuesChange([...selectedValues, noteValue]);
    }
  };

  const handleRestToggle = (restValue: RestValue) => {
    if (selectedRestValues.includes(restValue)) {
      onRestValuesChange(selectedRestValues.filter((v) => v !== restValue));
    } else {
      onRestValuesChange([...selectedRestValues, restValue]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Notes Section */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Notes</Label>
        <div className="grid grid-cols-2 gap-2">
          {NOTE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                ${selectedValues.includes(option.value)
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onCheckedChange={() => handleNoteToggle(option.value)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl leading-none flex-shrink-0"
                    style={{
                      // Use Bravura Text for beamed groups (has proper kerning), regular Bravura for single notes
                      fontFamily: ['twoEighths', 'twoSixteenths', 'fourSixteenths'].includes(option.value)
                        ? '"Bravura Text", Bravura, serif'
                        : 'Bravura, serif',
                      fontKerning: 'normal',
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      textRendering: 'optimizeLegibility',
                      // Calibrated letter-spacing for each beamed group type
                      letterSpacing: option.value === 'twoEighths' ? '-0.28em'
                        : option.value === 'twoSixteenths' ? '-0.48em'
                        : option.value === 'fourSixteenths' ? '-0.48em'
                        : 'normal',
                    }}
                  >
                    {option.symbol}
                  </span>
                  <span className="text-sm font-medium truncate">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500">{option.beats}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Rests Section */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Rests</Label>
        <div className="grid grid-cols-2 gap-2">
          {REST_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                ${selectedRestValues.includes(option.value)
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Checkbox
                checked={selectedRestValues.includes(option.value)}
                onCheckedChange={() => handleRestToggle(option.value)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl leading-none flex-shrink-0"
                    style={{
                      fontFamily: 'Bravura, serif',
                      fontKerning: 'normal',
                      fontFeatureSettings: '"kern" 1, "liga" 1',
                      textRendering: 'optimizeLegibility',
                    }}
                  >
                    {option.symbol}
                  </span>
                  <span className="text-sm font-medium truncate">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500">{option.beats}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
