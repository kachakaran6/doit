import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';
import 'app_text.dart';

class AppInput extends StatelessWidget {
  final TextEditingController? controller;
  final String? hintText;
  final String? label;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final int maxLines;
  final bool autofocus;
  final FocusNode? focusNode;

  const AppInput({
    super.key,
    this.controller,
    String? hintText,
    String? hint,
    this.label,
    this.onChanged,
    this.onSubmitted,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
    bool autofocus = false,
    bool? autoFocus,
    this.focusNode,
  })  : hintText = hint ?? hintText,
        autofocus = autoFocus ?? autofocus;

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          AppText(
            label!,
            variant: TextVariant.bodySmall,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w500,
          ),
          const SizedBox(height: AppSpacing.xs),
        ],
        Container(
          decoration: BoxDecoration(
            color: tokens.surface2,
            borderRadius: AppRadius.borderMd,
            border: Border.all(color: tokens.hairline, width: 1.0),
          ),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Row(
            children: [
              if (prefixIcon != null) ...[
                prefixIcon!,
                const SizedBox(width: AppSpacing.sm),
              ],
              Expanded(
                child: TextField(
                  controller: controller,
                  focusNode: focusNode,
                  autofocus: autofocus,
                  obscureText: obscureText,
                  keyboardType: keyboardType,
                  maxLines: maxLines,
                  onChanged: onChanged,
                  onSubmitted: onSubmitted,
                  style: TextStyle(
                    color: tokens.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                  cursorColor: tokens.accent,
                  decoration: InputDecoration(
                    hintText: hintText,
                    hintStyle: TextStyle(
                      color: tokens.textMuted,
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.md,
                    ),
                  ),
                ),
              ),
              if (suffixIcon != null) ...[
                const SizedBox(width: AppSpacing.sm),
                suffixIcon!,
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class AppSearchInput extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onClear;
  final String hintText;

  const AppSearchInput({
    super.key,
    this.controller,
    this.onChanged,
    this.onClear,
    this.hintText = 'Search tasks, bugs, stickies...',
  });

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: tokens.surface2,
        borderRadius: AppRadius.borderFull,
        border: Border.all(color: tokens.hairline, width: 1.0),
      ),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Row(
        children: [
          Icon(LucideIcons.search, size: 18, color: tokens.textMuted),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              style: TextStyle(
                color: tokens.textPrimary,
                fontSize: 14,
              ),
              cursorColor: tokens.accent,
              decoration: InputDecoration(
                hintText: hintText,
                hintStyle: TextStyle(
                  color: tokens.textMuted,
                  fontSize: 14,
                ),
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
          if (controller != null && controller!.text.isNotEmpty)
            GestureDetector(
              onTap: () {
                controller?.clear();
                onClear?.call();
                onChanged?.call('');
              },
              child: Icon(LucideIcons.x, size: 16, color: tokens.textMuted),
            ),
        ],
      ),
    );
  }
}
