import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import '../router/app_router.dart';
import 'app_text.dart';

final ValueNotifier<int> activeModalCount = ValueNotifier<int>(0);

class AppSheet extends StatelessWidget {
  final String? title;
  final Widget? trailing;
  final Widget child;

  const AppSheet({
    super.key,
    this.title,
    this.trailing,
    required this.child,
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool isDismissible = true,
    bool enableDrag = true,
    bool useRootNavigator = true,
  }) async {
    activeModalCount.value++;
    try {
      final targetContext = rootNavigatorKey.currentContext ?? context;
      return await showModalBottomSheet<T>(
        context: targetContext,
        useRootNavigator: true,
        isScrollControlled: true,
        isDismissible: isDismissible,
        enableDrag: enableDrag,
        backgroundColor: Colors.transparent,
        builder: builder,
      );
    } finally {
      activeModalCount.value = (activeModalCount.value - 1).clamp(0, 999);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Container(
      decoration: BoxDecoration(
        color: tokens.surface1,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
        border: Border.all(color: tokens.hairline, width: 1.0),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.lg,
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Grab Handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.sm),
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: tokens.textMuted.withAlpha(80),
                  borderRadius: AppRadius.borderFull,
                ),
              ),
            ),
            if (title != null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.xl,
                  vertical: AppSpacing.sm,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppText(
                      title!,
                      variant: TextVariant.titleMedium,
                      fontWeight: FontWeight.w700,
                    ),
                    ?trailing,
                  ],
                ),
              ),
              Divider(color: tokens.hairline, height: 1),
            ],
            Flexible(child: child),
          ],
        ),
      ),
    );
  }
}
