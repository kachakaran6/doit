import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Screen, LargeHeader, Chip, EmptyState, Button, Card } from '../../../components/ui';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react-native';

export const TrashScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const [tab, setTab] = useState<'tasks' | 'bugs' | 'stickies'>('tasks');

  const [trashedTasks, setTrashedTasks] = useState([
    { id: 'tr-1', title: 'Legacy OAuth 1.0 Provider Audit', deletedAt: 'Yesterday', type: 'TASK' },
    { id: 'tr-2', title: 'Clean up unused CSS variables', deletedAt: '3 days ago', type: 'TASK' },
  ]);

  const [trashedBugs, setTrashedBugs] = useState([
    { id: 'tb-1', title: 'Memory leak on rapid orientation change', deletedAt: '2 days ago', type: 'BUG' },
  ]);

  const [trashedStickies, setTrashedStickies] = useState<any[]>([]);

  const handleRestore = (id: string, title: string) => {
    Alert.alert('Restore Item', `Restore "${title}" back to active workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        onPress: () => {
          if (tab === 'tasks') setTrashedTasks((prev) => prev.filter((i) => i.id !== id));
          if (tab === 'bugs') setTrashedBugs((prev) => prev.filter((i) => i.id !== id));
          if (tab === 'stickies') setTrashedStickies((prev) => prev.filter((i) => i.id !== id));
          Alert.alert('Restored', `"${title}" has been restored.`);
        },
      },
    ]);
  };

  const handlePermanentDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Permanently',
      `Permanently delete "${title}"? This action cannot be reversed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            if (tab === 'tasks') setTrashedTasks((prev) => prev.filter((i) => i.id !== id));
            if (tab === 'bugs') setTrashedBugs((prev) => prev.filter((i) => i.id !== id));
            if (tab === 'stickies') setTrashedStickies((prev) => prev.filter((i) => i.id !== id));
          },
        },
      ]
    );
  };

  const currentItems = tab === 'tasks' ? trashedTasks : tab === 'bugs' ? trashedBugs : trashedStickies;

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader
        title="Trash & Archive"
        onBack={() => navigation.goBack()}
        badge={currentItems.length > 0 ? `${currentItems.length}` : undefined}
      />

      {/* Tabs */}
      <View style={[styles.tabsRow, { gap: spacing.xs, marginBottom: spacing.md }]}>
        <Chip
          label="Tasks"
          count={trashedTasks.length}
          selected={tab === 'tasks'}
          onPress={() => setTab('tasks')}
        />
        <Chip
          label="Bugs"
          count={trashedBugs.length}
          selected={tab === 'bugs'}
          onPress={() => setTab('bugs')}
        />
        <Chip
          label="Stickies"
          count={trashedStickies.length}
          selected={tab === 'stickies'}
          onPress={() => setTab('stickies')}
        />
      </View>

      {/* Item List */}
      {currentItems.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          {currentItems.map((item) => (
            <Card
              key={item.id}
              variant="surface1"
              style={[styles.itemCard, { borderRadius: radius.md, padding: spacing.md }]}
            >
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                  Deleted {item.deletedAt}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <TouchableOpacity
                  onPress={() => handleRestore(item.id, item.title)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.surface2,
                      borderRadius: radius.pill,
                    },
                  ]}
                  hitSlop={8}
                  accessibilityLabel="Restore item"
                >
                  <RotateCcw size={15} color={colors.accentText} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePermanentDelete(item.id, item.title)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: radius.pill,
                    },
                  ]}
                  hitSlop={8}
                  accessibilityLabel="Delete permanently"
                >
                  <Trash2 size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={{ marginTop: spacing['2xl'] }}>
          <EmptyState
            illustration="no-tasks"
            title="Trash is empty"
            body="Items moved to trash will appear here for 30 days before permanent cleanup."
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

