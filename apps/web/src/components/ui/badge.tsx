import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusMeta, getPriorityMeta, getSeverityMeta } from '@/lib/badge-map';
import {
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Minus,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Flame,
} from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neutral' | 'accent' | 'violet' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'md', ...props }: BadgeProps) {
  const tones = {
    default: 'bg-[var(--accent)] text-[var(--accent-foreground)]',
    neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
    accent: 'bg-[var(--primary-soft)] text-[var(--primary-text)] font-medium',
    violet: 'bg-[rgba(123,84,232,0.12)] text-[#7B54E8] dark:text-[#B9A3FF]',
    success: 'bg-[rgba(14,133,80,0.12)] text-[var(--success-text)]',
    warning: 'bg-[rgba(161,94,0,0.12)] text-[var(--warning-text)]',
    danger: 'bg-[rgba(201,60,53,0.12)] text-[var(--danger-text)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] leading-3.5',
    md: 'px-2.5 py-0.5 text-[12px] leading-4',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none',
        tones[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

/**
 * Single source of truth for Status rendering across DoIt Web.
 */
export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const meta = getStatusMeta(status);

  const renderIcon = () => {
    switch (meta.icon) {
      case 'circle-check':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success-text)] shrink-0" />;
      case 'circle-half':
        return <CircleDot className="w-3.5 h-3.5 text-[var(--primary-text)] shrink-0" />;
      case 'circle-x':
        return <XCircle className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />;
      case 'circle-alert':
        return <AlertCircle className="w-3.5 h-3.5 text-[var(--danger-text)] shrink-0" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0 stroke-[1.5]" />;
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--foreground)]',
        className
      )}
    >
      {renderIcon()}
      <span>{meta.label}</span>
    </div>
  );
}

/**
 * Priority Badge with high-contrast indicator
 */
export function PriorityBadge({ priority, className }: { priority?: string | null; className?: string }) {
  const meta = getPriorityMeta(priority);

  const renderIcon = () => {
    switch (meta.icon) {
      case 'bars-4':
        return <Flame className="w-3.5 h-3.5 text-[var(--danger-text)] shrink-0" />;
      case 'bars-3':
        return <SignalHigh className="w-3.5 h-3.5 text-[var(--warning-text)] shrink-0" />;
      case 'bars-2':
        return <SignalMedium className="w-3.5 h-3.5 text-[var(--primary-text)] shrink-0" />;
      case 'bars-1':
        return <SignalLow className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />;
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted-foreground)]',
        className
      )}
    >
      {renderIcon()}
      <span>{meta.label}</span>
    </div>
  );
}

/**
 * Bug Severity Badge with colored dot
 */
export function SeverityBadge({ severity, className }: { severity?: string | null; className?: string }) {
  const meta = getSeverityMeta(severity);

  const dotColors = {
    danger: 'bg-[var(--destructive)]',
    warning: 'bg-[var(--warning-text)]',
    amber: 'bg-[#F59E0B]',
    neutral: 'bg-[var(--muted-foreground)]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--muted)] text-[var(--foreground)]',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[meta.tone])} />
      <span>{meta.label}</span>
    </div>
  );
}

/**
 * Role Badge (OWNER, ADMIN, MEMBER, TESTER, VIEWER)
 */
export function RoleBadge({ role, className }: { role?: string | null; className?: string }) {
  const raw = (role || 'TESTER').toUpperCase();
  const r = raw === 'MEMBER' ? 'TESTER' : raw;
  const tones: Record<string, BadgeProps['variant']> = {
    OWNER: 'accent',
    ADMIN: 'violet',
    TESTER: 'warning',
    VIEWER: 'neutral',
  };

  return (
    <Badge variant={tones[r] || 'neutral'} size="sm" className={className}>
      {r.charAt(0) + r.slice(1).toLowerCase()}
    </Badge>
  );
}
