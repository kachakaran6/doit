import { useLocation, Link } from 'react-router-dom';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const { activeWorkspace } = useWorkspaceStore();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getPageTitle = (seg: string) => {
    switch (seg) {
      case 'tasks':
        return 'Tasks';
      case 'bugs':
        return 'Bug Queue';
      case 'stickies':
        return 'Sticky Board';
      case 'team':
        return 'Team';
      case 'settings':
        return 'Settings';
      case 'projects':
        return 'Projects';
      case 'search':
        return 'Search';
      case 'notifications':
        return 'Inbox';
      case 'workspace':
        return 'Workspace';
      default:
        return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : '';
    }
  };

  const firstSeg = pathSegments[0];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[var(--muted-foreground)]">
      <Link
        to="/"
        className="hover:text-[var(--foreground)] transition-colors truncate max-w-[140px] font-medium"
      >
        {activeWorkspace?.name || 'Workspace'}
      </Link>

      {firstSeg ? (
        <>
          <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
          <span className="font-semibold text-[var(--foreground)] truncate">
            {getPageTitle(firstSeg)}
          </span>
        </>
      ) : (
        <>
          <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
          <span className="font-semibold text-[var(--foreground)]">Overview</span>
        </>
      )}
    </nav>
  );
}
