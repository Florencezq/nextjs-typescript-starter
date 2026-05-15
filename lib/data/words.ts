import { asc, eq } from 'drizzle-orm';
import { db } from 'app/db';
import { words } from '@/lib/db/schema';
import { Word } from '@/lib/mock-data';

function mapWord(row: typeof words.$inferSelect): Word {
  return {
    id: row.id,
    wordRank: row.wordRank,
    headWord: row.headWord ?? '',
    content: row.content as Word['content'],
    bookId: row.bookId ?? '',
  };
}

export async function getWordsByBookId(bookId: string): Promise<Word[]> {
  const rows = await db
    .select()
    .from(words)
    .where(eq(words.bookId, bookId))
    .orderBy(asc(words.wordRank));

  return rows.map(mapWord);
}

export async function getWordById(wordId: number): Promise<Word | null> {
  const rows = await db
    .select()
    .from(words)
    .where(eq(words.id, wordId))
    .limit(1);

  return rows[0] ? mapWord(rows[0]) : null;
}
