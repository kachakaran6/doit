import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  EmptyState,
  Skeleton,
  Sheet,
  Input,
  ScreenHeader,
} from '../../../components/ui';
import { StickyNote } from '../../../components/patterns';
import { useStickiesQuery } from '../api/queries';
import {
  useCreateStickyMutation,
  useTogglePinStickyMutation,
  useConvertStickyMutation,
} from '../api/mutations';
import { StickyViewModel } from '../types';
import { useWorkspaceStore } from '../../workspace';
import { Plus } from 'lucide-react-native';

export const StickyBoardScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const { data: stickies, isLoading, error, refetch, isRefetching } = useStickiesQuery(projectId);

  const createSticky = useCreateStickyMutation(projectId);
  const togglePin = useTogglePinStickyMutation(projectId);
  const convertSticky = useConvertStickyMutation(projectId);

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
      'Sticky Note Options',
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

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="45%" height={28} style={{ marginBottom: spacing.lg }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Skeleton width="48%" height={120} style={{ borderRadius: radius.md }} />
          <Skeleton width="48%" height={120} style={{ borderRadius: radius.md }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Skeleton width="48%" height={120} style={{ borderRadius: radius.md }} />
          <Skeleton width="48%" height={120} style={{ borderRadius: radius.md }} />
        </View>
      </SafeAreaView>
    );
  }

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
  const sortedItems = [...items].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
        <ScreenHeader
          title="Stickies"
          subtitle={activeProject ? activeProject.name : 'Board'}
          badge={sortedItems.length}
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity
              style={[
                styles.addBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.sm,
                },
              ]}
              onPress={() => setSheetOpen(true)}
              accessibilityLabel="New sticky note"
            >
              <Plus size={16} color={colors.accentOnPrimary} />
              <Text
                variant="label"
                style={{ color: colors.accentOnPrimary, marginLeft: 4, fontWeight: '600' }}
              >
                Note
              </Text>
            </TouchableOpacity>
          }
        />
      </View>

      {!sortedItems.length ? (
        <EmptyState
          illustration="no-stickies"
          title="Board is empty"
          body="Stickies are ephemeral scratchpad notes. Long press any note to pin or convert it to a task."
          actionTitle="Add First Sticky"
          onAction={() => setSheetOpen(true)}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={[styles.gridRow, { gap: spacing.sm }]}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 110,
          }}
          renderItem={({ item }) => (
            <StickyNote
              id={item.id}
              body={item.body}
              color={item.color}
              isPinned={item.isPinned}
              convertedTaskId={item.convertedTaskId}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        />
      )}

      {/* Quick Add Sticky Sheet */}
      <Sheet visible={isSheetOpen} onClose={() => setSheetOpen(false)} detent={0.5} title="New Sticky">
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Input
            placeholder="Jot down a quick thought, note, or reminder..."
            value={newBody}
            onChangeText={setNewBody}
            multiline
            numberOfLines={4}
            autoFocus
          />
          <Button
            title="Pin to Board"
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
