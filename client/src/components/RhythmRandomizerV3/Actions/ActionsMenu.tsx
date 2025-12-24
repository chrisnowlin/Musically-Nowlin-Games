/**
 * Actions Menu Component
 * Dropdown menu for Share, Print, and Worksheet Export
 */

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RhythmSettings } from '@/lib/rhythmRandomizerV3/types';
import { WorksheetBuilder } from '../Worksheet/WorksheetBuilder';

interface ActionsMenuProps {
  settings: RhythmSettings;
}

export function ActionsMenu({ settings }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
          Export & Share
        </div>

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <div className="w-full">
            <WorksheetBuilder rhythmSettings={settings} />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
