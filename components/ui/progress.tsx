import * as React from 'react';
import { cn } from '@/lib/utils';

export function Progress({
  value = 0,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-stone-100',
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="h-full rounded-full bg-stone-950 transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
