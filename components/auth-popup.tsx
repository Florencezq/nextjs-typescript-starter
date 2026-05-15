'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMockAuth } from '@/hooks/use-mock-auth';

type AuthMode = 'login' | 'register';

export function AuthPopup({
  open,
  mode = 'login',
  redirectTo,
  onOpenChange,
}: {
  open: boolean;
  mode?: AuthMode;
  redirectTo?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const auth = useMockAuth();
  const [currentMode, setCurrentMode] = React.useState<AuthMode>(mode);
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('password');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setError('');
    }
  }, [mode, open]);

  function safeRedirect(value?: string) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
      return '';
    }

    return value;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码');
      return;
    }

    setSubmitting(true);

    window.setTimeout(() => {
      if (currentMode === 'login') {
        auth.login(email.trim());
      } else {
        auth.register(email.trim());
      }

      setSubmitting(false);
      onOpenChange(false);

      const target = safeRedirect(redirectTo);
      if (target) {
        router.push(target);
      } else {
        router.refresh();
      }
    }, 350);
  }

  const isLogin = currentMode === 'login';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isLogin ? '登录' : '注册'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? '使用邮箱和密码登录，继续保存你的学习进度。'
              : '创建账号后会自动登录，并回到刚才的学习入口。'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700" htmlFor="email">
              邮箱
            </label>
            <Input
              autoComplete="email"
              id="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-700"
              htmlFor="password"
            >
              密码
            </label>
            <Input
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={submitting} type="submit">
            {isLogin ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {submitting ? '处理中' : isLogin ? '登录' : '注册并登录'}
          </Button>

          <button
            className="w-full text-center text-sm font-medium text-stone-600"
            onClick={() => {
              setCurrentMode(isLogin ? 'register' : 'login');
              setError('');
            }}
            type="button"
          >
            {isLogin ? '没有账号？注册' : '已有账号？登录'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
