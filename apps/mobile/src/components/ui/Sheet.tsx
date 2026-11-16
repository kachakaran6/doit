import React, { useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useBottomInsets } from '../../layout/useBottomInsets';
import { useBackNavigationStore } from '../../navigation/back-navigation.store';
import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  detent?: 0.5 | 0.9 | number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Robust Native Bottom Sheet:
 * - Uses native Modal with animationType="slide" to prevent Fabric native driver failures
 * - statusBarTranslucent covers full window seamlessly
 * - Backdrop touch dismisses immediately
 * - Keyboard avoiding on iOS & Android
 * - Integrated with useBackNavigationStore and onRequestClose for hardware back
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
  const insets = useSafeAreaInsets();
  const { sheetFooterPaddingBottom } = useBottomInsets();
  const screenHeight = Dimensions.get('window').height;
  const detentRatio = typeof detent === 'number' ? detent : 0.5;
  const maxHeight = Math.min(screenHeight * detentRatio, screenHeight - (insets.top || 20));

  // Register with global back navigation so hardware back cleanly closes this sheet
  useEffect(() => {
    if (!visible) return;
    const subscriberId = `sheet-${title || 'modal'}-${Date.now()}`;
    return useBackNavigationStore.getState().registerBackSubscriber(
      subscriberId,
      () => {
        onClose();
        return true;
      },
      80 // Higher priority than screen navigation
    );
  }, [visible, onClose, title]);

  if (!visible) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Full screen backdrop */}
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.overlay || 'rgba(0,0,0,0.65)' }]}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheet,
              {
                maxHeight,
                backgroundColor: colors.surface1 || colors.surface,
                borderTopLeftRadius: radius.xl, // 28
                borderTopRightRadius: radius.xl,
                paddingBottom: Math.max(insets.bottom, 16),
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
                    backgroundColor: colors.borderStrong || 'rgba(255, 255, 255, 0.2)',
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

            <View style={styles.content}>
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardContainer: {
    width: '100%',
    justifyContent: 'flex-end',
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
    flexShrink: 1,
  },
  footer: {
    paddingTop: 12,
  },
});
