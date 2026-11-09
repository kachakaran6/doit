import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { CreateModal } from './CreateModal';
import { useSidebarStore } from '@/lib/sidebar-store';
import { useCreateStore } from '@/lib/create-store';

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { open: createModalOpen, type: createType, openCreate, closeCreate } = useCreateStore();
  const toggleSidebar = useSidebarStore((s) => s.toggle);

  // Global ⌘K / Ctrl+K, ⌘B / Ctrl+B, and 'c' shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openCreate('task');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, openCreate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full h-full animate-in slide-in-from-left duration-200">
            <Sidebar
              mobile
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenCreate={(type) => openCreate(type)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCreate={(type) => openCreate(type)}
      />

      <CreateModal
        open={createModalOpen}
        onClose={closeCreate}
        initialType={createType}
      />
    </div>
  );
}
