import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState } from '../../../components/ui';
import { useOutbox } from '../../../app/providers/OutboxProvider';
import { OutboxEntry } from '../../../lib/outbox';
import { RotateCw, Trash2, CheckCircle2 } from 'lucide-react-native';

export const PendingSyncScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation();
  const { entries, flush, retry, discard } = useOutbox();

  const renderItem = ({ item }: { item: OutboxEntry }) => {
    const isFailed = item.state === 'FAILED';

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.surface,
            borderColor: isFailed ? colors.danger : colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            ...elevation.e1,
          },
        ]}
      >
        <View style={styles.itemHeader}>
          <Text variant="caption" color="secondary">
            {item.method} {item.path}
          </Text>
          <Text
            variant="caption"
            color={isFailed ? 'danger' : 'accent'}
            style={{ fontWeight: '700' }}
          >
            {item.state}
          </Text>
        </View>

        <Text variant="bodyStrong" numberOfLines={1} style={{ marginTop: spacing.xs }}>
          {item.body?.title || item.entityId || 'Data Mutation'}
        </Text>

        {item.lastError && (
          <Text variant="caption" color="danger" style={{ marginTop: spacing.xs }}>
            {item.lastError}
          </Text>
        )}

        <View style={[styles.itemActions, { gap: spacing.sm, marginTop: spacing.sm }]}>
          <Button
            title="Retry"
            variant="secondary"
            size="sm"
            icon={<RotateCw size={12} color={colors.textPrimary} />}
            onPress={() => retry(item.id)}
          />
          <Button
            title="Discard"
            variant="ghost"
            size="sm"
            icon={<Trash2 size={12} color={colors.danger} />}
            onPress={() => discard(item.id)}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <View>
          <Button title="← Back" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
          <Text variant="h1" style={{ marginTop: spacing.xs }}>
            Sync Queue
          </Text>
          <Text variant="caption" color="secondary">
            {entries.length} offline changes awaiting upload
          </Text>
        </View>
        {entries.length > 0 && (
          <Button
            title="Sync All"
            variant="primary"
            size="sm"
            onPress={() => flush()}
          />
        )}
      </View>

      {!entries.length ? (
        <EmptyState
          title="All caught up"
          body="Your local changes are fully synchronized with the server."
          actionTitle="Back to Home"
          onAction={() => navigation.goBack()}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        />
      )}
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemCard: {
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
