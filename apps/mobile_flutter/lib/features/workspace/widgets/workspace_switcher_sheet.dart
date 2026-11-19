import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../providers/workspace_provider.dart';

class WorkspaceSwitcherSheet extends ConsumerWidget {
  const WorkspaceSwitcherSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;
    final wsState = ref.watch(workspaceProvider);

    return AppSheet(
      title: 'Switch Workspace',
      trailing: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: tokens.surface3,
            shape: BoxShape.circle,
          ),
          child: Icon(LucideIcons.x, size: 16, color: tokens.textSecondary),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Side-by-side action buttons: "+ New Workspace" and "Join with Code"
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'New Workspace',
                    size: ButtonSize.sm,
                    variant: ButtonVariant.secondary,
                    icon: const Icon(LucideIcons.plus, size: 14),
                    onPressed: () {
                      Navigator.pop(context);
                      // new workspace prompt
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: AppButton(
                    label: 'Join with Code',
                    size: ButtonSize.sm,
                    variant: ButtonVariant.secondary,
                    icon: const Icon(LucideIcons.key, size: 14),
                    onPressed: () {
                      Navigator.pop(context);
                      // join with code prompt
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Workspaces list
            ...wsState.workspaces.map((ws) {
              final isSelected = wsState.activeWorkspace?.id == ws.id;
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
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: isSelected ? tokens.accent : tokens.surface3,
                      borderRadius: AppRadius.borderMd,
                    ),
                    alignment: Alignment.center,
                    child: AppText(
                      ws.name.isNotEmpty ? ws.name.substring(0, ws.name.length >= 2 ? 2 : 1).toUpperCase() : 'WS',
                      variant: TextVariant.titleSmall,
                      fontWeight: FontWeight.w700,
                      customColor: isSelected ? Colors.white : tokens.textPrimary,
                    ),
                  ),
                  title: AppText(
                    ws.name,
                    variant: TextVariant.bodyMedium,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                  subtitle: AppText(
                    '${ws.projects.length} projects • ${ws.role.toUpperCase()}',
                    variant: TextVariant.caption,
                    colorType: TextColorType.secondary,
                  ),
                  trailing: isSelected
                      ? Icon(LucideIcons.check, color: tokens.accent, size: 20)
                      : null,
                  onTap: () {
                    ref.read(workspaceProvider.notifier).setActiveWorkspace(ws);
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
