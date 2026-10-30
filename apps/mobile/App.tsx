import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { KeyboardProvider } from './src/core/providers/KeyboardProvider';
import { OutboxProvider } from './src/core/providers/OutboxProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OutboxProvider>
            <KeyboardProvider>
              <RootNavigator />
            </KeyboardProvider>
          </OutboxProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
