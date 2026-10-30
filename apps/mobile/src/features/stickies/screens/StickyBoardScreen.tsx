import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState, Skeleton, Sheet, Input } from '../../../components/ui';
import { StickyCard } from '../../../components/patterns';
import { useStickiesQuery } from '../api/queries';
import {
  useCreateStickyMutation,
  useTogglePinStickyMutation,
  useConvertStickyMutation,
} from '../api/mutations';
import { StickyViewModel } from '../types';

export const StickyBoardScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { data: stickies, isLoading, error, refetch, isRefetching } = useStickiesQuery('default');

  const createSticky = useCreateStickyMutation('default');
  const togglePin = useTogglePinStickyMutation('default');
  const convertSticky = useConvertStickyMutation('default');

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [newBody, setNewBody] = useState('');

  const handleCreate = async () => {
    if (!newBody.trim()) return;
    await createSticky.mutateAsync({ body: newBody.trim() });
    setNewBody('');
    setSheetOpen(false);
  };

  const handleLongPress = (sticky: StickyViewModel) => {
    Alert.alert(
      'Sticky Note Actions',
      sticky.body.substring(0, 60),
      [
        {
          text: sticky.isPinned ? 'Unpin' : 'Pin to top',
          onPress: () => togglePin.mutate({ id: sticky.id, isPinned: !sticky.isPinned }),
        },
        {
          text: 'Convert to Task',
          onPress: () => convertSticky.mutate(sticky.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // 1. Loading Skeleton state
  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="50%" height={28} style={{ marginBottom: spacing.lg }} />
        <View style={styles.gridRow}>
          <Skeleton width="48%" height={120} />
          <Skeleton width="48%" height={120} />
        </View>
        <View style={[styles.gridRow, { marginTop: spacing.md }]}>
          <Skeleton width="48%" height={120} />
          <Skeleton width="48%" height={120} />
        </View>
      </SafeAreaView>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="offline"
          title="Could not load stickies"
          body={error.message || 'Please check your connection and retry.'}
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const items = stickies || [];
  // Pinned items sort first per §3.5
  const sortedItems = [...items].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <View>
          <Text variant="h1">Stickies</Text>
          <Text variant="caption" color="secondary">
            Quick thoughts, snippets, and unfiled items
          </Text>
        </View>
        <Button
          title="+ Add Note"
          variant="primary"
          size="sm"
          onPress={() => setSheetOpen(true)}
        />
      </View>

      {/* 3. Empty state */}
      {!sortedItems.length ? (
        <EmptyState
          illustration="no-stickies"
          title="No stickies yet"
          body="Jot down quick thoughts, ideas, or meeting fragments."
          actionTitle="Create Sticky"
          onAction={() => setSheetOpen(true)}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
        /* 4. 2-column Grid Data state */
        <FlatList
          data={sortedItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StickyCard
              id={item.id}
              body={item.body}
              isPinned={item.isPinned}
              convertedTaskId={item.convertedTaskId}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
            />
          }
        />
      )}

      {/* Create Sticky Sheet */}
      <Sheet visible={isSheetOpen} onClose={() => setSheetOpen(false)} detent={0.5} title="New Sticky">
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Input
            placeholder="Type your note here..."
            value={newBody}
            onChangeText={setNewBody}
            multiline
            numberOfLines={4}
            autoFocus
          />
          <Button
            title="Save Sticky"
            variant="primary"
            disabled={!newBody.trim()}
            loading={createSticky.isPending}
            onPress={handleCreate}
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
