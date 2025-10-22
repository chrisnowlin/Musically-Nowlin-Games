import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useViewport';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  const layout = useResponsiveLayout();

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      style={{ padding: `${layout.padding}px` }}
    >
      <Card
        className="bg-slate-800 border-slate-700 w-full"
        style={{
          maxWidth: `${Math.min(layout.maxContentWidth, 384)}px`,
          padding: `${layout.padding}px`
        }}
      >
        <CardHeader className="text-center" style={{ padding: `${layout.padding}px` }}>
          <CardTitle
            className="font-bold text-white"
            style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
          >
            ⏸️ Paused
          </CardTitle>
        </CardHeader>

        <CardContent
          style={{
            padding: `${layout.padding}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${layout.gridGap}px`
          }}
        >
          <Button
            onClick={onResume}
            className="w-full font-bold bg-green-600 hover:bg-green-700 text-white touch-target"
            style={{
              height: `${Math.max(layout.padding * 2, 48)}px`,
              fontSize: `${layout.getFontSize('lg')}px`
            }}
          >
            Resume Game
          </Button>

          <Button
            onClick={onQuit}
            className="w-full font-bold bg-slate-600 hover:bg-slate-700 text-white touch-target"
            style={{
              height: `${Math.max(layout.padding * 2, 48)}px`,
              fontSize: `${layout.getFontSize('lg')}px`
            }}
          >
            Quit to Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

