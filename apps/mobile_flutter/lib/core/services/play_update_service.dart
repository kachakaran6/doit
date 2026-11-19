import 'dart:io';
import 'package:flutter/material.dart';
import 'package:in_app_update/in_app_update.dart';

class PlayUpdateService {
  static bool _hasPromptedThisSession = false;
  static bool _isChecking = false;

  /// Check for updates safely on launch, resume, or user action.
  static Future<void> checkForUpdatesSafely({
    BuildContext? context,
    bool forceUserCheck = false,
  }) async {
    if (!Platform.isAndroid) return;
    if (_isChecking) return;
    if (!forceUserCheck && _hasPromptedThisSession) return;

    _isChecking = true;
    try {
      final info = await InAppUpdate.checkForUpdate();

      // Check if update is already downloaded and ready to complete
      if (info.installStatus == InstallStatus.downloaded) {
        if (context != null && context.mounted) {
          _showInstallDialog(context);
        } else {
          await InAppUpdate.completeFlexibleUpdate();
        }
        return;
      }

      if (info.updateAvailability == UpdateAvailability.updateAvailable) {
        _hasPromptedThisSession = true;

        // Immediate update preferred for high priority / required releases
        if (info.immediateUpdateAllowed && (info.updatePriority >= 4 || forceUserCheck)) {
          await InAppUpdate.performImmediateUpdate();
        } else if (info.flexibleUpdateAllowed) {
          await InAppUpdate.startFlexibleUpdate();
          if (context != null && context.mounted) {
            _showInstallDialog(context);
          } else {
            await InAppUpdate.completeFlexibleUpdate();
          }
        } else if (info.immediateUpdateAllowed) {
          await InAppUpdate.performImmediateUpdate();
        }
      } else if (forceUserCheck && context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('You are on the latest release of DoIt. No updates pending on Google Play.'),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (forceUserCheck && context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google Play update check: $e'),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      _isChecking = false;
    }
  }

  static void _showInstallDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Update Ready to Install'),
        content: const Text(
          'The latest DoIt release has finished downloading from Google Play. Restart the app now to apply the newest features and improvements.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Later'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              try {
                await InAppUpdate.completeFlexibleUpdate();
              } catch (_) {}
            },
            child: const Text('Restart & Install'),
          ),
        ],
      ),
    );
  }
}
