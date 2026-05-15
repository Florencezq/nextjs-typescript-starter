'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BookCard } from '@/components/book-card';
import { RecentStudyCard } from '@/components/recent-study-card';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { useProgressList } from '@/hooks/use-progress';
import { Book, getBook, toStudyWordView } from '@/lib/mock-data';
import {
  ensureBookProgress,
  getBookProgress,
  getNextWord,
} from '@/lib/mock-store';

export function HomeScreen({ books }: { books: Book[] }) {
  const router = useRouter();
  const auth = useMockAuth();
  const { progress, recentProgress } = useProgressList();
  const recentBook = recentProgress
    ? books.find((book) => book.bookId === recentProgress.bookId) ??
      getBook(recentProgress.bookId)
    : null;
  const nextRecentWord =
    recentProgress && recentBook
      ? getNextWord(recentProgress.bookId, recentProgress.currentWordRank)
      : null;

  function openBook(book: Book) {
    if ((book.availableWordCount ?? book.wordCount) === 0) return;

    if (!auth.isLoggedIn) {
      router.push(`/mine?auth=login&redirect=/study/${book.bookId}`);
      return;
    }

    ensureBookProgress(book.bookId, book);
    router.push(`/study/${book.bookId}`);
  }

  return (
    <AppShell>
      <div className="space-y-7 px-4 py-6">
        <header>
          <p className="text-sm font-medium text-stone-500">
            {auth.isLoggedIn ? '继续保持一点点学习节奏' : '选择一本单词书开始学习'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
            首页
          </h1>
        </header>

        {auth.isLoggedIn && recentProgress && recentBook ? (
          <section className="space-y-3">
            <RecentStudyCard
              book={recentBook}
              nextWord={nextRecentWord ? toStudyWordView(nextRecentWord) : null}
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
                    auth.isLoggedIn
                      ? progress.find((item) => item.bookId === book.bookId) ??
                        getBookProgress(book.bookId)
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
