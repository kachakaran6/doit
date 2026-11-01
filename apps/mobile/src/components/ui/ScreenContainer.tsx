import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, RefreshControl } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/**
 * ScreenContainer ensures uniform 16px horizontal alignment, safe area insets,
 * and theme background across every single screen in the DoIt application.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  refreshing = false,
  onRefresh,
  edges = ['top'],
  style,
  contentContainerStyle,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: colors.bg }, style]}
    >
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: 110, // Avoid bottom floating nav bar
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.fixedContent,
            {
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fixedContent: {
    flex: 1,
  },
});

