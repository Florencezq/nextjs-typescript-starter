'use client';

import * as React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, UserRound } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AuthPopup } from '@/components/auth-popup';
import { ProgressCard } from '@/components/progress-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AuthUser, BookProgress } from '@/lib/data/progress';
import type { Book } from '@/lib/mock-data';

export function MineScreen({
  authMode,
  books,
  progress,
  redirectTo,
  user,
}: {
  authMode?: 'login' | 'register';
  books: Book[];
  progress: BookProgress[];
  redirectTo?: string;
  user: AuthUser | null;
}) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = React.useState(false);

  React.useEffect(() => {
    if (authMode && !user) {
      setAuthOpen(true);
    }
  }, [authMode, user]);

  React.useEffect(() => {
    if (user && redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) {
      router.push(redirectTo);
    }
  }, [redirectTo, router, user]);

  function findBook(bookId: string) {
    return books.find((book) => book.bookId === bookId) ?? null;
  }

  function continueBook(bookId: string) {
    router.push(`/study/${bookId}`);
  }

  return (
    <AppShell>
      <div className="space-y-7 px-4 py-6">
        <header>
          <p className="text-sm font-medium text-stone-500">
            {user ? '查看你的学习状态' : '登录后保存学习进度'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
            我的
          </h1>
        </header>

        {user ? (
          <>
            <Card>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-950">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">已登录</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    signOut({ callbackUrl: '/mine' });
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </Button>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-stone-950">
                  学习进度
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  按最近学习时间排序
                </p>
              </div>

              {progress.length > 0 ? (
                <div className="space-y-3">
                  {progress.map((item) => {
                    const book = findBook(item.bookId);
                    if (!book) return null;

                    return (
                      <ProgressCard
                        key={item.bookId}
                        book={book}
                        onClick={() => continueBook(item.bookId)}
                        progress={item}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>还没有学习记录</CardTitle>
                    <CardDescription>
                      去首页选择一本单词书，就能在这里看到进度。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push('/')} type="button">
                      去首页
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>登录后保存学习进度</CardTitle>
              <CardDescription>
                使用邮箱和密码登录，之后可以从最近学习的位置继续。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setAuthOpen(true)}>
                <UserRound className="h-4 w-4" />
                登录 / 注册
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AuthPopup
        mode={authMode ?? 'login'}
        onOpenChange={setAuthOpen}
        open={authOpen}
        redirectTo={redirectTo}
      />
    </AppShell>
  );
}
