'use client';

import { Book, getBook, getWordsByBook, Word } from '@/lib/mock-data';

const AUTH_KEY = 'word-h5-auth';
const PROGRESS_KEY = 'word-h5-progress';

export type MockUser = {
  id: number;
  email: string;
};

export type BookProgress = {
  id: number;
  userId: number;
  bookId: string;
  currentWordId: number | null;
  currentWordRank: number;
  learnedCount: number;
  totalWords: number;
  status: 'not_started' | 'learning' | 'completed';
  lastOpenedAt: string | null;
  lastStudiedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('word-h5-storage'));
}

export function getMockUser() {
  return readJson<MockUser | null>(AUTH_KEY, null);
}

export function loginMockUser(email: string) {
  const user = {
    id: 1,
    email,
  };
  writeJson(AUTH_KEY, user);
  return user;
}

export function logoutMockUser() {
  window.localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('word-h5-storage'));
}

export function getAllProgress() {
  return readJson<BookProgress[]>(PROGRESS_KEY, []);
}

function saveAllProgress(progress: BookProgress[]) {
  writeJson(PROGRESS_KEY, progress);
}

export function getBookProgress(bookId: string) {
  return getAllProgress().find((item) => item.bookId === bookId) ?? null;
}

export function ensureBookProgress(
  bookId: string,
  sourceBook?: Book,
  sourceWords?: Word[],
) {
  const book = sourceBook ?? getBook(bookId);
  const now = new Date().toISOString();
  const allProgress = getAllProgress();
  const existing = allProgress.find((item) => item.bookId === bookId);

  if (!book) return null;

  if (existing) {
    const words = sourceWords?.length ? resolveWords(bookId, sourceWords) : [];
    const maxWordRank = words.at(-1)?.wordRank ?? 0;
    const shouldResetStaleProgress =
      words.length > 0 &&
      ((existing.status === 'completed' && existing.learnedCount < words.length) ||
        existing.currentWordRank > maxWordRank ||
        existing.learnedCount > words.length);

    const next = {
      ...(shouldResetStaleProgress
        ? {
            ...existing,
            currentWordId: null,
            currentWordRank: 0,
            learnedCount: 0,
            status: 'not_started' as const,
            lastStudiedAt: null,
            completedAt: null,
          }
        : existing),
      totalWords: book.wordCount,
      lastOpenedAt: now,
      updatedAt: now,
    };

    saveAllProgress(
      allProgress.map((item) => (item.bookId === bookId ? next : item)),
    );
    return next;
  }

  const progress: BookProgress = {
    id: Date.now(),
    userId: 1,
    bookId,
    currentWordId: null,
    currentWordRank: 0,
    learnedCount: 0,
    totalWords: book.wordCount,
    status: 'not_started',
    lastOpenedAt: now,
    lastStudiedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  saveAllProgress([...allProgress, progress]);
  return progress;
}

function resolveWords(bookId: string, sourceWords?: Word[]) {
  return [...(sourceWords ?? getWordsByBook(bookId))].sort(
    (a, b) => a.wordRank - b.wordRank,
  );
}

export function getNextWord(
  bookId: string,
  currentWordRank: number,
  sourceWords?: Word[],
) {
  let nextWord: Word | null = null;

  for (const word of sourceWords ?? getWordsByBook(bookId)) {
    if (word.bookId !== bookId || word.wordRank <= currentWordRank) continue;
    if (!nextWord || word.wordRank < nextWord.wordRank) {
      nextWord = word;
    }
  }

  return nextWord;
}

export function completeWord(
  bookId: string,
  wordId: number,
  sourceBook?: Book,
  sourceWords?: Word[],
) {
  const book = sourceBook ?? getBook(bookId);
  const words = resolveWords(bookId, sourceWords);
  const word = words.find((item) => item.id === wordId);

  if (!book || !word) return null;

  const now = new Date().toISOString();
  const allProgress = getAllProgress();
  const existing =
    allProgress.find((item) => item.bookId === bookId) ??
    ensureBookProgress(bookId, book, words);

  if (!existing) return null;

  const currentWordRank = Math.max(existing.currentWordRank, word.wordRank);
  const learnedCount = words.filter((item) => item.wordRank <= currentWordRank)
    .length;
  const completedTarget = Math.min(book.wordCount, words.length || book.wordCount);
  const completed = learnedCount >= completedTarget;
  const next: BookProgress = {
    ...existing,
    currentWordId: word.id,
    currentWordRank,
    learnedCount,
    totalWords: book.wordCount,
    status: completed ? 'completed' : 'learning',
    lastStudiedAt: now,
    completedAt: completed ? now : existing.completedAt,
    updatedAt: now,
  };

  saveAllProgress(
    allProgress.some((item) => item.bookId === bookId)
      ? allProgress.map((item) => (item.bookId === bookId ? next : item))
      : [...allProgress, next],
  );

  return next;
}

export function getRecentProgress() {
  return (
    [...getAllProgress()]
      .filter((item) => item.lastOpenedAt || item.lastStudiedAt)
      .sort((a, b) => {
        const aTime = a.lastStudiedAt ?? a.lastOpenedAt ?? a.updatedAt;
        const bTime = b.lastStudiedAt ?? b.lastOpenedAt ?? b.updatedAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })[0] ?? null
  );
}
