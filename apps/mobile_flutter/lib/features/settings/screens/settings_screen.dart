import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/shake_test_modal.dart';
import '../widgets/quick_capture_guide_sheet.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  int _aboutTapCount = 0;
  bool _devModeUnlocked = false;
  double _cacheSizeMb = 14.8;

  void _handleAboutTap() {
    setState(() {
      _aboutTapCount++;
      if (_aboutTapCount >= 7 && !_devModeUnlocked) {
        _devModeUnlocked = true;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Developer Mode Unlocked! Developer tools enabled.'),
            backgroundColor: Color(0xFF0E8550),
          ),
        );
      }
    });
  }

  void _showClearCacheDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.tokens.surface1,
        title: AppText('Offline Storage & Cache', variant: TextVariant.titleSmall, fontWeight: FontWeight.w700),
        content: AppText(
          '$_cacheSizeMb MB currently cached locally. Do you want to clear temporary offline cache?',
          variant: TextVariant.bodyMedium,
          colorType: TextColorType.secondary,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: AppText('Cancel', colorType: TextColorType.secondary),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _cacheSizeMb = 0.4;
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cache successfully cleared.')),
              );
            },
            child: AppText('Clear Cache', color: context.tokens.accent),
          ),
        ],
      ),
    );
  }

  void _showExportDataDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.tokens.surface1,
        title: AppText('Export Workspace Data', variant: TextVariant.titleSmall, fontWeight: FontWeight.w700),
        content: AppText(
          'Your workspace tasks, bugs, and stickies will be prepared as a downloadable JSON archive and sent to your email.',
          variant: TextVariant.bodyMedium,
          colorType: TextColorType.secondary,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: AppText('Cancel', colorType: TextColorType.secondary),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Export archive requested. Download link sent.')),
              );
            },
            child: AppText('Export Now', color: context.tokens.accent),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.tokens.surface1,
        title: AppText('Delete Account?', variant: TextVariant.titleSmall, fontWeight: FontWeight.w700, color: context.tokens.danger),
        content: AppText(
          'Permanently delete your account and all associated workspace data? This action is irreversible.',
          variant: TextVariant.bodyMedium,
          colorType: TextColorType.secondary,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: AppText('Cancel', colorType: TextColorType.secondary),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Account deletion scheduled. You will be signed out.'),
                  backgroundColor: Color(0xFFD6305A),
                ),
              );
              ref.read(authProvider.notifier).logout();
              context.go('/auth');
            },
            child: AppText('Delete Account', color: context.tokens.danger, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  void _showSignOutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.tokens.surface1,
        title: AppText('Log out of DoIt?', variant: TextVariant.titleSmall, fontWeight: FontWeight.w700),
        content: AppText(
          'You will need to sign in again to access your projects and tasks.',
          variant: TextVariant.bodyMedium,
          colorType: TextColorType.secondary,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: AppText('Cancel', colorType: TextColorType.secondary),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authProvider.notifier).logout();
              context.go('/auth');
            },
            child: AppText('Log Out', color: context.tokens.danger, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final themeState = ref.watch(themeProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Settings',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        children: [
          // 1. Account Section
          AppText(
            'ACCOUNT',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
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
                              authState.user?.fullName ?? 'DoIt Engineer',
                              variant: TextVariant.bodyLarge,
                              fontWeight: FontWeight.w700,
                            ),
                            AppText(
                              authState.user?.email ?? 'alice@example.com',
                              variant: TextVariant.caption,
                              colorType: TextColorType.secondary,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Divider(color: tokens.hairline, height: 1),
                ListTile(
                  leading: Icon(LucideIcons.users, size: 18, color: tokens.accent),
                  title: AppText('Team & Members', variant: TextVariant.bodyMedium, fontWeight: FontWeight.w600),
                  subtitle: AppText('Teammates, roles, and invitation links', variant: TextVariant.caption, colorType: TextColorType.secondary),
                  trailing: Icon(LucideIcons.chevronRight, size: 16, color: tokens.textTertiary),
                  onTap: () => context.push('/team-members'),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 2. Appearance Section
          AppText(
            'APPEARANCE',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppText(
                      'Color theme',
                      variant: TextVariant.bodyMedium,
                      fontWeight: FontWeight.w600,
                    ),
                    SegmentedButton<ThemeMode>(
                      segments: const [
                        ButtonSegment(value: ThemeMode.dark, label: Text('Dark')),
                        ButtonSegment(value: ThemeMode.light, label: Text('Light')),
                        ButtonSegment(value: ThemeMode.system, label: Text('Auto')),
                      ],
                      selected: {themeState.themeMode},
                      onSelectionChanged: (set) {
                        ref.read(themeProvider.notifier).setThemeMode(set.first);
                      },
                      style: const ButtonStyle(
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                  ],
                ),
                Divider(color: tokens.hairline, height: 24),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppText(
                          'Accent Color',
                          variant: TextVariant.bodyMedium,
                          fontWeight: FontWeight.w600,
                        ),
                        AppText(
                          switch (themeState.accent) {
                            AppAccentName.blue => 'Ocean Blue',
                            AppAccentName.violet => 'Iris Violet',
                            AppAccentName.green => 'Emerald Green',
                            AppAccentName.orange => 'Amber Orange',
                            AppAccentName.rose => 'Crimson Rose',
                          },
                          variant: TextVariant.caption,
                          fontWeight: FontWeight.w600,
                          customColor: tokens.accentText,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: AppAccentName.values.map((acc) {
                        final isSelected = themeState.accent == acc;
                        Color c;
                        if (tokens.isDark) {
                          switch (acc) {
                            case AppAccentName.blue:
                              c = AppColors.blueFillDark;
                              break;
                            case AppAccentName.violet:
                              c = AppColors.violetFillDark;
                              break;
                            case AppAccentName.green:
                              c = AppColors.greenFillDark;
                              break;
                            case AppAccentName.orange:
                              c = AppColors.orangeFillDark;
                              break;
                            case AppAccentName.rose:
                              c = AppColors.roseFillDark;
                              break;
                          }
                        } else {
                          switch (acc) {
                            case AppAccentName.blue:
                              c = AppColors.blueFillLight;
                              break;
                            case AppAccentName.violet:
                              c = AppColors.violetFillLight;
                              break;
                            case AppAccentName.green:
                              c = AppColors.greenFillLight;
                              break;
                            case AppAccentName.orange:
                              c = AppColors.orangeFillLight;
                              break;
                            case AppAccentName.rose:
                              c = AppColors.roseFillLight;
                              break;
                          }
                        }

                        return Expanded(
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () {
                              HapticFeedback.mediumImpact();
                              ref.read(themeProvider.notifier).setAccent(acc);
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Center(
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: isSelected
                                        ? Border.all(
                                            color: c,
                                            width: 2.5,
                                          )
                                        : Border.all(
                                            color: Colors.transparent,
                                            width: 2.5,
                                          ),
                                  ),
                                  child: Center(
                                    child: Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: c,
                                        shape: BoxShape.circle,
                                        boxShadow: isSelected
                                            ? [
                                                BoxShadow(
                                                  color: c.withAlpha(140),
                                                  blurRadius: 10,
                                                  offset: const Offset(0, 3),
                                                ),
                                              ]
                                            : null,
                                      ),
                                      child: isSelected
                                          ? const Icon(LucideIcons.check, size: 18, color: Colors.white)
                                          : null,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 3. Capture & AI Section
          AppText(
            'CAPTURE & AI INTELLIGENCE',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
            child: Column(
              children: [
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.folder,
                  title: 'Project Context',
                  subtitle: 'Markdown the AI prompt uses for this project',
                  onTap: () => context.push('/project-context'),
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.zap,
                  title: 'Quick Capture & Shake',
                  subtitle: 'Configure sensitivity, trigger thresholds, and presets',
                  onTap: () => context.push('/quick-capture-prefs'),
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.helpCircle,
                  title: 'Hardware & Capture Guide',
                  subtitle: 'Troubleshooting floating bubble & gestures',
                  onTap: () {
                    AppSheet.show(
                      context: context,
                      builder: (_) => const QuickCaptureGuideSheet(),
                    );
                  },
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.activity,
                  title: 'Test Shake Detector',
                  subtitle: 'Live accelerometer visualizer & threshold feedback',
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (_) => const ShakeTestModal(),
                    );
                  },
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.sparkles,
                  title: 'AI Intelligence Provider',
                  subtitle: 'OpenAI, Anthropic, Gemini, Groq integration',
                  onTap: () => context.push('/ai-provider'),
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.cloud,
                  title: 'Offline Sync & Outbox',
                  subtitle: 'View pending mutations & offline cache state',
                  onTap: () => context.push('/pending-sync'),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 4. Storage & Cache Section
          AppText(
            'STORAGE AND CACHE',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
            child: _buildSettingsRow(
              context,
              icon: LucideIcons.hardDrive,
              title: 'Local Storage & Cache',
              subtitle: '${_cacheSizeMb.toStringAsFixed(1)} MB stored on this device',
              onTap: _showClearCacheDialog,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 5. Data & Privacy Section
          AppText(
            'DATA AND PRIVACY',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
            child: Column(
              children: [
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.fileText,
                  title: 'Export Data',
                  subtitle: 'Download all tasks, bugs, and notes in JSON',
                  onTap: _showExportDataDialog,
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.trash2,
                  iconColor: tokens.danger,
                  title: 'Delete Account',
                  titleColor: tokens.danger,
                  subtitle: 'Permanently remove account & personal data',
                  onTap: _showDeleteAccountDialog,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 6. Samyukt Ecosystem Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppText(
                'SAMYUKT ECOSYSTEM',
                variant: TextVariant.tiny,
                colorType: TextColorType.secondary,
                fontWeight: FontWeight.w700,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: tokens.accent.withAlpha(38),
                  borderRadius: AppRadius.borderPill,
                ),
                child: AppText(
                  'PRECISION STANDARDS',
                  variant: TextVariant.tiny,
                  color: tokens.accent,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
            child: Column(
              children: [
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.sparkles,
                  iconColor: tokens.accent,
                  title: 'Our Apps',
                  badgeText: 'Registry',
                  subtitle: 'Explore precision apps built by Samyukt',
                  onTap: () => context.push('/our-apps'),
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.downloadCloud,
                  iconColor: const Color(0xFF0E8550),
                  title: 'Check for Updates',
                  subtitle: 'Native Google Play in-app updates',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('DoIt is up to date (Version 2.0.3 Build 63).'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.star,
                  iconColor: const Color(0xFFEAB308),
                  title: 'Rate on Google Play',
                  subtitle: 'Leave a review on our official Play Store page',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Opening Google Play Store rating...')),
                    );
                  },
                ),
                Divider(color: tokens.hairline, height: 1),
                _buildSettingsRow(
                  context,
                  icon: LucideIcons.share2,
                  title: 'Share DoIt',
                  subtitle: 'Share with colleagues and engineering teams',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Link copied to clipboard: https://doit.samyukt.pro')),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // 7. About Section (Tap 7x for developer easter egg)
          AppText(
            'ABOUT',
            variant: TextVariant.tiny,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.xs),
          GestureDetector(
            onTap: _handleAboutTap,
            child: AppCard(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppText('DoIt Mobile', variant: TextVariant.bodyLarge, fontWeight: FontWeight.w700),
                      AppText('Version 2.0.3 (Build 63)', variant: TextVariant.caption, colorType: TextColorType.secondary),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: tokens.accent.withAlpha(25),
                      borderRadius: AppRadius.borderPill,
                    ),
                    child: AppText(
                      'Samyukt Standard',
                      variant: TextVariant.tiny,
                      color: tokens.accent,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Developer options if unlocked
          if (_devModeUnlocked) ...[
            const SizedBox(height: AppSpacing.md),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
              child: Column(
                children: [
                  _buildSettingsRow(
                    context,
                    icon: LucideIcons.palette,
                    title: 'Design Foundation Gallery',
                    subtitle: 'Inspect raw tokens, typography ramp, and components',
                    onTap: () => context.push('/foundation-gallery'),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),

          // Sign Out Button
          AppButton(
            label: 'Sign Out',
            variant: ButtonVariant.danger,
            isFullWidth: true,
            icon: const Icon(LucideIcons.logOut, size: 18, color: Colors.white),
            onPressed: _showSignOutDialog,
          ),
          const SizedBox(height: AppSpacing.lg),

          // Attribution
          Center(
            child: GestureDetector(
              onTap: () async {
                final uri = Uri.parse('https://samyukt.pro');
                if (await canLaunchUrl(uri)) launchUrl(uri);
              },
              child: AppText(
                'Crafted with precision by Samyukt - samyukt.pro',
                variant: TextVariant.tiny,
                colorType: TextColorType.tertiary,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildSettingsRow(
    BuildContext context, {
    required IconData icon,
    Color? iconColor,
    required String title,
    Color? titleColor,
    String? badgeText,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final tokens = context.tokens;
    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: tokens.surface3,
          borderRadius: AppRadius.borderMd,
        ),
        child: Icon(icon, size: 18, color: iconColor ?? tokens.textSecondary),
      ),
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: AppText(
              title,
              variant: TextVariant.bodyMedium,
              fontWeight: FontWeight.w600,
              color: titleColor,
            ),
          ),
          if (badgeText != null) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: tokens.accent.withAlpha(38),
                borderRadius: AppRadius.borderPill,
              ),
              child: AppText(
                badgeText,
                variant: TextVariant.tiny,
                color: tokens.accent,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ],
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
