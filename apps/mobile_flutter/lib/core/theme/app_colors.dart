import 'package:flutter/material.dart';

enum AppAccentName { blue, violet, green, orange, rose }

class AppColors {
  // --- Dark Theme Ramp ---
  static const Color darkCanvas = Color(0xFF0B0B0E);
  static const Color darkSurface1 = Color(0xFF141418);
  static const Color darkSurface2 = Color(0xFF1C1C22);
  static const Color darkSurface3 = Color(0xFF25252C);
  static const Color darkHairline = Color(0x12FFFFFF); // rgba(255, 255, 255, 0.07)

  static const Color darkTextPrimary = Color(0xFFF5F5F7);
  static const Color darkTextSecondary = Color(0xFFA3A3AD);
  static const Color darkTextTertiary = Color(0xFF868691);
  static const Color darkTextMuted = Color(0xFF868691);

  // --- Light Theme Ramp ---
  static const Color lightCanvas = Color(0xFFF4F4F7);
  static const Color lightSurface1 = Color(0xFFFFFFFF);
  static const Color lightSurface2 = Color(0xFFF0F0F4);
  static const Color lightSurface3 = Color(0xFFE8E8EE);
  static const Color lightHairline = Color(0x14000000); // rgba(0, 0, 0, 0.08)

  static const Color lightTextPrimary = Color(0xFF16161A);
  static const Color lightTextSecondary = Color(0xFF5B5B66);
  static const Color lightTextTertiary = Color(0xFF6B6B77);
  static const Color lightTextMuted = Color(0xFF6B6B77);

  // --- Accent Presets ---
  // Blue (Default)
  static const Color blueFillDark = Color(0xFF3A66F2);
  static const Color blueTextDark = Color(0xFF8FAEFF);
  static const Color blueSoftDark = Color(0x293A66F2);
  static const Color blueFillLight = Color(0xFF2F5BEA);
  static const Color blueTextLight = Color(0xFF2750D8);
  static const Color blueSoftLight = Color(0x1F2F5BEA);

  // Violet
  static const Color violetFillDark = Color(0xFF8B5CF6);
  static const Color violetTextDark = Color(0xFFC4B5FD);
  static const Color violetSoftDark = Color(0x298B5CF6);
  static const Color violetFillLight = Color(0xFF7C3AED);
  static const Color violetTextLight = Color(0xFF6D28D9);
  static const Color violetSoftLight = Color(0x1F7C3AED);

  // Green
  static const Color greenFillDark = Color(0xFF10B981);
  static const Color greenTextDark = Color(0xFF6EE7B7);
  static const Color greenSoftDark = Color(0x2910B981);
  static const Color greenFillLight = Color(0xFF059669);
  static const Color greenTextLight = Color(0xFF047857);
  static const Color greenSoftLight = Color(0x1F059669);

  // Orange
  static const Color orangeFillDark = Color(0xFFF97316);
  static const Color orangeTextDark = Color(0xFFFDBA74);
  static const Color orangeSoftDark = Color(0x29F97316);
  static const Color orangeFillLight = Color(0xFFEA580C);
  static const Color orangeTextLight = Color(0xFFC2410C);
  static const Color orangeSoftLight = Color(0x1FEA580C);

  // Rose
  static const Color roseFillDark = Color(0xFFF43F5E);
  static const Color roseTextDark = Color(0xFFFDA4AF);
  static const Color roseSoftDark = Color(0x29F43F5E);
  static const Color roseFillLight = Color(0xFFE11D48);
  static const Color roseTextLight = Color(0xFFBE123C);
  static const Color roseSoftLight = Color(0x1FE11D48);

