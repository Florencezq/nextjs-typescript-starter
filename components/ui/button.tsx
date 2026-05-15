import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  default: 'bg-stone-950 text-white shadow-sm hover:bg-stone-800',
  secondary: 'bg-stone-100 text-stone-950 hover:bg-stone-200',
  outline:
    'border border-stone-200 bg-white text-stone-950 shadow-sm hover:bg-stone-50',
  ghost: 'text-stone-700 hover:bg-stone-100 hover:text-stone-950',
  destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-500',
};

const sizes: Record<ButtonSize, string> = {
  default: 'h-11 px-4 py-2',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-5',
  icon: 'h-10 w-10',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
