/**
 * Worksheet Builder Component
 * Configure and export rhythm worksheets as PDF
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileDown, Loader2 } from 'lucide-react';
import {
  WorksheetSettings,
  WorksheetFormat,
  RhythmSettings,
  DEFAULT_WORKSHEET_SETTINGS,
} from '@/lib/rhythmRandomizer/types';
import {
  downloadWorksheetPdf,
  getWorksheetFormatName,
  getWorksheetFormatDescription,
} from '@/lib/rhythmRandomizer/worksheetGenerator';

interface WorksheetBuilderProps {
  rhythmSettings: RhythmSettings;
}

const WORKSHEET_FORMATS: WorksheetFormat[] = ['standard', 'blankCompletion', 'quiz'];
const VARIANT_OPTIONS = [1, 2, 3, 4] as const;

export function WorksheetBuilder({ rhythmSettings }: WorksheetBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [worksheetSettings, setWorksheetSettings] = useState<WorksheetSettings>(
    DEFAULT_WORKSHEET_SETTINGS
  );

  const updateSetting = <K extends keyof WorksheetSettings>(
    key: K,
    value: WorksheetSettings[K]
  ) => {
    setWorksheetSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadWorksheetPdf(rhythmSettings, worksheetSettings);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to export worksheet:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" />
          Export Worksheet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Worksheet</DialogTitle>
          <DialogDescription>
            Generate a printable PDF worksheet for rhythm practice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Worksheet Title</Label>
            <Input
              id="title"
              value={worksheetSettings.title}
              onChange={(e) => updateSetting('title', e.target.value)}
              placeholder="Rhythm Practice"
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Worksheet Format</Label>
            <Select
              value={worksheetSettings.format}
              onValueChange={(v) => updateSetting('format', v as WorksheetFormat)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {WORKSHEET_FORMATS.map((format) => (
                  <SelectItem key={format} value={format}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {getWorksheetFormatName(format)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getWorksheetFormatDescription(format)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of exercises */}
          <div className="space-y-2">
            <Label>Number of Exercises</Label>
            <Select
              value={String(worksheetSettings.difficultyVariants)}
              onValueChange={(v) =>
                updateSetting('difficultyVariants', Number(v) as 1 | 2 | 3 | 4)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} exercise{n > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="answer-key" className="cursor-pointer">
                Include Answer Key
              </Label>
              <Switch
                id="answer-key"
                checked={worksheetSettings.includeAnswerKey}
                onCheckedChange={(checked) =>
                  updateSetting('includeAnswerKey', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="syllables" className="cursor-pointer">
                Include Counting Syllables
              </Label>
              <Switch
                id="syllables"
                checked={worksheetSettings.includeSyllables}
                onCheckedChange={(checked) =>
                  updateSetting('includeSyllables', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="name-field" className="cursor-pointer">
                Include Name Field
              </Label>
              <Switch
                id="name-field"
                checked={worksheetSettings.includeNameField}
                onCheckedChange={(checked) =>
                  updateSetting('includeNameField', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="date-field" className="cursor-pointer">
                Include Date Field
              </Label>
              <Switch
                id="date-field"
                checked={worksheetSettings.includeDateField}
                onCheckedChange={(checked) =>
                  updateSetting('includeDateField', checked)
                }
              />
            </div>
          </div>

          {/* Preview info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <div className="font-medium mb-1">Current Settings:</div>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Time Signature: {rhythmSettings.timeSignature}</li>
              <li>Tempo: {rhythmSettings.tempo} BPM</li>
              <li>Measures per exercise: {rhythmSettings.measureCount}</li>
              <li>
                Counting System:{' '}
                {rhythmSettings.countingSystem === 'none'
                  ? 'None'
                  : rhythmSettings.countingSystem}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
