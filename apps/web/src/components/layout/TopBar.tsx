import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Search, Plus, Menu, ChevronDown, CheckSquare, Bug, StickyNote, Bell } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--background)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Mobile Menu button + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
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

      {/* Right: Single Global Create Split Button */}
      <div className="relative flex items-center gap-2">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
        >
          <Bell className="w-4 h-4" />
        </Link>
        <div className="inline-flex rounded-lg shadow-xs">
          <Button
            size="sm"
            onClick={() => onOpenCreate('task')}
            className="rounded-r-none border-r border-white/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New task</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="rounded-l-none px-2"
            aria-label="More create options"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>

        {dropdownOpen && (
          <div
            className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-[var(--popover)] text-[var(--popover-foreground)] shadow-xl border border-[var(--border)] p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onOpenCreate('task');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer text-left"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[var(--primary-text)]" />
              <span>Create task</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onOpenCreate('bug');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer text-left"
            >
              <Bug className="w-3.5 h-3.5 text-[var(--danger-text)]" />
              <span>Report bug</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onOpenCreate('sticky');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer text-left"
            >
              <StickyNote className="w-3.5 h-3.5 text-[var(--warning-text)]" />
              <span>New sticky note</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
