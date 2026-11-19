import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_input.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/empty_state.dart';
import '../../tasks/providers/tasks_provider.dart';
import '../../tasks/widgets/task_row.dart';
import '../../bugs/providers/bugs_provider.dart';
import '../../bugs/widgets/bug_row.dart';
import '../../stickies/providers/stickies_provider.dart';
import '../../stickies/widgets/sticky_card.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String _query = '';
  String _activeCategory = 'all'; // all, tasks, bugs, stickies

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final tasksState = ref.watch(tasksProvider);
    final bugsState = ref.watch(bugsProvider);
    final stickiesState = ref.watch(stickiesProvider);

    final q = _query.toLowerCase().trim();

    final matchedTasks = tasksState.tasks.where((t) {
      if (q.isEmpty) return false;
      return t.title.toLowerCase().contains(q) ||
          (t.description?.toLowerCase().contains(q) ?? false) ||
          t.humanId.toLowerCase().contains(q);
    }).toList();

    final matchedBugs = bugsState.bugs.where((b) {
      if (q.isEmpty) return false;
      return b.title.toLowerCase().contains(q) ||
          (b.description?.toLowerCase().contains(q) ?? false) ||
          b.humanId.toLowerCase().contains(q);
    }).toList();

    final matchedStickies = stickiesState.stickies.where((s) {
      if (q.isEmpty) return false;
      return s.body.toLowerCase().contains(q);
    }).toList();

    final totalMatches = (_activeCategory == 'all'
        ? (matchedTasks.length + matchedBugs.length + matchedStickies.length)
        : _activeCategory == 'tasks'
            ? matchedTasks.length
            : _activeCategory == 'bugs'
                ? matchedBugs.length
                : matchedStickies.length);

    return Scaffold(
      backgroundColor: tokens.canvas,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Search Input Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
              child: AppSearchInput(
                controller: _searchController,
                onChanged: (val) => setState(() => _query = val),
                onClear: () => setState(() => _query = ''),
              ),
            ),

            // Category Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
              child: Row(
                children: [
                  AppChip(
                    label: 'All',
                    isSelected: _activeCategory == 'all',
                    onTap: () => setState(() => _activeCategory = 'all'),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppChip(
                    label: 'Tasks',
                    count: '${matchedTasks.length}',
                    isSelected: _activeCategory == 'tasks',
                    onTap: () => setState(() => _activeCategory = 'tasks'),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppChip(
                    label: 'Bugs',
                    count: '${matchedBugs.length}',
                    isSelected: _activeCategory == 'bugs',
                    onTap: () => setState(() => _activeCategory = 'bugs'),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppChip(
                    label: 'Stickies',
                    count: '${matchedStickies.length}',
                    isSelected: _activeCategory == 'stickies',
                    onTap: () => setState(() => _activeCategory = 'stickies'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),

            // Search Results
            Expanded(
              child: q.isEmpty
                  ? const EmptyState(
                      icon: LucideIcons.search,
                      title: 'Search Workspace',
                      message: 'Search across tasks, bug reports, and stickies by title, ID, or description.',
                    )
                  : totalMatches == 0
                      ? EmptyState(
                          icon: LucideIcons.searchX,
                          title: 'No matches found',
                          message: 'No results for "$_query". Try another keyword.',
                        )
                      : ListView(
                          padding: const EdgeInsets.only(
                            left: AppSpacing.lg,
                            right: AppSpacing.lg,
                            bottom: 120,
                          ),
                          children: [
                            if ((_activeCategory == 'all' || _activeCategory == 'tasks') && matchedTasks.isNotEmpty) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                                child: AppText(
                                  'Tasks (${matchedTasks.length})',
                                  variant: TextVariant.titleSmall,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              ...matchedTasks.map((t) => TaskRow(
                                    task: t,
                                    onTap: () => context.push('/task/${t.id}'),
                                    onToggleStatus: () {
                                      ref.read(tasksProvider.notifier).toggleTaskStatus(t.id);
                                    },
                                  )),
                              const SizedBox(height: AppSpacing.md),
                            ],
                            if ((_activeCategory == 'all' || _activeCategory == 'bugs') && matchedBugs.isNotEmpty) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                                child: AppText(
                                  'Bugs (${matchedBugs.length})',
                                  variant: TextVariant.titleSmall,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              ...matchedBugs.map((b) => BugRow(
                                    bug: b,
                                    onTap: () => context.push('/bug/${b.id}'),
                                  )),
                              const SizedBox(height: AppSpacing.md),
                            ],
                            if ((_activeCategory == 'all' || _activeCategory == 'stickies') && matchedStickies.isNotEmpty) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                                child: AppText(
                                  'Stickies (${matchedStickies.length})',
                                  variant: TextVariant.titleSmall,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              ...matchedStickies.map((s) => StickyCard(
                                    sticky: s,
                                    onTogglePin: () {
                                      ref.read(stickiesProvider.notifier).togglePin(s.id);
                                    },
                                    onDelete: () {
                                      ref.read(stickiesProvider.notifier).deleteSticky(s.id);
                                    },
                                  )),
                            ],
                          ],
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
