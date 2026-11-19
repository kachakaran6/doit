import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/status_badge.dart';
import '../models/task.dart';

class TaskStatusPickerSheet extends StatelessWidget {
  final TaskStatus currentStatus;
  final ValueChanged<TaskStatus> onStatusSelected;

  const TaskStatusPickerSheet({
    super.key,
    required this.currentStatus,
    required this.onStatusSelected,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return AppSheet(
      title: 'Update Status',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: TaskStatus.values.map((status) {
            final isSelected = status == currentStatus;
            final statusStr = TaskViewModel.statusToString(status);

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
                leading: StatusBadge(status: statusStr),
                title: AppText(
                  statusStr,
                  variant: TextVariant.bodyMedium,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                ),
                trailing: isSelected
                    ? Icon(LucideIcons.check, color: tokens.accent, size: 20)
                    : null,
                onTap: () {
                  onStatusSelected(status);
                  Navigator.pop(context);
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
