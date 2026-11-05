import { NavLink } from 'react-router-dom';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useThemeStore } from '@/lib/theme-store';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { UserMenu } from './UserMenu';
import {
  LayoutDashboard,
  CheckSquare,
  Bug,
  StickyNote,
  Users,
  Settings,
  Folder,
} from 'lucide-react';

export function Sidebar({
  mobile = false,
  onCloseMobile,
}: {
  mobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const { projects, activeProject, setActiveProject } = useWorkspaceStore();
  const { mode } = useThemeStore();

  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/bugs', label: 'Bug Queue', icon: Bug },
    { to: '/stickies', label: 'Stickies', icon: StickyNote },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = () => {
    if (mobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Brand Logo Header */}
        <div className="p-4 pb-2 flex items-center justify-between">
          <img
            src={isDarkMode ? '/logo-horizontal-dark.svg' : '/logo-horizontal-light.svg'}
            alt="DoIt"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 pb-3">
          <WorkspaceSwitcher />
        </div>

        {/* Main Navigation */}
        <div className="px-3 space-y-0.5">
          <div className="px-2 py-1 text-[11px] font-medium text-[var(--muted-foreground)]">
            Workspace
          </div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)] font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Projects Sub-section */}
        {projects.length > 0 && (
          <div className="px-3 pt-4 space-y-0.5">
            <div className="px-2 py-1 text-[11px] font-medium text-[var(--muted-foreground)] flex items-center justify-between">
              <span>Projects</span>
              <span className="text-[10px] tabular">{projects.length}</span>
            </div>
            {projects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProject(p);
                    handleNavClick();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)] font-semibold'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-[var(--primary-text)] shrink-0 opacity-80" />
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono">{p.key}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[var(--sidebar-border)] shrink-0">
        <UserMenu />
      </div>
    </aside>
  );
}
