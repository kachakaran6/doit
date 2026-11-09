import React from 'react';
import { BackHandler } from 'react-native';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { useBackNavigationStore } from '../../navigation/back-navigation.store';

/**
 * ExitConfirmDialog
 * Professional confirmation dialog shown on Android when the user is at the root screen
 * and presses hardware back or performs an edge back swipe gesture.
 *
 * Requirements:
 * - Title: "Exit DoIt?"
 * - Description: "Are you sure you want to close the application?"
 * - Cancel: dismisses dialog
 * - Exit App: gracefully closes the application via BackHandler.exitApp()
 * - Pressing back while dialog is open dismisses it
 */
export const ExitConfirmDialog: React.FC = () => {
  const isExitDialogOpen = useBackNavigationStore((s) => s.isExitDialogOpen);
  const closeExitDialog = useBackNavigationStore((s) => s.closeExitDialog);

  const handleExit = () => {
    closeExitDialog();
    BackHandler.exitApp();
  };

  return (
    <ConfirmationDialog
      visible={isExitDialogOpen}
      title="Exit DoIt?"
      message="Are you sure you want to close the application?"
      confirmLabel="Exit App"
      cancelLabel="Cancel"
      destructive
      onConfirm={handleExit}
      onCancel={closeExitDialog}
    />
  );
};

