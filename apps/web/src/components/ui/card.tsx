import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'raised' | 'bordered';
}

export function Card({ className, variant = 'flat', ...props }: CardProps) {
  const variants = {
    flat: 'bg-[var(--card)] text-[var(--card-foreground)] shadow-[var(--shadow-card)]',
    raised: 'bg-[var(--surface-raised)] text-[var(--card-foreground)]',
    bordered: 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-[var(--shadow-card)]',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-150',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[15px] font-semibold leading-5 text-[var(--foreground)] tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-[13px] text-[var(--muted-foreground)] leading-snug', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-5 pt-0', className)} {...props} />;
}
