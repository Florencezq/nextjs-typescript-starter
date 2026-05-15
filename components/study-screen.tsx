'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, LogIn } from 'lucide-react';
import { syncStudiedWordsAction } from '@/app/actions/study-actions';
import { AppShell } from '@/components/app-shell';
import { PronunciationButton } from '@/components/pronunciation-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BookProgress } from '@/lib/data/progress';
import type { Book, StudyWordView } from '@/lib/mock-data';

export function StudyScreen({
  book,
  completed: initialCompleted,
  loginRequired = false,
  progress: initialProgress,
  words: initialWords,
}: {
  book: Book | null;
  completed: boolean;
  loginRequired?: boolean;
  progress: BookProgress | null;
  words: StudyWordView[];
}) {
  const router = useRouter();
  const [progress, setProgress] =
    React.useState<BookProgress | null>(initialProgress);
  const [words, setWords] = React.useState<StudyWordView[]>(initialWords);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [completed, setCompleted] = React.useState(initialCompleted);
  const [error, setError] = React.useState('');
  const [syncing, setSyncing] = React.useState(false);
  const [waitingForMore, setWaitingForMore] = React.useState(false);
  const pendingWordIdsRef = React.useRef<number[]>([]);
  const syncTimerRef = React.useRef<number | null>(null);
  const wordsRef = React.useRef(initialWords);
  const currentIndexRef = React.useRef(0);
  const bookId = book?.bookId ?? '';
  const word = words[currentIndex] ?? null;

  React.useEffect(() => {
    setProgress(initialProgress);
    setWords(initialWords);
    setCurrentIndex(0);
    setCompleted(initialCompleted);
    setError('');
    setWaitingForMore(false);
    pendingWordIdsRef.current = [];
  }, [initialCompleted, initialProgress, initialWords]);

  React.useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const flushProgress = React.useCallback(async () => {
    if (!bookId || pendingWordIdsRef.current.length === 0) return;

    const wordIds = Array.from(new Set(pendingWordIdsRef.current));
    pendingWordIdsRef.current = [];
    setSyncing(true);

    const tailRank = wordsRef.current.at(-1)?.wordRank ?? 0;
    const result = await syncStudiedWordsAction(bookId, wordIds, tailRank);

    setSyncing(false);

    if (!result.ok) {
      pendingWordIdsRef.current = [...wordIds, ...pendingWordIdsRef.current];
      setError(result.message);
      return;
    }

    setProgress(result.progress);
    setWords((currentWords) => {
      const existingIds = new Set(currentWords.map((item) => item.id));
      const freshWords = result.words.filter((item) => !existingIds.has(item.id));
      return freshWords.length > 0 ? [...currentWords, ...freshWords] : currentWords;
    });

    const noLocalNext =
      currentIndexRef.current >= wordsRef.current.length &&
      result.words.length === 0;
    setWaitingForMore(false);
    setCompleted(result.completed && noLocalNext);
  }, [bookId]);

  React.useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }

      void flushProgress();
    };
  }, [flushProgress]);

  function scheduleSync({ soon = false }: { soon?: boolean } = {}) {
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(
      () => {
        syncTimerRef.current = null;
        void flushProgress();
      },
      soon ? 0 : 800,
    );
  }

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

  if (loginRequired) {
    return (
      <AppShell showTabs={false}>
        <div className="flex min-h-dvh flex-col px-4 py-5">
          <TopBar title={book?.title ?? '开始学习'} />
          <Card className="mt-8 p-5">
            <h1 className="text-xl font-semibold">请先登录</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              登录后才能开始学习，并保存这本书的进度。
            </p>
            <Button
              className="mt-5 w-full"
              onClick={() =>
                router.push(`/mine?auth=login&redirect=/study/${bookId}`)
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

    setError('');
    pendingWordIdsRef.current = [...pendingWordIdsRef.current, word.id];

    const nextIndex = currentIndex + 1;
    const hasNextWord = nextIndex < words.length;
    currentIndexRef.current = nextIndex;

    setProgress((currentProgress) => {
      if (!currentProgress) return currentProgress;

      const nextLearnedCount = Math.min(
        currentProgress.totalWords,
        currentProgress.learnedCount + 1,
      );

      return {
        ...currentProgress,
        currentWordId: word.id,
        currentWordRank: Math.max(currentProgress.currentWordRank, word.wordRank),
        learnedCount: nextLearnedCount,
        status:
          !hasNextWord && nextLearnedCount >= currentProgress.totalWords
            ? 'completed'
            : 'learning',
      };
    });

    if (hasNextWord) {
      setCurrentIndex(nextIndex);
      setWaitingForMore(false);
    } else {
      setCurrentIndex(nextIndex);
      setWaitingForMore(true);
      setCompleted(false);
    }

    const remainingWords = words.length - nextIndex - 1;
    scheduleSync({
      soon: pendingWordIdsRef.current.length >= 5 || remainingWords <= 10,
    });
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

            {error ? (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              className="h-12 w-full"
              onClick={handleNext}
              type="button"
            >
              下一个
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-3 text-center text-xs text-stone-400">
              {syncing ? '同步中' : '进度会自动同步'}
            </p>
          </div>
        ) : waitingForMore ? (
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full p-5 text-center">
              <p className="text-base font-semibold text-stone-950">
                正在加载下一组
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                已学进度正在后台同步。
              </p>
            </Card>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full p-5 text-center">
              <p className="text-base font-semibold text-stone-950">
                单词数据未导入
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                这本书在 books 表中存在，但 words 表里还没有 book_id ={' '}
                {book.bookId} 的可学习单词。导入后会从第一个单词开始学习。
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
      </Link>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-stone-500">
        {word.ukphone ? (
          <span className="inline-flex items-center gap-1">
            UK {word.ukphone}
            <PronunciationButton type={1} word={word.headWord} />
          </span>
        ) : null}
        {word.usphone ? (
          <span className="inline-flex items-center gap-1">
            US {word.usphone}
            <PronunciationButton type={2} word={word.headWord} />
          </span>
        ) : null}
      </div>

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
