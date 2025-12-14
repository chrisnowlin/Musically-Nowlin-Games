import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useViewport';
import { Play, X } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  const layout = useResponsiveLayout();

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      style={{ padding: `${layout.padding}px` }}
    >
      <Card
        className="bg-slate-900/90 border-slate-700 w-full shadow-2xl relative overflow-hidden"
        style={{
          maxWidth: `${Math.min(layout.maxContentWidth, 384)}px`,
          padding: 0
        }}
      >
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <CardHeader className="text-center pt-8 pb-2">
          <CardTitle
            className="font-bold text-white flex items-center justify-center gap-3"
            style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
          >
            <span className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              ⏸️
            </span>
            Paused
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <Button
            onClick={onResume}
            className="w-full font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20 h-14 rounded-xl text-lg transition-all hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Resume Mission
          </Button>

          <Button
            onClick={onQuit}
            variant="outline"
            className="w-full font-bold border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white h-12 rounded-xl"
          >
            <X className="w-5 h-5 mr-2" />
            Quit to Base
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

