import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displayLabels: React.MutableRefObject<Map<string, React.ReactNode>>;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  className,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '');
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      const next = typeof action === 'function' ? action(open) : action;
      if (!isControlledOpen) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlledOpen, onOpenChange, open]
  );

  const handleValueChange = React.useCallback(
    (nextVal: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
      setOpen(false);
    },
    [controlledValue, onValueChange, setOpen]
  );

  const displayLabels = React.useRef(new Map<string, React.ReactNode>());

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        displayLabels,
      }}
    >
      <div className={cn('relative inline-block', className ?? 'w-full')}>{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error('SelectTrigger must be used within Select');

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={ctx.open}
        onClick={() => ctx.setOpen((prev) => !prev)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-2xs cursor-pointer select-none',
          className
        )}
        {...props}
      >
        <span className="truncate text-left flex-1">{children}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ml-2',
            ctx.open && 'transform rotate-180 text-[var(--foreground)]'
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SelectValue({ placeholder, className, children }: SelectValueProps) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('SelectValue must be used within Select');

  const selectedLabel = children ?? (ctx.value ? ctx.displayLabels.current.get(ctx.value) : null);

  // If ctx.value is a raw UUID, prevent rendering the ugly UUID string if display label is not found
  const isUuid =
    typeof ctx.value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ctx.value);

  const fallback = isUuid
    ? (placeholder ?? 'Select an option…')
    : (ctx.value ?? placeholder ?? 'Select an option…');

  return (
    <span
      className={cn(
        'truncate block',
        !ctx.value && !children && 'text-[var(--muted-foreground)]',
        className
      )}
    >
      {selectedLabel ?? fallback}
    </span>
  );
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function SelectContent({
  className,
  children,
  align = 'start',
  ...props
}: SelectContentProps) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('SelectContent must be used within Select');

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx.open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (contentRef.current && !contentRef.current.contains(target) && !target?.closest('[role="combobox"]')) {
        ctx.setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ctx.setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ctx]);

  if (!ctx.open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 mt-1 max-h-64 w-full min-w-[8rem] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 text-[var(--foreground)] shadow-xl animate-in fade-in-0 zoom-in-95 duration-100',
        align === 'end' && 'right-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'start' && 'left-0',
        className
      )}
      {...props}
    >
      <div className="py-0.5 space-y-0.5">{children}</div>
    </div>
  );
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, className, children, disabled, ...props }, ref) => {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error('SelectItem must be used within Select');

    React.useEffect(() => {
      ctx.displayLabels.current.set(value, children);
    }, [ctx, value, children]);

    const isSelected = ctx.value === value;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) {
            ctx.onValueChange?.(value);
          }
        }}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-8 text-[13px] outline-none transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
          isSelected && 'bg-[var(--accent)] font-medium text-[var(--foreground)]',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        <span className="truncate flex-1">{children}</span>
        {isSelected && (
          <span className="absolute right-2.5 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4 text-[var(--primary)]" />
          </span>
        )}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

export function SelectSeparator({ className }: { className?: string }) {
  return <div className={cn('-mx-1 my-1 h-px bg-[var(--border)]', className)} />;
}

export function SelectLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'px-3 py-1.5 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Drop-in wrapper component for convenient single-element usage:
 * <ShadcnSelect value={val} onChange={setVal} options={[{ value: '1', label: 'One' }]} />
 */
export interface ShadcnSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface ShadcnSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ShadcnSelectOption[];
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

export function ShadcnSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  wrapperClassName,
  disabled,
}: ShadcnSelectProps) {
  const currentOption = options.find((opt) => opt.value === value);
  const displayLabel = currentOption ? currentOption.label : undefined;

  // Auto-detect if width constraint is intended (e.g. min-w-, w-auto, w-[...])
  // so the wrapper doesn't force a full-width line break in flex layouts.
  const hasWidthConstraint = className && /(min-w-|w-auto|max-w-|w-\[)/.test(className);
  const isExplicitFull = className?.includes('w-full');
  const computedWrapper = wrapperClassName ?? (isExplicitFull ? 'w-full' : hasWidthConstraint ? 'w-auto' : 'w-full');

  return (
    <Select value={value} onValueChange={onChange} className={computedWrapper}>
      <SelectTrigger className={className} disabled={disabled}>
        <SelectValue placeholder={placeholder}>{displayLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

