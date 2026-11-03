import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useBottomInsets } from '../../layout/useBottomInsets';

export interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  gutter?: boolean;
}

/**
 * P-02 Screen Primitive:
 * 09-PROMPTS/P-02-shell.md & 07-PLATFORM-CRAFT.md §7.2, §7.3
 * Standard frame:
 * - Safe area top and horizontal handling
 * - Translucent status bar matching theme mode
 * - 16pt standard horizontal gutter
 * - Single source of bottom insets via useBottomInsets()
 * - Header slot + scroll / content slot
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  header,
  scrollable = true,
  refreshing = false,
  onRefresh,
  edges = ['top'],
  gutter = true,
}) => {
  const { colors, spacing, resolvedTheme } = useTheme();
  const { scrollPaddingBottom } = useBottomInsets();

  const isDark = resolvedTheme === 'dark';

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {header && <View style={gutter ? styles.gutter : undefined}>{header}</View>}

      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            gutter && styles.gutter,
            {
              paddingTop: spacing.md,
              paddingBottom: scrollPaddingBottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
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
        <View style={[styles.staticContent, gutter && styles.gutter]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gutter: {
    paddingHorizontal: 16, // 16 gutter per §6.1
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});

