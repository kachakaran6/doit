import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Text,
  Screen,
  LargeHeader,
  SearchInput,
  Chip,
  Card,
  Checkbox,
  PriorityDot,
  DueText,
  EmptyState,
} from '../components/ui';
import { BugRow, StickyCard } from '../components/patterns';
import { useTheme } from '../theme/useTheme';
import { useTasksQuery } from '../features/tasks/api/queries';
import { useBugsQuery } from '../features/bugs/api/queries';
import { useStickiesQuery } from '../features/stickies/api/queries';
import { useWorkspaceStore } from '../features/workspace';
import { RootStackParamList } from '../navigation/types';
import { Clock, History, ArrowUpRight } from 'lucide-react-native';

const RECENT_SEARCHES_KEY = 'doit.search.recent';

export const SearchScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const { data: tasks } = useTasksQuery(projectId);
  const { data: bugs } = useBugsQuery(projectId);
  const { data: stickies } = useStickiesQuery(projectId);

  // Load recent searches
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'web') {
          if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) setRecentSearches(JSON.parse(stored));
          }
          return;
        }
        const stored = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const saveRecentSearch = async (term?: string) => {
    if (!term) return;
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } else {
        await SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(RECENT_SEARCHES_KEY);
      } else {
        await SecureStore.deleteItemAsync(RECENT_SEARCHES_KEY);
      }
    } catch {
      // ignore
    }
  };

  const appendToken = (token: string) => {
    setQuery((prev) => (prev ? `${prev.trim()} ${token}` : token));
  };

  const q = query.toLowerCase().trim();

  const handleSelectRecent = (term: string) => {
    setQuery(term);
  };

  const matchingTasks = useMemo(() => {
    if (!q) return [];
    return (tasks || []).filter((t) => {
      const matchText = `${t.title} ${t.description || ''} ${t.humanId}`.toLowerCase();
      if (q.includes('is:done')) return t.status === 'DONE';
      if (q.includes('is:open')) return t.status !== 'DONE';
      if (q.includes('due:today')) {
        const todayStr = new Date().toISOString().split('T')[0] ?? '';
        return Boolean(t.dueDate && t.dueDate.startsWith(todayStr));
      }
      const rawTerm = q.replace(/is:\w+/g, '').replace(/due:\w+/g, '').trim();
      return rawTerm ? matchText.includes(rawTerm) : true;
    });
  }, [tasks, q]);

  const matchingBugs = useMemo(() => {
    if (!q) return [];
    return (bugs || []).filter((b) => {
      const matchText = `${b.title} ${b.description || ''} ${b.humanId} ${b.severity} ${b.status}`.toLowerCase();
      if (q.includes('is:open')) return b.status !== 'RESOLVED' && b.status !== 'VERIFIED';
      if (q.includes('is:done')) return b.status === 'RESOLVED' || b.status === 'VERIFIED';
      const rawTerm = q.replace(/is:\w+/g, '').replace(/due:\w+/g, '').trim();
      return rawTerm ? matchText.includes(rawTerm) : true;
    });
  }, [bugs, q]);

  const matchingStickies = useMemo(() => {
    if (!q) return [];
    const rawTerm = q.replace(/is:\w+/g, '').replace(/due:\w+/g, '').trim();
    if (!rawTerm) return [];
    return (stickies || []).filter((s) => s.body.toLowerCase().includes(rawTerm));
  }, [stickies, q]);

  const totalResults = matchingTasks.length + matchingBugs.length + matchingStickies.length;

  return (
    <Screen scrollable includeBottomNavPadding>
      <LargeHeader
        title="Search"
        subtitle={activeProject ? activeProject.name : 'All Projects'}
      />

      {/* Large Search Input */}
      <View style={{ marginBottom: spacing.md }}>
        <SearchInput
          placeholder="Search tasks, bugs, stickies..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => saveRecentSearch(query)}
          onClear={() => setQuery('')}
        />
      </View>

      {/* Suggestion Chips */}
      <View style={[styles.operatorsRow, { gap: spacing.xs, marginBottom: spacing.lg }]}>
        <Chip label="#label" variant="filter" onPress={() => appendToken('#')} />
        <Chip label="is:open" variant="filter" onPress={() => appendToken('is:open')} />
        <Chip label="is:done" variant="filter" onPress={() => appendToken('is:done')} />
        <Chip label="due:today" variant="filter" onPress={() => appendToken('due:today')} />
      </View>

      {/* Results or Idle state */}
      {q.length > 0 ? (
        <View>
          {totalResults === 0 ? (
            <EmptyState
              illustration="no-results"
              title="No results found"
              body={`No tasks, bugs, or stickies matched "${query}".`}
              actionTitle="Clear query"
              onAction={() => setQuery('')}
              style={{ marginTop: spacing.xl }}
            />
          ) : (
            <View style={{ gap: spacing.xl, paddingBottom: spacing.xl }}>
              {/* Tasks Results */}
              {matchingTasks.length > 0 && (
                <View>
                  <View style={styles.sectionHeaderRow}>
                    <Text variant="caption" color="secondary" style={styles.sectionHeaderText}>
                      TASKS ({matchingTasks.length})
                    </Text>
                  </View>
                  <View style={{ gap: 4, marginTop: spacing.xs }}>
                    {matchingTasks.map((t) => (
                      <Card
                        key={t.id}
                        onPress={() => navigation.navigate('TaskDetail', { id: t.id })}
                        padding={12}
                        style={styles.taskResultCard}
                      >
                        <Checkbox
                          checked={t.status === 'DONE'}
                          disabled
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text
                            variant="bodyStrong"
                            numberOfLines={1}
                            style={{
                              textDecorationLine: t.status === 'DONE' ? 'line-through' : 'none',
                              color: t.status === 'DONE' ? colors.textTertiary : colors.textPrimary,
                            }}
                          >
                            {t.title}
                          </Text>
                          <View style={styles.metaRow}>
                            <Text variant="caption" color="secondary">
                              {t.humanId}
                            </Text>
                            {t.priority && (
                              <View style={styles.metaItem}>
                                <PriorityDot level={t.priority} />
                                <Text variant="caption" color="tertiary" style={{ marginLeft: 4 }}>
                                  {t.priority}
                                </Text>
                              </View>
                            )}
                            {t.dueDate && <DueText date={t.dueDate} />}
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                </View>
              )}

              {/* Bugs Results */}
              {matchingBugs.length > 0 && (
                <View>
                  <View style={styles.sectionHeaderRow}>
                    <Text variant="caption" color="secondary" style={styles.sectionHeaderText}>
                      BUGS ({matchingBugs.length})
                    </Text>
                  </View>
                  <View style={{ gap: 4, marginTop: spacing.xs }}>
                    {matchingBugs.map((b) => (
                      <BugRow
                        key={b.id}
                        id={b.id}
                        humanId={b.humanId}
                        title={b.title}
                        severity={b.severity}
                        status={b.status}
                        deviceInfo={b.telemetry?.deviceModel}
                        hasAttachment={b.hasAttachment}
                        createdAt={b.createdAt}
                        onPress={() => navigation.navigate('BugDetail', { id: b.id })}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Stickies Results */}
              {matchingStickies.length > 0 && (
                <View>
                  <View style={styles.sectionHeaderRow}>
                    <Text variant="caption" color="secondary" style={styles.sectionHeaderText}>
                      STICKIES ({matchingStickies.length})
                    </Text>
                  </View>
                  <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                    {matchingStickies.map((s) => (
                      <StickyCard
                        key={s.id}
                        id={s.id}
                        body={s.body}
                        color={s.color}
                        isPinned={s.isPinned}
                        convertedTaskId={s.convertedTaskId}
                        onPress={() => navigation.navigate('StickyBoard')}
                        numberOfLines={3}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={{ marginTop: spacing.sm }}>
          {/* Recent Searches */}
          {recentSearches.length > 0 ? (
            <View style={{ marginBottom: spacing.xl }}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <History size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text variant="caption" color="secondary" style={styles.sectionHeaderText}>
                    RECENT SEARCHES
                  </Text>
                </View>
                <TouchableOpacity onPress={clearRecentSearches} hitSlop={8}>
                  <Text variant="caption" color="tertiary" style={{ fontSize: 12 }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.recentPillWrap, { gap: spacing.xs, marginTop: spacing.sm }]}>
                {recentSearches.map((term, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectRecent(term)}
                    style={[
                      styles.recentSearchPill,
                      {
                        backgroundColor: colors.surface2,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Clock size={12} color={colors.textTertiary} style={{ marginRight: 6 }} />
                    <Text variant="caption" style={{ color: colors.textPrimary }}>
                      {term}
                    </Text>
                    <ArrowUpRight size={12} color={colors.textTertiary} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Quick Search Guide / Hint */}
          <View
            style={[
              styles.hintBox,
              {
                backgroundColor: colors.surface1,
                borderRadius: radius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <Text variant="bodyStrong" style={{ marginBottom: 4 }}>
              Quick Filters & Search Tips
            </Text>
            <Text variant="body" color="secondary" style={{ fontSize: 13, lineHeight: 20 }}>
              Use <Text style={{ fontWeight: '700', color: colors.accentText }}>is:open</Text> or <Text style={{ fontWeight: '700', color: colors.accentText }}>is:done</Text> to filter by completion status.
              Combine terms like <Text style={{ fontWeight: '700', color: colors.accentText }}>due:today</Text> to see imminent deadlines.
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  operatorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  taskResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hintBox: {
    borderWidth: 0,
  },
});
