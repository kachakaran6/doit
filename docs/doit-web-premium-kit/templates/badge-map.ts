// Single source of truth for status / priority / severity presentation. Raw enums must NEVER reach the UI.
// Put in packages/ui-web (or contracts for the label part); <StatusBadge/>, <PriorityBadge/>, <SeverityBadge/> read from here.
export const STATUS = {
  backlog:     { label: 'Backlog',     tone: 'neutral', icon: 'circle-dashed' },
  todo:        { label: 'To do',       tone: 'neutral', icon: 'circle-dashed' },
  in_progress: { label: 'In progress', tone: 'accent',  icon: 'circle-half' },
  in_review:   { label: 'In review',   tone: 'violet',  icon: 'circle-half' },
  blocked:     { label: 'Blocked',     tone: 'danger',  icon: 'circle-x' },
  done:        { label: 'Done',        tone: 'success', icon: 'circle-check' },
  cancelled:   { label: 'Cancelled',   tone: 'neutral', icon: 'circle-x' },
} as const;
export const PRIORITY = {
  urgent: { label: 'Urgent', tone: 'danger',  icon: 'bars-4' },
  high:   { label: 'High',   tone: 'warning', icon: 'bars-3' },
  medium: { label: 'Medium', tone: 'accent',  icon: 'bars-2' },
  low:    { label: 'Low',    tone: 'neutral', icon: 'bars-1' },
  none:   { label: 'No priority', tone: 'neutral', icon: 'minus' },
} as const;
export const SEVERITY = {
  critical: { label: 'Critical', tone: 'danger' },
  major:    { label: 'Major',    tone: 'warning' },
  minor:    { label: 'Minor',    tone: 'amber' },
  trivial:  { label: 'Trivial',  tone: 'neutral' },
} as const;
export const BUG_STATE = {
  new: { label: 'New' }, triaged: { label: 'Triaged' }, in_progress: { label: 'In progress' },
  resolved: { label: 'Resolved' }, wont_fix: { label: "Won't fix" }, duplicate: { label: 'Duplicate' },
} as const;
// Tones map to tokens: neutral=muted, accent=primary-soft/primary-text, success/warning/danger use *-text on a soft tint.
// Fallback for unknown values: title-case the enum ("in_progress" -> "In progress") — never print it raw.
export const humanize = (v: string) => v.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase());
