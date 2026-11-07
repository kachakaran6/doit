import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Workspace } from '@/lib/types';
import { ChevronDown, Check, Plus, Building, Settings, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace, loadWorkspaces } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);
  const { success, error } = useToast();
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

  const handleSelect = async (ws: Workspace) => {
    await setActiveWorkspace(ws);
    setOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      setCreating(true);
      const ws = await api.workspaces.create({ name: newWorkspaceName.trim() });
      success('Workspace created', `Switched to ${ws.name}`);
      await loadWorkspaces();
      await setActiveWorkspace(ws);
      setNewWorkspaceName('');
      setCreateModalOpen(false);
      setOpen(false);
    } catch (err: any) {
      error('Failed to create workspace', err.message);
    } finally {
      setCreating(false);
    }
  };

  const initials = activeWorkspace?.name ? activeWorkspace.name.slice(0, 2).toUpperCase() : 'DO';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white font-semibold flex items-center justify-center text-[12px] shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--foreground)] truncate leading-tight">
              {activeWorkspace?.name || 'Workspace'}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] leading-tight">
              {activeWorkspace?.role ? activeWorkspace.role.toLowerCase() : 'active'}
            </div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 transition-transform group-hover:text-[var(--foreground)]" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[var(--popover)] text-[var(--popover-foreground)] shadow-xl border border-[var(--border)] p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[11px] font-medium text-[var(--muted-foreground)]">
            Workspaces
          </div>
          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {workspaces.map((ws) => {
              const isSelected = activeWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleSelect(ws)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] font-semibold text-[var(--foreground)]'
                      : 'hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[var(--primary)] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-1 border-t border-[var(--border)] space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[var(--primary-text)] hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create workspace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/workspace/settings');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Workspace settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/team');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite people</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create new workspace"
        description="Workspaces isolate projects, teams, tasks, and settings."
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Workspace name"
            placeholder="Acme Engineering"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
