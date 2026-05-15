import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 64 }),
  password: varchar('password', { length: 64 }),
});

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

export const userBookProgress = pgTable('user_book_progress', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: integer('user_id').notNull(),
  bookId: text('book_id').notNull(),
  currentWordId: bigint('current_word_id', { mode: 'number' }),
  currentWordRank: integer('current_word_rank').notNull().default(0),
  learnedCount: integer('learned_count').notNull().default(0),
  totalWords: integer('total_words').notNull().default(0),
  status: text('status').notNull().default('not_started'),
  lastOpenedAt: timestamp('last_opened_at', { withTimezone: true }),
  lastStudiedAt: timestamp('last_studied_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const userWordStudyRecords = pgTable('user_word_study_records', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: integer('user_id').notNull(),
  bookId: text('book_id').notNull(),
  wordId: bigint('word_id', { mode: 'number' }).notNull(),
  wordRank: integer('word_rank').notNull(),
  studyCount: integer('study_count').notNull().default(1),
  firstStudiedAt: timestamp('first_studied_at', { withTimezone: true }).notNull(),
  lastStudiedAt: timestamp('last_studied_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});
