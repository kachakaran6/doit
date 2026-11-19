import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/network/http_client.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController(text: 'alice@samyukt.com');
  final _passwordController = TextEditingController(text: 'password123');
  bool _obscurePassword = true;
  bool _isCreateAccountMode = false;
  String? _pingResult;
  bool _isPinging = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) return;

    ref.read(authProvider.notifier).login(email, password);
  }

  void _fillDemo(String email, String role) {
    HapticFeedback.lightImpact();
    setState(() {
      _emailController.text = email;
      _passwordController.text = 'password123';
    });
    _submit();
  }

  void _testConnection() async {
    setState(() {
      _isPinging = true;
      _pingResult = null;
    });
    HapticFeedback.selectionClick();

    try {
      final res = await apiClient.get<Map<String, dynamic>>('/ping');
      setState(() {
        _isPinging = false;
        _pingResult = 'Online (${res['version'] ?? 'v1'})';
      });
    } catch (_) {
      setState(() {
        _isPinging = false;
        _pingResult = 'Reachable';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: tokens.canvas,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl, vertical: AppSpacing.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Brand Logo & Icon (Speech bubble with checkmark)
                Center(
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: tokens.accent,
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(
                          color: tokens.accent.withAlpha(90),
                          blurRadius: 18,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(
                      LucideIcons.checkCheck,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                AppText(
                  'DoIt',
                  variant: TextVariant.display,
                  fontWeight: FontWeight.w800,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xs),
                AppText(
                  'Precision project management & issue tracking',
                  variant: TextVariant.bodyMedium,
                  colorType: TextColorType.secondary,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xl),

                // Form Container Card
                AppCard(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Sign In / Create Account Segmented Switcher
                      Container(
                        decoration: BoxDecoration(
                          color: tokens.surface3,
                          borderRadius: AppRadius.borderMd,
                        ),
                        padding: const EdgeInsets.all(3),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _isCreateAccountMode = false),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  decoration: BoxDecoration(
                                    color: !_isCreateAccountMode ? tokens.surface1 : Colors.transparent,
                                    borderRadius: AppRadius.borderSm,
                                  ),
                                  alignment: Alignment.center,
                                  child: AppText(
                                    'Sign In',
                                    variant: TextVariant.bodySmall,
                                    fontWeight: !_isCreateAccountMode ? FontWeight.w700 : FontWeight.w500,
                                    customColor: !_isCreateAccountMode ? tokens.textPrimary : tokens.textSecondary,
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _isCreateAccountMode = true),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  decoration: BoxDecoration(
                                    color: _isCreateAccountMode ? tokens.surface1 : Colors.transparent,
                                    borderRadius: AppRadius.borderSm,
                                  ),
                                  alignment: Alignment.center,
                                  child: AppText(
                                    'Create Account',
                                    variant: TextVariant.bodySmall,
                                    fontWeight: _isCreateAccountMode ? FontWeight.w700 : FontWeight.w500,
                                    customColor: _isCreateAccountMode ? tokens.textPrimary : tokens.textSecondary,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      if (authState.errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: tokens.dangerSoft,
                            borderRadius: AppRadius.borderMd,
                            border: Border.all(color: tokens.danger.withAlpha(80)),
                          ),
                          child: Row(
                            children: [
                              Icon(LucideIcons.alertCircle, size: 18, color: tokens.danger),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: AppText(
                                  authState.errorMessage!,
                                  variant: TextVariant.bodySmall,
                                  customColor: tokens.danger,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                      ],

                      // Email Field
                      AppInput(
                        controller: _emailController,
                        label: 'Email Address',
                        hintText: 'alice@samyukt.com',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: AppSpacing.md),

                      // Password Field
                      AppInput(
                        controller: _passwordController,
                        label: 'Password',
                        hintText: '••••••••••••',
                        obscureText: _obscurePassword,
                        suffixIcon: GestureDetector(
                          onTap: () => setState(() => _obscurePassword = !_obscurePassword),
                          child: Icon(
                            _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                            size: 18,
                            color: tokens.textMuted,
                          ),
                        ),
                        onSubmitted: (_) => _submit(),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Submit Button
                      AppButton(
                        label: _isCreateAccountMode ? 'Create & Join Workspace' : 'Sign In to Workspace',
                        isLoading: authState.isLoading,
                        isFullWidth: true,
                        size: ButtonSize.lg,
                        onPressed: _submit,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

                // DEMO ACCOUNTS Section
                Center(
                  child: AppText(
                    'DEMO ACCOUNTS',
                    variant: TextVariant.tiny,
                    fontWeight: FontWeight.w700,
                    colorType: TextColorType.tertiary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Alice (Owner)',
                        size: ButtonSize.sm,
                        variant: ButtonVariant.secondary,
                        onPressed: () => _fillDemo('alice@samyukt.com', 'Owner'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: AppButton(
                        label: 'Bob (Tester)',
                        size: ButtonSize.sm,
                        variant: ButtonVariant.secondary,
                        onPressed: () => _fillDemo('bob@samyukt.com', 'Tester'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                // BACKEND SERVER Section Card
                AppCard(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(LucideIcons.hardDrive, size: 14, color: tokens.textTertiary),
                              const SizedBox(width: AppSpacing.xs),
                              AppText(
                                'BACKEND SERVER',
                                variant: TextVariant.tiny,
                                fontWeight: FontWeight.w700,
                                colorType: TextColorType.tertiary,
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: _testConnection,
                            child: Row(
                              children: [
                                if (_isPinging)
                                  SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 1.5,
                                      valueColor: AlwaysStoppedAnimation<Color>(tokens.accentText),
                                    ),
                                  )
                                else
                                  Icon(LucideIcons.refreshCw, size: 12, color: tokens.accentText),
                                const SizedBox(width: 4),
                                AppText(
                                  _pingResult ?? 'Test Connection',
                                  variant: TextVariant.tiny,
                                  fontWeight: FontWeight.w600,
                                  customColor: tokens.accentText,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      AppText(
                        apiClient.getBaseUrl(),
                        variant: TextVariant.tiny,
                        colorType: TextColorType.secondary,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              label: 'Production Live',
                              size: ButtonSize.sm,
                              variant: ButtonVariant.ghost,
                              onPressed: () {
                                apiClient.setBaseUrl('https://doit.samyukt.pro/api/v1');
                                setState(() {});
                              },
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: AppButton(
                              label: 'USB (localhost)',
                              size: ButtonSize.sm,
                              variant: ButtonVariant.ghost,
                              onPressed: () {
                                apiClient.setBaseUrl('http://10.0.2.2:3000/api/v1');
                                setState(() {});
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
