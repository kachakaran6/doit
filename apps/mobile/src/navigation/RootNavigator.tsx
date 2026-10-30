import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabsNavigator } from './TabsNavigator';
import { TaskDetailScreen, BugDetailScreen, CaptureModal, AuthScreen } from '../screens';
import { ComponentGallery } from '../app/dev/ComponentGallery';
import { NavBarScrollProvider } from './nav-bar-scroll.context';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['samyukt://', 'https://samyukt.com'],
  config: {
    screens: {
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
      Auth: 'auth',
      DevGallery: 'dev/gallery',
    },
  },
};

export const RootNavigator: React.FC = () => {
  return (
    <NavBarScrollProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="MainTabs" component={TabsNavigator} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="BugDetail" component={BugDetailScreen} />
          <Stack.Screen
            name="CaptureModal"
            component={CaptureModal}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="DevGallery" component={ComponentGallery} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavBarScrollProvider>
  );
};
