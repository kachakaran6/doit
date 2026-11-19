import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/priority_dot.dart';
import '../../auth/providers/auth_provider.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../../workspace/widgets/workspace_switcher_sheet.dart';
import '../../settings/widgets/account_menu_sheet.dart';
import '../../tasks/providers/tasks_provider.dart';
import '../../tasks/models/task.dart';
import '../../bugs/providers/bugs_provider.dart';
import '../../stickies/providers/stickies_provider.dart';
import '../../sessions/widgets/live_session_bar.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _showGettingStarted = true;

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final authState = ref.watch(authProvider);
    final wsState = ref.watch(workspaceProvider);
    final tasksState = ref.watch(tasksProvider);
    final bugsState = ref.watch(bugsProvider);
    final stickiesState = ref.watch(stickiesProvider);

    final openTasks = tasksState.tasks.where((t) => t.status != TaskStatus.done).toList();
    final completedTasks = tasksState.tasks.where((t) => t.status == TaskStatus.done).toList();
    final totalWorkItems = tasksState.tasks.length;
    final progress = totalWorkItems > 0 ? (completedTasks.length / totalWorkItems) : 0.0;
    final progressPct = (progress * 100).toInt();

    final activeWsName = wsState.activeWorkspace?.name ?? 'Workspace';
    final activeWsInitial = activeWsName.isNotEmpty
        ? activeWsName.substring(0, activeWsName.length >= 2 ? 2 : 1).toUpperCase()
        : 'WS';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldExit = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: tokens.surface1,
            title: AppText('Exit DoIt?', variant: TextVariant.titleSmall, fontWeight: FontWeight.w700),
            content: AppText(
              'Are you sure you want to exit the application?',
              variant: TextVariant.bodyMedium,
              colorType: TextColorType.secondary,
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: AppText('Stay', colorType: TextColorType.secondary),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: AppText('Exit', color: tokens.danger, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        );
        if (shouldExit == true) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: tokens.canvas,
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([
              ref.read(tasksProvider.notifier).fetchTasks(),
              ref.read(bugsProvider.notifier).fetchBugs(),
              ref.read(stickiesProvider.notifier).fetchStickies(),
              ref.read(workspaceProvider.notifier).fetchWorkspaces(),
            ]);
          },
          color: tokens.accent,
          child: ListView(
            padding: const EdgeInsets.only(bottom: 120),
            children: [
              // Top Header Row matching screenshot 01_Home_Dashboard.png
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
                child: Row(
                  children: [
                    // Workspace Dropdown Pill (Left)
                    GestureDetector(
                      onTap: () {
                        AppSheet.show(
                          context: context,
                          builder: (_) => const WorkspaceSwitcherSheet(),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: tokens.surface2,
                          borderRadius: AppRadius.borderFull,
                          border: Border.all(color: tokens.hairline),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: tokens.accentSoft,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: AppText(
                                activeWsInitial,
                                variant: TextVariant.tiny,
                                fontWeight: FontWeight.w800,
                                customColor: tokens.accentText,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 160),
                              child: AppText(
                                activeWsName,
                                variant: TextVariant.bodySmall,
                                fontWeight: FontWeight.w600,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Icon(LucideIcons.chevronDown, size: 14, color: tokens.textSecondary),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                    // Notification Bell (Right)
                    GestureDetector(
                      onTap: () => context.push('/notifications'),
                      child: Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: tokens.surface2,
                          shape: BoxShape.circle,
                          border: Border.all(color: tokens.hairline),
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Icon(LucideIcons.bell, size: 18, color: tokens.textSecondary),
                            Positioned(
                              top: 9,
                              right: 9,
                              child: Container(
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                  color: tokens.accent,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    // User Avatar Button -> Opens AccountMenuSheet
                    GestureDetector(
                      onTap: () {
                        AppSheet.show(
                          context: context,
                          builder: (_) => const AccountMenuSheet(),
                        );
                      },
                      child: AppAvatar(
                        name: authState.user?.fullName,
                        avatarUrl: authState.user?.avatarUrl,
                        size: 38,
                      ),
                    ),
                  ],
                ),
              ),

              // Getting Started Dismissible Card
              if (_showGettingStarted && completedTasks.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: tokens.surface2,
                      borderRadius: AppRadius.borderLg,
                      border: Border.all(color: tokens.accent.withAlpha(50)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(LucideIcons.sparkles, size: 16, color: tokens.accentText),
                                const SizedBox(width: AppSpacing.xs),
                                AppText(
                                  'Getting Started',
                                  variant: TextVariant.titleSmall,
                                  fontWeight: FontWeight.w700,
                                ),
                              ],
                            ),
                            GestureDetector(
                              onTap: () => setState(() => _showGettingStarted = false),
                              child: AppText(
                                'Dismiss',
                                variant: TextVariant.caption,
                                colorType: TextColorType.secondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        AppText(
                          'Welcome to DoIt! Complete these quick steps to set up your team workflow:',
                          variant: TextVariant.caption,
                          colorType: TextColorType.secondary,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        _buildOnboardingStep(
                          context,
                          title: 'Create your first task',
                          onTap: () => context.go('/tasks'),
                        ),
                        _buildOnboardingStep(
                          context,
                          title: 'Report a bug with screen telemetry',
                          onTap: () => context.go('/bugs'),
                        ),
                      ],
                    ),
                  ),
                ),

              // Live Work Session Active Bar
              const LiveSessionBar(),

              // TODAY Summary Card matching screenshot
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
                child: AppCard(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AppText(
                                'TODAY',
                                variant: TextVariant.tiny,
                                fontWeight: FontWeight.w700,
                                colorType: TextColorType.secondary,
                              ),
                              const SizedBox(height: 4),
                              AppText(
                                '${openTasks.length} to do • ${completedTasks.length} done',
                                variant: TextVariant.titleLarge,
                                fontWeight: FontWeight.w800,
                              ),
                              const SizedBox(height: 2),
                              AppText(
                                '$totalWorkItems total work items',
                                variant: TextVariant.caption,
                                colorType: TextColorType.secondary,
                              ),
                            ],
                          ),
                          // Progress Ring with dot at top
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 56,
                                height: 56,
                                child: CircularProgressIndicator(
                                  value: progress > 0 ? progress : 0.05,
                                  strokeWidth: 4.5,
                                  backgroundColor: tokens.surface3,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    progress > 0 ? tokens.success : tokens.accent,
                                  ),
                                ),
                              ),
                              AppText(
                                '$progressPct%',
                                variant: TextVariant.caption,
                                fontWeight: FontWeight.w700,
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      // Metric Chips Row: Done, Bugs, Stickies
                      Row(
                        children: [
                          _buildStatChip(
                            context,
                            icon: LucideIcons.checkCircle2,
                            label: '${completedTasks.length} Done',
                            color: tokens.success,
                            onTap: () => context.go('/tasks'),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          _buildStatChip(
                            context,
                            icon: LucideIcons.bug,
                            label: '${bugsState.bugs.length} Bugs',
                            color: tokens.warning,
                            onTap: () => context.go('/bugs'),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          _buildStatChip(
                            context,
                            icon: LucideIcons.fileText,
                            label: '${stickiesState.stickies.length} Stickies',
                            color: tokens.textSecondary,
                            onTap: () => context.push('/stickies'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // "Work" Project Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: AppCard(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  onTap: () => context.go('/tasks'),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: tokens.accentSoft,
                          borderRadius: AppRadius.borderMd,
                        ),
                        child: Icon(LucideIcons.checkSquare, size: 20, color: tokens.accentText),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppText(
                              'Work',
                              variant: TextVariant.titleSmall,
                              fontWeight: FontWeight.w700,
                            ),
                            AppText(
                              '${openTasks.length} open in ${wsState.activeProject?.name ?? 'General'}',
                              variant: TextVariant.caption,
                              colorType: TextColorType.secondary,
                            ),
                          ],
                        ),
                      ),
                      Icon(LucideIcons.chevronRight, size: 18, color: tokens.textTertiary),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // "Your Work" Section Header with "See all"
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppText(
                      'Your Work',
                      variant: TextVariant.titleMedium,
                      fontWeight: FontWeight.w800,
                    ),
                    GestureDetector(
                      onTap: () => context.go('/tasks'),
                      child: AppText(
                        'See all',
                        variant: TextVariant.bodySmall,
                        fontWeight: FontWeight.w600,
                        customColor: tokens.accentText,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),

              // Task List Container Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: openTasks.isEmpty
                    ? AppCard(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(LucideIcons.checkCheck, size: 32, color: tokens.success),
                              const SizedBox(height: AppSpacing.sm),
                              AppText(
                                'You are all caught up!',
                                variant: TextVariant.bodyMedium,
                                fontWeight: FontWeight.w600,
                              ),
                              AppText(
                                'Tap "+" below to capture a new task or defect.',
                                variant: TextVariant.caption,
                                colorType: TextColorType.secondary,
                              ),
                            ],
                          ),
                        ),
                      )
                    : AppCard(
                        padding: EdgeInsets.zero,
                        child: Column(
                          children: openTasks.take(6).map((task) {
                            final isDone = task.status == TaskStatus.done;
                            return Column(
                              children: [
                                ListTile(
                                  onTap: () => context.push('/task/${task.id}'),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.md,
                                    vertical: 4,
                                  ),
                                  leading: GestureDetector(
                                    onTap: () {
                                      ref.read(tasksProvider.notifier).toggleTaskStatus(task.id);
                                    },
                                    child: Container(
                                      width: 22,
                                      height: 22,
                                      decoration: BoxDecoration(
                                        color: isDone ? tokens.success : Colors.transparent,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: isDone ? tokens.success : tokens.textMuted.withAlpha(120),
                                          width: 1.5,
                                        ),
                                      ),
                                      child: isDone
                                          ? const Icon(LucideIcons.check, size: 12, color: Colors.white)
                                          : null,
                                    ),
                                  ),
                                  title: AppText(
                                    task.title,
                                    variant: TextVariant.bodyMedium,
                                    fontWeight: FontWeight.w600,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Row(
                                    children: [
                                      PriorityDot(priority: TaskViewModel.priorityToString(task.priority), size: 7),
                                      const SizedBox(width: 4),
                                      AppText(
                                        task.humanId,
                                        variant: TextVariant.tiny,
                                        colorType: TextColorType.tertiary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ],
                                  ),
                                ),
                                Divider(color: tokens.hairline, height: 1),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Sticky Board Preview Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: AppCard(
                  onTap: () => context.push('/stickies'),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF08A),
                          borderRadius: AppRadius.borderMd,
                        ),
                        child: const Icon(LucideIcons.fileText, size: 20, color: Color(0xFF854D0E)),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppText(
                              'Sticky Board',
                              variant: TextVariant.bodyMedium,
                              fontWeight: FontWeight.w700,
                            ),
                            AppText(
                              '${stickiesState.stickies.length} ideas and notes on board',
                              variant: TextVariant.caption,
                              colorType: TextColorType.secondary,
                            ),
                          ],
                        ),
                      ),
                      Icon(LucideIcons.chevronRight, size: 18, color: tokens.textTertiary),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

  Widget _buildStatChip(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    final tokens = context.tokens;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: tokens.surface3,
          borderRadius: AppRadius.borderFull,
        ),
        child: Row(
          children: [
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 4),
            AppText(
              label,
              variant: TextVariant.caption,
              fontWeight: FontWeight.w600,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOnboardingStep(
    BuildContext context, {
    required String title,
    required VoidCallback onTap,
  }) {
    final tokens = context.tokens;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Icon(LucideIcons.checkCircle2, size: 16, color: tokens.accentText),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: AppText(
                title,
                variant: TextVariant.bodySmall,
                fontWeight: FontWeight.w600,
              ),
            ),
            Icon(LucideIcons.arrowRight, size: 14, color: tokens.textSecondary),
          ],
        ),
      ),
    );
  }
}
