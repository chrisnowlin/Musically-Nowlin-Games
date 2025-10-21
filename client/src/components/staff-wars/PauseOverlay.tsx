import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">
            ⏸️ Paused
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={onResume}
            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
          >
            Resume Game
          </Button>

          <Button
            onClick={onQuit}
            className="w-full h-12 text-lg font-bold bg-slate-600 hover:bg-slate-700 text-white"
          >
            Quit to Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

