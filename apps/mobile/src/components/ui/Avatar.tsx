import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, { dimension: number; fontSize: number }> = {
  sm: { dimension: 24, fontSize: 10 },
  md: { dimension: 32, fontSize: 12 },
  lg: { dimension: 40, fontSize: 14 },
  xl: { dimension: 48, fontSize: 16 },
};

/**
 * Avatar with consistent circular border, fallback initials, and standardized sizes.
 */
export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  imageUrl,
  size = 'md',
  style,
}) => {
  const { colors, radius } = useTheme();
  const { dimension, fontSize } = sizeMap[size];

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: radius.pill,
            },
          ]}
        />
      ) : (
        <Text
          variant="caption"
          style={{
            fontSize,
            fontWeight: '600',
            color: colors.textSecondary,
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});
