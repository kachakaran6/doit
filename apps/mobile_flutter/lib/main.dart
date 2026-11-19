import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/sensors/shake_detector.dart';
import 'core/widgets/app_sheet.dart';
import 'core/providers/capture_bubble_provider.dart';
import 'features/capture/screens/capture_modal.dart';
import 'features/system/providers/version_policy_provider.dart';
import 'features/system/screens/force_update_screen.dart';
import 'core/services/play_update_service.dart';
import 'features/workspace/providers/workspace_provider.dart';
import 'features/tasks/providers/tasks_provider.dart';
import 'features/bugs/providers/bugs_provider.dart';
import 'features/stickies/providers/stickies_provider.dart';
import 'features/auth/providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system navigation & status bar transparent style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(
    const ProviderScope(
      child: DoItApp(),
    ),
  );
}

class DoItApp extends ConsumerStatefulWidget {
  const DoItApp({super.key});

  @override
  ConsumerState<DoItApp> createState() => _DoItAppState();
}

class _DoItAppState extends ConsumerState<DoItApp> with WidgetsBindingObserver {
  ShakeDetector? _shakeDetector;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _applyShakeConfig(ref.read(shakeConfigProvider));
      PlayUpdateService.checkForUpdatesSafely();
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      PlayUpdateService.checkForUpdatesSafely();
    }
  }

  void _applyShakeConfig(ShakeConfigState config) {
    _shakeDetector?.stopListening();
    if (!config.enabled) return;

    _shakeDetector = ShakeDetector(
      shakeThresholdGravity: config.threshold,
      onShake: () {
        final context = ref.read(routerProvider).routerDelegate.navigatorKey.currentContext;
        if (context != null) {
          HapticFeedback.heavyImpact();
          AppSheet.show(
            context: context,
            useRootNavigator: true,
            builder: (_) => const QuickCaptureSheet(initialMode: 'bug'),
          );
        }
      },
    );
    _shakeDetector?.startListening();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _shakeDetector?.stopListening();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeState = ref.watch(themeProvider);
    final router = ref.watch(routerProvider);
    final versionPolicy = ref.watch(versionPolicyProvider);

    // Keep shake detector updated with preferences
    ref.listen<ShakeConfigState>(shakeConfigProvider, (prev, next) {
      _applyShakeConfig(next);
    });

    // Initial background workspace data hydration on sign-in
    ref.listen(authProvider, (prev, next) {
      if (next.isAuthenticated && !(prev?.isAuthenticated ?? false)) {
        ref.read(workspaceProvider.notifier).fetchWorkspaces().then((_) {
          ref.read(tasksProvider.notifier).fetchTasks();
          ref.read(bugsProvider.notifier).fetchBugs();
          ref.read(stickiesProvider.notifier).fetchStickies();
        });
      }
    });

    if (versionPolicy.checked && versionPolicy.needsUpdate) {
      return MaterialApp(
        title: 'DoIt',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.buildDarkTheme(themeState.accent),
        home: ForceUpdateScreen(
          minVersion: versionPolicy.minAppVersion ?? '1.0.0',
          downloadUrl: versionPolicy.downloadUrl ?? 'https://doit.samyukt.pro',
        ),
      );
    }

    return MaterialApp.router(
      title: 'DoIt',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.buildLightTheme(themeState.accent),
      darkTheme: AppTheme.buildDarkTheme(themeState.accent),
      themeMode: themeState.themeMode,
      routerConfig: router,
    );
  }
}
