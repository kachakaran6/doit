import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center select-none', className)}>
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--muted-foreground)] max-w-sm mb-5 leading-normal">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
