'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  {
    href: '/',
    label: '首页',
    icon: BookOpen,
    active: (pathname: string) => pathname === '/',
  },
  {
    href: '/mine',
    label: '我的',
    icon: UserRound,
    active: (pathname: string) => pathname.startsWith('/mine'),
  },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] border-t border-stone-200 bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(28,25,23,0.06)] backdrop-blur">
      <div className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.active(pathname);

          return (
            <Link
              key={tab.href}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-stone-500 transition-colors',
                active && 'bg-stone-950 text-white',
              )}
              href={tab.href}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
