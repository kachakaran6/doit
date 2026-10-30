import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Chip, EmptyState } from '../components/ui';
import { useTheme } from '../theme/useTheme';
import { RootStackParamList } from '../navigation/types';

export const BugsScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <View>
            <Text variant="h1">
              Bug Queue
            </Text>
            <Text variant="caption" color="secondary">
              Reported issues, severity triage, and verification
            </Text>
          </View>
          <Button
            title="Report Bug"
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
          />
        </View>

        {/* Severity Filter Chips */}
        <View style={[styles.chipRow, { gap: spacing.sm, marginVertical: spacing.md }]}>
          <Chip
            label="All"
            selected={selectedSeverity === 'ALL'}
            onPress={() => setSelectedSeverity('ALL')}
          />
          <Chip
            label="Critical"
            selected={selectedSeverity === 'CRITICAL'}
            onPress={() => setSelectedSeverity('CRITICAL')}
          />
          <Chip
            label="Major"
            selected={selectedSeverity === 'MAJOR'}
            onPress={() => setSelectedSeverity('MAJOR')}
          />
          <Chip
            label="Minor"
            selected={selectedSeverity === 'MINOR'}
            onPress={() => setSelectedSeverity('MINOR')}
          />
        </View>

        {/* Empty State */}
        <EmptyState
          illustration="no-bugs"
          title="No open bugs"
          body="Everything is running smoothly or no issues match your filter."
          actionTitle="Report Issue"
          onAction={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
