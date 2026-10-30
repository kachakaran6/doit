import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabsNavigator } from './TabsNavigator';
import { TaskDetailScreen, BugDetailScreen, CaptureModal, AuthScreen } from '../screens';
import { SettingsScreen } from '../features/settings';
import { PendingSyncScreen } from '../features/outbox/screens/PendingSyncScreen';
import { NotificationsScreen } from '../features/notifications';
import { ComponentGallery } from '../core/dev/ComponentGallery';
import { NavBarScrollProvider } from './nav-bar-scroll.context';
import { useAuthStore } from '../features/auth/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['doit://', 'samyukt://', 'https://app.samyukt.com', 'https://samyukt.com'],
  config: {
    screens: {
      Auth: 'auth',
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
      CaptureModal: 'capture',
      Settings: 'settings',
      PendingSync: 'sync',
      Notifications: 'notifications',
      DevGallery: 'dev/gallery',
    },
  },
};

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavBarScrollProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'MainTabs' : 'Auth'}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabsNavigator} />
              <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
              <Stack.Screen name="BugDetail" component={BugDetailScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
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
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavBarScrollProvider>
  );
};
