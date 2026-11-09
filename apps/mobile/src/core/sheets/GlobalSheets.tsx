import React from 'react';
import { useSheetStore } from './sheet.store';
import { WorkspaceSwitcherSheet } from '../../features/workspace/components/WorkspaceSwitcherSheet';
import { ProjectSwitcherSheet } from '../../features/workspace/components/ProjectSwitcherSheet';
import { AccountMenuSheet } from '../../features/settings/components/AccountMenuSheet';
import { navigationRef } from '../../navigation/navigationRef';

export const GlobalSheets: React.FC = () => {
  const {
    isWorkspaceSheetOpen,
    closeWorkspaceSheet,
    openWorkspaceSheet,
    isProjectSheetOpen,
    closeProjectSheet,
    openProjectSheet,
    isAccountMenuOpen,
    closeAccountMenu,
  } = useSheetStore();

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

