import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';
import '../../workspace/providers/workspace_provider.dart';

class ProjectContextScreen extends ConsumerStatefulWidget {
  const ProjectContextScreen({super.key});

  @override
  ConsumerState<ProjectContextScreen> createState() => _ProjectContextScreenState();
}

class _ProjectContextScreenState extends ConsumerState<ProjectContextScreen> {
  final TextEditingController _textController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();

  bool _isPreview = false;
  String _savedMarkdown = '';
  int _version = 1;
  String _searchQuery = '';

  static const String _starterStructure = '''# Project Architecture & System Prompt Context

## 1. Domain & Purpose
High-performance task, bug tracking, and collaborative sticky board workspace.

## 2. Technical Stack
- Framework: Flutter 3.44 / Dart 3.12
- State: flutter_riverpod with async notifiers
- Routing: go_router with StatefulShellRoute
- Network: Dio with mutex JWT refresh interceptor
- Sync: OutboxManager with UUID v4 idempotency keys

## 3. Conventions & Constraints
- 8% Luminance color ramp (Canvas #0B0B0E -> Surface1 #141418 -> Surface2 #1C1C22)
- Zero blocking network calls on main UI thread
- Offline-first with optimistic local updates
''';

  @override
  void initState() {
    super.initState();
    _savedMarkdown = _starterStructure;
    _textController.text = _starterStructure;
  }

  @override
  void dispose() {
    _textController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  bool get _isDirty => _textController.text != _savedMarkdown;

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final wsState = ref.watch(workspaceProvider);
    final activeProjectName = wsState.activeProject?.name ?? 'General Project';

    final text = _textController.text;
    final query = _searchQuery.trim().toLowerCase();
    final matchCount = query.isNotEmpty
        ? text.toLowerCase().split(query).length - 1
        : 0;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Project Context',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
        actions: [
          IconButton(
            icon: Icon(_isPreview ? LucideIcons.fileEdit : LucideIcons.eye, size: 20),
            tooltip: _isPreview ? 'Edit Mode' : 'Preview Mode',
            onPressed: () => setState(() => _isPreview = !_isPreview),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Info Header Card
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.fileCode, size: 18, color: tokens.accent),
                    const SizedBox(width: AppSpacing.sm),
                    AppText(
                      activeProjectName,
                      variant: TextVariant.bodyLarge,
                      fontWeight: FontWeight.w700,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                AppText(
                  'Structured Markdown describing codebase architecture, conventions, and constraints. Used by the AI prompt builder to ground fixes.',
                  variant: TextVariant.caption,
                  colorType: TextColorType.secondary,
                ),
                const SizedBox(height: AppSpacing.sm),
                Divider(color: tokens.hairline, height: 1),
                const SizedBox(height: AppSpacing.sm),
                AppText(
                  'v$_version · ${text.length} chars · Updated Today by You',
                  variant: TextVariant.tiny,
                  colorType: TextColorType.tertiary,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Search in context
          AppInput(
            controller: _searchController,
            hint: 'Search in context...',
            prefixIcon: const Icon(LucideIcons.search, size: 16),
            onChanged: (val) => setState(() => _searchQuery = val),
          ),
          if (query.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xs),
            AppText(
              '$matchCount match(es) found',
              variant: TextVariant.tiny,
              color: tokens.accent,
            ),
          ],
          const SizedBox(height: AppSpacing.md),

          // Action Toolbar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: () {
                  setState(() {
                    _textController.text = _starterStructure;
                  });
                },
                icon: const Icon(LucideIcons.sparkles, size: 14),
                label: const Text('Insert Suggested Template'),
              ),
              AppButton(
                label: _isPreview ? 'Edit' : 'Preview',
                variant: ButtonVariant.secondary,
                onPressed: () => setState(() => _isPreview = !_isPreview),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // Editor / Preview Container
          Container(
            constraints: const BoxConstraints(minHeight: 320),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: tokens.surface2,
              borderRadius: AppRadius.borderLg,
              border: Border.all(color: tokens.hairline),
            ),
            child: _isPreview
                ? SingleChildScrollView(
                    child: AppText(
                      text.isEmpty ? 'Nothing to preview. Tap Edit Mode to add context.' : text,
                      variant: TextVariant.bodyMedium,
                    ),
                  )
                : TextField(
                    controller: _textController,
                    maxLines: null,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: tokens.textPrimary,
                      height: 1.5,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Purpose, stack, conventions, file paths, and architecture constraints...',
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Save / Discard Bar
          AppButton(
            label: _isDirty ? 'Save Context Changes' : 'Saved',
            variant: ButtonVariant.primary,
            isFullWidth: true,
            icon: Icon(_isDirty ? LucideIcons.save : LucideIcons.check, size: 16),
            onPressed: _isDirty
                ? () {
                    setState(() {
                      _savedMarkdown = _textController.text;
                      _version++;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Project context saved for AI prompt generation.'),
                        backgroundColor: Color(0xFF0E8550),
                      ),
                    );
                  }
                : null,
          ),
          if (_isDirty) ...[
            const SizedBox(height: AppSpacing.sm),
            AppButton(
              label: 'Discard Unsaved Changes',
              variant: ButtonVariant.secondary,
              isFullWidth: true,
              onPressed: () {
                setState(() {
                  _textController.text = _savedMarkdown;
                });
              },
            ),
          ],
        ],
      ),
    );
  }
}
