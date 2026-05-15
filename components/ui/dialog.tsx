'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-16 sm:items-center">
      <button
        aria-label="关闭弹窗遮罩"
        className="absolute inset-0 cursor-default"
        type="button"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        'relative z-10 w-full max-w-[420px] rounded-lg border border-stone-200 bg-white p-5 text-stone-950 shadow-xl',
        className,
      )}
      role="dialog"
      aria-modal="true"
    >
      <Button
        aria-label="关闭"
        className="absolute right-3 top-3"
        onClick={onClose}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X className="h-5 w-5" />
      </Button>
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-5 pr-10', className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-7 text-stone-950', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-1 text-sm leading-5 text-stone-500', className)}
      {...props}
    />
  );
}
