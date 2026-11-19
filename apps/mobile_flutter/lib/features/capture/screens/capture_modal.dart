import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_sheet.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';
import '../../../core/widgets/app_chip.dart';
import '../../tasks/models/task.dart';
import '../../tasks/providers/tasks_provider.dart';
import '../../bugs/models/bug.dart';
import '../../bugs/providers/bugs_provider.dart';
import '../../stickies/providers/stickies_provider.dart';

class QuickCaptureSheet extends ConsumerStatefulWidget {
  final String initialMode; // 'task', 'bug', 'sticky', 'voice'

  const QuickCaptureSheet({super.key, this.initialMode = 'task'});

  @override
  ConsumerState<QuickCaptureSheet> createState() => _QuickCaptureSheetState();
}

class _QuickCaptureSheetState extends ConsumerState<QuickCaptureSheet>
    with SingleTickerProviderStateMixin {
  late String _currentMode;
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  TaskPriority _taskPriority = TaskPriority.medium;
  BugSeverity _bugSeverity = BugSeverity.major;
  bool _isSaving = false;
  bool _isSuccess = false;
  bool _isRecording = false;

  late AnimationController _animController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _currentMode = widget.initialMode;
    if (_currentMode == 'voice') {
      _isRecording = true;
    }
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.elasticOut,
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<DeviceTelemetry> _collectDeviceTelemetry() async {
    try {
      final devInfo = DeviceInfoPlugin();
      final pkgInfo = await PackageInfo.fromPlatform();

      String model = 'Device';
      String os = 'OS';

      if (Platform.isAndroid) {
        final android = await devInfo.androidInfo;
        model = '${android.manufacturer} ${android.model}';
        os = 'Android ${android.version.release}';
      } else if (Platform.isIOS) {
        final ios = await devInfo.iosInfo;
        model = ios.utsname.machine;
        os = 'iOS ${ios.systemVersion}';
      } else if (Platform.isWindows) {
        model = 'Windows PC';
        os = 'Windows 11';
      }

      return DeviceTelemetry(
        deviceModel: model,
        osVersion: os,
        appVersion: pkgInfo.version.isNotEmpty ? pkgInfo.version : '1.0.0',
        buildNumber: pkgInfo.buildNumber.isNotEmpty ? pkgInfo.buildNumber : '1',
        timestamp: DateTime.now().toIso8601String(),
      );
    } catch (_) {
      return DeviceTelemetry(
        deviceModel: 'Generic Mobile',
        osVersion: '14.0',
        appVersion: '1.0.0',
        buildNumber: '1',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  void _submit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    setState(() => _isSaving = true);

    if (_currentMode == 'task') {
      await ref.read(tasksProvider.notifier).createTask(
            title: title,
            description: _descController.text.trim().isNotEmpty ? _descController.text.trim() : null,
            priority: _taskPriority,
          );
    } else if (_currentMode == 'bug') {
      final telemetry = await _collectDeviceTelemetry();
      await ref.read(bugsProvider.notifier).createBug(
            title: title,
            description: _descController.text.trim().isNotEmpty ? _descController.text.trim() : null,
            severity: _bugSeverity,
            telemetry: telemetry,
          );
    } else if (_currentMode == 'sticky') {
      await ref.read(stickiesProvider.notifier).createSticky(body: title);
    }

    HapticFeedback.mediumImpact();
    setState(() {
      _isSaving = false;
      _isSuccess = true;
    });
    _animController.forward();

    // 600ms success spring overlay then auto-dismiss
    await Future.delayed(const Duration(milliseconds: 650));
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    if (_isSuccess) {
      return Container(
        height: 260,
        alignment: Alignment.center,
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: tokens.success,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: tokens.success.withAlpha(100),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(LucideIcons.check, size: 40, color: Colors.white),
              ),
              const SizedBox(height: AppSpacing.md),
              AppText(
                'Captured Successfully',
                variant: TextVariant.titleSmall,
                fontWeight: FontWeight.w700,
              ),
            ],
          ),
        ),
      );
    }

    return AppSheet(
      title: _currentMode == 'bug'
          ? 'Report Bug'
          : _currentMode == 'sticky'
              ? 'Quick Sticky'
              : 'Quick Capture',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Mode Selectors
            Row(
              children: [
                AppChip(
                  label: 'Task',
                  icon: const Icon(LucideIcons.checkSquare, size: 14),
                  isSelected: _currentMode == 'task',
                  onTap: () => setState(() => _currentMode = 'task'),
                ),
                const SizedBox(width: AppSpacing.sm),
                AppChip(
                  label: 'Bug',
                  icon: const Icon(LucideIcons.bug, size: 14),
                  isSelected: _currentMode == 'bug',
                  onTap: () => setState(() => _currentMode = 'bug'),
                ),
                const SizedBox(width: AppSpacing.sm),
                AppChip(
                  label: 'Sticky',
                  icon: const Icon(LucideIcons.fileText, size: 14),
                  isSelected: _currentMode == 'sticky',
                  onTap: () => setState(() => _currentMode = 'sticky'),
                ),
                const SizedBox(width: AppSpacing.sm),
                AppChip(
                  label: 'Voice',
                  icon: const Icon(LucideIcons.mic, size: 14),
                  isSelected: _currentMode == 'voice',
                  onTap: () => setState(() {
                    _currentMode = 'voice';
                    _isRecording = true;
                  }),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            if (_currentMode == 'voice') ...[
              // Voice Recording Visualizer
              Container(
                height: 120,
                decoration: BoxDecoration(
                  color: tokens.surface2,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(color: tokens.accent.withAlpha(60)),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: _isRecording ? tokens.danger : tokens.accent,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _isRecording ? LucideIcons.mic : LucideIcons.micOff,
                          color: Colors.white,
                          size: 26,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      AppText(
                        _isRecording ? 'Listening... Speak your idea' : 'Voice Memo Ready',
                        variant: TextVariant.bodySmall,
                        colorType: TextColorType.secondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            AppInput(
              controller: _titleController,
              hintText: _currentMode == 'bug'
                  ? 'What broke or failed?'
                  : _currentMode == 'sticky'
                      ? 'Note content...'
                      : 'What needs to be done?',
              autofocus: _currentMode != 'voice',
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: AppSpacing.md),

            if (_currentMode != 'sticky') ...[
              AppInput(
                controller: _descController,
                hintText: 'Add description (optional)...',
                maxLines: 2,
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            if (_currentMode == 'task') ...[
              AppText(
                'Priority',
                variant: TextVariant.caption,
                colorType: TextColorType.secondary,
                fontWeight: FontWeight.w600,
              ),
              const SizedBox(height: AppSpacing.xs),
              Wrap(
                spacing: AppSpacing.sm,
                children: TaskPriority.values.map((p) {
                  return AppChip(
                    label: TaskViewModel.priorityToString(p),
                    isSelected: _taskPriority == p,
                    onTap: () => setState(() => _taskPriority = p),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],

            if (_currentMode == 'bug') ...[
              AppText(
                'Severity',
                variant: TextVariant.caption,
                colorType: TextColorType.secondary,
                fontWeight: FontWeight.w600,
              ),
              const SizedBox(height: AppSpacing.xs),
              Wrap(
                spacing: AppSpacing.sm,
                children: BugSeverity.values.map((s) {
                  return AppChip(
                    label: BugViewModel.severityToString(s),
                    isSelected: _bugSeverity == s,
                    onTap: () => setState(() => _bugSeverity = s),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],

            AppButton(
              label: 'Save & Capture',
              isLoading: _isSaving,
              isFullWidth: true,
              size: ButtonSize.lg,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
