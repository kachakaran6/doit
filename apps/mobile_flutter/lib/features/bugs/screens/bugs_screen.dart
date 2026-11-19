import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../../workspace/widgets/project_switcher_sheet.dart';
import '../../capture/screens/capture_modal.dart';
import '../models/bug.dart';
import '../providers/bugs_provider.dart';

class BugsScreen extends ConsumerWidget {
  const BugsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;
    final wsState = ref.watch(workspaceProvider);
    final bugsState = ref.watch(bugsProvider);
    final bugs = bugsState.filteredBugs;

    final criticalCount = bugsState.bugs.where((b) => b.severity == BugSeverity.critical).length;
    final majorCount = bugsState.bugs.where((b) => b.severity == BugSeverity.major).length;
    final minorCount = bugsState.bugs.where((b) => b.severity == BugSeverity.minor).length;

    return Scaffold(
      backgroundColor: tokens.canvas,
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Header Bar matching 03_Bug_Queue.png
            Padding(
              padding: const EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                top: AppSpacing.md,
                bottom: AppSpacing.xs,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          AppText(
                            'Bugs',
                            variant: TextVariant.display,
                            fontWeight: FontWeight.w800,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: tokens.surface3,
                              borderRadius: AppRadius.borderFull,
                            ),
                            child: AppText(
                              '${bugsState.bugs.length}',
                              variant: TextVariant.tiny,
                              fontWeight: FontWeight.w700,
                              colorType: TextColorType.secondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      // Project Selector Dropdown
                      GestureDetector(
                        onTap: () {
                          AppSheet.show(
                            context: context,
                            builder: (_) => const ProjectSwitcherSheet(),
                          );
                        },
                        child: Row(
                          children: [
                            AppText(
                              wsState.activeProject?.name ?? 'General',
                              variant: TextVariant.bodySmall,
                              colorType: TextColorType.secondary,
                              fontWeight: FontWeight.w600,
                            ),
                            const SizedBox(width: 4),
                            Icon(LucideIcons.chevronDown, size: 14, color: tokens.textSecondary),
                          ],
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () {
                      AppSheet.show(
                        context: context,
                        builder: (_) => const QuickCaptureSheet(initialMode: 'bug'),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                      decoration: BoxDecoration(
                        color: tokens.accentSoft,
                        borderRadius: AppRadius.borderFull,
                      ),
                      child: Row(
                        children: [
                          Icon(LucideIcons.plus, size: 14, color: tokens.accentText),
                          const SizedBox(width: 4),
                          AppText(
                            'Report',
                            variant: TextVariant.tiny,
                            fontWeight: FontWeight.w700,
                            customColor: tokens.accentText,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Severity Filter Chips with Colored Indicator Dots
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
              child: Row(
                children: [
                  _buildSeverityChip(
                    context,
                    label: 'All ${bugsState.bugs.length}',
                    isSelected: bugsState.severityFilter == null,
                    onTap: () => ref.read(bugsProvider.notifier).setSeverityFilter(null),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  _buildSeverityChip(
                    context,
                    label: 'Critical $criticalCount',
                    dotColor: tokens.danger,
                    isSelected: bugsState.severityFilter == BugSeverity.critical,
                    onTap: () => ref.read(bugsProvider.notifier).setSeverityFilter(BugSeverity.critical),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  _buildSeverityChip(
                    context,
                    label: 'Major $majorCount',
                    dotColor: tokens.warning,
                    isSelected: bugsState.severityFilter == BugSeverity.major,
                    onTap: () => ref.read(bugsProvider.notifier).setSeverityFilter(BugSeverity.major),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  _buildSeverityChip(
                    context,
                    label: 'Minor $minorCount',
                    dotColor: tokens.info,
                    isSelected: bugsState.severityFilter == BugSeverity.minor,
                    onTap: () => ref.read(bugsProvider.notifier).setSeverityFilter(BugSeverity.minor),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Bugs List
            Expanded(
              child: bugsState.isLoading && bugs.isEmpty
                  ? Center(child: CircularProgressIndicator(color: tokens.accent))
                  : RefreshIndicator(
                      onRefresh: () => ref.read(bugsProvider.notifier).fetchBugs(),
                      color: tokens.accent,
                      child: bugs.isEmpty
                          ? EmptyState(
                              icon: LucideIcons.bug,
                              title: 'No open bugs',
                              message: 'All reported defects in this category have been resolved.',
                              actionLabel: 'Report Defect',
                              onAction: () {
                                AppSheet.show(
                                  context: context,
                                  builder: (_) => const QuickCaptureSheet(initialMode: 'bug'),
                                );
                              },
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.only(
                                left: AppSpacing.lg,
                                right: AppSpacing.lg,
                                top: AppSpacing.xs,
                                bottom: 120,
                              ),
                              itemCount: bugs.length,
                              itemBuilder: (context, index) {
                                final bug = bugs[index];
                                return _buildBugCard(context, bug);
                              },
                            ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBugCard(BuildContext context, BugViewModel bug) {
    final tokens = context.tokens;

    Color sevColor;
    switch (bug.severity) {
      case BugSeverity.critical:
        sevColor = tokens.danger;
        break;
      case BugSeverity.major:
        sevColor = tokens.warning;
        break;
      case BugSeverity.minor:
        sevColor = tokens.info;
        break;
      case BugSeverity.trivial:
        sevColor = tokens.textTertiary;
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: tokens.surface2,
        borderRadius: AppRadius.borderLg,
        border: Border.all(color: tokens.hairline),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.push('/bug/${bug.id}'),
          borderRadius: AppRadius.borderLg,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left severity square thumbnail container
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: tokens.surface3,
                    borderRadius: AppRadius.borderMd,
                    border: Border.all(color: tokens.hairline),
                  ),
                  child: Icon(LucideIcons.bug, size: 22, color: sevColor),
                ),
                const SizedBox(width: AppSpacing.md),
                // Middle column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppText(
                        '${bug.humanId} • 1d ago',
                        variant: TextVariant.tiny,
                        colorType: TextColorType.tertiary,
                        fontWeight: FontWeight.w600,
                      ),
                      const SizedBox(height: 2),
                      AppText(
                        bug.title,
                        variant: TextVariant.bodyMedium,
                        fontWeight: FontWeight.w600,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      // Severity Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: sevColor.withAlpha(25),
                          borderRadius: AppRadius.borderFull,
                          border: Border.all(color: sevColor.withAlpha(60)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(color: sevColor, shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 4),
                            AppText(
                              BugViewModel.severityToString(bug.severity),
                              variant: TextVariant.tiny,
                              fontWeight: FontWeight.w800,
                              customColor: sevColor,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // Right side status pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: tokens.accentSoft,
                    borderRadius: AppRadius.borderSm,
                  ),
                  child: AppText(
                    BugViewModel.statusToString(bug.status),
                    variant: TextVariant.tiny,
                    fontWeight: FontWeight.w700,
                    customColor: tokens.accentText,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSeverityChip(
    BuildContext context, {
    required String label,
    Color? dotColor,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final tokens = context.tokens;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? tokens.accentSoft : tokens.surface2,
          borderRadius: AppRadius.borderFull,
          border: Border.all(
            color: isSelected ? tokens.accent.withAlpha(90) : tokens.hairline,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (dotColor != null) ...[
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
            ],
            AppText(
              label,
              variant: TextVariant.bodySmall,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              customColor: isSelected ? tokens.accentText : tokens.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
