import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/network/http_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../providers/workspace_provider.dart';
import '../models/workspace.dart';

class TeamMembersScreen extends ConsumerStatefulWidget {
  const TeamMembersScreen({super.key});

  @override
  ConsumerState<TeamMembersScreen> createState() => _TeamMembersScreenState();
}

class _TeamMembersScreenState extends ConsumerState<TeamMembersScreen> {
  List<TeamMember> _members = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMembers();
  }

  Future<void> _fetchMembers() async {
    final wsId = ref.read(workspaceProvider).activeWorkspace?.id;
    if (wsId == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final res = await apiClient.get<dynamic>(ApiEndpoints.workspaceMembers(wsId));
      List<dynamic> list = [];
      if (res is List) {
        list = res;
      } else if (res is Map && res['members'] is List) {
        list = res['members'];
      }
      setState(() {
        _members = list.map((m) => TeamMember.fromJson(m as Map<String, dynamic>)).toList();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;
    final activeWs = ref.watch(workspaceProvider).activeWorkspace;

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: AppText(
          'Team Members',
          variant: TextVariant.titleMedium,
          fontWeight: FontWeight.w700,
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: tokens.accent))
          : RefreshIndicator(
              onRefresh: _fetchMembers,
              color: tokens.accent,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                children: [
                  AppCard(
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: tokens.accentSoft,
                            borderRadius: AppRadius.borderMd,
                          ),
                          child: Icon(LucideIcons.users, color: tokens.accentText),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AppText(
                                activeWs?.name ?? 'Workspace',
                                variant: TextVariant.bodyLarge,
                                fontWeight: FontWeight.w700,
                              ),
                              AppText(
                                '${_members.length} members collaborating',
                                variant: TextVariant.caption,
                                colorType: TextColorType.secondary,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  AppText(
                    'Members',
                    variant: TextVariant.bodySmall,
                    colorType: TextColorType.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  ..._members.map((member) {
                    return AppCard(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        children: [
                          AppAvatar(
                            name: member.fullName,
                            avatarUrl: member.avatarUrl,
                            size: 40,
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                AppText(
                                  member.fullName,
                                  variant: TextVariant.bodyMedium,
                                  fontWeight: FontWeight.w600,
                                ),
                                AppText(
                                  member.email,
                                  variant: TextVariant.caption,
                                  colorType: TextColorType.secondary,
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.sm,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: tokens.surface3,
                              borderRadius: AppRadius.borderSm,
                            ),
                            child: AppText(
                              member.role.toUpperCase(),
                              variant: TextVariant.tiny,
                              fontWeight: FontWeight.w700,
                              colorType: TextColorType.secondary,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
