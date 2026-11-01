import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState, ScreenHeader } from '../../../components/ui';
import { Bell, Check, Layers } from 'lucide-react-native';

export interface NotificationViewModel {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export const NotificationsScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
        <ScreenHeader
          title="Notifications"
          badge={unreadCount > 0 ? `${unreadCount} new` : undefined}
          onBack={() => navigation.goBack()}
          rightAction={
            unreadCount > 0 ? (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={styles.markReadBtn}
              >
                <Check size={14} color={colors.accentText} />
                <Text variant="caption" color="accent" style={{ marginLeft: 4, fontWeight: '600' }}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {!notifications.length ? (
        <EmptyState
          illustration="no-tasks"
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
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 64,
          }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemCard,
                {
                  backgroundColor: item.isRead ? colors.surface : colors.surfaceRaised,
                  borderColor: item.isRead ? colors.border : colors.borderStrong,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.xs,
                  ...elevation.e1,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.typeRow, { gap: spacing.xs }]}>
                  <Bell size={13} color={item.isRead ? colors.textTertiary : colors.accentText} />
                  <Text
                    variant="caption"
                    style={{
                      color: item.isRead ? colors.textTertiary : colors.accentText,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      fontSize: 10,
                    }}
                  >
                    {item.type.replace('_', ' ')}
                  </Text>
                </View>
                <Text variant="caption" color="tertiary" style={{ fontSize: 11 }}>
                  {item.createdAt}
                </Text>
              </View>

              <Text variant="bodyStrong" style={{ marginTop: 4 }}>
                {item.title}
              </Text>
              <Text variant="body" color="secondary" style={{ marginTop: 2, fontSize: 13, lineHeight: 18 }}>
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
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
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
