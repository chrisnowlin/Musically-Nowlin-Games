/**
 * Print Button Component
 * Opens print-friendly view for current pattern
 */

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  onClick?: () => void;
}

export function PrintButton({ onClick }: PrintButtonProps) {
  const handlePrint = () => {
    if (onClick) {
      onClick();
    } else {
      window.print();
    }
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
      <Printer className="w-4 h-4" />
      Print
    </Button>
  );
}
