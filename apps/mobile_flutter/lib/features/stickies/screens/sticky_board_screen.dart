import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/app_input.dart';
import '../providers/stickies_provider.dart';
import '../widgets/sticky_card.dart';

class StickyBoardScreen extends ConsumerWidget {
  const StickyBoardScreen({super.key});

  void _showCreateStickySheet(BuildContext context, WidgetRef ref) {
    final textController = TextEditingController();
    String selectedColor = '#FEF08A'; // Yellow default

    final colors = [
      '#FEF08A', // Yellow
      '#BBF7D0', // Green
      '#BAE6FD', // Sky Blue
      '#FBCFE8', // Pink
      '#E9D5FF', // Purple
      '#FED7AA', // Orange
    ];

    AppSheet.show(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppText(
                'New Sticky Memo',
                variant: TextVariant.titleSmall,
                fontWeight: FontWeight.w700,
              ),
              const SizedBox(height: AppSpacing.md),
              AppInput(
                controller: textController,
                hintText: 'Jot down an idea, reminder, or note...',
                maxLines: 4,
                autofocus: true,
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: colors.map((c) {
                  final isSelected = selectedColor == c;
                  final clean = c.replaceAll('#', '');
                  final colorObj = Color(int.parse('FF$clean', radix: 16));
                  return GestureDetector(
                    onTap: () => setSheetState(() => selectedColor = c),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: colorObj,
                        shape: BoxShape.circle,
                        border: isSelected
                            ? Border.all(color: Colors.white, width: 3)
                            : null,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.xl),
              AppButton(
                label: 'Pin Sticky',
                onPressed: () {
                  final text = textController.text.trim();
                  if (text.isNotEmpty) {
                    ref.read(stickiesProvider.notifier).createSticky(
                          body: text,
                          color: selectedColor,
                        );
                    Navigator.pop(ctx);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;
    final stickiesState = ref.watch(stickiesProvider);
    final stickies = stickiesState.stickies;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Sticky Board',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, size: 22),
            onPressed: () => _showCreateStickySheet(context, ref),
          ),
        ],
      ),
      body: stickiesState.isLoading && stickies.isEmpty
          ? Center(child: CircularProgressIndicator(color: tokens.accent))
          : RefreshIndicator(
              onRefresh: () => ref.read(stickiesProvider.notifier).fetchStickies(),
              color: tokens.accent,
              child: stickies.isEmpty
                  ? EmptyState(
                      icon: LucideIcons.fileText,
                      title: 'No sticky notes yet',
                      message: 'Pin ideas, reminders, and notes to your team board.',
                      actionLabel: 'Add Sticky',
                      onAction: () => _showCreateStickySheet(context, ref),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: AppSpacing.md,
                        mainAxisSpacing: AppSpacing.md,
                        childAspectRatio: 0.95,
                      ),
                      itemCount: stickies.length,
                      itemBuilder: (context, index) {
                        final sticky = stickies[index];
                        return StickyCard(
                          sticky: sticky,
                          onTogglePin: () {
                            ref.read(stickiesProvider.notifier).togglePin(sticky.id);
                          },
                          onDelete: () {
                            ref.read(stickiesProvider.notifier).deleteSticky(sticky.id);
                          },
                        );
                      },
                    ),
            ),
    );
  }
}
