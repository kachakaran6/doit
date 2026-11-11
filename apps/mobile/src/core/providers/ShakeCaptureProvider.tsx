import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { shakeDetector, ShakeSensitivity, ShakeDiagnostics } from '../../native/shake';
import { navigateToCapture } from '../../navigation/navigationRef';
import { overlayService } from '../../native/overlay';
import { useAuthStore } from '../../features/auth/store';
import * as SecureStore from 'expo-secure-store';

interface ShakeCaptureContextValue {
  shakeEnabled: boolean;
  setShakeEnabled: (enabled: boolean) => void;
  sensitivity: ShakeSensitivity;
  setSensitivity: (s: ShakeSensitivity) => void;
  isAvailable: boolean;
  diagnostics: ShakeDiagnostics;
  testMode: boolean;
  setTestMode: (active: boolean) => void;
  testShakeSuccess: boolean;
}

const ShakeCaptureContext = createContext<ShakeCaptureContextValue | null>(null);

const STORAGE_SHAKE_ENABLED = 'com.samyukt.doit.shake_enabled';
const STORAGE_SHAKE_SENSITIVITY = 'com.samyukt.doit.shake_sensitivity';

export const ShakeCaptureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [shakeEnabled, setShakeEnabledState] = useState<boolean>(true);
  const [sensitivity, setSensitivityState] = useState<ShakeSensitivity>('medium');
  const [testMode, setTestModeState] = useState<boolean>(false);
  const [testShakeSuccess, setTestShakeSuccess] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<ShakeDiagnostics>({
    isAvailable: true,
    isListening: false,
    currentMagnitude: 0,
    threshold: 14.5,
    reversalsCount: 0,
    lastShakeTime: null,
    rawX: 0,
    rawY: 0,
    rawZ: 0,
  });

  const testTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved preferences
  useEffect(() => {
    (async () => {
      try {
        const savedEnabled = await SecureStore.getItemAsync(STORAGE_SHAKE_ENABLED);
        if (savedEnabled !== null) {
          setShakeEnabledState(savedEnabled === 'true');
        }
        const savedSens = (await SecureStore.getItemAsync(STORAGE_SHAKE_SENSITIVITY)) as ShakeSensitivity | null;
        if (savedSens && ['low', 'medium', 'high'].includes(savedSens)) {
          setSensitivityState(savedSens);
          shakeDetector.setSensitivity(savedSens);
        }
      } catch {
        // Fallback to defaults
      }
    })();
  }, []);

  const setShakeEnabled = useCallback((enabled: boolean) => {
    setShakeEnabledState(enabled);
    SecureStore.setItemAsync(STORAGE_SHAKE_ENABLED, String(enabled)).catch(() => {});
  }, []);

  const setSensitivity = useCallback((sens: ShakeSensitivity) => {
    setSensitivityState(sens);
    shakeDetector.setSensitivity(sens);
    SecureStore.setItemAsync(STORAGE_SHAKE_SENSITIVITY, sens).catch(() => {});
  }, []);

  const setTestMode = useCallback((active: boolean) => {
    setTestModeState(active);
    setTestShakeSuccess(false);
    shakeDetector.setTestMode(active);
  }, []);

  // Listen to shake diagnostics
  useEffect(() => {
    return shakeDetector.subscribeDiagnostics((diag) => {
      setDiagnostics(diag);
    });
  }, []);

  // Main shake handler
  useEffect(() => {
    if (!shakeEnabled && !testMode) {
      shakeDetector.stopListening();
      return;
    }

    const onShakeDetected = () => {
      if (testMode) {
        // In test mode: flash visual/haptic indicator without opening capture
        setTestShakeSuccess(true);
        if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
        testTimeoutRef.current = setTimeout(() => {
          setTestShakeSuccess(false);
        }, 1800);
        return;
      }

      // Normal mode: only trigger if user is authenticated and app is in foreground
      if (isAuthenticated) {
        overlayService.showQuickCapture('TASK').then((shown) => {
          if (!shown) {
            navigateToCapture('task');
          }
        });
      }
    };

    const cleanup = shakeDetector.registerCallback(onShakeDetected);
    shakeDetector.startListening();

    return () => {
      cleanup();
      shakeDetector.stopListening(onShakeDetected);
    };
  }, [shakeEnabled, testMode, isAuthenticated]);

  return (
    <ShakeCaptureContext.Provider
      value={{
        shakeEnabled,
        setShakeEnabled,
        sensitivity,
        setSensitivity,
        isAvailable: diagnostics.isAvailable,
        diagnostics,
        testMode,
        setTestMode,
        testShakeSuccess,
      }}
    >
      {children}
    </ShakeCaptureContext.Provider>
  );
};

export function useShakeCapture(): ShakeCaptureContextValue {
  const context = useContext(ShakeCaptureContext);
  if (!context) {
    throw new Error('useShakeCapture must be used within ShakeCaptureProvider');
  }
  return context;
}
