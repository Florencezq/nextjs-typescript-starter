'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookProgress, getAllProgress } from '@/lib/mock-store';

export function useProgressList() {
  const [progress, setProgress] = useState<BookProgress[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setProgress(
      [...getAllProgress()].sort((a, b) => {
        const aTime = a.lastStudiedAt ?? a.lastOpenedAt ?? a.updatedAt;
        const bTime = b.lastStudiedAt ?? b.lastOpenedAt ?? b.updatedAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }),
    );
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('word-h5-storage', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('word-h5-storage', refresh);
    };
  }, [refresh]);

  return {
    ready,
    progress,
    recentProgress: progress[0] ?? null,
    refresh,
  };
}
