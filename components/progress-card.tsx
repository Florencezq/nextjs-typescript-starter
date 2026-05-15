'use client';

import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BookProgress } from '@/lib/data/progress';
import type { Book } from '@/lib/mock-data';

export function ProgressCard({
  book,
  progress,
  onClick,
}: {
  book: Book;
  progress: BookProgress;
  onClick: () => void;
}) {
  const value =
    progress.totalWords > 0
      ? Math.round((progress.learnedCount / progress.totalWords) * 100)
      : 0;

  return (
    <button className="block w-full text-left" onClick={onClick} type="button">
      <Card className="p-4 transition-colors hover:bg-stone-50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold">{book.title}</h3>
            <div className="mt-3 flex items-center gap-3">
              <Progress className="flex-1" value={value} />
              <span className="w-16 text-right text-sm text-stone-500">
                {progress.learnedCount} / {progress.totalWords}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-stone-400" />
        </div>
      </Card>
    </button>
  );
}
