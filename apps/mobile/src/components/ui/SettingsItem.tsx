import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { ChevronRight } from 'lucide-react-native';

export interface SettingsItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Standardized 48px Settings row matching iOS / Linear preferences.
 */
export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  description,
  value,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  destructive = false,
  disabled = false,
  style,
}) => {
  const { colors, spacing } = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && <View style={[styles.iconWrapper, { marginRight: spacing.md }]}>{icon}</View>}

      <View style={styles.textWrapper}>
        <Text
          variant="body"
          color={destructive ? 'danger' : 'primary'}
          style={styles.label}
        >
          {label}
        </Text>
        {description && (
          <Text variant="caption" color="secondary" style={styles.description}>
            {description}
          </Text>
        )}
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.accentOnPrimary}
        />
      ) : value ? (
        <View style={styles.rightContent}>
          <Text variant="secondary" color="secondary" style={{ marginRight: 6 }}>
            {value}
          </Text>
          {onPress && <ChevronRight size={16} color={colors.textTertiary} />}
        </View>
      ) : onPress ? (
        <ChevronRight size={16} color={colors.textTertiary} />
      ) : null}
    </View>
  );

  if (isSwitch || !onPress) {
    return content;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontWeight: '500',
  },
  description: {
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

