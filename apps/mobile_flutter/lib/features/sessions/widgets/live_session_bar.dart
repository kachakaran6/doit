import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../providers/session_provider.dart';
import 'session_summary_modal.dart';

class LiveSessionBar extends ConsumerWidget {
  const LiveSessionBar({super.key});

  String _formatDuration(int totalSeconds) {
    final mins = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    if (!session.isActive) return const SizedBox.shrink();

    final tokens = context.tokens;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: tokens.dangerSoft,
        borderRadius: AppRadius.borderLg,
        border: Border.all(color: tokens.danger.withAlpha(90), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: tokens.danger.withAlpha(40),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: tokens.danger,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          AppText(
            'LIVE SESSION',
            variant: TextVariant.tiny,
            fontWeight: FontWeight.w800,
            customColor: tokens.danger,
          ),
          const SizedBox(width: AppSpacing.md),
          AppText(
            _formatDuration(session.elapsedSeconds),
            variant: TextVariant.bodyMedium,
            fontWeight: FontWeight.w700,
          ),
          const Spacer(),
          if (session.bugIds.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: tokens.danger,
                borderRadius: AppRadius.borderFull,
              ),
              child: AppText(
                '${session.bugIds.length} bugs',
                variant: TextVariant.tiny,
                fontWeight: FontWeight.w700,
                customColor: Colors.white,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          GestureDetector(
            onTap: () {
              final ended = ref.read(sessionProvider.notifier).endSession();
              showDialog(
                context: context,
                builder: (_) => SessionSummaryModal(session: ended),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
              decoration: BoxDecoration(
                color: tokens.surface1,
                borderRadius: AppRadius.borderMd,
                border: Border.all(color: tokens.hairline),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.stopCircle, size: 14, color: tokens.danger),
                  const SizedBox(width: 4),
                  AppText(
                    'End',
                    variant: TextVariant.caption,
                    fontWeight: FontWeight.w700,
                    customColor: tokens.danger,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
