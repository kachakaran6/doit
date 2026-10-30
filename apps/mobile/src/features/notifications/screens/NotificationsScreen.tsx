import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState } from '../../../components/ui';
import { Bell, ChevronLeft, Check } from 'lucide-react-native';

export interface NotificationViewModel {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export const NotificationsScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<NotificationViewModel[]>([
    {
      id: 'n1',
      title: 'Task Assigned',
      body: 'You were assigned to "Ship Phase 4 Capture Core"',
      type: 'TASK_ASSIGNED',
      createdAt: '10m ago',
      isRead: false,
    },
    {
      id: 'n2',
      title: 'Bug Verified',
      body: 'Bug SMP-BUG-1 has been verified and marked resolved.',
      type: 'BUG_REPORTED',
      createdAt: '1h ago',
      isRead: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <View>
          <Button
            title="Back"
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={16} color={colors.textPrimary} />}
            onPress={() => navigation.goBack()}
          />
          <Text variant="h1" style={{ marginTop: spacing.sm }}>
            Notifications
          </Text>
        </View>

        {notifications.some((n) => !n.isRead) && (
          <Button
            title="Mark all read"
            variant="ghost"
            size="sm"
            icon={<Check size={14} color={colors.accentText} />}
            onPress={handleMarkAllRead}
          />
        )}
      </View>

      {!notifications.length ? (
        <EmptyState
          title="No notifications"
          body="You're all caught up! New updates, task assignments and reminders will appear here."
          actionTitle="Back to Home"
          onAction={() => navigation.goBack()}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemCard,
                {
                  backgroundColor: item.isRead ? colors.surface : colors.surfaceRaised,
                  borderColor: item.isRead ? colors.border : colors.accent,
                  borderRadius: radius.md,
                  padding: spacing.md,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.typeRow, { gap: spacing.xs }]}>
                  <Bell size={14} color={item.isRead ? colors.textTertiary : colors.accentText} />
                  <Text variant="caption" color={item.isRead ? 'secondary' : 'accent'} style={{ fontWeight: '700' }}>
                    {item.title}
                  </Text>
                </View>
                <Text variant="caption" color="tertiary">
                  {item.createdAt}
                </Text>
              </View>

              <Text variant="body" color="primary" style={{ marginTop: spacing.xs }}>
                {item.body}
              </Text>
            </View>
          )}
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
    marginBottom: 8,
  },
  itemCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
