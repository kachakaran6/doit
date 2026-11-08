import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps, Platform } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

/**
 * Design System v3 Switch:
 * Track = accent fill when ON; surface3 when OFF.
 * Thumb = white (#FFFFFF) always, eliminating the blue-track / teal-thumb mismatch.
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  ...rest
}) => {
  const { colors } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.surface3,
        true: colors.accent,
      }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.surface3}
      {...rest}
    />
  );
};
