/**
 * Central label, icon, and tone mapping for DoIt Web.
 * Enforces sentence-case and consistent visual presentation.
 * Raw uppercase enums must NEVER reach the UI.
 */

export interface StatusMeta {
  label: string;
  tone: 'neutral' | 'accent' | 'violet' | 'success' | 'warning' | 'danger';
  icon: string;
}

export const STATUS_MAP: Record<string, StatusMeta> = {
  TODO: { label: 'To do', tone: 'neutral', icon: 'circle-dashed' },
  IN_PROGRESS: { label: 'In progress', tone: 'accent', icon: 'circle-half' },
  IN_REVIEW: { label: 'In review', tone: 'violet', icon: 'circle-half' },
  DONE: { label: 'Done', tone: 'success', icon: 'circle-check' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral', icon: 'circle-x' },
  BLOCKED: { label: 'Blocked', tone: 'danger', icon: 'circle-alert' },
  BACKLOG: { label: 'Backlog', tone: 'neutral', icon: 'circle-dashed' },
};

export const PRIORITY_MAP: Record<string, { label: string; tone: 'neutral' | 'accent' | 'warning' | 'danger'; icon: string }> = {
  URGENT: { label: 'Urgent', tone: 'danger', icon: 'bars-4' },
  HIGH: { label: 'High', tone: 'warning', icon: 'bars-3' },
  MEDIUM: { label: 'Medium', tone: 'accent', icon: 'bars-2' },
  LOW: { label: 'Low', tone: 'neutral', icon: 'bars-1' },
  NONE: { label: 'No priority', tone: 'neutral', icon: 'minus' },
};

export const SEVERITY_MAP: Record<string, { label: string; tone: 'danger' | 'warning' | 'amber' | 'neutral' }> = {
  CRITICAL: { label: 'Critical', tone: 'danger' },
  MAJOR: { label: 'Major', tone: 'warning' },
  MINOR: { label: 'Minor', tone: 'amber' },
  TRIVIAL: { label: 'Trivial', tone: 'neutral' },
};

export const BUG_STATE_MAP: Record<string, { label: string; tone: 'neutral' | 'accent' | 'success' | 'warning' }> = {
  NEW: { label: 'New', tone: 'neutral' },
  TRIAGED: { label: 'Triaged', tone: 'accent' },
  IN_PROGRESS: { label: 'In progress', tone: 'accent' },
  RESOLVED: { label: 'Resolved', tone: 'success' },
  VERIFIED: { label: 'Verified', tone: 'success' },
  WONT_FIX: { label: "Won't fix", tone: 'neutral' },
  DUPLICATE: { label: 'Duplicate', tone: 'warning' },
};

export function humanize(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export function getStatusMeta(status?: string | null): StatusMeta {
  if (!status) return { label: 'To do', tone: 'neutral', icon: 'circle-dashed' };
  const normalized = status.toUpperCase();
  return (
    STATUS_MAP[normalized] || {
      label: humanize(status),
      tone: 'neutral',
      icon: 'circle-dashed',
    }
  );
}

export function getPriorityMeta(priority?: string | null) {
  if (!priority) return { label: 'None', tone: 'neutral' as const, icon: 'minus' };
  const normalized = priority.toUpperCase();
  return (
    PRIORITY_MAP[normalized] || {
      label: humanize(priority),
      tone: 'neutral' as const,
      icon: 'minus',
    }
  );
}

export function getSeverityMeta(severity?: string | null) {
  if (!severity) return { label: 'Minor', tone: 'amber' as const };
  const normalized = severity.toUpperCase();
  return (
    SEVERITY_MAP[normalized] || {
      label: humanize(severity),
      tone: 'neutral' as const,
    }
  );
}
