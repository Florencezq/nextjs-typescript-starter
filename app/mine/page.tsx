import { MineScreen } from '@/components/mine-screen';
import { getAllBooks } from '@/lib/data/books';

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
  const books = await getAllBooks();

  return (
    <MineScreen
      authMode={authMode === 'register' ? 'register' : authMode === 'login' ? 'login' : undefined}
      books={books}
      redirectTo={redirectTo}
    />
  );
}
