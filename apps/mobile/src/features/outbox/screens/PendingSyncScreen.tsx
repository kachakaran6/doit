import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState, ScreenHeader } from '../../../components/ui';
import { useOutbox } from '../../../core/providers/OutboxProvider';
import { OutboxEntry } from '../../../lib/outbox';
import { RotateCw, Trash2, CheckCircle2, RefreshCw } from 'lucide-react-native';

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
            marginBottom: spacing.sm,
            ...elevation.e1,
          },
        ]}
      >
        <View style={styles.itemHeader}>
          <Text variant="caption" color="secondary">
            {item.method} {item.path}
          </Text>
          <View
            style={[
              styles.statePill,
              {
                backgroundColor: isFailed ? colors.danger + '20' : colors.surfaceRaised,
                borderColor: isFailed ? colors.danger : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color: isFailed ? colors.danger : colors.textSecondary,
                fontWeight: '600',
                fontSize: 10,
              }}
            >
              {item.state}
            </Text>
          </View>
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
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
        <ScreenHeader
          title="Sync Queue"
          subtitle="Offline Mutations"
          badge={entries.length}
          onBack={() => navigation.goBack()}
          rightAction={
            entries.length > 0 ? (
              <TouchableOpacity
                style={[
                  styles.syncAllBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: radius.sm,
                  },
                ]}
                onPress={() => flush()}
              >
                <RefreshCw size={14} color={colors.accentOnPrimary} />
                <Text
                  variant="label"
                  style={{ color: colors.accentOnPrimary, marginLeft: 6, fontWeight: '600' }}
                >
                  Sync All
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {!entries.length ? (
        <EmptyState
          illustration="no-tasks"
          title="All caught up"
          body="Your local changes are fully synchronized with the cloud backend."
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 64,
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemCard: {
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
  },
});
