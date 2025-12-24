/**
 * Share Button Component
 * Copy shareable URL to clipboard
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { RhythmSettings } from '@/lib/rhythmRandomizerV3/types';
import { generateShareUrl, copyShareUrl } from '@/lib/rhythmRandomizerV3/shareUtils';

interface ShareButtonProps {
  settings: RhythmSettings;
}

export function ShareButton({ settings }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = generateShareUrl(settings);

  const handleCopy = async () => {
    const success = await copyShareUrl(settings);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Share Settings</h4>
            <p className="text-xs text-gray-500">
              Copy this link to share your current rhythm settings
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="text-xs h-9"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-3"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {copied && (
            <p className="text-xs text-green-600 font-medium">
              Link copied to clipboard!
            </p>
          )}

          <div className="text-xs text-gray-400 border-t pt-2">
            Settings included: time signature, tempo, note values, density, and more
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
