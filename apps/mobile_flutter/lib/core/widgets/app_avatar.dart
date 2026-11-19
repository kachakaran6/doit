import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import 'app_text.dart';

class AppAvatar extends StatelessWidget {
  final String? name;
  final String? avatarUrl;
  final double size;

  const AppAvatar({
    super.key,
    this.name,
    this.avatarUrl,
    this.size = 32,
  });

  String _getInitials(String? str) {
    if (str == null || str.trim().isEmpty) return 'U';
    final parts = str.trim().split(' ');
    if (parts.length >= 2 && parts[0].isNotEmpty && parts[1].isNotEmpty) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return str[0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final initials = _getInitials(name);

    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: Image.network(
          avatarUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _buildFallback(tokens, initials),
        ),
      );
    }

    return _buildFallback(tokens, initials);
  }

  Widget _buildFallback(AppThemeTokens tokens, String initials) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: tokens.accentSoft,
        borderRadius: BorderRadius.circular(size / 2),
        border: Border.all(color: tokens.accent.withAlpha(50), width: 1.0),
      ),
      alignment: Alignment.center,
      child: AppText(
        initials,
        variant: size > 36 ? TextVariant.bodyMedium : TextVariant.tiny,
        fontWeight: FontWeight.w700,
        customColor: tokens.accentText,
      ),
    );
  }
}
