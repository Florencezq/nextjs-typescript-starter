'use client';

import { ArrowRight, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BookProgress } from '@/lib/data/progress';
import type { Book, StudyWordView } from '@/lib/mock-data';

export function RecentStudyCard({
  book,
  progress,
  nextWord,
  onClick,
}: {
  book: Book;
  progress: BookProgress;
  nextWord?: StudyWordView | null;
  onClick: () => void;
}) {
  const progressValue =
    progress.totalWords > 0
      ? Math.round((progress.learnedCount / progress.totalWords) * 100)
      : 0;

  return (
    <Card className="overflow-hidden border-stone-900 bg-stone-950 text-white">
      <button className="block w-full p-4 text-left" onClick={onClick} type="button">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-stone-800 shadow-sm">
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- mock remote covers should not require image-domain config.
                <img
                  alt={`${book.title}封面`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={book.coverUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-medium text-stone-500">
                  单词书
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-stone-300">
                <Clock3 className="h-4 w-4" />
                最近学习
              </div>
              <h2 className="mt-3 truncate text-xl font-semibold">{book.title}</h2>
              <p className="mt-2 text-sm text-stone-300">
                已学 {progress.learnedCount} / 共 {progress.totalWords}
              </p>
              <p className="mt-1 text-sm text-stone-300">
                {progress.status === 'completed'
                  ? '这本书已经完成'
                  : `下一个：${nextWord?.headWord ?? '准备开始'}`}
              </p>
            </div>
          </div>
          <Button className="mt-1 bg-white text-stone-950 hover:bg-stone-100" size="sm">
            继续
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Progress
          className="mt-5 bg-stone-800 [&>div]:bg-white"
          value={progressValue}
        />
      </button>
    </Card>
  );
}
