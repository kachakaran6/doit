import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../auth/providers/auth_provider.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../../workspace/widgets/workspace_switcher_sheet.dart';
import '../../workspace/widgets/project_switcher_sheet.dart';

class AccountMenuSheet extends ConsumerWidget {
  const AccountMenuSheet({super.key});

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.tokens.surface1,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderXl),
        title: AppText(
          'Log out of DoIt?',
          variant: TextVariant.titleSmall,
          fontWeight: FontWeight.w700,
        ),
        content: AppText(
          'Are you sure you want to sign out of your account on this device?',
          variant: TextVariant.bodyMedium,
          colorType: TextColorType.secondary,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: AppText('Cancel', customColor: context.tokens.textSecondary),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context); // close sheet
              ref.read(authProvider.notifier).logout();
              context.go('/auth');
            },
            child: AppText(
              'Log Out',
              customColor: context.tokens.danger,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;
    final authState = ref.watch(authProvider);
    final wsState = ref.watch(workspaceProvider);

    return AppSheet(
      title: 'Account & Workspace',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: tokens.surface2,
                borderRadius: AppRadius.borderLg,
                border: Border.all(color: tokens.hairline),
              ),
              child: Row(
                children: [
                  AppAvatar(
                    name: authState.user?.fullName,
                    avatarUrl: authState.user?.avatarUrl,
                    size: 46,
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppText(
                          authState.user?.fullName ?? 'User Profile',
                          variant: TextVariant.titleSmall,
                          fontWeight: FontWeight.w700,
                        ),
                        AppText(
                          authState.user?.email ?? 'user@samyukt.pro',
                          variant: TextVariant.caption,
                          colorType: TextColorType.secondary,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: tokens.accentSoft,
                      borderRadius: AppRadius.borderSm,
                    ),
                    child: AppText(
                      (wsState.activeWorkspace?.role ?? 'OWNER').toUpperCase(),
                      variant: TextVariant.tiny,
                      fontWeight: FontWeight.w800,
                      customColor: tokens.accentText,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Navigation Options
            _buildActionTile(
              context,
              icon: LucideIcons.building,
              title: 'Switch Workspace',
              subtitle: wsState.activeWorkspace?.name ?? 'Personal Workspace',
              onTap: () {
                Navigator.pop(context);
                AppSheet.show(
                  context: context,
                  builder: (_) => const WorkspaceSwitcherSheet(),
                );
              },
            ),
            Divider(color: tokens.hairline, height: 1),
            _buildActionTile(
              context,
              icon: LucideIcons.folder,
              title: 'Project Filter',
              subtitle: wsState.activeProject?.name ?? 'All Projects',
              onTap: () {
                Navigator.pop(context);
                AppSheet.show(
                  context: context,
                  builder: (_) => const ProjectSwitcherSheet(),
                );
              },
            ),
            Divider(color: tokens.hairline, height: 1),
            _buildActionTile(
              context,
              icon: LucideIcons.layoutGrid,
              title: 'Our Apps Catalog',
              subtitle: 'Precision apps built by Samyukt',
              onTap: () {
                Navigator.pop(context);
                context.push('/our-apps');
              },
            ),
            Divider(color: tokens.hairline, height: 1),
            _buildActionTile(
              context,
              icon: LucideIcons.settings,
              title: 'Settings & Preferences',
              subtitle: 'Themes, hardware sensors, and sync',
              onTap: () {
                Navigator.pop(context);
                context.push('/settings');
              },
            ),
            Divider(color: tokens.hairline, height: 1),
            _buildActionTile(
              context,
              icon: LucideIcons.logOut,
              title: 'Sign Out',
              subtitle: 'Disconnect account from this device',
              isDanger: true,
              onTap: () => _showLogoutDialog(context, ref),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDanger = false,
  }) {
    final tokens = context.tokens;
    final color = isDanger ? tokens.danger : tokens.textPrimary;

    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isDanger ? tokens.dangerSoft : tokens.surface3,
          borderRadius: AppRadius.borderMd,
        ),
        child: Icon(icon, size: 18, color: isDanger ? tokens.danger : tokens.textSecondary),
      ),
      title: AppText(
        title,
        variant: TextVariant.bodyMedium,
        fontWeight: FontWeight.w600,
        customColor: color,
      ),
      subtitle: AppText(
        subtitle,
        variant: TextVariant.caption,
        colorType: TextColorType.secondary,
      ),
      trailing: Icon(LucideIcons.chevronRight, size: 16, color: tokens.textTertiary),
      contentPadding: EdgeInsets.zero,
      onTap: onTap,
    );
  }
}
