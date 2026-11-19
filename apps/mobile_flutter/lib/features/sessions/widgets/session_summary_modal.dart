import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../models/test_session.dart';

class SessionSummaryModal extends StatelessWidget {
  final TestSession session;

  const SessionSummaryModal({super.key, required this.session});

  String _formatDuration(int totalSeconds) {
    final mins = totalSeconds ~/ 60;
    final secs = totalSeconds % 60;
    if (mins == 0) return '${secs}s';
    return '${mins}m ${secs}s';
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Dialog(
      backgroundColor: tokens.surface1,
      shape: RoundedRectangleBorder(borderRadius: AppRadius.borderXxl),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: tokens.accentSoft,
                  shape: BoxShape.circle,
                ),
                child: Icon(LucideIcons.award, size: 28, color: tokens.accentText),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            AppText(
              'Session Completed!',
              variant: TextVariant.titleMedium,
              fontWeight: FontWeight.w700,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xs),
            AppText(
              'Great work logging feedback and tracking bugs.',
              variant: TextVariant.bodySmall,
              colorType: TextColorType.secondary,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: tokens.surface2,
                borderRadius: AppRadius.borderLg,
                border: Border.all(color: tokens.hairline),
              ),
              child: Column(
                children: [
                  _buildStat(context, 'Total Duration', _formatDuration(session.elapsedSeconds)),
                  Divider(color: tokens.hairline, height: 16),
                  _buildStat(context, 'Defects Logged', '${session.bugIds.length} bugs'),
                  Divider(color: tokens.hairline, height: 16),
                  _buildStat(context, 'App Tested', session.appUnderTest),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppButton(
              label: 'Done',
              isFullWidth: true,
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(BuildContext context, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        AppText(
          label,
          variant: TextVariant.bodySmall,
          colorType: TextColorType.secondary,
        ),
        AppText(
          value,
          variant: TextVariant.bodyMedium,
          fontWeight: FontWeight.w700,
        ),
      ],
    );
  }
}
