import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class PriorityDot extends StatelessWidget {
  final String priority; // URGENT, HIGH, MEDIUM, LOW
  final double size;

  const PriorityDot({
    super.key,
    required this.priority,
    this.size = 8.0,
  });

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (priority.toUpperCase()) {
      case 'URGENT':
      case 'P0':
        color = AppColors.priorityUrgent;
        break;
      case 'HIGH':
      case 'P1':
        color = AppColors.priorityHigh;
        break;
      case 'MEDIUM':
      case 'P2':
        color = AppColors.priorityMedium;
        break;
      case 'LOW':
      case 'P3':
      default:
        color = AppColors.priorityLow;
        break;
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(70),
            blurRadius: 4,
            spreadRadius: 1,
          ),
        ],
      ),
    );
  }
}
