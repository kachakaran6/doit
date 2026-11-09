import { Link } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useThemeStore } from '@/lib/theme-store';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';

export function TopBar({
  onOpenSearch,
  onToggleMobileSidebar,
}: {
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
}) {
  const { mode, setMode } = useThemeStore();
  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

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

      {/* Right: Theme Toggle, Notifications, and Workspace Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
          className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Separator & Workspace Switcher in the top right corner */}
        <div className="h-5 w-[1px] bg-[var(--border)] mx-1" />
        <WorkspaceSwitcher />
      </div>
    </header>
  );
}
