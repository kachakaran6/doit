import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/status_badge.dart';
import '../models/bug.dart';

class BugRow extends StatelessWidget {
  final BugViewModel bug;
  final VoidCallback onTap;

  const BugRow({super.key, required this.bug, required this.onTap});

  @override
  Widget build(BuildContext context) {
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

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: sevColor.withAlpha(30),
              borderRadius: AppRadius.borderSm,
              border: Border.all(color: sevColor.withAlpha(70)),
            ),
            child: AppText(
              BugViewModel.severityToString(bug.severity),
              variant: TextVariant.tiny,
              fontWeight: FontWeight.w700,
              customColor: sevColor,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppText(
                      bug.humanId,
                      variant: TextVariant.tiny,
                      colorType: TextColorType.tertiary,
                      fontWeight: FontWeight.w700,
                    ),
                    StatusBadge(status: BugViewModel.statusToString(bug.status)),
                  ],
                ),
                const SizedBox(height: 4),
                AppText(
                  bug.title,
                  variant: TextVariant.bodyMedium,
                  fontWeight: FontWeight.w600,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (bug.telemetry != null) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      Icon(LucideIcons.smartphone, size: 12, color: tokens.textTertiary),
                      const SizedBox(width: 4),
                      AppText(
                        '${bug.telemetry!.deviceModel} • OS ${bug.telemetry!.osVersion}',
                        variant: TextVariant.tiny,
                        colorType: TextColorType.tertiary,
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
