import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (parts.length >= 2 && first && last && first[0] && last[0]) {
      return (first[0] + last[0]).toUpperCase();
    }
    if (first) {
      return first.slice(0, 2).toUpperCase();
    }
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

function getDeterministicColor(str?: string | null): string {
  const colors = [
    '#2F5BEA', // Blue
    '#7B54E8', // Violet
    '#0E8550', // Green
    '#C24E07', // Orange
    '#D6305A', // Rose
    '#0284C7', // Sky
    '#4F46E5', // Indigo
  ];
  if (!str) return colors[0] ?? '#2F5BEA';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? colors[0] ?? '#2F5BEA';
}

export function Avatar({ name, email, src, size = 'md', className, ...props }: AvatarProps) {
  const initials = getInitials(name, email);
  const bgColor = getDeterministicColor(name || email);

  const sizes = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-[12px]',
    lg: 'w-10 h-10 text-[14px]',
    xl: 'w-14 h-14 text-[18px]',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none overflow-hidden',
        sizes[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
      {...props}
    >
      {src ? (
        <img src={src} alt={name || email || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
