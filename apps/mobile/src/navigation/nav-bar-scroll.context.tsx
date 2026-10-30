import React, { createContext, useContext, useRef } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NavBarScrollContextValue {
  translateY: Animated.Value;
  showNavBar: () => void;
  hideNavBar: () => void;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const NavBarScrollContext = createContext<NavBarScrollContextValue | null>(null);

export const NavBarScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const showNavBar = () => {
    if (isHidden.current) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        isHidden.current = false;
      });
    }
  };

  const hideNavBar = () => {
    if (!isHidden.current) {
      Animated.timing(translateY, {
        toValue: 88,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        isHidden.current = true;
      });
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 8 && currentY > 50) {
      hideNavBar();
    } else if (diff < -8) {
      showNavBar();
    }

    lastScrollY.current = currentY;
  };

  return (
    <NavBarScrollContext.Provider
      value={{
        translateY,
        showNavBar,
        hideNavBar,
        onScroll,
      }}
    >
      {children}
    </NavBarScrollContext.Provider>
  );
};

export function useNavBarScroll() {
  const context = useContext(NavBarScrollContext);
  if (!context) {
    return {
      translateY: new Animated.Value(0),
      showNavBar: () => {},
      hideNavBar: () => {},
      onScroll: () => {},
    };
  }
  return context;
}

export function useBottomInset(): number {
  const insets = useSafeAreaInsets();
  const navbarHeight = 64;
  return navbarHeight + insets.bottom + 8;
}
