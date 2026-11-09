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
  Search,
  Inbox,
  Folder,
  Plus,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export function Sidebar({
  mobile = false,
  onCloseMobile,
  onOpenSearch,
}: {
  mobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSearch?: () => void;
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
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer group relative"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[12px] font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Expand sidebar (Ctrl+B)
              </div>
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
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer group relative"
                  title="Collapse sidebar (Ctrl+B)"
                  aria-label="Collapse sidebar"
                >
                  <ChevronsLeft className="w-4 h-4" />
                  <div className="absolute left-full ml-3 px-2 py-1 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[12px] font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Collapse (Ctrl+B)
                  </div>
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

          {/* Quick Search in-place action */}
          <button
            type="button"
            onClick={() => {
              onOpenSearch?.();
              handleNavClick();
            }}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2' : 'justify-between px-2.5 py-1.5'
            } rounded-lg text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer group relative`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
              {!isCollapsed && <span>Search</span>}
            </div>
            {!isCollapsed && (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)]">
                ⌘K
              </kbd>
            )}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[12px] font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Search (⌘K)
              </div>
            )}
          </button>

          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `w-full flex items-center ${
                  isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-2.5 py-1.5'
                } rounded-lg text-[13px] font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)] font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{label}</span>}

              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[12px] font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              )}
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
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-2.5 py-1.5'
                } rounded-lg text-[13px] transition-colors text-left cursor-pointer group relative ${
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

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[12px] font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {p.name} ({p.key})
                  </div>
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
