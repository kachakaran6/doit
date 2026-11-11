import React from 'react';
import { useSheetStore } from './sheet.store';
import { WorkspaceSwitcherSheet } from '../../features/workspace/components/WorkspaceSwitcherSheet';
import { ProjectSwitcherSheet } from '../../features/workspace/components/ProjectSwitcherSheet';
import { AccountMenuSheet } from '../../features/settings/components/AccountMenuSheet';
import { navigationRef } from '../../navigation/navigationRef';

export const GlobalSheets: React.FC = () => {
  const isWorkspaceSheetOpen = useSheetStore((s) => s.isWorkspaceSheetOpen);
  const closeWorkspaceSheet = useSheetStore((s) => s.closeWorkspaceSheet);
  const openWorkspaceSheet = useSheetStore((s) => s.openWorkspaceSheet);

  const isProjectSheetOpen = useSheetStore((s) => s.isProjectSheetOpen);
  const closeProjectSheet = useSheetStore((s) => s.closeProjectSheet);
  const openProjectSheet = useSheetStore((s) => s.openProjectSheet);

  const isAccountMenuOpen = useSheetStore((s) => s.isAccountMenuOpen);
  const closeAccountMenu = useSheetStore((s) => s.closeAccountMenu);

  return (
    <>
      <WorkspaceSwitcherSheet
        visible={isWorkspaceSheetOpen}
        onClose={closeWorkspaceSheet}
      />
      <ProjectSwitcherSheet
        visible={isProjectSheetOpen}
        onClose={closeProjectSheet}
      />
      <AccountMenuSheet
        visible={isAccountMenuOpen}
        onClose={closeAccountMenu}
        onNavigateSettings={() => {
          closeAccountMenu();
          if (navigationRef.isReady()) {
            navigationRef.navigate('Settings' as never);
          }
        }}
        onOpenWorkspaceSwitcher={() => {
          closeAccountMenu();
          setTimeout(openWorkspaceSheet, 150);
        }}
        onOpenProjectSwitcher={() => {
          closeAccountMenu();
          setTimeout(openProjectSheet, 150);
        }}
      />
    </>
  );
};

