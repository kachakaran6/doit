import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--accent)] text-[var(--accent-foreground)]',
    secondary: 'bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border)]',
    success: 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/20',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/20',
    danger: 'bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
