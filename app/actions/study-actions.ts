'use server';

import { getCurrentUser, syncStudiedWords } from '@/lib/data/progress';

export async function syncStudiedWordsAction(
  bookId: string,
  wordIds: number[],
  prefetchAfterRank: number,
) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      message: '请先登录后再继续学习。',
    };
  }

  return syncStudiedWords(user.id, bookId, wordIds, prefetchAfterRank);
}
