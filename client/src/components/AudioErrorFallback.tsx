import { AlertCircle, Volume2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

/**
 * Fallback UI component for audio initialization errors
 * 
 * Displays a user-friendly message when audio fails to initialize,
 * with helpful troubleshooting steps and retry option.
 * 
 * @example
 * ```tsx
 * {audioError && <AudioErrorFallback error={audioError} onRetry={initializeAudio} />}
 * ```
 */
export default function AudioErrorFallback({ error, onRetry }: AudioErrorFallbackProps) {
  const isPermissionError = error.message.includes('permission') || error.message.includes('blocked');
  const isUnsupportedError = error.message.includes('not supported');

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 max-w-md mx-auto">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Audio Not Available
          </h3>
          
          {isUnsupportedError ? (
            <div className="text-sm text-amber-800 space-y-2">
              <p>Your browser doesn't support Web Audio API.</p>
              <p className="font-medium">Try using:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Chrome, Firefox, Safari, or Edge</li>
                <li>A newer version of your current browser</li>
              </ul>
            </div>
          ) : isPermissionError ? (
            <div className="text-sm text-amber-800 space-y-2">
              <p>Audio is blocked by your browser.</p>
              <p className="font-medium">To fix this:</p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Check your browser's audio permissions</li>
                <li>Look for a speaker icon in the address bar</li>
                <li>Allow audio for this site</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          ) : (
            <div className="text-sm text-amber-800 space-y-2">
              <p>We couldn't start the audio system.</p>
              <p className="font-medium">Try these steps:</p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Check your device volume</li>
                <li>Make sure headphones are connected properly</li>
                <li>Close other apps using audio</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          )}

          {onRetry && !isUnsupportedError && (
            <div className="mt-4">
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-xs text-amber-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>Don't worry! You can still use the visual parts of the game.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

