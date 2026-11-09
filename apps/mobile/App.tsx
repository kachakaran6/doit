import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { KeyboardProvider } from './src/core/providers/KeyboardProvider';
import { OutboxProvider } from './src/core/providers/OutboxProvider';
import { ShakeCaptureProvider } from './src/core/providers/ShakeCaptureProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlobalSheets } from './src/core/sheets/GlobalSheets';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <OutboxProvider>
              <KeyboardProvider>
                <ShakeCaptureProvider>
                  <View style={styles.root}>
                    <RootNavigator />
                    <GlobalSheets />
                  </View>
                </ShakeCaptureProvider>
              </KeyboardProvider>
            </OutboxProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

