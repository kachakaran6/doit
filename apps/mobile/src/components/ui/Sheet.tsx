import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useBottomInsets } from '../../layout/useBottomInsets';
import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  detent?: 0.5 | 0.9;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * P-02 Sheet:
 * 09-PROMPTS/P-02-shell.md & 02-SURFACE-SYSTEM.md
 * - Detents: 0.5 / 0.9
 * - Surface L1 / L2 background with 1px top highlight
 * - ZERO border
 * - Top radius 28 (radius.xl)
 * - Pinned footer clears accessory bar via useBottomInsets()
 * - Keyboard avoiding on iOS & Android adjustResize
 */
export const Sheet: React.FC<SheetProps> = ({
  visible,
  onClose,
  title,
  detent = 0.5,
  children,
  footer,
  style,
}) => {
  const { colors, radius, spacing, resolvedTheme } = useTheme();
  const { sheetFooterPaddingBottom } = useBottomInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeight = screenHeight * detent;

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight, backdropOpacity, translateY]);

  if (!visible) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: colors.overlay,
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl, // 28
              borderTopRightRadius: radius.xl,
              transform: [{ translateY }],
            },
            style,
          ]}
        >
          {/* 1px top highlight */}
          {isDark && <View style={styles.topHighlight} />}

          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: colors.borderStrong,
                  borderRadius: radius.pill,
                },
              ]}
            />
          </View>

          {title && (
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: spacing.lg,
                  paddingBottom: spacing.md,
                },
              ]}
            >
              <Text variant="h3">{title}</Text>
            </View>
          )}

          <View style={[styles.content, { paddingHorizontal: spacing.lg }]}>
            {children}
          </View>

          {footer && (
            <View
              style={[
                styles.footer,
                {
                  paddingHorizontal: spacing.lg,
                  paddingBottom: sheetFooterPaddingBottom,
                },
              ]}
            >
              {footer}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 16,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
  },
  header: {
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingTop: 12,
  },
});
