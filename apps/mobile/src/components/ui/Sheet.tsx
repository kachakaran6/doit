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
import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  detent?: 0.5 | 0.9;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Use Sheet for modal workflows and creation sheets sliding up from the bottom of the screen.
 */
export const Sheet: React.FC<SheetProps> = ({
  visible,
  onClose,
  title,
  detent = 0.5,
  children,
  style,
}) => {
  const { colors, radius, spacing, elevation } = useTheme();
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
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              transform: [{ translateY }],
              ...elevation.e3,
            },
            style,
          ]}
        >
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
                  borderBottomColor: colors.border,
                  paddingHorizontal: spacing.lg,
                  paddingBottom: spacing.md,
                },
              ]}
            >
              <Text variant="h3">{title}</Text>
            </View>
          )}

          <View style={[styles.content, { padding: spacing.lg }]}>{children}</View>
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
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
  },
  header: {
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
});
