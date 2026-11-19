import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_text.dart';
import '../providers/workspace_provider.dart';

class ProjectSwitcherSheet extends ConsumerWidget {
  const ProjectSwitcherSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;
    final wsState = ref.watch(workspaceProvider);
    final projects = wsState.activeWorkspace?.projects ?? [];

    return AppSheet(
      title: 'Select Project',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Option for All Projects
            Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              decoration: BoxDecoration(
                color: wsState.activeProject == null ? tokens.accentSoft : tokens.surface2,
                borderRadius: AppRadius.borderLg,
                border: Border.all(
                  color: wsState.activeProject == null ? tokens.accent : tokens.hairline,
                  width: 1.0,
                ),
              ),
              child: ListTile(
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: tokens.surface3,
                    borderRadius: AppRadius.borderMd,
                  ),
                  child: Icon(LucideIcons.layers, size: 18, color: tokens.textSecondary),
                ),
                title: AppText(
                  'All Projects',
                  variant: TextVariant.bodyMedium,
                  fontWeight: wsState.activeProject == null ? FontWeight.w700 : FontWeight.w500,
                ),
                subtitle: AppText(
                  'Show tasks and bugs from across all projects',
                  variant: TextVariant.caption,
                  colorType: TextColorType.secondary,
                ),
                trailing: wsState.activeProject == null
                    ? Icon(LucideIcons.check, color: tokens.accent, size: 20)
                    : null,
                onTap: () {
                  ref.read(workspaceProvider.notifier).setActiveProject(null);
                  Navigator.pop(context);
                },
              ),
            ),
            // Specific projects
            ...projects.map((proj) {
              final isSelected = wsState.activeProject?.id == proj.id;
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                decoration: BoxDecoration(
                  color: isSelected ? tokens.accentSoft : tokens.surface2,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(
                    color: isSelected ? tokens.accent : tokens.hairline,
                    width: 1.0,
                  ),
                ),
                child: ListTile(
                  leading: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: tokens.accentSoft,
                      borderRadius: AppRadius.borderMd,
                    ),
                    alignment: Alignment.center,
                    child: AppText(
                      proj.key,
                      variant: TextVariant.tiny,
                      fontWeight: FontWeight.w700,
                      customColor: tokens.accentText,
                    ),
                  ),
                  title: AppText(
                    proj.name,
                    variant: TextVariant.bodyMedium,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                  subtitle: AppText(
                    'Key: ${proj.key}',
                    variant: TextVariant.caption,
                    colorType: TextColorType.secondary,
                  ),
                  trailing: isSelected
                      ? Icon(LucideIcons.check, color: tokens.accent, size: 20)
                      : null,
                  onTap: () {
                    ref.read(workspaceProvider.notifier).setActiveProject(proj);
                    Navigator.pop(context);
                  },
                ),
              );
            }),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }
}
