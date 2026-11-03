import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';

export interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/**
 * P-01 Checkbox:
 * Visual: 28x28, radius 8
 * Hit area: 44x44
 * 5 States: rest, pressed (scale 0.92), focused, checked, disabled
 * Checked: filled accent with white checkmark
 * Unchecked: 1.5px border with surfaceRaised (L2) background
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  disabled = false,
  accessibilityLabel = 'Toggle task completion',
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={styles.hitArea}
    >
      <Animated.View
        style={[
          styles.visual,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: checked ? colors.accent : colors.surfaceRaised,
            borderColor: isFocused
              ? colors.accent
              : checked
              ? colors.accent
              : colors.borderStrong,
            borderWidth: checked ? 0 : 1.5,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {checked && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  hitArea: {
    width: 44, // 44 hit area measured
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visual: {
    width: 28, // 28 visual
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

