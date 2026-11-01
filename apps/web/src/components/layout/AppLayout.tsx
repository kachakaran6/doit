import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Bug,
  StickyNote,
  Settings,
  Search,
  Plus,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppLayout() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('doit-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('doit-theme', 'light');
    }
  };

  const navLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/bugs', label: 'Bug Queue', icon: Bug },
    { to: '/stickies', label: 'Stickies', icon: StickyNote },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between shrink-0">
        <div>
          {/* Workspace Switcher Tile */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-[var(--surface-raised)] transition-colors">
              <div className="flex items-center gap-2.5">
                <img
                  src="/favicon.svg"
                  alt="DoIt Logo"
                  className="w-7 h-7 rounded object-contain border border-[var(--border)] bg-black/90 p-0.5 shadow-xs"
                />
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">DoIt Core</div>
                  <div className="text-xs text-[var(--text-secondary)]">Production WS</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center text-xs font-semibold">
              AS
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Alice Sharma</div>
              <div className="text-xs text-[var(--text-muted)]">alice@samyukt.com</div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
              <span>DoIt</span>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-semibold">Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search anything (Press /)..."
                className="w-full h-8 pl-9 pr-3 text-xs bg-[var(--surface-raised)] border border-[var(--border)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
