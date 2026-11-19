import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';

class LabelOption {
  final String id;
  final String name;
  final Color color;

  const LabelOption({required this.id, required this.name, required this.color});
}

class LabelManagerSheet extends StatefulWidget {
  final List<LabelOption> initialLabels;
  final ValueChanged<List<LabelOption>>? onLabelsChanged;

  const LabelManagerSheet({
    super.key,
    this.initialLabels = const [
      LabelOption(id: 'l-1', name: 'Frontend', color: Color(0xFF6366F1)),
      LabelOption(id: 'l-2', name: 'Backend', color: Color(0xFF14B8A6)),
      LabelOption(id: 'l-3', name: 'Bug', color: Color(0xFFF43F5E)),
      LabelOption(id: 'l-4', name: 'Design', color: Color(0xFF8B5CF6)),
      LabelOption(id: 'l-5', name: 'Performance', color: Color(0xFFF59E0B)),
    ],
    this.onLabelsChanged,
  });

  @override
  State<LabelManagerSheet> createState() => _LabelManagerSheetState();
}

class _LabelManagerSheetState extends State<LabelManagerSheet> {
  late List<LabelOption> _labels;
  final TextEditingController _nameController = TextEditingController();
  Color _selectedColor = const Color(0xFF6366F1);
  bool _isCreating = false;

  final List<Color> _colorPalette = const [
    Color(0xFF6366F1), // Indigo
    Color(0xFF14B8A6), // Teal
    Color(0xFFF59E0B), // Amber
    Color(0xFFF43F5E), // Rose
    Color(0xFF8B5CF6), // Violet
    Color(0xFF10B981), // Emerald
  ];

  @override
  void initState() {
    super.initState();
    _labels = List.from(widget.initialLabels);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _addLabel() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    final newLabel = LabelOption(
      id: 'l-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      color: _selectedColor,
    );

    setState(() {
      _labels.add(newLabel);
      _nameController.clear();
      _isCreating = false;
    });

    widget.onLabelsChanged?.call(_labels);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    return Container(
      decoration: BoxDecoration(
        color: tokens.surface1,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
      ),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: tokens.surface3,
                borderRadius: AppRadius.borderFull,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.tag, size: 20, color: tokens.accent),
                  const SizedBox(width: AppSpacing.sm),
                  AppText(
                    'Workspace Labels',
                    variant: TextVariant.titleSmall,
                    fontWeight: FontWeight.w700,
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(LucideIcons.x, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Label List
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _labels.map((lbl) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: lbl.color.withAlpha(35),
                  borderRadius: AppRadius.borderFull,
                  border: Border.all(color: lbl.color.withAlpha(80)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: lbl.color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    AppText(
                      lbl.name,
                      variant: TextVariant.bodySmall,
                      fontWeight: FontWeight.w600,
                      color: lbl.color,
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Create new label toggle / form
          if (!_isCreating)
            AppButton(
              label: 'Create New Label',
              variant: ButtonVariant.secondary,
              icon: const Icon(LucideIcons.plus, size: 16),
              onPressed: () => setState(() => _isCreating = true),
            )
          else ...[
            AppInput(
              controller: _nameController,
              hint: 'Label name (e.g., Release, Blocker)',
              autoFocus: true,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                AppText('Color: ', variant: TextVariant.caption, colorType: TextColorType.secondary),
                const SizedBox(width: AppSpacing.sm),
                ..._colorPalette.map((c) {
                  final isSelected = _selectedColor == c;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedColor = c),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: c,
                        shape: BoxShape.circle,
                        border: isSelected
                            ? Border.all(color: Colors.white, width: 2)
                            : null,
                      ),
                    ),
                  );
                }),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Cancel',
                    variant: ButtonVariant.ghost,
                    onPressed: () => setState(() => _isCreating = false),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: AppButton(
                    label: 'Save Label',
                    variant: ButtonVariant.primary,
                    onPressed: _addLabel,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }
}
