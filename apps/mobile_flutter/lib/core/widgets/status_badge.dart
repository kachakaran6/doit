import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import 'app_text.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    Color bg;
    Color fg;
    String display = status;

    switch (status.toUpperCase()) {
      case 'DONE':
      case 'RESOLVED':
      case 'VERIFIED':
        bg = tokens.successSoft;
        fg = tokens.success;
        display = status == 'DONE' ? 'Done' : 'Resolved';
        break;
      case 'IN_PROGRESS':
        bg = tokens.accentSoft;
        fg = tokens.accentText;
        display = 'In Progress';
        break;
      case 'BLOCKED':
      case 'CRITICAL':
        bg = tokens.dangerSoft;
        fg = tokens.danger;
        display = status == 'BLOCKED' ? 'Blocked' : 'Critical';
        break;
      case 'TODO':
      case 'TRIAGED':
      default:
        bg = tokens.surface2;
        fg = tokens.textSecondary;
        display = status == 'TODO' ? 'To Do' : status;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppRadius.borderSm,
      ),
      child: AppText(
        display,
        variant: TextVariant.tiny,
        fontWeight: FontWeight.w600,
        customColor: fg,
      ),
    );
  }
}
