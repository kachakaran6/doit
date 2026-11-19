import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import 'app_text.dart';

class NavTabItem {
  final String label;
  final IconData icon;

  const NavTabItem({required this.label, required this.icon});
}

class FloatingNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onQuickCapturePressed;
  final ValueChanged<String>? onQuickModeSelected;

  const FloatingNavBar({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    required this.onQuickCapturePressed,
    this.onQuickModeSelected,
  });

  static const List<NavTabItem> tabs = [
    NavTabItem(label: 'Home', icon: LucideIcons.home),
    NavTabItem(label: 'Tasks', icon: LucideIcons.checkSquare),
    NavTabItem(label: 'Bugs', icon: LucideIcons.bug),
    NavTabItem(label: 'Search', icon: LucideIcons.search),
  ];

  void _showQuickActionsMenu(BuildContext context) {
    HapticFeedback.mediumImpact();
    final tokens = context.tokens;

    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        margin: const EdgeInsets.all(AppSpacing.lg),
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: tokens.surface1,
          borderRadius: AppRadius.borderXxl,
          border: Border.all(color: tokens.hairline, width: 1.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(50),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppText(
              'Quick Create',
              variant: TextVariant.titleSmall,
              fontWeight: FontWeight.w700,
            ),
            const SizedBox(height: AppSpacing.md),
            _buildActionItem(
              ctx,
              icon: LucideIcons.checkSquare,
              title: 'Create Task',
              subtitle: 'Add to project backlog or sprint',
              mode: 'task',
            ),
            _buildActionItem(
              ctx,
              icon: LucideIcons.bug,
              title: 'Report Bug',
              subtitle: 'Capture defect with device context',
              mode: 'bug',
            ),
            _buildActionItem(
              ctx,
              icon: LucideIcons.fileText,
              title: 'New Sticky',
              subtitle: 'Quick scratchpad memo',
              mode: 'sticky',
            ),
            _buildActionItem(
              ctx,
              icon: LucideIcons.mic,
              title: 'Voice Note',
              subtitle: 'Dictate thought for auto-transcription',
              mode: 'voice',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required String mode,
  }) {
    final tokens = context.tokens;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.pop(context);
          HapticFeedback.lightImpact();
          onQuickModeSelected?.call(mode);
        },
        borderRadius: AppRadius.borderLg,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            vertical: AppSpacing.sm,
            horizontal: AppSpacing.sm,
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: tokens.accentSoft,
                  borderRadius: AppRadius.borderMd,
                ),
                child: Icon(icon, size: 20, color: tokens.accentText),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppText(
                      title,
                      variant: TextVariant.bodyMedium,
                      fontWeight: FontWeight.w600,
                    ),
                    AppText(
                      subtitle,
                      variant: TextVariant.caption,
                      colorType: TextColorType.secondary,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        bottom: bottomPadding > 0 ? bottomPadding + 6 : AppSpacing.md,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Main Nav Capsule
          Expanded(
            child: Container(
              height: 58,
              decoration: BoxDecoration(
                color: tokens.surface1.withAlpha(235),
                borderRadius: AppRadius.borderFull,
                border: Border.all(color: tokens.hairline, width: 1.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(tokens.isDark ? 80 : 30),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(tabs.length, (index) {
                  final tab = tabs[index];
                  final isSelected = currentIndex == index;

                  return Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () {
                        HapticFeedback.selectionClick();
                        onTabSelected(index);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeInOut,
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        decoration: BoxDecoration(
                          color: isSelected ? tokens.surface3 : Colors.transparent,
                          borderRadius: AppRadius.borderFull,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              tab.icon,
                              size: 19,
                              color: isSelected ? tokens.accentText : tokens.textTertiary,
                            ),
                            if (isSelected) ...[
                              const SizedBox(height: 2),
                              AppText(
                                tab.label,
                                variant: TextVariant.tiny,
                                fontWeight: FontWeight.w700,
                                customColor: tokens.accentText,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          // Separate Detached Floating '+' FAB
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onQuickCapturePressed();
            },
            onLongPress: () => _showQuickActionsMenu(context),
            child: Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: tokens.accent,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: tokens.accent.withAlpha(100),
                    blurRadius: 14,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: const Icon(
                LucideIcons.plus,
                color: Colors.white,
                size: 26,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
