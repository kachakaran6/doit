import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { Button } from './Button';
import {
  CheckCircle2,
  StickyNote,
  Bug,
  Search,
  WifiOff,
  FolderOpen,
} from 'lucide-react-native';

export type EmptyStateIllustration =
  | 'no-tasks'
  | 'no-stickies'
  | 'no-bugs'
  | 'no-results'
  | 'offline'
  | 'no-projects';

export interface EmptyStateProps {
  illustration?: EmptyStateIllustration;
  title: string;
  body: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * EmptyState adheres to Linear/Things 3 aesthetics:
 * Muted monochrome iconography, clean typography hierarchy, restrained button.
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

  const renderIcon = () => {
    const iconSize = 24;
    const iconColor = colors.textSecondary;

    switch (illustration) {
      case 'no-stickies':
        return <StickyNote size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'no-bugs':
        return <Bug size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'no-results':
        return <Search size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'offline':
        return <WifiOff size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'no-projects':
        return <FolderOpen size={iconSize} color={iconColor} strokeWidth={1.5} />;
      case 'no-tasks':
      default:
        return <CheckCircle2 size={iconSize} color={iconColor} strokeWidth={1.5} />;
    }
  };

  return (
    <View style={[styles.container, { paddingVertical: spacing['3xl'] }, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
            borderRadius: radius.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        {renderIcon()}
      </View>

      <Text variant="h2" align="center" style={[styles.title, { marginBottom: spacing.xs }]}>
        {title}
      </Text>

      <Text
        variant="body"
        color="secondary"
        align="center"
        style={[styles.bodyText, { marginBottom: spacing.xl }]}
      >
        {body}
      </Text>

      {actionTitle && onAction && (
        <Button
          variant="secondary"
          title={actionTitle}
          onPress={onAction}
          size="sm"
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
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  bodyText: {
    maxWidth: 280,
    lineHeight: 20,
  },
});
