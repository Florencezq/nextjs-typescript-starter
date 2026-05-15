'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, LogIn } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMockAuth } from '@/hooks/use-mock-auth';
import {
  Book,
  StudyWordView,
  Word,
  toStudyWordView,
} from '@/lib/mock-data';
import {
  BookProgress,
  completeWord,
  ensureBookProgress,
  getNextWord,
} from '@/lib/mock-store';

export function StudyScreen({
  book,
  words,
}: {
  book: Book | null;
  words: Word[];
}) {
  const router = useRouter();
  const auth = useMockAuth();
  const [progress, setProgress] = React.useState<BookProgress | null>(null);
  const [word, setWord] = React.useState<StudyWordView | null>(null);
  const [completed, setCompleted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const bookId = book?.bookId ?? '';

  React.useEffect(() => {
    if (!auth.ready || !auth.isLoggedIn || !book) return;

    const nextProgress = ensureBookProgress(book.bookId, book, words);
    const nextWord = nextProgress
      ? getNextWord(book.bookId, nextProgress.currentWordRank, words)
      : null;

    setProgress(nextProgress);
    setWord(nextWord ? toStudyWordView(nextWord) : null);
    setCompleted(isCompleted(nextProgress, words, nextWord));
  }, [auth.isLoggedIn, auth.ready, book, words]);

  if (!book) {
    return (
      <AppShell showTabs={false}>
        <div className="flex min-h-dvh flex-col px-4 py-5">
          <TopBar title="单词书不存在" />
          <Card className="mt-8 p-5">
            <p className="text-sm leading-6 text-stone-600">
              没有找到这本单词书，请返回首页重新选择。
            </p>
            <Button className="mt-5" onClick={() => router.push('/')}>
              返回首页
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (auth.ready && !auth.isLoggedIn) {
    return (
      <AppShell showTabs={false}>
        <div className="flex min-h-dvh flex-col px-4 py-5">
          <TopBar title={book.title} />
          <Card className="mt-8 p-5">
            <h1 className="text-xl font-semibold">请先登录</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              登录后才能开始学习，并保存这本书的进度。
            </p>
            <Button
              className="mt-5 w-full"
              onClick={() =>
                router.push(`/mine?auth=login&redirect=/study/${book.bookId}`)
              }
            >
              <LogIn className="h-4 w-4" />
              去登录
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  const totalWords = progress?.totalWords ?? book.wordCount;
  const learnedCount = progress?.learnedCount ?? 0;
  const progressValue =
    totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

  function handleNext() {
    if (!word || !book) return;

    setSaving(true);

    window.setTimeout(() => {
      const nextProgress = completeWord(bookId, word.id, book, words);
      const nextWord = nextProgress
        ? getNextWord(bookId, nextProgress.currentWordRank, words)
        : null;

      setProgress(nextProgress);
      setWord(nextWord ? toStudyWordView(nextWord) : null);
      setCompleted(isCompleted(nextProgress, words, nextWord));
      setSaving(false);
    }, 250);
  }

  return (
    <AppShell showTabs={false}>
      <div className="flex min-h-dvh flex-col px-4 py-5">
        <TopBar title={book.title} meta={`${learnedCount}/${totalWords}`} />

        <div className="mt-5">
          <Progress value={progressValue} />
        </div>

        {completed ? (
          <div className="flex flex-1 items-center">
            <Card className="w-full p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h1 className="mt-5 text-2xl font-semibold">本书已学习完成</h1>
              <p className="mt-3 text-sm text-stone-500">
                已学 {totalWords} / {totalWords}
              </p>
              <Button className="mt-6 w-full" onClick={() => router.push('/')}>
                返回首页
              </Button>
            </Card>
          </div>
        ) : word ? (
          <div className="flex flex-1 flex-col justify-between py-6">
            <StudyWordCard bookId={bookId} word={word} />

            <Button
              className="h-12 w-full"
              disabled={saving}
              onClick={handleNext}
              type="button"
            >
              {saving ? '保存中' : '下一个'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full p-5 text-center">
              <p className="text-base font-semibold text-stone-950">
                {words.length > 0 ? '正在准备单词' : '单词数据未导入'}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {words.length > 0
                  ? '如果页面停留太久，请返回首页后重新进入。'
                  : `这本书在 books 表中存在，但 words 表里还没有 book_id = ${book.bookId} 的单词。导入后会从第一个单词开始学习。`}
              </p>
              <Button className="mt-5 w-full" onClick={() => router.push('/')}>
                返回首页
              </Button>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function isCompleted(
  progress: BookProgress | null,
  words: Word[],
  nextWord: Word | null,
) {
  return Boolean(
    progress &&
      words.length > 0 &&
      !nextWord &&
      progress.learnedCount >= words.length,
  );
}

function TopBar({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex h-10 items-center justify-between gap-3">
      <Link
        aria-label="返回首页"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100"
        href="/"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-semibold text-stone-950">{title}</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-end text-sm text-stone-500">
        {meta}
      </div>
    </div>
  );
}

function StudyWordCard({
  bookId,
  word,
}: {
  bookId: string;
  word: StudyWordView;
}) {
  return (
    <Card className="-mx-4 rounded-none border-x-0 p-6">
      <Link
        className="block text-center"
        href={`/word/${word.id}?from=/study/${bookId}`}
      >
        <h1 className="break-words text-4xl font-semibold leading-tight text-stone-950">
          {word.headWord}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-stone-500">
          {word.ukphone ? <span>UK {word.ukphone}</span> : null}
          {word.usphone ? <span>US {word.usphone}</span> : null}
        </div>
      </Link>

      <div className="mt-8 rounded-md bg-stone-50 p-4">
        <p className="text-base font-medium leading-7 text-stone-950">
          {word.pos ? `${word.pos}. ` : ''}
          {word.tranCn ?? '暂无释义'}
        </p>
      </div>

      {word.sentence ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm leading-6 text-stone-700">{word.sentence.en}</p>
          <p className="text-sm leading-6 text-stone-500">{word.sentence.cn}</p>
        </div>
      ) : null}
    </Card>
  );
}
