import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme, StatusBar as RNStatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  ThemeContext,
  ThemeMode,
  Accent,
  ThemeContextValue,
  buildThemeColors,
} from './useTheme';
import { ThemeStorage } from './theme.storage';
import { spacing, radius, typography, dimensions, elevation } from '@doit/tokens';

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialAccent?: Accent;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode,
  initialAccent,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(
    initialMode || ThemeStorage.getMode() || 'dark',
  );
  const [accent, setAccentState] = useState<Accent>(
    initialAccent || ThemeStorage.getAccent() || 'indigo',
  );

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    ThemeStorage.setMode(newMode);
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
    ThemeStorage.setAccent(newAccent);
  };

  const colors = useMemo(() => {
    return buildThemeColors(resolvedTheme, accent);
  }, [resolvedTheme, accent]);

  // Synchronize Android and iOS System Status Bar with active theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        RNStatusBar.setBackgroundColor(colors.bg, true);
        RNStatusBar.setBarStyle(resolvedTheme === 'light' ? 'dark-content' : 'light-content', true);
      } catch {
        // Ignore on platforms without native statusbar control
      }
    }
  }, [resolvedTheme, colors.bg]);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      mode,
      resolvedTheme,
      accent,
      colors,
      spacing,
      radius,
      typography,
      dimensions,
      elevation,
      setMode,
      setAccent,
    }),
    [mode, resolvedTheme, accent, colors],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ExpoStatusBar
        style={resolvedTheme === 'light' ? 'dark' : 'light'}
        backgroundColor={colors.bg}
        translucent={false}
      />
      {children}
    </ThemeContext.Provider>
  );
};
