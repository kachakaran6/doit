import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--danger)] focus:border-[var(--danger)]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

