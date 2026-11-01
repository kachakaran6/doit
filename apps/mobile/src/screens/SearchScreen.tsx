import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Text,
  SearchInput,
  Chip,
  ScreenHeader,
  EmptyState,
} from '../components/ui';
import { TaskItem, StickyNote } from '../components/patterns';
import { useTheme } from '../theme/useTheme';
import { useTasksQuery } from '../features/tasks/api/queries';
import { useStickiesQuery } from '../features/stickies/api/queries';
import { useWorkspaceStore } from '../features/workspace';

export const SearchScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const { data: tasks } = useTasksQuery(projectId);
  const { data: stickies } = useStickiesQuery(projectId);

  const appendOperator = (op: string) => {
    setQuery((prev) => (prev ? `${prev.trim()} ${op}` : op));
  };

  const q = query.toLowerCase().trim();

  const matchingTasks = useMemo(() => {
    if (!q) return [];
    return (tasks || []).filter((t) => {
      const matchText = `${t.title} ${t.description || ''} ${t.humanId}`.toLowerCase();
      if (q.includes('is:done')) return t.status === 'DONE';
      if (q.includes('is:open')) return t.status !== 'DONE';
      return matchText.includes(q.replace(/is:\w+/g, '').trim());
    });
  }, [tasks, q]);

  const matchingStickies = useMemo(() => {
    if (!q) return [];
    return (stickies || []).filter((s) => s.body.toLowerCase().includes(q));
  }, [stickies, q]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xs,
            paddingBottom: 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title="Search"
          subtitle={activeProject ? activeProject.name : 'Global'}
        />

        {/* Standardized Search Input */}
        <SearchInput
          placeholder="Search by keywords or tags..."
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
        />

        {/* Live Filter Operators */}
        <View style={[styles.operatorsRow, { gap: spacing.xs, marginTop: spacing.md }]}>
          <Chip label="#label" onPress={() => appendOperator('#')} />
          <Chip label="is:done" onPress={() => appendOperator('is:done')} />
          <Chip label="is:open" onPress={() => appendOperator('is:open')} />
          <Chip label="due:today" onPress={() => appendOperator('due:today')} />
        </View>

        {/* Results Section */}
        {q.length > 0 ? (
          <View style={{ marginTop: spacing.xl }}>
            {matchingTasks.length === 0 && matchingStickies.length === 0 ? (
              <EmptyState
                illustration="no-results"
                title="No results found"
                body={`No tasks or stickies matched "${query}". Try different keywords.`}
              />
            ) : (
              <View style={{ gap: spacing.lg }}>
                {matchingTasks.length > 0 && (
                  <View>
                    <Text variant="caption" color="secondary" style={styles.sectionHeader}>
                      TASKS ({matchingTasks.length})
                    </Text>
                    <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
                      {matchingTasks.map((item) => (
                        <TaskItem
                          key={item.id}
                          id={item.id}
                          humanId={item.humanId}
                          title={item.title}
                          status={item.status}
                          priority={item.priority}
                          dueDate={item.dueDate}
                          onPress={() => (navigation as any).navigate('TaskDetail', { id: item.id })}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {matchingStickies.length > 0 && (
                  <View>
                    <Text variant="caption" color="secondary" style={styles.sectionHeader}>
                      STICKIES ({matchingStickies.length})
                    </Text>
                    <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
                      {matchingStickies.map((s) => (
                        <StickyNote
                          key={s.id}
                          id={s.id}
                          body={s.body}
                          color={s.color}
                          isPinned={s.isPinned}
                          onPress={() => (navigation as any).navigate('StickyBoard')}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.hintContainer, { marginTop: spacing['3xl'] }]}>
            <Text variant="body" color="secondary" align="center">
              Type to search instantly across all tasks, descriptions, and stickies in this workspace.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  operatorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  hintContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
});
