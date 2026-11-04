import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { BugsPage } from './pages/BugsPage';
import { StickiesPage } from './pages/StickiesPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { InviteAcceptPage } from './pages/InviteAcceptPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public invitation acceptance route */}
        <Route path="/invite/:token" element={<InviteAcceptPage />} />

        {/* Workspace dashboard & app layout routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="bugs" element={<BugsPage />} />
          <Route path="stickies" element={<StickiesPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
