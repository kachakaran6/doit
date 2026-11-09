import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, Menu, ChevronDown, CheckSquare, Bug, StickyNote, Bell, FolderKanban, UserPlus } from 'lucide-react';
import { CreateType } from './CreateModal';

export function TopBar({
  onOpenSearch,
  onOpenCreate,
  onToggleMobileSidebar,
}: {
  onOpenSearch: () => void;
  onOpenCreate: (type: CreateType) => void;
  onToggleMobileSidebar: () => void;
}) {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--background)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Mobile Menu button (small screens) + Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search or command…</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--muted)] text-[10px] font-mono text-[var(--muted-foreground)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications, Create Split Button, and User Profile Menu */}
      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Global Create Split Button with Shadcn DropdownMenu */}
        <div className="relative inline-flex rounded-lg shadow-xs">
          <Button
            size="sm"
            onClick={() => onOpenCreate('task')}
            className="rounded-r-none border-r border-white/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New task</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="rounded-l-none px-2"
                aria-label="More create options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onOpenCreate('task')}>
                <CheckSquare className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                <span>Create task</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenCreate('bug')}>
                <Bug className="w-3.5 h-3.5 text-[var(--danger-text)]" />
                <span>Report bug</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenCreate('sticky')}>
                <StickyNote className="w-3.5 h-3.5 text-[var(--warning-text)]" />
                <span>New sticky note</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/projects')}>
                <FolderKanban className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                <span>New project</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/team')}>
                <UserPlus className="w-3.5 h-3.5 text-[var(--success-text)]" />
                <span>Invite people</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Separator & Workspace Switcher in the top right corner */}
        <div className="h-5 w-[1px] bg-[var(--border)] mx-1" />
        <WorkspaceSwitcher />
      </div>
    </header>
  );
}
