'use client';

import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book } from '@/lib/mock-data';
import { BookProgress } from '@/lib/mock-store';

export function BookCard({
  book,
  progress,
  onClick,
}: {
  book: Book;
  progress?: BookProgress | null;
  onClick: () => void;
}) {
  const learnedCount = progress?.learnedCount ?? 0;
  const availableWordCount = book.availableWordCount ?? book.wordCount;
  const disabled = availableWordCount === 0;
  const progressValue =
    progress && progress.totalWords > 0
      ? Math.round((progress.learnedCount / progress.totalWords) * 100)
      : 0;

  return (
    <button
      className="block w-full text-left disabled:cursor-not-allowed"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Card className="p-4 transition-colors hover:bg-stone-50 disabled:opacity-60">
        <div className="flex items-start gap-4">
          <div className="h-24 w-[72px] shrink-0 overflow-hidden rounded-md bg-stone-100 shadow-sm">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- mock remote covers should not require image-domain config.
              <img
                alt={`${book.title}封面`}
                className="h-full w-full object-cover"
                loading="lazy"
                src={book.coverUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-medium text-stone-400">
                单词书
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-stone-950">
                {book.title}
              </h3>
              {progress?.status === 'completed' ? (
                <Badge className="bg-emerald-50 text-emerald-700">已完成</Badge>
              ) : null}
              {disabled ? (
                <Badge className="bg-amber-50 text-amber-700">待导入</Badge>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-stone-500">
              {book.wordCount} 个单词
              {progress ? ` · 已学 ${learnedCount}` : ''}
              {disabled ? ' · 单词数据未导入' : ''}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>

            {progress ? (
              <div className="mt-4 space-y-2">
                <Progress value={progressValue} />
                <p className="text-xs text-stone-500">
                  {progress.learnedCount} / {progress.totalWords}
                </p>
              </div>
            ) : null}
          </div>

          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-stone-400" />
        </div>
      </Card>
    </button>
  );
}
