import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { Button } from './Button';

export type EmptyStateIllustration =
  | 'no-tasks'
  | 'no-stickies'
  | 'no-bugs'
  | 'no-results'
  | 'offline';

export interface EmptyStateProps {
  illustration?: EmptyStateIllustration;
  title: string;
  body: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Use EmptyState whenever a list, search result, or board has zero items.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration = 'no-tasks',
  title,
  body,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  // Isometric glyph illustration container
  const renderIllustration = () => {
    let iconGlyph = '📋';
    if (illustration === 'no-stickies') iconGlyph = '📌';
    if (illustration === 'no-bugs') iconGlyph = '🐞';
    if (illustration === 'no-results') iconGlyph = '🔍';
    if (illustration === 'offline') iconGlyph = '📡';

    return (
      <View
        style={[
          styles.illustrationContainer,
          {
            backgroundColor: colors.accentContainer,
            borderRadius: radius.xl,
            marginBottom: spacing.xl,
          },
        ]}
      >
        <Text style={{ fontSize: 40 }}>{iconGlyph}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { padding: spacing['2xl'] }, style]}>
      {renderIllustration()}

      <Text variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
        {title}
      </Text>

      <Text
        variant="body"
        color="secondary"
        align="center"
        style={{ marginBottom: spacing.xl, maxWidth: 300 }}
      >
        {body}
      </Text>

      {actionTitle && onAction && (
        <Button
          variant="primary"
          title={actionTitle}
          onPress={onAction}
          size="md"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustrationContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
