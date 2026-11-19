import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_typography.dart';

enum TextVariant {
  display,
  titleLarge,
  titleMedium,
  titleSmall,
  bodyLarge,
  bodyMedium,
  bodySmall,
  caption,
  tiny,
}

enum TextColorType {
  primary,
  secondary,
  tertiary,
  muted,
  accent,
  danger,
  success,
  warning,
  white,
}

class AppText extends StatelessWidget {
  final String text;
  final TextVariant variant;
  final TextColorType colorType;
  final FontWeight? fontWeight;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  final Color? customColor;
  final bool strikethrough;

  const AppText(
    this.text, {
    super.key,
    this.variant = TextVariant.bodyMedium,
    this.colorType = TextColorType.primary,
    this.fontWeight,
    this.textAlign,
    this.maxLines,
    this.overflow,
    Color? color,
    Color? customColor,
    this.strikethrough = false,
  }) : customColor = color ?? customColor;

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    Color resolvedColor;
    if (customColor != null) {
      resolvedColor = customColor!;
    } else {
      switch (colorType) {
        case TextColorType.primary:
          resolvedColor = tokens.textPrimary;
          break;
        case TextColorType.secondary:
          resolvedColor = tokens.textSecondary;
          break;
        case TextColorType.tertiary:
          resolvedColor = tokens.textTertiary;
          break;
        case TextColorType.muted:
          resolvedColor = tokens.textMuted;
          break;
        case TextColorType.accent:
          resolvedColor = tokens.accentText;
          break;
        case TextColorType.danger:
          resolvedColor = tokens.danger;
          break;
        case TextColorType.success:
          resolvedColor = tokens.success;
          break;
        case TextColorType.warning:
          resolvedColor = tokens.warning;
          break;
        case TextColorType.white:
          resolvedColor = Colors.white;
          break;
      }
    }

    TextStyle baseStyle;
    switch (variant) {
      case TextVariant.display:
        baseStyle = AppTypography.display;
        break;
      case TextVariant.titleLarge:
        baseStyle = AppTypography.titleLarge;
        break;
      case TextVariant.titleMedium:
        baseStyle = AppTypography.titleMedium;
        break;
      case TextVariant.titleSmall:
        baseStyle = AppTypography.titleSmall;
        break;
      case TextVariant.bodyLarge:
        baseStyle = AppTypography.bodyLarge;
        break;
      case TextVariant.bodyMedium:
        baseStyle = AppTypography.bodyMedium;
        break;
      case TextVariant.bodySmall:
        baseStyle = AppTypography.bodySmall;
        break;
      case TextVariant.caption:
        baseStyle = AppTypography.caption;
        break;
      case TextVariant.tiny:
        baseStyle = AppTypography.tiny;
        break;
    }

    return Text(
      text,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
      style: baseStyle.copyWith(
        color: resolvedColor,
        fontWeight: fontWeight ?? baseStyle.fontWeight,
        decoration: strikethrough ? TextDecoration.lineThrough : null,
        decorationColor: resolvedColor,
      ),
    );
  }
}
