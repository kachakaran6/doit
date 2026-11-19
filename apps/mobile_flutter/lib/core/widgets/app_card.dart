import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

enum CardLevel { surface1, surface2, surface3 }

class AppCard extends StatelessWidget {
  final Widget child;
  final CardLevel level;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final BorderRadius? borderRadius;
  final bool showBorder;
  final Color? customBorderColor;

  const AppCard({
    super.key,
    required this.child,
    this.level = CardLevel.surface1,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.margin,
    this.onTap,
    this.onLongPress,
    this.borderRadius,
    this.showBorder = true,
    this.customBorderColor,
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    Color bg;
    switch (level) {
      case CardLevel.surface1:
        bg = tokens.surface1;
        break;
      case CardLevel.surface2:
        bg = tokens.surface2;
        break;
      case CardLevel.surface3:
        bg = tokens.surface3;
        break;
    }

    final radius = borderRadius ?? AppRadius.borderLg;

    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: radius,
        border: showBorder
            ? Border.all(
                color: customBorderColor ?? tokens.hairline,
                width: 1.0,
              )
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          onLongPress: onLongPress,
          borderRadius: radius,
          child: Padding(
            padding: padding ?? EdgeInsets.zero,
            child: child,
          ),
        ),
      ),
    );
  }
}
