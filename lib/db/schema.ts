import { sql } from 'drizzle-orm';
import {
  bigint,
  integer,
  json,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  wordCount: integer('word_count').notNull(),
  coverUrl: text('cover_url'),
  bookId: text('book_id').notNull(),
  tags: text('tags')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const words = pgTable('words', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  wordRank: integer('word_rank').notNull(),
  headWord: text('head_word'),
  content: json('content'),
  bookId: text('book_id'),
});
