import { WordDetailScreen } from '@/components/word-detail-screen';
import { getBookByBookId } from '@/lib/data/books';
import { getWordById } from '@/lib/data/words';

function getFirstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export const dynamic = 'force-dynamic';

export default async function WordPage({
  params,
  searchParams,
}: {
  params: { wordId: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const word = await getWordById(Number(params.wordId));
  const book = word?.bookId ? await getBookByBookId(word.bookId) : null;

  return (
    <WordDetailScreen
      book={book}
      from={getFirstValue(searchParams?.from)}
      word={word}
    />
  );
}
