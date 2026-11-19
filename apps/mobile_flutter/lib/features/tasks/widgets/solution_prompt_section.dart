import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';

class SolutionPromptSection extends StatefulWidget {
  final String entityId;
  final String entityTitle;
  final String? entityDescription;
  final String type; // 'task' or 'bug'

  const SolutionPromptSection({
    super.key,
    required this.entityId,
    required this.entityTitle,
    this.entityDescription,
    this.type = 'task',
  });

  @override
  State<SolutionPromptSection> createState() => _SolutionPromptSectionState();
}

class _SolutionPromptSectionState extends State<SolutionPromptSection> {
  final _draftController = TextEditingController();
  bool _isGenerating = false;
  bool _isCopied = false;
  bool _hasPrompt = false;

  @override
  void dispose() {
    _draftController.dispose();
    super.dispose();
  }

  void _assembleContext() {
    final prompt = '''# Context for Coding Agent
**Target**: ${widget.type.toUpperCase()} ${widget.entityId}
**Title**: ${widget.entityTitle}
**Details**: ${widget.entityDescription ?? 'No additional description provided.'}

## Instructions:
1. Review the existing codebase architecture and conventions.
2. Formulate a verified patch for this ${widget.type}.
3. Ensure all tests and static analysis pass cleanly.
''';
    setState(() {
      _draftController.text = prompt;
      _hasPrompt = true;
    });
    HapticFeedback.lightImpact();
  }

  Future<void> _generateWithAi() async {
    setState(() => _isGenerating = true);
    await Future.delayed(const Duration(milliseconds: 900));

    final aiPrompt = '''# Automated AI Agent Task Prompt
**${widget.type == 'bug' ? 'Defect Resolution Plan' : 'Implementation Blueprint'}**
- Target ID: ${widget.entityId}
- Subject: ${widget.entityTitle}

### Technical Solution Analysis:
1. Analyze relevant data providers and state lifecycle.
2. Apply strict type-safe null safety checks and verify offline queue idempotency.
3. Verify responsiveness across Dark and Light theme ramps.
''';

    if (mounted) {
      setState(() {
        _draftController.text = aiPrompt;
        _hasPrompt = true;
        _isGenerating = false;
      });
      HapticFeedback.mediumImpact();
    }
  }

  void _copyToClipboard() async {
    if (_draftController.text.trim().isEmpty) return;
    await Clipboard.setData(ClipboardData(text: _draftController.text));
    HapticFeedback.selectionClick();
    setState(() => _isCopied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _isCopied = false);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: tokens.accentSoft,
                  borderRadius: AppRadius.borderSm,
                ),
                child: Icon(LucideIcons.sparkles, size: 18, color: tokens.accentText),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppText(
                      'Solution prompt',
                      variant: TextVariant.titleSmall,
                      fontWeight: FontWeight.w700,
                    ),
                    AppText(
                      'Copy-ready instructions for a coding agent with assembled context.',
                      variant: TextVariant.caption,
                      colorType: TextColorType.secondary,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Action Buttons: Assemble & Generate
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Assemble',
                  size: ButtonSize.sm,
                  variant: ButtonVariant.secondary,
                  icon: const Icon(LucideIcons.sparkles, size: 14),
                  onPressed: _assembleContext,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: AppButton(
                  label: 'Generate with AI',
                  size: ButtonSize.sm,
                  isLoading: _isGenerating,
                  icon: const Icon(LucideIcons.bot, size: 14, color: Colors.white),
                  onPressed: _generateWithAi,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          if (_hasPrompt) ...[
            Container(
              decoration: BoxDecoration(
                color: tokens.surface2,
                borderRadius: AppRadius.borderMd,
                border: Border.all(color: tokens.hairline),
              ),
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: tokens.successSoft,
                          borderRadius: AppRadius.borderSm,
                        ),
                        child: AppText(
                          'READY',
                          variant: TextVariant.tiny,
                          fontWeight: FontWeight.w800,
                          customColor: tokens.success,
                        ),
                      ),
                      GestureDetector(
                        onTap: _copyToClipboard,
                        child: Row(
                          children: [
                            Icon(
                              _isCopied ? LucideIcons.check : LucideIcons.copy,
                              size: 14,
                              color: _isCopied ? tokens.success : tokens.accentText,
                            ),
                            const SizedBox(width: 4),
                            AppText(
                              _isCopied ? 'Copied!' : 'Copy',
                              variant: TextVariant.tiny,
                              fontWeight: FontWeight.w700,
                              customColor: _isCopied ? tokens.success : tokens.accentText,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: _draftController,
                    maxLines: 6,
                    style: TextStyle(
                      color: tokens.textPrimary,
                      fontSize: 13,
                      fontFamily: 'monospace',
                      height: 1.4,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: AppText(
                  'No prompt generated yet. Tap Assemble or Generate.',
                  variant: TextVariant.caption,
                  colorType: TextColorType.tertiary,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
