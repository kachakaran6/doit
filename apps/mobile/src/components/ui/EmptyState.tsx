import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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
  style?: StyleProp<ViewStyle>;
}

/**
 * P-01 EmptyState:
 * Bare 64 icon in textMuted — NO rounded container (09-PROMPTS/P-01-primitives.md).
 * Title in h3, body in secondary, optional action button.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration = 'no-tasks',
  title,
  body,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, spacing } = useTheme();

  const renderIcon = () => {
    const iconSize = 64; // Bare 64 icon per spec
    const iconColor = colors.textMuted;

    switch (illustration) {
      case 'no-stickies':
        return <StickyNote size={iconSize} color={iconColor} strokeWidth={1.2} />;
      case 'no-bugs':
        return <Bug size={iconSize} color={iconColor} strokeWidth={1.2} />;
      case 'no-results':
        return <Search size={iconSize} color={iconColor} strokeWidth={1.2} />;
      case 'offline':
        return <WifiOff size={iconSize} color={iconColor} strokeWidth={1.2} />;
      case 'no-projects':
        return <FolderOpen size={iconSize} color={iconColor} strokeWidth={1.2} />;
      case 'no-tasks':
      default:
        return <CheckCircle2 size={iconSize} color={iconColor} strokeWidth={1.2} />;
    }
  };

  return (
    <View style={[styles.container, { paddingVertical: spacing['3xl'] }, style]}>
      {/* Bare 64 icon without rounded box */}
      <View style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
        {renderIcon()}
      </View>

      <Text variant="h3" align="center" style={{ marginBottom: spacing.xs }}>
        {title}
      </Text>

      <View style={{ maxWidth: 300, marginBottom: actionTitle ? spacing.xl : 0 }}>
        <Text variant="body" color="secondary" align="center">
          {body}
        </Text>
      </View>

      {actionTitle && onAction && (
        <View style={{ marginTop: spacing.md }}>
          <Button
            title={actionTitle}
            variant="secondary"
            size="md"
            onPress={onAction}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
});
