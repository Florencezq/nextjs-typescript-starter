import { and, eq, gt, inArray, sql } from 'drizzle-orm';
import { db } from 'app/db';
import { auth } from 'app/auth';
import {
  books,
  userBookProgress,
  userWordStudyRecords,
  users,
  words,
} from '@/lib/db/schema';
import { Book, toStudyWordView, Word } from '@/lib/mock-data';

export type AuthUser = {
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

export type StudyPageData = {
  book: Book | null;
  completed: boolean;
  progress: BookProgress | null;
  words: ReturnType<typeof toStudyWordView>[];
};

export type SyncStudyProgressResult =
  | {
      ok: true;
      completed: boolean;
      progress: BookProgress;
      words: ReturnType<typeof toStudyWordView>[];
    }
  | {
      ok: false;
      message: string;
    };

const STUDY_BATCH_SIZE = 50;

function toIso(value: Date | null) {
  return value ? value.toISOString() : null;
}

function mapProgress(row: typeof userBookProgress.$inferSelect): BookProgress {
  return {
    id: row.id,
    userId: row.userId,
    bookId: row.bookId,
    currentWordId: row.currentWordId,
    currentWordRank: row.currentWordRank,
    learnedCount: row.learnedCount,
    totalWords: row.totalWords,
    status: row.status as BookProgress['status'],
    lastOpenedAt: toIso(row.lastOpenedAt),
    lastStudiedAt: toIso(row.lastStudiedAt),
    completedAt: toIso(row.completedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapBook(row: typeof books.$inferSelect): Book {
  return {
    id: row.id,
    title: row.title,
    wordCount: row.wordCount,
    coverUrl: row.coverUrl,
    bookId: row.bookId,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapWord(row: typeof words.$inferSelect): Word {
  return {
    id: row.id,
    wordRank: row.wordRank,
    headWord: row.headWord ?? '',
    content: row.content as Word['content'],
    bookId: row.bookId ?? '',
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return null;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];

  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
  };
}

export async function getProgressList(userId: number) {
  const rows = await db
    .select()
    .from(userBookProgress)
    .where(eq(userBookProgress.userId, userId))
    .orderBy(
      sql`${userBookProgress.lastStudiedAt} desc nulls last`,
      sql`${userBookProgress.lastOpenedAt} desc nulls last`,
      sql`${userBookProgress.updatedAt} desc`,
    );

  return rows.map(mapProgress);
}

export async function ensureBookProgress(userId: number, bookId: string) {
  const bookRows = await db
    .select()
    .from(books)
    .where(eq(books.bookId, bookId))
    .limit(1);
  const book = bookRows[0];

  if (!book) return null;

  const now = new Date();
  const progressRows = await db
    .select()
    .from(userBookProgress)
    .where(
      and(
        eq(userBookProgress.userId, userId),
        eq(userBookProgress.bookId, bookId),
      ),
    )
    .limit(1);
  const existing = progressRows[0];

  if (existing) {
    const [updated] = await db
      .update(userBookProgress)
      .set({
        totalWords: book.wordCount,
        lastOpenedAt: now,
        updatedAt: now,
      })
      .where(eq(userBookProgress.id, existing.id))
      .returning();

    return mapProgress(updated);
  }

  const [created] = await db
    .insert(userBookProgress)
    .values({
      userId,
      bookId,
      currentWordRank: 0,
      learnedCount: 0,
      totalWords: book.wordCount,
      status: 'not_started',
      lastOpenedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return mapProgress(created);
}

export async function getNextWordForStudy(
  userId: number,
  bookId: string,
): Promise<StudyPageData> {
  const bookRows = await db
    .select()
    .from(books)
    .where(eq(books.bookId, bookId))
    .limit(1);
  const book = bookRows[0];

  if (!book) {
    return {
      book: null,
      completed: false,
      progress: null,
      words: [],
    };
  }

  const progress = await ensureBookProgress(userId, bookId);
  if (!progress) {
    return {
      book: mapBook(book),
      completed: false,
      progress: null,
      words: [],
    };
  }

  const wordRows = await db
    .select()
    .from(words)
    .where(
      and(eq(words.bookId, bookId), gt(words.wordRank, progress.currentWordRank)),
    )
    .orderBy(words.wordRank)
    .limit(STUDY_BATCH_SIZE);
  const studyWords = wordRows.map(mapWord);
  const completed =
    progress.status === 'completed' ||
    (progress.learnedCount >= progress.totalWords && studyWords.length === 0);

  return {
    book: mapBook(book),
    completed,
    progress,
    words: studyWords.map(toStudyWordView),
  };
}

export async function getRecentStudy(userId: number) {
  const progressRows = await db
    .select()
    .from(userBookProgress)
    .where(eq(userBookProgress.userId, userId))
    .orderBy(
      sql`${userBookProgress.lastStudiedAt} desc nulls last`,
      sql`${userBookProgress.lastOpenedAt} desc nulls last`,
      sql`${userBookProgress.updatedAt} desc`,
    )
    .limit(1);
  const progress = progressRows[0] ? mapProgress(progressRows[0]) : null;

  if (!progress) {
    return {
      progress: null,
      nextWord: null,
    };
  }

  const wordRows = await db
    .select()
    .from(words)
    .where(
      and(
        eq(words.bookId, progress.bookId),
        gt(words.wordRank, progress.currentWordRank),
      ),
    )
    .orderBy(words.wordRank)
    .limit(1);

  return {
    progress,
    nextWord: wordRows[0] ? toStudyWordView(mapWord(wordRows[0])) : null,
  };
}

export async function syncStudiedWords(
  userId: number,
  bookId: string,
  wordIds: number[],
  prefetchAfterRank: number,
): Promise<SyncStudyProgressResult> {
  const uniqueWordIds = Array.from(new Set(wordIds)).filter(Number.isFinite);

  if (uniqueWordIds.length === 0) {
    return {
      ok: false,
      message: '没有需要同步的学习记录。',
    };
  }

  try {
    return await db.transaction(async (tx) => {
      const now = new Date();
      const [book] = await tx
        .select()
        .from(books)
        .where(eq(books.bookId, bookId))
        .limit(1);
      const studiedWords = await tx
        .select()
        .from(words)
        .where(and(eq(words.bookId, bookId), inArray(words.id, uniqueWordIds)));

      if (!book || studiedWords.length === 0) {
        return {
          ok: false,
          message: '没有找到需要同步的单词。',
        };
      }

      const [existingProgress] = await tx
        .select()
        .from(userBookProgress)
        .where(
          and(
            eq(userBookProgress.userId, userId),
            eq(userBookProgress.bookId, bookId),
          ),
        )
        .limit(1);

      const progress =
        existingProgress ??
        (
          await tx
            .insert(userBookProgress)
            .values({
              userId,
              bookId,
              currentWordRank: 0,
              learnedCount: 0,
              totalWords: book.wordCount,
              status: 'not_started',
              lastOpenedAt: now,
              createdAt: now,
              updatedAt: now,
            })
            .returning()
        )[0];

      await tx
        .insert(userWordStudyRecords)
        .values(
          studiedWords.map((word) => ({
            userId,
            bookId,
            wordId: word.id,
            wordRank: word.wordRank,
            studyCount: 1,
            firstStudiedAt: now,
            lastStudiedAt: now,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .onConflictDoUpdate({
          target: [
            userWordStudyRecords.userId,
            userWordStudyRecords.bookId,
            userWordStudyRecords.wordId,
          ],
          set: {
            studyCount: sql`${userWordStudyRecords.studyCount} + 1`,
            lastStudiedAt: now,
            updatedAt: now,
          },
        });

      const latestWord = studiedWords.reduce((latest, word) =>
        word.wordRank > latest.wordRank ? word : latest,
      );
      const currentWordRank = Math.max(
        progress.currentWordRank,
        latestWord.wordRank,
      );
      const [{ learnedCount }] = await tx
        .select({
          learnedCount: sql<number>`count(*)::int`,
        })
        .from(userWordStudyRecords)
        .where(
          and(
            eq(userWordStudyRecords.userId, userId),
            eq(userWordStudyRecords.bookId, bookId),
          ),
        );
      const [{ availableWordCount }] = await tx
        .select({
          availableWordCount: sql<number>`count(*)::int`,
        })
        .from(words)
        .where(eq(words.bookId, bookId));
      const completedTarget = Math.min(
        book.wordCount,
        availableWordCount || book.wordCount,
      );
      const [nextWordRow] = await tx
        .select()
        .from(words)
        .where(and(eq(words.bookId, bookId), gt(words.wordRank, currentWordRank)))
        .orderBy(words.wordRank)
        .limit(1);
      const completed =
        !nextWordRow ||
        (completedTarget > 0 && learnedCount >= completedTarget);

      const [nextProgressRow] = await tx
        .update(userBookProgress)
        .set({
          currentWordId: latestWord.id,
          currentWordRank,
          learnedCount,
          totalWords: book.wordCount,
          status: completed ? 'completed' : 'learning',
          lastStudiedAt: now,
          completedAt: completed ? now : progress.completedAt,
          updatedAt: now,
        })
        .where(eq(userBookProgress.id, progress.id))
        .returning();
      const nextProgress = mapProgress(nextProgressRow);
      const prefetchRows = await tx
        .select()
        .from(words)
        .where(
          and(
            eq(words.bookId, bookId),
            gt(words.wordRank, Math.max(prefetchAfterRank, currentWordRank)),
          ),
        )
        .orderBy(words.wordRank)
        .limit(STUDY_BATCH_SIZE);

      return {
        ok: true,
        completed,
        progress: {
          ...nextProgress,
          status: completed ? 'completed' : nextProgress.status,
        },
        words: prefetchRows.map((word) => toStudyWordView(mapWord(word))),
      };
    });
  } catch {
    return {
      ok: false,
      message: '保存学习进度失败，请稍后重试。',
    };
  }
}
