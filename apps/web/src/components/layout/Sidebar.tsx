import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useThemeStore } from '@/lib/theme-store';
import { useSidebarStore } from '@/lib/sidebar-store';
import { UserMenu } from './UserMenu';
import { NewProjectDialog } from './NewProjectDialog';
import {
  LayoutDashboard,
  CheckSquare,
  Bug,
  StickyNote,
  Users,
  FolderKanban,
  Inbox,
  Folder,
  Plus,
  ChevronsLeft,
} from 'lucide-react';

export function Sidebar({
  mobile = false,
  onCloseMobile,
}: {
  mobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const { projects, activeProject, setActiveProject } = useWorkspaceStore();
  const [projectOpen, setProjectOpen] = useState(false);
  const { mode } = useThemeStore();
  const { collapsed, toggle } = useSidebarStore();

  const isCollapsed = !mobile && collapsed;

  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/bugs', label: 'Bug Queue', icon: Bug },
    { to: '/stickies', label: 'Stickies', icon: StickyNote },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/notifications', label: 'Inbox', icon: Inbox },
  ];

  const handleNavClick = () => {
    if (mobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[68px]' : 'w-64'
      } h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col select-none transition-all duration-200 ease-in-out`}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
        {/* Brand Logo & Collapse Header */}
        <div
          className={`p-3.5 pb-2 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggle}
              className="p-1 rounded-xl hover:bg-[var(--sidebar-accent)] transition-all cursor-pointer flex items-center justify-center"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <img
                src="/app-icon-rounded.svg"
                alt="DoIt"
                className="w-8 h-8 rounded-lg shadow-2xs hover:scale-105 active:scale-95 transition-transform"
              />
            </button>
          ) : (
            <>
              <img
                src={isDarkMode ? '/logo-horizontal-dark.svg' : '/logo-horizontal-light.svg'}
                alt="DoIt"
                className="h-7 w-auto object-contain"
              />
              {!mobile && (
                <button
                  type="button"
                  onClick={toggle}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer"
                  title="Collapse sidebar (Ctrl+B)"
                  aria-label="Collapse sidebar"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Main Navigation */}
        <div className="px-2 space-y-0.5">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              Workspace
            </div>
          )}

          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={handleNavClick}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                `w-full flex items-center ${
                  isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-2.5 py-1.5'
                } rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)] font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Projects Sub-section */}
        <div className="px-2 pt-3 space-y-0.5">
          {!isCollapsed ? (
            <div className="px-2.5 py-1 text-[11px] font-medium text-[var(--muted-foreground)] flex items-center justify-between">
              <span>Projects</span>
              <button
                type="button"
                aria-label="New project"
                onClick={() => setProjectOpen(true)}
                className="p-0.5 rounded hover:bg-[var(--sidebar-accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="my-2 border-t border-[var(--sidebar-border)] mx-1" />
          )}

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
                title={isCollapsed ? `${p.name} (${p.key})` : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-2.5 py-1.5'
                } rounded-lg text-[13px] transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)] font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-[var(--primary-text)] shrink-0 opacity-80" />
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1">{p.name}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">{p.key}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Menu at Bottom */}
      <div className="p-2 border-t border-[var(--sidebar-border)] shrink-0">
        <UserMenu collapsed={isCollapsed} />
      </div>

      <NewProjectDialog open={projectOpen} onClose={() => setProjectOpen(false)} />
    </aside>
  );
}
