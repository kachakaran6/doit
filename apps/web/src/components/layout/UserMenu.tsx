import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useThemeStore } from '@/lib/theme-store';
import { Avatar } from '@/components/ui/avatar';
import { Settings, LogOut, Sun, Moon, Laptop, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Signed in';
  const role =
    user?.memberships?.find((m) => m.workspaceId === activeWorkspace?.id)?.role ||
    activeWorkspace?.role;
  const { mode, setMode } = useThemeStore();
  const { info } = useToast();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    info('Signed out', 'You have been safely signed out.');
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        } p-2 rounded-xl hover:bg-[var(--sidebar-accent)] transition-colors text-left cursor-pointer group relative`}
        aria-label="User account menu"
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 min-w-0 flex-1'}`}>
          <Avatar name={displayName} email={user?.email} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[var(--foreground)] truncate leading-tight">
                {displayName}
              </div>
              <div className="text-[11px] text-[var(--muted-foreground)] leading-tight truncate">
                {user?.email || 'Signed in'}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <ChevronUp
            className={`w-4 h-4 text-[var(--muted-foreground)] shrink-0 transition-transform duration-150 group-hover:text-[var(--foreground)] ${
              open ? 'rotate-180' : ''
            }`}
          />
        )}

        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[12px] font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {displayName}
          </div>
        )}
      </button>

      {open && (
        <div className={`absolute bottom-full ${collapsed ? 'left-2' : 'left-0'} mb-2 w-60 rounded-xl bg-[var(--popover)] text-[var(--popover-foreground)] shadow-xl border border-[var(--border)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1`}>
          {/* User Info Header */}
          <div className="px-2.5 py-2 border-b border-[var(--border)]">
            <div className="text-[13px] font-semibold text-[var(--foreground)] truncate">
              {displayName}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] truncate">
              {user?.email}
              {role ? ` · ${role.charAt(0)}${role.slice(1).toLowerCase()}` : ''}
            </div>
          </div>

          {/* Theme Mode Selector */}
          <div className="px-2.5 py-1.5">
            <div className="text-[11px] font-medium text-[var(--muted-foreground)] mb-1.5">
              Theme
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[var(--muted)] p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  mode === 'light'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  mode === 'dark'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('system')}
                className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  mode === 'system'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Laptop className="w-3 h-3" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="pt-1 border-t border-[var(--border)] space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-[var(--danger-text)] hover:bg-[rgba(201,60,53,0.1)] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
