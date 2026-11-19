import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/sync/outbox_manager.dart';

class PendingSyncScreen extends StatefulWidget {
  const PendingSyncScreen({super.key});

  @override
  State<PendingSyncScreen> createState() => _PendingSyncScreenState();
}

class _PendingSyncScreenState extends State<PendingSyncScreen> {
  @override
  void initState() {
    super.initState();
    outboxManager.addListener(_onOutboxChange);
  }

  @override
  void dispose() {
    outboxManager.removeListener(_onOutboxChange);
    super.dispose();
  }

  void _onOutboxChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final queue = outboxManager.queue;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Offline Outbox',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            onPressed: () => outboxManager.flush(),
          ),
        ],
      ),
      body: queue.isEmpty
          ? EmptyState(
              icon: LucideIcons.cloud,
              title: 'All mutations synced',
              message: 'Your offline queue is completely reconciled with the cloud server.',
            )
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppText(
                      '${outboxManager.pendingCount} Pending Mutations',
                      variant: TextVariant.titleSmall,
                      fontWeight: FontWeight.w700,
                    ),
                    AppButton(
                      label: 'Sync Now',
                      size: ButtonSize.sm,
                      onPressed: () => outboxManager.flush(),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                ...queue.map((entry) {
                  Color stateColor;
                  switch (entry.state) {
                    case OutboxState.sending:
                    case OutboxState.uploading:
                      stateColor = tokens.accent;
                      break;
                    case OutboxState.failed:
                      stateColor = tokens.danger;
                      break;
                    case OutboxState.reconciled:
                      stateColor = tokens.success;
                      break;
                    case OutboxState.pending:
                      stateColor = tokens.warning;
                      break;
                  }

                  return AppCard(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: tokens.surface3,
                                borderRadius: AppRadius.borderSm,
                              ),
                              child: AppText(
                                entry.method,
                                variant: TextVariant.tiny,
                                fontWeight: FontWeight.w700,
                                colorType: TextColorType.secondary,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: stateColor.withAlpha(25),
                                borderRadius: AppRadius.borderSm,
                                border: Border.all(color: stateColor.withAlpha(80)),
                              ),
                              child: AppText(
                                entry.state.name.toUpperCase(),
                                variant: TextVariant.tiny,
                                fontWeight: FontWeight.w700,
                                customColor: stateColor,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        AppText(
                          entry.path,
                          variant: TextVariant.bodySmall,
                          fontWeight: FontWeight.w600,
                        ),
                        if (entry.lastError != null) ...[
                          const SizedBox(height: 4),
                          AppText(
                            entry.lastError!,
                            variant: TextVariant.tiny,
                            customColor: tokens.danger,
                          ),
                        ],
                      ],
                    ),
                  );
                }),
              ],
            ),
    );
  }
}
