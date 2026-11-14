import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme, StatusBar as RNStatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  ThemeContext,
  ThemeMode,
  Accent,
  ThemeContextValue,
  buildThemeColors,
  normalizeAccent,
} from './useTheme';
import { ThemeStorage } from './theme.storage';
import { spacing, radius, typography, dimensions, elevation } from '@doit/tokens';
import { overlayService } from '../native/overlay';

function toAndroidColor(input: string, fallback: string): string {
  const value = (input || '').trim();
  const match = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i,
  );
  if (!match) {
    return value.startsWith('#') ? value : fallback;
  }
  const channel = (raw: string) =>
    Math.max(0, Math.min(255, Math.round(Number(raw)))).toString(16).padStart(2, '0');
  const alphaSource = match[4];
  const alpha = alphaSource == null
    ? 255
    : Math.round(Number(alphaSource) <= 1 ? Number(alphaSource) * 255 : Number(alphaSource));
  return `#${channel(String(alpha))}${channel(match[1] || '0')}${channel(match[2] || '0')}${channel(match[3] || '0')}`;
}

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
    normalizeAccent(initialAccent || ThemeStorage.getAccent() || 'blue'),
  );

  // Rehydrate persisted theme & accent asynchronously without causing initial render flashes
  useEffect(() => {
    ThemeStorage.loadPersisted().then(({ mode: persistedMode, accent: persistedAccent }) => {
      if (persistedMode && persistedMode !== mode) {
        setModeState(persistedMode);
      }
      if (persistedAccent && persistedAccent !== accent) {
        setAccentState(persistedAccent);
      }
    });
  }, []);

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
    const normalized = normalizeAccent(newAccent);
    setAccentState(normalized);
    ThemeStorage.setAccent(normalized);
  };

  const colors = useMemo(() => {
    return buildThemeColors(resolvedTheme, accent);
  }, [resolvedTheme, accent]);

  // Synchronize Android native Status Bar with active theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        RNStatusBar.setBarStyle(resolvedTheme === 'light' ? 'dark-content' : 'light-content', true);
        RNStatusBar.setBackgroundColor('transparent', true);
      } catch {
        // Ignore on platforms without native statusbar control
      }
    }
  }, [resolvedTheme]);

  // Synchronize Android native overlay with active theme and accent
  useEffect(() => {
    if (Platform.OS === 'android') {
      overlayService.updateThemeConfig(
        mode,
        resolvedTheme,
        accent,
        toAndroidColor(colors.accent, '#3A66F2'),
        toAndroidColor(colors.accentSoft, resolvedTheme === 'dark' ? '#293A66F2' : '#1F2F5BEA'),
      );
    }
  }, [mode, resolvedTheme, accent, colors.accent, colors.accentSoft]);

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
        backgroundColor="transparent"
        translucent={true}
      />
      {children}
    </ThemeContext.Provider>
  );
};
