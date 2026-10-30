import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Input, Chip } from '../components/ui';
import { useTheme } from '../theme/useTheme';

export const SearchScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const [query, setQuery] = useState('');

  const appendOperator = (op: string) => {
    setQuery((prev) => (prev ? `${prev} ${op}` : op));
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text variant="h1">
            Search
          </Text>
          <Text variant="caption" color="secondary">
            Find tasks, stickies, bugs, and comments across workspaces
          </Text>
        </View>

        <Input
          placeholder="Search by keywords or operators..."
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
        />

        {/* Live Operator Chips */}
        <View style={[styles.operatorsRow, { gap: spacing.xs, marginTop: spacing.md }]}>
          <Chip label="#label" onPress={() => appendOperator('#')} />
          <Chip label="@assignee" onPress={() => appendOperator('@')} />
          <Chip label="is:bug" onPress={() => appendOperator('is:bug')} />
          <Chip label="is:done" onPress={() => appendOperator('is:done')} />
          <Chip label="due:today" onPress={() => appendOperator('due:today')} />
          <Chip label="due:overdue" onPress={() => appendOperator('due:overdue')} />
        </View>

        <View style={[styles.resultSummary, { marginTop: spacing.xl }]}>
          <Text variant="caption" color="tertiary">
            {query.trim().length > 0 ? `Showing results for "${query}"` : 'Enter a search term above'}
          </Text>
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
  operatorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultSummary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
});
