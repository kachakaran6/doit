import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../providers/capture_bubble_provider.dart';
import 'app_sheet.dart';
import '../../features/capture/screens/capture_modal.dart';

class DraggableOverlayBubble extends ConsumerStatefulWidget {
  const DraggableOverlayBubble({super.key});

  @override
  ConsumerState<DraggableOverlayBubble> createState() => _DraggableOverlayBubbleState();
}

class _DraggableOverlayBubbleState extends ConsumerState<DraggableOverlayBubble> {
  Offset? _position;
  bool _isDragging = false;

  @override
  Widget build(BuildContext context) {
    final enabled = ref.watch(overlayBubbleProvider);
    if (!enabled) return const SizedBox.shrink();

    final size = MediaQuery.of(context).size;
    final tokens = context.tokens;
    final bubbleSize = 52.0;

    // Default position: right-aligned, middle of screen
    _position ??= Offset(
      size.width - bubbleSize - 16,
      size.height * 0.45,
    );

    return Positioned(
      left: _position!.dx,
      top: _position!.dy,
      child: GestureDetector(
        onPanStart: (_) => setState(() => _isDragging = true),
        onPanUpdate: (details) {
          setState(() {
            final nextX = (_position!.dx + details.delta.dx).clamp(
              8.0,
              size.width - bubbleSize - 8.0,
            );
            final nextY = (_position!.dy + details.delta.dy).clamp(
              MediaQuery.of(context).padding.top + 8.0,
              size.height - bubbleSize - 100.0,
            );
            _position = Offset(nextX, nextY);
          });
        },
        onPanEnd: (_) {
          setState(() => _isDragging = false);
          // Gently snap to nearest horizontal edge
          final snapX = (_position!.dx + bubbleSize / 2) < size.width / 2
              ? 16.0
              : size.width - bubbleSize - 16.0;
          setState(() {
            _position = Offset(snapX, _position!.dy);
          });
        },
        onTap: () {
          HapticFeedback.mediumImpact();
          AppSheet.show(
            context: context,
            useRootNavigator: true,
            builder: (_) => const QuickCaptureSheet(initialMode: 'bug'),
          );
        },
        onLongPress: () {
          HapticFeedback.heavyImpact();
          AppSheet.show(
            context: context,
            useRootNavigator: true,
            builder: (_) => const QuickCaptureSheet(initialMode: 'task'),
          );
        },
        child: AnimatedScale(
          scale: _isDragging ? 1.15 : 1.0,
          duration: const Duration(milliseconds: 150),
          child: Container(
            width: bubbleSize,
            height: bubbleSize,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  tokens.accent,
                  tokens.accent.withAlpha(210),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withAlpha(tokens.isDark ? 50 : 180),
                width: 2.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: tokens.accent.withAlpha(120),
                  blurRadius: _isDragging ? 20 : 12,
                  spreadRadius: _isDragging ? 3 : 1,
                  offset: const Offset(0, 4),
                ),
                BoxShadow(
                  color: Colors.black.withAlpha(60),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                LucideIcons.sparkles,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
