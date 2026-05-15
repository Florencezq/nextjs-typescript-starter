import { StudyScreen } from '@/components/study-screen';
import { getBookByBookId } from '@/lib/data/books';
import { getWordsByBookId } from '@/lib/data/words';

export const dynamic = 'force-dynamic';

export default async function StudyPage({
  params,
}: {
  params: { bookId: string };
}) {
  const [book, words] = await Promise.all([
    getBookByBookId(params.bookId),
    getWordsByBookId(params.bookId),
  ]);

  return <StudyScreen book={book} words={words} />;
}
