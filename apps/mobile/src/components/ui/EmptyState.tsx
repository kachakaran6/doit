import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Text as RNText } from 'react-native';
import {
  CheckCircle2,
  StickyNote,
  Bug,
  Search,
  WifiOff,
  FolderOpen,
  LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';

export type EmptyStateIllustration =
  | 'no-tasks'
  | 'no-stickies'
  | 'no-bugs'
  | 'no-results'
  | 'offline'
  | 'no-projects'
  | (string & {});

export interface EmptyStateProps {
  /** Predefined illustration type */
  illustration?: EmptyStateIllustration;
  /** Custom icon component or ReactNode */
  icon?: LucideIcon | React.ReactNode;
  /** Primary headline (sentence case) */
  title: string;
  /** Optional body sentence */
  body?: string;
  /** Call to action button title */
  actionTitle?: string;
  /** Backward-compatible alias for actionTitle */
  actionLabel?: string;
  /** Call to action button callback */
  onAction?: () => void;
  /** Container style overrides */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * EmptyState: Optical Center Feedback Primitive (Phase L2)
 *
 * Implements refined empty state feedback without wireframe boxes:
 * - Positioned at optical center (~40% from top of screen).
 * - Bare 64px vector line illustration in `textMuted` / `textTertiary`.
 * - Friendly sentence-case copy constrained to 320pt to prevent awkward stretching.
 * - Single borderless action button.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration = 'no-tasks',
  icon,
  title,
  body,
  actionTitle,
  actionLabel,
  onAction,
  style,
  testID,
}) => {
  const { colors, spacing } = useTheme();
  const effectiveActionTitle = actionTitle || actionLabel;

  const renderIcon = () => {
    if (icon) {
      if (React.isValidElement(icon)) {
        return icon;
      }
      const IconComp = icon as LucideIcon;
      return <IconComp size={64} color={colors.textTertiary} strokeWidth={1.4} />;
    }

    const iconColor = colors.textTertiary;
    const strokeWidth = 1.3;

    switch (illustration) {
      case 'no-stickies':
        return <StickyNote size={64} color={iconColor} strokeWidth={strokeWidth} />;
      case 'no-bugs':
        return <Bug size={64} color={iconColor} strokeWidth={strokeWidth} />;
      case 'no-results':
        return <Search size={64} color={iconColor} strokeWidth={strokeWidth} />;
      case 'offline':
        return <WifiOff size={64} color={iconColor} strokeWidth={strokeWidth} />;
      case 'no-projects':
        return <FolderOpen size={64} color={iconColor} strokeWidth={strokeWidth} />;
      case 'no-tasks':
      default:
        return <CheckCircle2 size={64} color={iconColor} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Bare 64px line vector illustration without boxed borders */}
      <View style={[styles.iconWrapper, { marginBottom: spacing.lg }]}>
        {renderIcon()}
      </View>

      <RNText
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            marginBottom: body ? spacing.xs : spacing.lg,
          },
        ]}
      >
        {title}
      </RNText>

      {body && (
        <View style={styles.bodyWrapper}>
          <RNText
            style={[
              styles.body,
              {
                color: colors.textSecondary,
                marginBottom: effectiveActionTitle ? spacing.xl : 0,
              },
            ]}
          >
            {body}
          </RNText>
        </View>
      )}

      {effectiveActionTitle && onAction && (
        <View style={{ marginTop: spacing.md }}>
          <Button
            title={effectiveActionTitle}
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
    paddingTop: 48,
    paddingBottom: 72,
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  bodyWrapper: {
    maxWidth: 320,
    alignItems: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
});
