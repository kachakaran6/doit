import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';

export interface QuickCaptureHeaderProps {
  onClose: () => void;
  title?: string;
}

export const QuickCaptureHeader: React.FC<QuickCaptureHeaderProps> = ({
  onClose,
  title = 'Quick Capture',
}) => {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={[styles.appBadge, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
          <Check size={14} color={colors.accentOnPrimary} strokeWidth={2.5} />
        </View>
        <Text variant="headline" style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeButton, { backgroundColor: colors.surface2, borderRadius: radius.pill }]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Close capture dialog"
        activeOpacity={0.7}
      >
        <X size={16} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
