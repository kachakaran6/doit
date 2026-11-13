import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';

export interface QuickCaptureHeaderProps {
  onClose: () => void;
  title?: string;
}

export const QuickCaptureHeader: React.FC<QuickCaptureHeaderProps> = ({
  onClose,
  title = 'New capture',
}) => {
  const { colors, radius } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.accentSoft, borderRadius: radius.lg },
      ]}
    >
      <View style={styles.titleContainer}>
        <View style={styles.copy}>
          <Text variant="caption" style={[styles.eyebrow, { color: colors.accent }]}>
            DOIT
          </Text>
          <Text variant="headline" style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Text variant="caption" style={{ color: colors.textSecondary }}>
            Task or bug, with project and owner
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={[
          styles.closeButton,
          {
            backgroundColor: colors.surface1,
            borderColor: colors.accent,
            borderRadius: radius.pill,
          },
        ]}
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  copy: {
    gap: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
