import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface CompactHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backAccessibilityLabel?: string;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backAccessibilityLabel = 'Go back',
  rightAction,
  children,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: colors.hairline,
        },
      ]}
    >
      <View style={styles.leftCol}>
        {onBack && (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onBack}
            style={[styles.backBtn, { borderRadius: radius.pill }]}
            accessibilityRole="button"
            accessibilityLabel={backAccessibilityLabel}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {children || (
          <View style={styles.titleWrap}>
            {title && (
              <Text
                variant="bodyStrong"
                numberOfLines={1}
                style={[styles.title, { color: colors.textPrimary }]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      {rightAction && <View style={styles.rightCol}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
    marginLeft: -6,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

