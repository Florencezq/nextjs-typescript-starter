'use client';

import Link from 'next/link';
import type React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Book, toWordDetailView, Word } from '@/lib/mock-data';

export function WordDetailScreen({
  book,
  from,
  word: rawWord,
}: {
  book: Book | null;
  from?: string;
  word: Word | null;
}) {
  const word = rawWord ? toWordDetailView(rawWord) : null;
  const backHref =
    from && from.startsWith('/') && !from.startsWith('//')
      ? from
      : word
        ? `/study/${word.bookId}`
        : '/';

  return (
    <AppShell showTabs={false}>
      <div className="min-h-dvh px-4 py-5">
        <div className="flex h-10 items-center gap-3">
          <Link
            aria-label="返回"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100"
            href={backHref}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-950">单词详情</p>
            {book ? (
              <p className="truncate text-xs text-stone-500">{book.title}</p>
            ) : null}
          </div>
        </div>

        {word ? (
          <div className="space-y-4 py-6">
            <section>
              <h1 className="break-words text-4xl font-semibold leading-tight text-stone-950">
                {word.headWord}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Rank {word.wordRank}</Badge>
                <Badge>{word.bookId}</Badge>
                {word.wordId ? <Badge>{word.wordId}</Badge> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-500">
                {word.ukphone ? <span>UK {word.ukphone}</span> : null}
                {word.usphone ? <span>US {word.usphone}</span> : null}
                {word.phone ? <span>{word.phone}</span> : null}
              </div>
            </section>

            <DetailSection title="释义">
              <div className="space-y-4">
                {word.translations.map((translation, index) => (
                  <div key={`${translation.tranCn}-${index}`} className="space-y-2">
                    <p className="text-base font-medium leading-7 text-stone-950">
                      {translation.pos ? `${translation.pos}. ` : ''}
                      {translation.tranCn}
                    </p>
                    {translation.tranOther ? (
                      <p className="text-sm leading-6 text-stone-600">
                        {translation.tranOther}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </DetailSection>

            {word.sentences.length > 0 ? (
              <DetailSection title="例句">
                <div className="space-y-4">
                  {word.sentences.map((sentence, index) => (
                    <div key={`${sentence.en}-${index}`} className="space-y-2">
                      <p className="text-sm leading-6 text-stone-700">
                        {sentence.en}
                      </p>
                      <p className="text-sm leading-6 text-stone-500">
                        {sentence.cn}
                      </p>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            {word.phrases.length > 0 ? (
              <DetailSection title="短语">
                <div className="space-y-3">
                  {word.phrases.map((phrase, index) => (
                    <div key={`${phrase.pContent}-${index}`} className="space-y-1">
                      <p className="text-sm font-medium leading-6 text-stone-950">
                        {phrase.pContent}
                      </p>
                      <p className="text-sm leading-6 text-stone-500">
                        {phrase.pCn}
                      </p>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            {word.synonyms.length > 0 ? (
              <DetailSection title="同近义词">
                <div className="space-y-4">
                  {word.synonyms.map((synonym, index) => (
                    <div key={`${synonym.tran}-${index}`} className="space-y-2">
                      <p className="text-sm font-medium leading-6 text-stone-950">
                        {synonym.pos ? `${synonym.pos}. ` : ''}
                        {synonym.tran}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {synonym.words.map((item) => (
                          <Badge key={item}>{item}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            {word.relatedWords.length > 0 ? (
              <DetailSection title="同根词">
                <div className="space-y-4">
                  {word.relatedWords.map((group, index) => (
                    <div key={`${group.pos}-${index}`} className="space-y-2">
                      {group.pos ? (
                        <p className="text-sm font-semibold text-stone-950">
                          {group.pos}
                        </p>
                      ) : null}
                      <div className="space-y-2">
                        {group.words.map((item) => (
                          <div
                            key={`${item.hwd}-${item.tran}`}
                            className="rounded-md bg-stone-50 px-3 py-2"
                          >
                            <p className="text-sm font-medium leading-6 text-stone-950">
                              {item.hwd}
                            </p>
                            <p className="text-sm leading-6 text-stone-500">
                              {item.tran}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}
          </div>
        ) : (
          <Card className="mt-8 p-5">
            <h1 className="text-xl font-semibold">单词不存在</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              没有找到这个单词，请返回首页重新选择。
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-stone-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
