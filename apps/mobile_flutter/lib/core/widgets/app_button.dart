import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import 'app_text.dart';

enum ButtonVariant { primary, secondary, outline, ghost, danger }
enum ButtonSize { sm, md, lg }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final Widget? icon;
  final bool isLoading;
  final bool isFullWidth;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    Color bg;
    Color fg;
    Border? border;

    switch (variant) {
      case ButtonVariant.primary:
        bg = tokens.accent;
        fg = Colors.white;
        break;
      case ButtonVariant.secondary:
        bg = tokens.surface2;
        fg = tokens.textPrimary;
        break;
      case ButtonVariant.outline:
        bg = Colors.transparent;
        fg = tokens.textPrimary;
        border = Border.all(color: tokens.hairline, width: 1.2);
        break;
      case ButtonVariant.ghost:
        bg = Colors.transparent;
        fg = tokens.textSecondary;
        break;
      case ButtonVariant.danger:
        bg = tokens.danger;
        fg = Colors.white;
        break;
    }

    double height;
    EdgeInsets padding;
    TextVariant textVar;

    switch (size) {
      case ButtonSize.sm:
        height = 36;
        padding = const EdgeInsets.symmetric(horizontal: AppSpacing.md);
        textVar = TextVariant.bodySmall;
        break;
      case ButtonSize.md:
        height = 46;
        padding = const EdgeInsets.symmetric(horizontal: AppSpacing.lg);
        textVar = TextVariant.bodyMedium;
        break;
      case ButtonSize.lg:
        height = 54;
        padding = const EdgeInsets.symmetric(horizontal: AppSpacing.xxl);
        textVar = TextVariant.titleSmall;
        break;
    }

    final content = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading)
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(fg),
            ),
          )
        else ...[
          if (icon != null) ...[
            icon!,
            const SizedBox(width: AppSpacing.sm),
          ],
          AppText(
            label,
            variant: textVar,
            fontWeight: FontWeight.w600,
            customColor: fg,
          ),
        ],
      ],
    );

    return Opacity(
      opacity: (onPressed == null || isLoading) ? 0.5 : 1.0,
      child: Material(
        color: bg,
        borderRadius: AppRadius.borderMd,
        child: InkWell(
          onTap: (onPressed == null || isLoading)
              ? null
              : () {
                  HapticFeedback.lightImpact();
                  onPressed!();
                },
          borderRadius: AppRadius.borderMd,
          child: Container(
            height: height,
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: AppRadius.borderMd,
              border: border,
            ),
            alignment: Alignment.center,
            child: content,
          ),
        ),
      ),
    );
  }
}
