import * as React from 'react';
import { cn } from '@/lib/utils';
import { BottomTabs } from '@/components/bottom-tabs';

export function AppShell({
  children,
  showTabs = true,
  className,
}: {
  children: React.ReactNode;
  showTabs?: boolean;
  className?: string;
}) {
  return (
    <main className="min-h-dvh bg-stone-100 text-stone-950">
      <div
        className={cn(
          'mx-auto min-h-dvh w-full max-w-[480px] bg-stone-50 shadow-sm',
          showTabs && 'pb-[calc(76px+env(safe-area-inset-bottom))]',
          className,
        )}
      >
        {children}
        {showTabs ? <BottomTabs /> : null}
      </div>
    </main>
  );
}
