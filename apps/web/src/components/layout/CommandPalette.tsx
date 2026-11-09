import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useThemeStore } from '@/lib/theme-store';
import { api } from '@/lib/api';
import {
  Search,
  CheckSquare,
  Bug,
  StickyNote,
  LayoutDashboard,
  Settings,
  Users,
  Sun,
  Moon,
  Plus,
  ArrowRight,
} from 'lucide-react';

export function CommandPalette({
  open,
  onClose,
  onOpenCreate,
}: {
  open: boolean;
  onClose: () => void;
  onOpenCreate: (type: 'task' | 'bug' | 'sticky') => void;
}) {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceStore();
  const { mode, setMode } = useThemeStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global search debounced
  useEffect(() => {
    if (!query.trim() || !activeWorkspace) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.search.global(query.trim(), activeWorkspace.id);
        const combined: any[] = [];
        if (res.tasks) {
          res.tasks.slice(0, 5).forEach((t: any) =>
            combined.push({
              id: t.id,
              type: t.type === 'BUG' ? 'bug' : 'task',
              title: t.title,
              subtitle: t.humanId,
              action: () => {
                navigate(t.type === 'BUG' ? '/bugs' : '/tasks');
                onClose();
              },
            })
          );
        }
        if (res.stickies) {
          res.stickies.slice(0, 3).forEach((s: any) =>
            combined.push({
              id: s.id,
              type: 'sticky',
              title: s.body.slice(0, 45) + (s.body.length > 45 ? '…' : ''),
              subtitle: 'Sticky',
              action: () => {
                navigate('/stickies');
                onClose();
              },
            })
          );
        }
        setResults(combined);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, activeWorkspace, navigate, onClose]);

  // Static commands
  const defaultActions = [
    {
      id: 'create-task',
      title: 'Create new task',
      subtitle: 'Actions',
      icon: <Plus className="w-4 h-4 text-[var(--primary-text)]" />,
      action: () => {
        onClose();
        onOpenCreate('task');
      },
    },
    {
      id: 'report-bug',
      title: 'Report a bug',
      subtitle: 'Actions',
      icon: <Bug className="w-4 h-4 text-[var(--danger-text)]" />,
      action: () => {
        onClose();
        onOpenCreate('bug');
      },
    },
    {
      id: 'create-sticky',
      title: 'New sticky note',
      subtitle: 'Actions',
      icon: <StickyNote className="w-4 h-4 text-[var(--warning-text)]" />,
      action: () => {
        onClose();
        onOpenCreate('sticky');
      },
    },
    {
      id: 'nav-overview',
      title: 'Go to Overview',
      subtitle: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-[var(--muted-foreground)]" />,
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'nav-tasks',
      title: 'Go to Tasks',
      subtitle: 'Navigation',
      icon: <CheckSquare className="w-4 h-4 text-[var(--muted-foreground)]" />,
      action: () => {
        navigate('/tasks');
        onClose();
      },
    },
    {
      id: 'nav-bugs',
      title: 'Go to Bug Queue',
      subtitle: 'Navigation',
      icon: <Bug className="w-4 h-4 text-[var(--muted-foreground)]" />,
      action: () => {
        navigate('/bugs');
        onClose();
      },
    },
    {
      id: 'nav-stickies',
      title: 'Go to Sticky Board',
      subtitle: 'Navigation',
      icon: <StickyNote className="w-4 h-4 text-[var(--muted-foreground)]" />,
      action: () => {
        navigate('/stickies');
        onClose();
      },
    },
    {
      id: 'nav-team',
      title: 'Go to Team & Members',
      subtitle: 'Navigation',
      icon: <Users className="w-4 h-4 text-[var(--muted-foreground)]" />,
      action: () => {
        navigate('/team');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Navigation',
      icon: <Settings className="w-4 h-4 text-[var(--muted-foreground)]" />,
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} theme`,
      subtitle: 'Preferences',
      icon: mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
        onClose();
      },
    },
  ];

  const currentItems = query.trim() && results.length > 0 ? results : defaultActions;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % currentItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + currentItems.length) % currentItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentItems[selectedIndex]) {
        currentItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div
        className="relative w-full max-w-xl rounded-2xl bg-[var(--card)] shadow-2xl border border-[var(--border)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-[var(--border)]">
          <Search className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search tasks, bugs, stickies…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent px-3 py-3.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none border-none focus:outline-none focus:border-none focus:ring-0 focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 shadow-none ring-0"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          />
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shrink-0" />
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
          {currentItems.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[var(--muted-foreground)]">
              No results found for "{query}"
            </div>
          ) : (
            currentItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {item.icon ? (
                      item.icon
                    ) : item.type === 'bug' ? (
                      <Bug className="w-4 h-4 text-[var(--danger-text)] shrink-0" />
                    ) : item.type === 'task' ? (
                      <CheckSquare className="w-4 h-4 text-[var(--primary-text)] shrink-0" />
                    ) : (
                      <StickyNote className="w-4 h-4 text-[var(--warning-text)] shrink-0" />
                    )}
                    <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-[var(--muted-foreground)]">{item.subtitle}</span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[var(--primary-text)]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <span>Navigate with ↑ ↓</span>
          <span>Select with ↵</span>
          <span>Close with Esc</span>
        </div>
      </div>
    </div>
  );
}
