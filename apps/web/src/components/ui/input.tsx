import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-transparent transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[12px] text-[var(--danger-text)]">{error}</p>
        ) : helperText ? (
          <p className="text-[12px] text-[var(--muted-foreground)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
