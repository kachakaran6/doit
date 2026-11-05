import { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();
  const { loadWorkspaces, activeWorkspace } = useWorkspaceStore();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated && !activeWorkspace) {
      loadWorkspaces();
    }
  }, [isAuthenticated, activeWorkspace, loadWorkspaces]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        <span className="mt-3 text-[13px] text-[var(--muted-foreground)]">Connecting to DoIt…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
