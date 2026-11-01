import React from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react-native';

export interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  style,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.centerContainer, style]}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text
        variant="caption"
        color="secondary"
        style={{ marginTop: spacing.md }}
      >
        {message}
      </Text>
    </View>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to load content right now. Please try again.',
  onRetry,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.centerContainer, { paddingHorizontal: spacing.xl }, style]}>
      <View
        style={[
          styles.errorIconBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        <AlertCircle size={24} color={colors.danger} strokeWidth={1.5} />
      </View>

      <Text variant="h2" align="center" style={{ marginBottom: spacing.xs, fontWeight: '600' }}>
        {title}
      </Text>

      <Text
        variant="body"
        color="secondary"
        align="center"
        style={{ marginBottom: spacing.lg, maxWidth: 280 }}
      >
        {message}
      </Text>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          title="Try again"
          onPress={onRetry}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
