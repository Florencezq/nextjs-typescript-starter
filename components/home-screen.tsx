'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BookCard } from '@/components/book-card';
import { RecentStudyCard } from '@/components/recent-study-card';
import type { AuthUser, BookProgress } from '@/lib/data/progress';
import type { Book, StudyWordView } from '@/lib/mock-data';

export function HomeScreen({
  books,
  progress,
  recentProgress,
  nextRecentWord,
  user,
}: {
  books: Book[];
  progress: BookProgress[];
  recentProgress: BookProgress | null;
  nextRecentWord: StudyWordView | null;
  user: AuthUser | null;
}) {
  const router = useRouter();
  const recentBook = recentProgress
    ? books.find((book) => book.bookId === recentProgress.bookId) ?? null
    : null;

  function openBook(book: Book) {
    if ((book.availableWordCount ?? book.wordCount) === 0) return;

    if (!user) {
      router.push(`/mine?auth=login&redirect=/study/${book.bookId}`);
      return;
    }

    router.push(`/study/${book.bookId}`);
  }

  return (
    <AppShell>
      <div className="space-y-7 px-4 py-6">
        <header>
          <p className="text-sm font-medium text-stone-500">
            {user ? '继续保持一点点学习节奏' : '选择一本单词书开始学习'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
            首页
          </h1>
        </header>

        {user && recentProgress && recentBook ? (
          <section className="space-y-3">
            <RecentStudyCard
              book={recentBook}
              nextWord={nextRecentWord}
              onClick={() => openBook(recentBook)}
              progress={recentProgress}
            />
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">
                全部单词书
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {books.length} 本可学习单词书
              </p>
            </div>
          </div>

          {books.length > 0 ? (
            <div className="space-y-3">
              {books.map((book) => (
                <BookCard
                  key={book.bookId}
                  book={book}
                  onClick={() => openBook(book)}
                  progress={
                    user
                      ? progress.find((item) => item.bookId === book.bookId) ??
                        null
                      : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
              暂无单词书
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
