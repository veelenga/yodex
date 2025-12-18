import { X } from 'lucide-react';
import { Button } from './button';

/**
 * Reusable exit button component with X icon
 * Designed to be placed in top-right corner of quiz views
 */
export function ExitButton({ onClick, className = '', variant = 'ghost' }) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={`h-8 w-8 p-0 hover:bg-destructive/10 ${className}`}
      aria-label="Exit quiz"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
