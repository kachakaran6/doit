import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const variants = {
      primary:
        'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 active:scale-[0.98] shadow-xs',
      secondary:
        'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] active:scale-[0.98]',
      outline:
        'bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--accent)] active:scale-[0.98]',
      ghost:
        'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] active:scale-[0.98]',
      soft:
        'bg-[var(--primary-soft)] text-[var(--primary-text)] hover:brightness-95 active:scale-[0.98]',
      danger:
        'bg-[rgba(201,60,53,0.12)] text-[var(--danger-text)] hover:bg-[rgba(201,60,53,0.22)] active:scale-[0.98]',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-[12px] gap-1',
      sm: 'h-8 px-3 text-[13px] gap-1.5',
      md: 'h-9 px-3.5 text-[14px] gap-2',
      lg: 'h-10 px-5 text-[15px] gap-2.5',
      icon: 'h-9 w-9 p-0',
      'icon-sm': 'h-7 w-7 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
