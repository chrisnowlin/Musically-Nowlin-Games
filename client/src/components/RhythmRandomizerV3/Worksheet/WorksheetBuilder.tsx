/**
 * Worksheet Builder Component
 * Configure and export rhythm worksheets as PDF with preview
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileDown,
  Loader2,
  Eye,
  Settings2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  WorksheetSettings,
  WorksheetFormat,
  RhythmSettings,
  DEFAULT_WORKSHEET_SETTINGS,
} from '@/lib/rhythmRandomizerV3/types';
import {
  downloadWorksheetPdf,
  generatePreviewUrl,
  getWorksheetFormatName,
  getWorksheetFormatDescription,
  PageSettings,
  PageSize,
  PageOrientation,
  DEFAULT_PAGE_SETTINGS,
} from '@/lib/rhythmRandomizerV3/worksheetGenerator';

interface WorksheetBuilderProps {
  rhythmSettings: RhythmSettings;
}

const WORKSHEET_FORMATS: WorksheetFormat[] = [
  'standard',
  'blankCompletion',
  'quiz',
];
const VARIANT_OPTIONS = [1, 2, 3, 4, 6, 8] as const;
const PAGE_SIZES: { value: PageSize; label: string }[] = [
  { value: 'letter', label: 'US Letter (8.5" × 11")' },
  { value: 'a4', label: 'A4 (210mm × 297mm)' },
  { value: 'legal', label: 'US Legal (8.5" × 14")' },
];
const PAGE_ORIENTATIONS: { value: PageOrientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

export function WorksheetBuilder({ rhythmSettings }: WorksheetBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  const previewUrlRef = useRef<string | null>(null);
  const hasGeneratedPreviewRef = useRef(false);

  const [worksheetSettings, setWorksheetSettings] = useState<WorksheetSettings>(
    DEFAULT_WORKSHEET_SETTINGS
  );
  const [pageSettings, setPageSettings] = useState<PageSettings>(
    DEFAULT_PAGE_SETTINGS
  );

  const updateWorksheetSetting = <K extends keyof WorksheetSettings>(
    key: K,
    value: WorksheetSettings[K]
  ) => {
    setWorksheetSettings((prev) => ({ ...prev, [key]: value }));
    // Mark preview as stale when settings change
    hasGeneratedPreviewRef.current = false;
  };

  const updatePageSetting = <K extends keyof PageSettings>(
    key: K,
    value: PageSettings[K]
  ) => {
    setPageSettings((prev) => ({ ...prev, [key]: value }));
    // Mark preview as stale when settings change
    hasGeneratedPreviewRef.current = false;
  };

  // Generate preview - stable function that doesn't depend on previewUrl state
  const generatePreview = useCallback(async () => {
    // Clean up previous URL using ref
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setIsGeneratingPreview(true);
    setPreviewError(null);

    try {
      const url = await generatePreviewUrl(
        rhythmSettings,
        worksheetSettings,
        pageSettings
      );
      previewUrlRef.current = url;
      setPreviewUrl(url);
      hasGeneratedPreviewRef.current = true;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewError(
        error instanceof Error ? error.message : 'Failed to generate preview'
      );
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [rhythmSettings, worksheetSettings, pageSettings]);

  // Generate preview only once when switching to preview tab (if not already generated)
  useEffect(() => {
    if (activeTab === 'preview' && isOpen && !hasGeneratedPreviewRef.current && !isGeneratingPreview) {
      generatePreview();
    }
  }, [activeTab, isOpen, generatePreview, isGeneratingPreview]);

  // Clean up preview URL when dialog closes
  useEffect(() => {
    if (!isOpen) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreviewUrl(null);
      hasGeneratedPreviewRef.current = false;
      setActiveTab('settings');
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadWorksheetPdf(rhythmSettings, worksheetSettings, pageSettings);
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
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Worksheet</DialogTitle>
          <DialogDescription>
            Generate a printable PDF worksheet with high-quality music notation
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'settings' | 'preview')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="settings"
            className="flex-1 overflow-y-auto mt-4 pr-2"
          >
            <div className="space-y-6">
              {/* Content Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content
                </h3>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Worksheet Title</Label>
                  <Input
                    id="title"
                    value={worksheetSettings.title}
                    onChange={(e) =>
                      updateWorksheetSetting('title', e.target.value)
                    }
                    placeholder="Rhythm Practice"
                  />
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <Label>Worksheet Format</Label>
                  <Select
                    value={worksheetSettings.format}
                    onValueChange={(v) =>
                      updateWorksheetSetting('format', v as WorksheetFormat)
                    }
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
                      updateWorksheetSetting(
                        'difficultyVariants',
                        Number(v) as WorksheetSettings['difficultyVariants']
                      )
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

                {/* Content toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="answer-key" className="cursor-pointer">
                      Include Answer Key
                    </Label>
                    <Switch
                      id="answer-key"
                      checked={worksheetSettings.includeAnswerKey}
                      onCheckedChange={(checked) =>
                        updateWorksheetSetting('includeAnswerKey', checked)
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
                        updateWorksheetSetting('includeSyllables', checked)
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
                        updateWorksheetSetting('includeNameField', checked)
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
                        updateWorksheetSetting('includeDateField', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Page Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileDown className="w-4 h-4" />
                  Page Layout
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Page Size */}
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Select
                      value={pageSettings.size}
                      onValueChange={(v) =>
                        updatePageSetting('size', v as PageSize)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orientation */}
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select
                      value={pageSettings.orientation}
                      onValueChange={(v) =>
                        updatePageSetting('orientation', v as PageOrientation)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_ORIENTATIONS.map((orient) => (
                          <SelectItem key={orient.value} value={orient.value}>
                            {orient.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Current Settings Info */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                <div className="font-medium mb-1">
                  Pattern Settings (from current rhythm):
                </div>
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
                  <li>
                    Staff Lines:{' '}
                    {rhythmSettings.staffLineMode === 'single'
                      ? 'Single line'
                      : 'Full staff (5 lines)'}
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="preview"
            className="flex-1 flex flex-col mt-4 min-h-0"
          >
            <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 relative" style={{ minHeight: '450px' }}>
              {isGeneratingPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Generating preview...
                    </span>
                  </div>
                </div>
              )}

              {previewError && !isGeneratingPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <span className="text-sm text-gray-600">{previewError}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generatePreview}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {previewUrl && !isGeneratingPreview && !previewError && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full absolute inset-0"
                  title="Worksheet Preview"
                  style={{ border: 'none' }}
                />
              )}

              {!previewUrl && !isGeneratingPreview && !previewError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Loading preview...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={isGeneratingPreview}
                className="gap-2"
              >
                {isGeneratingPreview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Refresh Preview
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
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
