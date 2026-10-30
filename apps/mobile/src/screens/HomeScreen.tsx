import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Chip, Stack } from '../components/ui';
import { useTheme } from '../theme/useTheme';
import { RootStackParamList } from '../navigation/types';

export const HomeScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text variant="h1">
            My Day
          </Text>
          <Text variant="caption" color="secondary">
            Focus on what matters today
          </Text>
        </View>

        {/* Quick Filter Chips */}
        <View style={[styles.chipRow, { gap: spacing.sm }]}>
          <Chip label="Today" selected />
          <Chip label="Overdue" count={2} />
          <Chip label="High Priority" />
        </View>

        {/* Pinned Stickies Section */}
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <Text variant="h3">
            Pinned Stickies
          </Text>
          <View
            style={[
              styles.stickyCard,
              {
                backgroundColor: colors.surfaceRaised,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text variant="bodyStrong">
              Ship Phase 3: Mobile Experience & Navigation Shell
            </Text>
            <Text variant="caption" color="tertiary" style={{ marginTop: spacing.xs }}>
              Pill navbar, tabs, quick capture modal
            </Text>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">
              Today's Tasks
            </Text>
            <Button
              title="Add Task"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('CaptureModal', { initialMode: 'task' })}
            />
          </View>

          <View
            style={[
              styles.taskPlaceholder,
              {
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
                marginTop: spacing.sm,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text variant="body" color="secondary">
              No tasks remaining for today. Tap + to capture new items.
            </Text>
          </View>
        </View>
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
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickyCard: {
    borderWidth: 1,
  },
  taskPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
