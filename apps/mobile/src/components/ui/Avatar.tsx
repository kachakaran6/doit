import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { accentFor } from '@doit/design-tokens';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface AvatarProps {
  id?: string;
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
}

const sizeMap: Record<'sm' | 'md' | 'lg' | 'xl', { dimension: number; fontSize: number }> = {
  sm: { dimension: 24, fontSize: 10 },
  md: { dimension: 28, fontSize: 11 }, // 28 spec per 06-COMPOSITION.md §6.3
  lg: { dimension: 36, fontSize: 13 },
  xl: { dimension: 44, fontSize: 15 },
};

/**
 * P-01 Avatar:
 * 04-COLOUR-AS-INFORMATION.md §4.4
 * Avatars use accentFor(id).primary with white initials.
 */
export const Avatar: React.FC<AvatarProps> = ({
  id,
  name = 'User',
  imageUrl,
  size = 'md',
}) => {
  const { radius } = useTheme();

  let dimension = 28;
  let fontSize = 11;

  if (typeof size === 'number') {
    dimension = size;
    fontSize = Math.round(size * 0.4);
  } else if (sizeMap[size]) {
    dimension = sizeMap[size].dimension;
    fontSize = sizeMap[size].fontSize;
  }

  const identity = id || name;
  const avatarAccent = accentFor(identity);

  const initials = (name || id || 'U')
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
          backgroundColor: avatarAccent.primary,
        },
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
            color: '#FFFFFF', // White initials per §4.4
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});
