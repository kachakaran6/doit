import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { DefaultTheme, DarkTheme, NavigationContainer, LinkingOptions, getStateFromPath } from '@react-navigation/native';
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
import { OurAppsScreen } from '../screens/OurAppsScreen';
import { playUpdateService } from '../services/playStore/playUpdateService';
import { StickyBoardScreen } from '../features/stickies';
import { SettingsScreen } from '../features/settings';
import { AiProviderScreen } from '../features/settings/screens/AiProviderScreen';
import { QuickCapturePrefsScreen } from '../features/settings/screens/QuickCapturePrefsScreen';
import { ProjectContextScreen } from '../features/projects/ProjectContextScreen';
import { TeamMembersScreen } from '../features/workspace';
import { PendingSyncScreen } from '../features/outbox/screens/PendingSyncScreen';
import { NotificationsScreen } from '../features/notifications';
import { TrashScreen } from '../features/tasks/screens/TrashScreen';
import { ComponentGallery } from '../core/dev/ComponentGallery';
import { FoundationGallery } from '../core/dev/FoundationGallery';
import { NavBarScrollProvider } from './nav-bar-scroll.context';
import { useAuthStore } from '../features/auth/store';
import { useWorkspaceStore } from '../features/workspace/store';
import { useVersionPolicy } from '../features/system/useVersionPolicy';
import { ForceUpdateScreen } from '../features/system/ForceUpdateScreen';

import { navigationRef } from './navigationRef';
import { extractInviteToken } from './invite-link';
import { useTheme } from '../theme/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

let hasProcessedInitialUrl = false;

const linking: LinkingOptions<RootStackParamList> = {
  async getInitialURL() {
    if (hasProcessedInitialUrl) return null;
    const url = await Linking.getInitialURL();
    if (!url) return null;
    if (/\/invite(?:\/|$)/i.test(url) && !extractInviteToken(url)) {
      return null;
    }
    hasProcessedInitialUrl = true;
    return url;
  },
  subscribe(listener) {
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (/\/invite(?:\/|$)/i.test(url) && !extractInviteToken(url)) return;
      listener(url);
    });
    return () => sub.remove();
  },
  getStateFromPath(path, options) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (normalized === '/' || normalized === '') return undefined;
    if (/^\/invite\/?$/.test(normalized)) return undefined;
    const invite = normalized.match(/^\/invite\/([^/?#]+)/);
    if (invite && !extractInviteToken(`doit://invite/${invite[1]}`)) return undefined;
    return getStateFromPath(path, options);
  },
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
      CaptureModal: 'capture/:initialMode?',
      Settings: 'settings',
      PendingSync: 'sync',
      Notifications: 'notifications',
      Trash: 'trash',
      DevGallery: 'dev/gallery',
      FoundationGallery: 'dev/foundation',
    },
  },
};

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const versionPolicy = useVersionPolicy();
  const { colors, resolvedTheme } = useTheme();
  const baseTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.canvas,
      card: 'transparent',
      border: 'transparent',
    },
  };

  useEffect(() => {
    useAuthStore.getState().initAuth().catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      useWorkspaceStore.getState().fetchAndInitializeWorkspaces().catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    playUpdateService.init();
    return () => playUpdateService.destroy();
  }, []);

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
      <NavigationContainer ref={navigationRef} linking={linking} theme={navigationTheme}>
        <Stack.Navigator
          key={isAuthenticated ? 'signed-in' : 'signed-out'}
          initialRouteName={isAuthenticated ? 'MainTabs' : 'Auth'}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabsNavigator} />
              <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
              <Stack.Screen name="BugDetail" component={BugDetailScreen} />
              <Stack.Screen name="StickyBoard" component={StickyBoardScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="AiProvider" component={AiProviderScreen} />
              <Stack.Screen name="QuickCapturePrefs" component={QuickCapturePrefsScreen} />
              <Stack.Screen name="ProjectContext" component={ProjectContextScreen} />
              <Stack.Screen name="TeamMembers" component={TeamMembersScreen} />
              <Stack.Screen name="PendingSync" component={PendingSyncScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Trash" component={TrashScreen} />
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
          <Stack.Screen name="OurApps" component={OurAppsScreen} />
          <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavBarScrollProvider>
  );
};
