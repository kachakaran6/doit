import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Chip, EmptyState } from '../components/ui';
import { useTheme } from '../theme/useTheme';
import { RootStackParamList } from '../navigation/types';

export const TasksScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <View>
            <Text variant="h1">
              Tasks
            </Text>
            <Text variant="caption" color="secondary">
              All project workstreams and active items
            </Text>
          </View>
          <View style={[styles.viewToggle, { gap: spacing.xs }]}>
            <Button
              title="List"
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setViewMode('list')}
            />
            <Button
              title="Board"
              variant={viewMode === 'board' ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setViewMode('board')}
            />
          </View>
        </View>

        {/* Status Filter Chips */}
        <View style={[styles.chipRow, { gap: spacing.sm, marginVertical: spacing.md }]}>
          <Chip
            label="All"
            selected={selectedStatus === 'ALL'}
            onPress={() => setSelectedStatus('ALL')}
          />
          <Chip
            label="To Do"
            selected={selectedStatus === 'TODO'}
            onPress={() => setSelectedStatus('TODO')}
          />
          <Chip
            label="In Progress"
            selected={selectedStatus === 'IN_PROGRESS'}
            onPress={() => setSelectedStatus('IN_PROGRESS')}
          />
          <Chip
            label="Done"
            selected={selectedStatus === 'DONE'}
            onPress={() => setSelectedStatus('DONE')}
          />
        </View>

        {/* Empty State / Task List */}
        <EmptyState
          title="No tasks found"
          body="Create your first task or switch filters to see active items."
          actionTitle="Create Task"
          onAction={() => navigation.navigate('CaptureModal', { initialMode: 'task' })}
          style={{ marginTop: spacing['2xl'] }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
