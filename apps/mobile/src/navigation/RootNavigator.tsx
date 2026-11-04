import React, { useEffect } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabsNavigator } from './TabsNavigator';
import {
  TaskDetailScreen,
  BugDetailScreen,
  CaptureModal,
  AuthScreen,
  InviteAcceptScreen,
} from '../screens';
import { StickyBoardScreen } from '../features/stickies';
import { SettingsScreen } from '../features/settings';
import { TeamMembersScreen } from '../features/workspace';
import { PendingSyncScreen } from '../features/outbox/screens/PendingSyncScreen';
import { NotificationsScreen } from '../features/notifications';
import { ComponentGallery } from '../core/dev/ComponentGallery';
import { FoundationGallery } from '../core/dev/FoundationGallery';
import { NavBarScrollProvider } from './nav-bar-scroll.context';
import { useAuthStore } from '../features/auth/store';
import { useWorkspaceStore } from '../features/workspace/store';
import { useVersionPolicy } from '../features/system/useVersionPolicy';
import { ForceUpdateScreen } from '../features/system/ForceUpdateScreen';

import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'doit://',
    'samyukt://',
    'https://doit.kachakaran.tech',
    'https://doit.samyukt.pro',
    'https://app.samyukt.com',
    'https://samyukt.com',
  ],
  config: {
    screens: {
      Auth: 'auth',
      InviteAccept: 'invite/:token',
      TeamMembers: 'team',
      MainTabs: {
        screens: {
          Home: 'home',
          Tasks: 'tasks',
          Bugs: 'bugs',
          Search: 'search',
        },
      },
      TaskDetail: 'task/:id',
      BugDetail: 'bug/:id',
      StickyBoard: 'stickies',
      CaptureModal: 'capture',
      Settings: 'settings',
      PendingSync: 'sync',
      Notifications: 'notifications',
      DevGallery: 'dev/gallery',
      FoundationGallery: 'dev/foundation',
    },
  },
};

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const versionPolicy = useVersionPolicy();

  useEffect(() => {
    useAuthStore.getState().initAuth().catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      useWorkspaceStore.getState().fetchAndInitializeWorkspaces().catch(() => {});
    }
  }, [isAuthenticated]);

  if (versionPolicy.checked && versionPolicy.needsUpdate) {
    return (
      <ForceUpdateScreen
        minVersion={versionPolicy.minAppVersion}
        downloadUrl={versionPolicy.downloadUrl}
      />
    );
  }

  return (
    <NavBarScrollProvider>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'MainTabs' : 'Auth'}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* Always permit invitation acceptance deep-links */}
          <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />

          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabsNavigator} />
              <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
              <Stack.Screen name="BugDetail" component={BugDetailScreen} />
              <Stack.Screen name="StickyBoard" component={StickyBoardScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="TeamMembers" component={TeamMembersScreen} />
              <Stack.Screen name="PendingSync" component={PendingSyncScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen
                name="CaptureModal"
                component={CaptureModal}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen name="DevGallery" component={ComponentGallery} />
              <Stack.Screen name="FoundationGallery" component={FoundationGallery} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavBarScrollProvider>
  );
};
