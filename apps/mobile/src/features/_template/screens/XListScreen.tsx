import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState, Skeleton } from '../../../components/ui';
import { useXListQuery } from '../api/queries';
import { useXFilters } from '../hooks/useXFilters';
import { XCard } from '../components/XCard';

export const XListScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { data: items, isLoading, error, refetch, isRefetching } = useXListQuery();
  const { filteredItems } = useXFilters(items || []);

  // 1. Loading Skeleton state
  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="60%" height={28} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={80} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={80} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={80} />
      </SafeAreaView>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="offline"
          title="Failed to load items"
          body={error.message || 'An unexpected network error occurred.'}
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  // 3. Empty state
  if (!filteredItems.length) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="no-results"
          title="No items found"
          body="Get started by creating your first item."
          actionTitle="Refresh"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  // 4. Data state
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <XCard item={item} />}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
