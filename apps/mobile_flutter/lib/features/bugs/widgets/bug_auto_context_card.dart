import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../models/bug.dart';

class BugAutoContextCard extends StatelessWidget {
  final DeviceTelemetry telemetry;

  const BugAutoContextCard({super.key, required this.telemetry});

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: tokens.accentSoft,
                  borderRadius: AppRadius.borderSm,
                ),
                child: Icon(LucideIcons.cpu, size: 16, color: tokens.accentText),
              ),
              const SizedBox(width: AppSpacing.sm),
              AppText(
                'Auto-Captured Context',
                variant: TextVariant.titleSmall,
                fontWeight: FontWeight.w700,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          _buildItem(context, 'Device', telemetry.deviceModel),
          _buildItem(context, 'OS Version', telemetry.osVersion),
          _buildItem(context, 'App Version', '${telemetry.appVersion} (${telemetry.buildNumber})'),
          if (telemetry.screenResolution != null)
            _buildItem(context, 'Resolution', telemetry.screenResolution!),
          if (telemetry.freeMemoryMb != null)
            _buildItem(context, 'Free Memory', '${telemetry.freeMemoryMb} MB'),
          _buildItem(context, 'Captured At', telemetry.timestamp),
        ],
      ),
    );
  }

  Widget _buildItem(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          AppText(
            label,
            variant: TextVariant.caption,
            colorType: TextColorType.secondary,
          ),
          AppText(
            value,
            variant: TextVariant.bodySmall,
            fontWeight: FontWeight.w600,
          ),
        ],
      ),
    );
  }
}
