import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

export interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenu({ open: controlledOpen, onOpenChange, children }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      const next = typeof action === 'function' ? action(open) : action;
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange, open]
  );

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext);
    if (!ctx) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="menu"
        aria-expanded={ctx.open}
        onClick={(e) => {
          onClick?.(e);
          ctx.setOpen((prev) => !prev);
        }}
        className={cn('inline-flex items-center justify-center cursor-pointer', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function DropdownMenuContent({
  className,
  align = 'end',
  children,
  ...props
}: DropdownMenuContentProps) {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx.open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        !target?.closest('[aria-haspopup="menu"]')
      ) {
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
      role="menu"
      className={cn(
        'absolute z-50 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 text-[var(--foreground)] shadow-xl animate-in fade-in-0 zoom-in-95 duration-100',
        align === 'end' && 'right-0',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  destructive?: boolean;
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, disabled, destructive, onClick, children, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext);
    if (!ctx) throw new Error('DropdownMenuItem must be used within DropdownMenu');

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(e);
          ctx.setOpen(false);
        }}
        className={cn(
          'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] outline-none transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
          destructive && 'text-[var(--danger-text)] hover:bg-[var(--danger-surface)] hover:text-[var(--danger-text)]',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export function DropdownMenuLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('-mx-1 my-1 h-px bg-[var(--border)]', className)} />;
}

