import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    final mockNotifications = [
      _Notif(
        id: '1',
        title: 'Task Assigned',
        body: 'You were assigned to "Implement biometric login for Android"',
        time: '10m ago',
        icon: LucideIcons.checkSquare,
        isUnread: true,
      ),
      _Notif(
        id: '2',
        title: 'Bug Verified',
        body: 'QA verified bug BUG-104: Shake sensitivity calibration',
        time: '2h ago',
        icon: LucideIcons.bug,
        isUnread: true,
      ),
      _Notif(
        id: '3',
        title: 'Workspace Invite Accepted',
        body: 'Karan accepted your invitation to join the engineering team',
        time: 'Yesterday',
        icon: LucideIcons.userCheck,
        isUnread: false,
      ),
    ];

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Notifications',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: mockNotifications.length,
        itemBuilder: (context, index) {
          final item = mockNotifications[index];
          return AppCard(
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: item.isUnread ? tokens.accentSoft : tokens.surface3,
                    borderRadius: AppRadius.borderMd,
                  ),
                  child: Icon(
                    item.icon,
                    size: 18,
                    color: item.isUnread ? tokens.accentText : tokens.textSecondary,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppText(
                            item.title,
                            variant: TextVariant.bodyMedium,
                            fontWeight: item.isUnread ? FontWeight.w700 : FontWeight.w500,
                          ),
                          AppText(
                            item.time,
                            variant: TextVariant.tiny,
                            colorType: TextColorType.tertiary,
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      AppText(
                        item.body,
                        variant: TextVariant.bodySmall,
                        colorType: TextColorType.secondary,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _Notif {
  final String id;
  final String title;
  final String body;
  final String time;
  final IconData icon;
  final bool isUnread;

  _Notif({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.icon,
    required this.isUnread,
  });
}
