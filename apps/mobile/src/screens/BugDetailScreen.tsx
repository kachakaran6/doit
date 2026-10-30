import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Button, Chip } from '../components/ui';
import { useTheme } from '../theme/useTheme';
import { RootStackParamList } from '../navigation/types';

type BugDetailRouteProp = RouteProp<RootStackParamList, 'BugDetail'>;

export const BugDetailScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<BugDetailRouteProp>();
  const { id } = route.params;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Button title="Back" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
          <Chip label="TRIAGED" selected />
        </View>

        <Text variant="h1" style={{ marginTop: spacing.md }}>
          Bug #{id}
        </Text>
        <Text variant="body" color="secondary" style={{ marginTop: spacing.sm }}>
          Reproduction steps, device telemetry, logs, and screenshots.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
