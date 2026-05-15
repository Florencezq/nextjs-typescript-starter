import { MineScreen } from '@/components/mine-screen';
import { getAllBooks } from '@/lib/data/books';
import { getCurrentUser, getProgressList } from '@/lib/data/progress';

function getFirstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export const dynamic = 'force-dynamic';

export default async function MinePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const authMode = getFirstValue(searchParams?.auth);
  const redirectTo = getFirstValue(searchParams?.redirect);
  const user = await getCurrentUser();
  const [books, progress] = await Promise.all([
    getAllBooks(),
    user ? getProgressList(user.id) : [],
  ]);

  return (
    <MineScreen
      authMode={authMode === 'register' ? 'register' : authMode === 'login' ? 'login' : undefined}
      books={books}
      progress={progress}
      redirectTo={redirectTo}
      user={user}
    />
  );
}
