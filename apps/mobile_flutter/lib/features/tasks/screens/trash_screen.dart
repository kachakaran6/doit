import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/empty_state.dart';

class TrashScreen extends ConsumerWidget {
  const TrashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = context.tokens;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Trash',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: const EmptyState(
        icon: LucideIcons.trash2,
        title: 'Trash is empty',
        message: 'Deleted tasks and bugs will appear here before being permanently removed.',
      ),
    );
  }
}
