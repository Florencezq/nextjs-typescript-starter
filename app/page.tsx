import { HomeScreen } from '@/components/home-screen';
import { getAllBooks } from '@/lib/data/books';
import {
  getCurrentUser,
  getProgressList,
  getRecentStudy,
} from '@/lib/data/progress';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  const [books, progress, recentStudy] = await Promise.all([
    getAllBooks(),
    user ? getProgressList(user.id) : [],
    user ? getRecentStudy(user.id) : { progress: null, nextWord: null },
  ]);

  return (
    <HomeScreen
      books={books}
      nextRecentWord={recentStudy.nextWord}
      progress={progress}
      recentProgress={recentStudy.progress}
      user={user}
    />
  );
}