  // --- Semantic Colors ---
  static const Color success = Color(0xFF10B981);
  static const Color successSoft = Color(0x2410B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningSoft = Color(0x24F59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerSoft = Color(0x24EF4444);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoSoft = Color(0x243B82F6);

  // --- Priority Colors ---
  static const Color priorityUrgent = Color(0xFFEF4444); // Red P0
  static const Color priorityHigh = Color(0xFFF59E0B);   // Amber P1
  static const Color priorityMedium = Color(0xFF3B82F6); // Blue P2
  static const Color priorityLow = Color(0xFF6B7280);    // Gray P3
}

/// ThemeExtension to give every widget instant, type-safe access to tokens:
/// `final tokens = Theme.of(context).extension<AppThemeTokens>()!;`
class AppThemeTokens extends ThemeExtension<AppThemeTokens> {
  final Color canvas;
  final Color surface1;
  final Color surface2;
  final Color surface3;
  final Color hairline;
  final Color textPrimary;
  final Color textSecondary;
  final Color textTertiary;
  final Color textMuted;
  final Color accent;
  final Color accentText;
  final Color accentSoft;
  final Color success;
  final Color successSoft;
  final Color warning;
  final Color warningSoft;
  final Color danger;
  final Color dangerSoft;
  final Color info;
  final Color infoSoft;
  final bool isDark;

  const AppThemeTokens({
    required this.canvas,
    required this.surface1,
    required this.surface2,
    required this.surface3,
    required this.hairline,
    required this.textPrimary,
    required this.textSecondary,
    required this.textTertiary,
    required this.textMuted,
    required this.accent,
    required this.accentText,
    required this.accentSoft,
    required this.success,
    required this.successSoft,
    required this.warning,
    required this.warningSoft,
    required this.danger,
    required this.dangerSoft,
    required this.info,
    required this.infoSoft,
    required this.isDark,
  });

  factory AppThemeTokens.dark({AppAccentName accentName = AppAccentName.blue}) {
    Color acc;
    Color accTxt;
    Color accSoft;
    switch (accentName) {
      case AppAccentName.violet:
        acc = AppColors.violetFillDark;
        accTxt = AppColors.violetTextDark;
        accSoft = AppColors.violetSoftDark;
        break;
      case AppAccentName.green:
        acc = AppColors.greenFillDark;
        accTxt = AppColors.greenTextDark;
        accSoft = AppColors.greenSoftDark;
        break;
      case AppAccentName.orange:
        acc = AppColors.orangeFillDark;
        accTxt = AppColors.orangeTextDark;
        accSoft = AppColors.orangeSoftDark;
        break;
      case AppAccentName.rose:
        acc = AppColors.roseFillDark;
        accTxt = AppColors.roseTextDark;
        accSoft = AppColors.roseSoftDark;
        break;
      case AppAccentName.blue:
        acc = AppColors.blueFillDark;
        accTxt = AppColors.blueTextDark;
        accSoft = AppColors.blueSoftDark;
        break;
    }

    return AppThemeTokens(
      canvas: AppColors.darkCanvas,
      surface1: AppColors.darkSurface1,
      surface2: AppColors.darkSurface2,
      surface3: AppColors.darkSurface3,
      hairline: AppColors.darkHairline,
      textPrimary: AppColors.darkTextPrimary,
      textSecondary: AppColors.darkTextSecondary,
      textTertiary: AppColors.darkTextTertiary,
      textMuted: AppColors.darkTextMuted,
      accent: acc,
      accentText: accTxt,
      accentSoft: accSoft,
      success: AppColors.success,
      successSoft: AppColors.successSoft,
      warning: AppColors.warning,
      warningSoft: AppColors.warningSoft,
      danger: AppColors.danger,
      dangerSoft: AppColors.dangerSoft,
      info: AppColors.info,
      infoSoft: AppColors.infoSoft,
      isDark: true,
    );
  }

  factory AppThemeTokens.light({AppAccentName accentName = AppAccentName.blue}) {
    Color acc;
    Color accTxt;
    Color accSoft;
    switch (accentName) {
      case AppAccentName.violet:
        acc = AppColors.violetFillLight;
        accTxt = AppColors.violetTextLight;
        accSoft = AppColors.violetSoftLight;
        break;
      case AppAccentName.green:
        acc = AppColors.greenFillLight;
        accTxt = AppColors.greenTextLight;
        accSoft = AppColors.greenSoftLight;
        break;
      case AppAccentName.orange:
        acc = AppColors.orangeFillLight;
        accTxt = AppColors.orangeTextLight;
        accSoft = AppColors.orangeSoftLight;
        break;
      case AppAccentName.rose:
        acc = AppColors.roseFillLight;
        accTxt = AppColors.roseTextLight;
        accSoft = AppColors.roseSoftLight;
        break;
      case AppAccentName.blue:
        acc = AppColors.blueFillLight;
        accTxt = AppColors.blueTextLight;
        accSoft = AppColors.blueSoftLight;
        break;
    }

    return AppThemeTokens(
      canvas: AppColors.lightCanvas,
      surface1: AppColors.lightSurface1,
      surface2: AppColors.lightSurface2,
      surface3: AppColors.lightSurface3,
      hairline: AppColors.lightHairline,
      textPrimary: AppColors.lightTextPrimary,
      textSecondary: AppColors.lightTextSecondary,
      textTertiary: AppColors.lightTextTertiary,
      textMuted: AppColors.lightTextMuted,
      accent: acc,
      accentText: accTxt,
      accentSoft: accSoft,
      success: AppColors.success,
      successSoft: AppColors.successSoft,
      warning: AppColors.warning,
      warningSoft: AppColors.warningSoft,
      danger: AppColors.danger,
      dangerSoft: AppColors.dangerSoft,
      info: AppColors.info,
      infoSoft: AppColors.infoSoft,
      isDark: false,
    );
  }

  @override
  AppThemeTokens copyWith({
    Color? canvas,
    Color? surface1,
    Color? surface2,
    Color? surface3,
    Color? hairline,
    Color? textPrimary,
    Color? textSecondary,
    Color? textTertiary,
    Color? textMuted,
    Color? accent,
    Color? accentText,
    Color? accentSoft,
    Color? success,
    Color? successSoft,
    Color? warning,
    Color? warningSoft,
    Color? danger,
    Color? dangerSoft,
    Color? info,
    Color? infoSoft,
    bool? isDark,
  }) {
    return AppThemeTokens(
      canvas: canvas ?? this.canvas,
      surface1: surface1 ?? this.surface1,
      surface2: surface2 ?? this.surface2,
      surface3: surface3 ?? this.surface3,
      hairline: hairline ?? this.hairline,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textTertiary: textTertiary ?? this.textTertiary,
      textMuted: textMuted ?? this.textMuted,
      accent: accent ?? this.accent,
      accentText: accentText ?? this.accentText,
      accentSoft: accentSoft ?? this.accentSoft,
      success: success ?? this.success,
      successSoft: successSoft ?? this.successSoft,
      warning: warning ?? this.warning,
      warningSoft: warningSoft ?? this.warningSoft,
      danger: danger ?? this.danger,
      dangerSoft: dangerSoft ?? this.dangerSoft,
      info: info ?? this.info,
      infoSoft: infoSoft ?? this.infoSoft,
      isDark: isDark ?? this.isDark,
    );
  }

  @override
  AppThemeTokens lerp(ThemeExtension<AppThemeTokens>? other, double t) {
    if (other is! AppThemeTokens) return this;
    return AppThemeTokens(
      canvas: Color.lerp(canvas, other.canvas, t) ?? canvas,
      surface1: Color.lerp(surface1, other.surface1, t) ?? surface1,
      surface2: Color.lerp(surface2, other.surface2, t) ?? surface2,
      surface3: Color.lerp(surface3, other.surface3, t) ?? surface3,
      hairline: Color.lerp(hairline, other.hairline, t) ?? hairline,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t) ?? textPrimary,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t) ?? textSecondary,
      textTertiary: Color.lerp(textTertiary, other.textTertiary, t) ?? textTertiary,
      textMuted: Color.lerp(textMuted, other.textMuted, t) ?? textMuted,
      accent: Color.lerp(accent, other.accent, t) ?? accent,
      accentText: Color.lerp(accentText, other.accentText, t) ?? accentText,
      accentSoft: Color.lerp(accentSoft, other.accentSoft, t) ?? accentSoft,
      success: Color.lerp(success, other.success, t) ?? success,
      successSoft: Color.lerp(successSoft, other.successSoft, t) ?? successSoft,
      warning: Color.lerp(warning, other.warning, t) ?? warning,
      warningSoft: Color.lerp(warningSoft, other.warningSoft, t) ?? warningSoft,
      danger: Color.lerp(danger, other.danger, t) ?? danger,
      dangerSoft: Color.lerp(dangerSoft, other.dangerSoft, t) ?? dangerSoft,
      info: Color.lerp(info, other.info, t) ?? info,
      infoSoft: Color.lerp(infoSoft, other.infoSoft, t) ?? infoSoft,
      isDark: t < 0.5 ? isDark : other.isDark,
    );
  }
}
