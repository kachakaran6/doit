import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import { FloatingNavBar } from '../components/ui/FloatingNavBar';
import { HomeScreen } from '../screens/HomeScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { BugsScreen } from '../screens/BugsScreen';
import { SearchScreen } from '../screens/SearchScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const DummyStub: React.FC = () => <View />;

export const TabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <FloatingNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen
        name="CaptureStub"
        component={DummyStub}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('CaptureModal', { initialMode: 'task' });
          },
        })}
      />
      <Tab.Screen name="Bugs" component={BugsScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
};
