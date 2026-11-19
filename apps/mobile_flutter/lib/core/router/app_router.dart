import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/tasks/screens/tasks_screen.dart';
import '../../features/tasks/screens/task_detail_screen.dart';
import '../../features/tasks/screens/trash_screen.dart';
import '../../features/bugs/screens/bugs_screen.dart';
import '../../features/bugs/screens/bug_detail_screen.dart';
import '../../features/stickies/screens/sticky_board_screen.dart';
import '../../features/search/screens/search_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/outbox/screens/pending_sync_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import '../../features/settings/screens/ai_provider_screen.dart';
import '../../features/settings/screens/quick_capture_prefs_screen.dart';
import '../../features/workspace/screens/team_members_screen.dart';
import '../../features/system/screens/foundation_gallery_screen.dart';
import '../../features/system/screens/our_apps_screen.dart';
import '../../features/projects/screens/project_context_screen.dart';
import '../../features/capture/screens/capture_modal.dart';
import '../widgets/floating_nav_bar.dart';
import '../widgets/draggable_overlay_bubble.dart';
import '../widgets/app_sheet.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: authState.isAuthenticated ? '/home' : '/auth',
    redirect: (context, state) {
      if (!authState.isInitialized) return null;

      final isLoggingIn = state.matchedLocation == '/auth';
      if (!authState.isAuthenticated) {
        return isLoggingIn ? null : '/auth';
      }
      if (isLoggingIn) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/auth',
        builder: (context, state) => const LoginScreen(),
      ),
      // Stateful Nested Bottom Navigation Shell
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state, navigationShell) {
          final keyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;
          return Scaffold(
            resizeToAvoidBottomInset: false,
            body: Stack(
              children: [
                navigationShell,
                ValueListenableBuilder<int>(
                  valueListenable: activeModalCount,
                  builder: (context, count, _) {
                    if (count > 0 || keyboardOpen) {
                      return const SizedBox.shrink();
                    }
                    return Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: FloatingNavBar(
                        currentIndex: navigationShell.currentIndex,
                        onTabSelected: (index) {
                          navigationShell.goBranch(
                            index,
                            initialLocation: index == navigationShell.currentIndex,
                          );
                        },
                        onQuickCapturePressed: () {
                          AppSheet.show(
                            context: context,
                            builder: (_) => const QuickCaptureSheet(initialMode: 'task'),
                          );
                        },
                        onQuickModeSelected: (mode) {
                          AppSheet.show(
                            context: context,
                            builder: (_) => QuickCaptureSheet(initialMode: mode),
                          );
                        },
                      ),
                    );
                  },
                ),
                ValueListenableBuilder<int>(
                  valueListenable: activeModalCount,
                  builder: (context, count, _) {
                    if (count > 0 || keyboardOpen) {
                      return const SizedBox.shrink();
                    }
                    return const DraggableOverlayBubble();
                  },
                ),
              ],
            ),
          );
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/tasks',
                builder: (context, state) => const TasksScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/bugs',
                builder: (context, state) => const BugsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/search',
                builder: (context, state) => const SearchScreen(),
              ),
            ],
          ),
        ],
      ),

      // Detail & Modal Screens
      GoRoute(
        path: '/task/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return TaskDetailScreen(taskId: id);
        },
      ),
      GoRoute(
        path: '/bug/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return BugDetailScreen(bugId: id);
        },
      ),
      GoRoute(
        path: '/stickies',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const StickyBoardScreen(),
      ),
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/pending-sync',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PendingSyncScreen(),
      ),
      GoRoute(
        path: '/trash',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const TrashScreen(),
      ),
      GoRoute(
        path: '/team-members',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const TeamMembersScreen(),
      ),
      GoRoute(
        path: '/settings',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/ai-provider',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const AiProviderScreen(),
      ),
      GoRoute(
        path: '/quick-capture-prefs',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const QuickCapturePrefsScreen(),
      ),
      GoRoute(
        path: '/foundation-gallery',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const FoundationGalleryScreen(),
      ),
      GoRoute(
        path: '/our-apps',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const OurAppsScreen(),
      ),
      GoRoute(
        path: '/project-context',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const ProjectContextScreen(),
      ),
    ],
  );
});
