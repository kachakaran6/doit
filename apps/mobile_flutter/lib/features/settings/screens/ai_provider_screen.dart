import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';
import '../../../core/storage/local_storage.dart';

class AiProviderScreen extends StatefulWidget {
  const AiProviderScreen({super.key});

  @override
  State<AiProviderScreen> createState() => _AiProviderScreenState();
}

class _AiProviderScreenState extends State<AiProviderScreen> {
  final _storage = LocalStorageService();
  String _selectedProvider = 'openai';
  final _apiKeyController = TextEditingController();
  final _modelController = TextEditingController(text: 'gpt-4o-mini');
  bool _isSaved = false;

  final providers = [
    {'id': 'openai', 'name': 'OpenAI', 'icon': LucideIcons.sparkles},
    {'id': 'anthropic', 'name': 'Anthropic Claude', 'icon': LucideIcons.brain},
    {'id': 'gemini', 'name': 'Google Gemini', 'icon': LucideIcons.zap},
    {'id': 'groq', 'name': 'Groq Cloud', 'icon': LucideIcons.flame},
    {'id': 'ollama', 'name': 'Local Ollama', 'icon': LucideIcons.server},
  ];

  @override
  void initState() {
    super.initState();
    _loadCurrent();
  }

  void _loadCurrent() async {
    final p = await _storage.getAiProvider();
    setState(() => _selectedProvider = p);
  }

  void _save() async {
    await _storage.setAiProvider(_selectedProvider);
    setState(() => _isSaved = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'AI Provider Config',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          AppText(
            'Select AI Engine',
            variant: TextVariant.caption,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.sm),
          ...providers.map((p) {
            final isSelected = _selectedProvider == p['id'];
            return Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              decoration: BoxDecoration(
                color: isSelected ? tokens.accentSoft : tokens.surface2,
                borderRadius: AppRadius.borderLg,
                border: Border.all(
                  color: isSelected ? tokens.accent : tokens.hairline,
                  width: 1.0,
                ),
              ),
              child: ListTile(
                leading: Icon(
                  p['icon'] as IconData,
                  color: isSelected ? tokens.accentText : tokens.textSecondary,
                  size: 20,
                ),
                title: AppText(
                  p['name'] as String,
                  variant: TextVariant.bodyMedium,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                ),
                trailing: isSelected
                    ? Icon(LucideIcons.check, color: tokens.accent, size: 20)
                    : null,
                onTap: () {
                  setState(() => _selectedProvider = p['id'] as String);
                },
              ),
            );
          }),
          const SizedBox(height: AppSpacing.xl),
          AppText(
            'Credentials & Model',
            variant: TextVariant.caption,
            colorType: TextColorType.secondary,
            fontWeight: FontWeight.w700,
          ),
          const SizedBox(height: AppSpacing.sm),
          AppCard(
            child: Column(
              children: [
                AppInput(
                  controller: _apiKeyController,
                  label: 'API Key',
                  hintText: 'sk-...',
                  obscureText: true,
                ),
                const SizedBox(height: AppSpacing.md),
                AppInput(
                  controller: _modelController,
                  label: 'Model ID',
                  hintText: 'e.g. gpt-4o, claude-3-5-sonnet, gemini-1.5-pro',
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          AppButton(
            label: _isSaved ? 'Saved!' : 'Save AI Settings',
            isFullWidth: true,
            onPressed: _save,
          ),
        ],
      ),
    );
  }
}
