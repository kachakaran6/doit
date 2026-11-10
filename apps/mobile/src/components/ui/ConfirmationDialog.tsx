import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { Button } from './Button';

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  style?: ViewStyle;
}

/**
 * ConfirmationDialog provides an accessible, non-intrusive alert modal
 * adhering to the graphite palette and standard button heights.
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  style,
}) => {
  const { colors, spacing, radius, elevation } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.overlay || 'rgba(0, 0, 0, 0.65)' }]}
        activeOpacity={1}
        onPress={onCancel}
      />
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface1 || colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            ...elevation.e3,
          },
          style,
        ]}
      >
        <Text variant="h2" style={{ marginBottom: spacing.xs, fontWeight: '700', color: colors.textPrimary }}>
          {title}
        </Text>
        <Text
          variant="body"
          color="secondary"
          style={{ marginBottom: spacing.xl, lineHeight: 21, color: colors.textSecondary }}
        >
          {message}
        </Text>

        <View style={[styles.buttonRow, { gap: spacing.sm }]}>
          <View style={styles.dialogBtn}>
            <Button title={cancelLabel} variant="secondary" size="sm" onPress={onCancel} />
          </View>
          <View style={styles.dialogBtn}>
            <Button title={confirmLabel} variant={destructive ? 'danger' : 'primary'} size="sm" loading={loading} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    zIndex: 100000,
    elevation: 10000,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogBtn: {
    minWidth: 90,
  },
});

