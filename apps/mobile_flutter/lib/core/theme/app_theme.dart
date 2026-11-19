import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_colors.dart';
import 'app_radius.dart';

class ThemeState {
  final ThemeMode themeMode;
  final AppAccentName accent;

  const ThemeState({
    required this.themeMode,
    required this.accent,
  });

  ThemeState copyWith({
    ThemeMode? themeMode,
    AppAccentName? accent,
  }) {
    return ThemeState(
      themeMode: themeMode ?? this.themeMode,
      accent: accent ?? this.accent,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ThemeState &&
          runtimeType == other.runtimeType &&
          themeMode == other.themeMode &&
          accent == other.accent;

  @override
  int get hashCode => themeMode.hashCode ^ accent.hashCode;
}

class ThemeNotifier extends Notifier<ThemeState> {
  static const _themeModeKey = 'doit_theme_mode';
  static const _accentKey = 'doit_accent_name';

  @override
  ThemeState build() {
    _loadFromPrefs();
    return const ThemeState(
      themeMode: ThemeMode.dark, // Default to Dark mode per design system
      accent: AppAccentName.blue,
    );
  }

  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final modeStr = prefs.getString(_themeModeKey);
      final accStr = prefs.getString(_accentKey);

      ThemeMode mode = ThemeMode.dark;
      if (modeStr == 'light') mode = ThemeMode.light;
      if (modeStr == 'system') mode = ThemeMode.system;

      AppAccentName acc = AppAccentName.blue;
      for (final a in AppAccentName.values) {
        if (a.name == accStr) {
          acc = a;
          break;
        }
      }

      state = ThemeState(themeMode: mode, accent: acc);
    } catch (_) {}
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = state.copyWith(themeMode: mode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeModeKey, mode.name);
  }

  Future<void> setAccent(AppAccentName accent) async {
    state = state.copyWith(accent: accent);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accentKey, accent.name);
  }
}

final themeProvider = NotifierProvider<ThemeNotifier, ThemeState>(ThemeNotifier.new);

class AppTheme {
  static ThemeData buildDarkTheme(AppAccentName accent) {
    final tokens = AppThemeTokens.dark(accentName: accent);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: tokens.canvas,
      canvasColor: tokens.canvas,
      cardColor: tokens.surface1,
      dividerColor: tokens.hairline,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      extensions: [tokens],
      colorScheme: ColorScheme.dark(
        surface: tokens.surface1,
        primary: tokens.accent,
        onPrimary: Colors.white,
        onSurface: tokens.textPrimary,
        error: tokens.danger,
        onError: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: tokens.canvas,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        iconTheme: IconThemeData(color: tokens.textPrimary),
        titleTextStyle: TextStyle(
          color: tokens.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: tokens.surface1,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
        ),
      ),
    );
  }

  static ThemeData buildLightTheme(AppAccentName accent) {
    final tokens = AppThemeTokens.light(accentName: accent);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: tokens.canvas,
      canvasColor: tokens.canvas,
      cardColor: tokens.surface1,
      dividerColor: tokens.hairline,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      extensions: [tokens],
      colorScheme: ColorScheme.light(
        surface: tokens.surface1,
        primary: tokens.accent,
        onPrimary: Colors.white,
        onSurface: tokens.textPrimary,
        error: tokens.danger,
        onError: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: tokens.canvas,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        iconTheme: IconThemeData(color: tokens.textPrimary),
        titleTextStyle: TextStyle(
          color: tokens.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: tokens.surface1,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
        ),
      ),
    );
  }
}

extension AppThemeContext on BuildContext {
  AppThemeTokens get tokens => Theme.of(this).extension<AppThemeTokens>()!;
}
