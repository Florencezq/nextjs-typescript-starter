import { StudyScreen } from '@/components/study-screen';
import { getBookByBookId } from '@/lib/data/books';
import { getCurrentUser, getNextWordForStudy } from '@/lib/data/progress';

export const dynamic = 'force-dynamic';

export default async function StudyPage({
  params,
}: {
  params: { bookId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    const book = await getBookByBookId(params.bookId);

    return (
      <StudyScreen
        book={book}
        completed={false}
        loginRequired
        progress={null}
        words={[]}
      />
    );
  }

  const data = await getNextWordForStudy(user.id, params.bookId);

  return (
    <StudyScreen
      book={data.book}
      completed={data.completed}
      progress={data.progress}
      words={data.words}
    />
  );
}
