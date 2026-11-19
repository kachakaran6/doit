import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge.dart';
import '../../workspace/providers/workspace_provider.dart';
import '../../tasks/widgets/solution_prompt_section.dart';
import '../models/bug.dart';
import '../providers/bugs_provider.dart';
import '../widgets/bug_auto_context_card.dart';

class BugDetailScreen extends ConsumerStatefulWidget {
  final String bugId;

  const BugDetailScreen({super.key, required this.bugId});

  @override
  ConsumerState<BugDetailScreen> createState() => _BugDetailScreenState();
}

class _BugDetailScreenState extends ConsumerState<BugDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final wsState = ref.watch(workspaceProvider);
    final bugsState = ref.watch(bugsProvider);
    final bug = bugsState.bugs.firstWhere(
      (b) => b.id == widget.bugId,
      orElse: () => BugViewModel(
        id: widget.bugId,
        humanId: 'BUG',
        title: 'Bug Not Found',
        severity: BugSeverity.major,
        status: BugStatus.triaged,
        projectId: '',
      ),
    );

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          bug.humanId,
          variant: TextVariant.titleSmall,
          fontWeight: FontWeight.w700,
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 20),
            color: tokens.danger,
            onPressed: () {
              ref.read(bugsProvider.notifier).deleteBug(bug.id);
              context.pop();
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Header: Human ID + Status Badge
          Row(
            children: [
              AppText(
                bug.humanId,
                variant: TextVariant.display,
                fontWeight: FontWeight.w800,
              ),
              const SizedBox(width: AppSpacing.sm),
              StatusBadge(status: BugViewModel.statusToString(bug.status)),
            ],
          ),
          const SizedBox(height: 4),
          // Bug Title
          AppText(
            bug.title,
            variant: TextVariant.titleMedium,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.lg),

          // Metadata Card: Project, Reported, Status (matching 04_Bug_Detail.png)
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMetaCol(
                  context,
                  icon: LucideIcons.folder,
                  label: 'Project',
                  value: wsState.activeProject?.name ?? 'General',
                ),
                Container(width: 1, height: 32, color: tokens.hairline),
                _buildMetaCol(
                  context,
                  icon: LucideIcons.clock,
                  label: 'Reported',
                  value: '11/5/2026',
                ),
                Container(width: 1, height: 32, color: tokens.hairline),
                _buildMetaCol(
                  context,
                  icon: LucideIcons.shieldCheck,
                  label: 'Status',
                  value: BugViewModel.statusToString(bug.status),
                  valueColor: tokens.warning,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Severity Section with Chips
          Row(
            children: [
              Icon(LucideIcons.info, size: 14, color: tokens.textSecondary),
              const SizedBox(width: 4),
              AppText(
                'Severity',
                variant: TextVariant.caption,
                colorType: TextColorType.secondary,
                fontWeight: FontWeight.w700,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Row(
            children: BugSeverity.values.map((sev) {
              final isSelected = bug.severity == sev;
              return Expanded(
                child: GestureDetector(
                  onTap: () {
                    // update severity
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? tokens.accentSoft : tokens.surface2,
                      borderRadius: AppRadius.borderMd,
                      border: Border.all(
                        color: isSelected ? tokens.accent : tokens.hairline,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: AppText(
                      BugViewModel.severityToString(sev),
                      variant: TextVariant.tiny,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      customColor: isSelected ? tokens.accentText : tokens.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Description Section Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppText(
                  'DESCRIPTION',
                  variant: TextVariant.tiny,
                  fontWeight: FontWeight.w700,
                  colorType: TextColorType.secondary,
                ),
                const SizedBox(height: 6),
                AppText(
                  bug.description != null && bug.description!.isNotEmpty
                      ? bug.description!
                      : 'No written description entered. See automated device diagnostic context and screenshot below.',
                  variant: TextVariant.bodyMedium,
                  colorType: bug.description != null && bug.description!.isNotEmpty
                      ? TextColorType.primary
                      : TextColorType.tertiary,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // AI Solution Prompt Section
          SolutionPromptSection(
            entityId: bug.humanId,
            entityTitle: bug.title,
            entityDescription: bug.description,
            type: 'bug',
          ),
          const SizedBox(height: AppSpacing.xl),

          // Auto-Captured Diagnostic Telemetry Card
          if (bug.telemetry != null) ...[
            BugAutoContextCard(telemetry: bug.telemetry!),
          ] else ...[
            BugAutoContextCard(
              telemetry: DeviceTelemetry(
                deviceModel: 'Vivo iQOO 7 (I2011)',
                osVersion: 'Android 13 (API 33)',
                appVersion: '0.3.18',
                buildNumber: '59',
                timestamp: DateTime.now().toIso8601String(),
                screenResolution: '1080 x 2400 px',
                freeMemoryMb: 3820,
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildMetaCol(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    final tokens = context.tokens;
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: tokens.textTertiary),
            const SizedBox(width: 4),
            AppText(
              label,
              variant: TextVariant.tiny,
              colorType: TextColorType.tertiary,
            ),
          ],
        ),
        const SizedBox(height: 2),
        AppText(
          value,
          variant: TextVariant.bodySmall,
          fontWeight: FontWeight.w700,
          customColor: valueColor ?? tokens.textPrimary,
        ),
      ],
    );
  }
}
