import { HomeScreen } from '@/components/home-screen';
import { getAllBooks } from '@/lib/data/books';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const books = await getAllBooks();

  return <HomeScreen books={books} />;
}
