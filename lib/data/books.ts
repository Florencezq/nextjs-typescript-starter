import { asc, eq, sql } from 'drizzle-orm';
import { db } from 'app/db';
import { books, words } from '@/lib/db/schema';
import { Book } from '@/lib/mock-data';

export async function getAllBooks(): Promise<Book[]> {
  const rows = await db
    .select({
      id: books.id,
      title: books.title,
      wordCount: books.wordCount,
      coverUrl: books.coverUrl,
      bookId: books.bookId,
      tags: books.tags,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      availableWordCount: sql<number>`count(${words.id})::int`,
    })
    .from(books)
    .leftJoin(words, eq(words.bookId, books.bookId))
    .groupBy(
      books.id,
      books.title,
      books.wordCount,
      books.coverUrl,
      books.bookId,
      books.tags,
      books.createdAt,
      books.updatedAt,
    )
    .orderBy(asc(books.id));

  return rows.map((book) => ({
    id: book.id,
    title: book.title,
    wordCount: book.wordCount,
    coverUrl: book.coverUrl,
    bookId: book.bookId,
    tags: book.tags,
    availableWordCount: book.availableWordCount,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  }));
}

export async function getBookByBookId(bookId: string): Promise<Book | null> {
  const rows = await db
    .select()
    .from(books)
    .where(eq(books.bookId, bookId))
    .limit(1);

  const book = rows[0];
  if (!book) return null;

  return {
    id: book.id,
    title: book.title,
    wordCount: book.wordCount,
    coverUrl: book.coverUrl,
    bookId: book.bookId,
    tags: book.tags,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}
