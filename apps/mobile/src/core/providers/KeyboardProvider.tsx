import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

export type KeyboardContextType =
  | 'task_title'
  | 'task_desc'
  | 'bug_desc'
  | 'comment'
  | 'sticky_body'
  | 'search'
  | 'none';

export interface KeyboardState {
  keyboardContext: KeyboardContextType;
  setKeyboardContext: (ctx: KeyboardContextType) => void;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  activeValues: Record<string, any>;
  setActiveValue: (key: string, val: any) => void;
  onAction?: (actionId: string, payload?: any) => void;
  setOnAction: (handler?: (actionId: string, payload?: any) => void) => void;
}

const KeyboardStateContext = createContext<KeyboardState>({
  keyboardContext: 'none',
  setKeyboardContext: () => {},
  keyboardHeight: 0,
  isKeyboardVisible: false,
  activeValues: {},
  setActiveValue: () => {},
  setOnAction: () => {},
});

export const KeyboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keyboardContext, setKeyboardContext] = useState<KeyboardContextType>('none');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [activeValues, setActiveValues] = useState<Record<string, any>>({});
  const [actionHandler, setActionHandler] = useState<((actionId: string, payload?: any) => void) | undefined>();

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const setActiveValue = useCallback((key: string, val: any) => {
    setActiveValues((prev) => {
      if (prev[key] === val) return prev;
      return { ...prev, [key]: val };
    });
  }, []);

  const setKeyboardContextCallback = useCallback((ctx: KeyboardContextType) => {
    setKeyboardContext((prev) => (prev === ctx ? prev : ctx));
  }, []);

  const setOnActionCallback = useCallback((handler?: (actionId: string, payload?: any) => void) => {
    setActionHandler(() => handler);
  }, []);

  return (
    <KeyboardStateContext.Provider
      value={{
        keyboardContext,
        setKeyboardContext: setKeyboardContextCallback,
        keyboardHeight,
        isKeyboardVisible,
        activeValues,
        setActiveValue,
        onAction: actionHandler,
        setOnAction: setOnActionCallback,
      }}
    >
      {children}
    </KeyboardStateContext.Provider>
  );
};

export function useKeyboardBar() {
  return useContext(KeyboardStateContext);
}

export function useKeyboardInset() {
  const { keyboardHeight, isKeyboardVisible } = useKeyboardBar();
  return isKeyboardVisible ? keyboardHeight : 0;
}
