import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/widgets/app_text.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/app_input.dart';

class SamyuktAppItem {
  final String id;
  final String appName;
  final String category;
  final String tagline;
  final String status; // 'production', 'coming_soon'
  final List<String> techStack;
  final String? playStoreUrl;
  final IconData icon;

  const SamyuktAppItem({
    required this.id,
    required this.appName,
    required this.category,
    required this.tagline,
    required this.status,
    required this.techStack,
    this.playStoreUrl,
    required this.icon,
  });
}

class OurAppsScreen extends StatefulWidget {
  const OurAppsScreen({super.key});

  @override
  State<OurAppsScreen> createState() => _OurAppsScreenState();
}

class _OurAppsScreenState extends State<OurAppsScreen> {
  String _selectedFilter = 'all'; // all, production, coming_soon
  final _searchController = TextEditingController();
  String _searchQuery = '';

  final List<SamyuktAppItem> _apps = const [
    SamyuktAppItem(
      id: 'vaultx',
      appName: 'Vault X',
      category: 'Android utility & Privacy',
      tagline: 'Secure on-device digital bookmark vault with client-side encryption',
      status: 'production',
      techStack: ['Flutter', 'Dart', 'SQLite', 'AES-256'],
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.samyukt.vaultx',
      icon: LucideIcons.shieldCheck,
    ),
    SamyuktAppItem(
      id: 'trusttracker',
      appName: 'Trust Tracker',
      category: 'Android utility & Personal finance',
      tagline: 'Offline subscription and expense ledger without cloud trackers',
      status: 'production',
      techStack: ['Flutter', 'Dart', 'Local SQLite'],
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.samyukt.trusttracker',
      icon: LucideIcons.wallet,
    ),
    SamyuktAppItem(
      id: 'snapdocs',
      appName: 'SnapDocs',
      category: 'Android utility & Document security',
      tagline: 'Offline document scanner and cryptographic vault',
      status: 'production',
      techStack: ['Kotlin', 'Android SDK', 'Room DB'],
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.samyukt.snapdocs',
      icon: LucideIcons.fileCheck,
    ),
    SamyuktAppItem(
      id: 'doit',
      appName: 'DoIt Mobile',
      category: 'High-velocity project & bug tracker',
      tagline: 'High-performance team task management, shake-to-capture defect reporter',
      status: 'production',
      techStack: ['Flutter 3.44', 'Dart 3.12', 'Riverpod', 'Dio'],
      playStoreUrl: 'https://doit.samyukt.pro',
      icon: LucideIcons.checkSquare,
    ),
    SamyuktAppItem(
      id: 'pulsekit',
      appName: 'PulseKit XR',
      category: 'Spatial computing & Telemetry',
      tagline: 'Real-time sensor telemetry and diagnostics HUD',
      status: 'coming_soon',
      techStack: ['WebXR', 'Three.js', 'WebSockets'],
      icon: LucideIcons.sparkles,
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openUrl(String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.tokens;

    final filteredApps = _apps.where((app) {
      if (_selectedFilter == 'production' && app.status != 'production') return false;
      if (_selectedFilter == 'coming_soon' && app.status != 'coming_soon') return false;

      final q = _searchQuery.toLowerCase().trim();
      if (q.isNotEmpty) {
        final matchTitle = app.appName.toLowerCase().contains(q);
        final matchTag = app.tagline.toLowerCase().contains(q);
        final matchCat = app.category.toLowerCase().contains(q);
        if (!matchTitle && !matchTag && !matchCat) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: tokens.canvas,
      appBar: AppBar(
        title: Row(
          children: [
            AppText(
              'Our Apps',
              variant: TextVariant.titleMedium,
              fontWeight: FontWeight.w700,
            ),
            const SizedBox(width: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: tokens.accentSoft,
                borderRadius: AppRadius.borderSm,
              ),
              child: AppText(
                'Samyukt',
                variant: TextVariant.tiny,
                fontWeight: FontWeight.w800,
                customColor: tokens.accentText,
              ),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Banner Card
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: tokens.surface2,
              borderRadius: AppRadius.borderLg,
              border: Border.all(color: tokens.accent.withAlpha(50)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(LucideIcons.sparkles, size: 20, color: tokens.accentText),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppText(
                        'Built by Samyukt',
                        variant: TextVariant.titleSmall,
                        fontWeight: FontWeight.w700,
                      ),
                      const SizedBox(height: 4),
                      AppText(
                        'Every application in the Samyukt catalog is crafted with strict standards: 100% privacy, zero bloat, native speed, and offline resilience.',
                        variant: TextVariant.bodySmall,
                        colorType: TextColorType.secondary,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Search Field
          AppSearchInput(
            controller: _searchController,
            hintText: 'Search applications, tags, or features...',
            onChanged: (val) => setState(() => _searchQuery = val),
            onClear: () => setState(() => _searchQuery = ''),
          ),
          const SizedBox(height: AppSpacing.md),

          // Filter Chips
          Row(
            children: [
              AppChip(
                label: 'All Apps',
                isSelected: _selectedFilter == 'all',
                onTap: () => setState(() => _selectedFilter = 'all'),
              ),
              const SizedBox(width: AppSpacing.sm),
              AppChip(
                label: 'Production',
                isSelected: _selectedFilter == 'production',
                onTap: () => setState(() => _selectedFilter = 'production'),
              ),
              const SizedBox(width: AppSpacing.sm),
              AppChip(
                label: 'Coming Soon',
                isSelected: _selectedFilter == 'coming_soon',
                onTap: () => setState(() => _selectedFilter = 'coming_soon'),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // App Cards List
          ...filteredApps.map((app) {
            final isLive = app.status == 'production';
            return AppCard(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: tokens.surface3,
                          borderRadius: AppRadius.borderMd,
                          border: Border.all(color: tokens.hairline),
                        ),
                        child: Icon(app.icon, size: 22, color: tokens.accentText),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppText(
                              app.appName,
                              variant: TextVariant.titleSmall,
                              fontWeight: FontWeight.w700,
                            ),
                            AppText(
                              app.category,
                              variant: TextVariant.caption,
                              colorType: TextColorType.secondary,
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: isLive ? tokens.successSoft : tokens.surface3,
                          borderRadius: AppRadius.borderSm,
                        ),
                        child: AppText(
                          isLive ? 'LIVE' : 'SOON',
                          variant: TextVariant.tiny,
                          fontWeight: FontWeight.w800,
                          customColor: isLive ? tokens.success : tokens.textTertiary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppText(
                    app.tagline,
                    variant: TextVariant.bodyMedium,
                    colorType: TextColorType.primary,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Wrap(
                    spacing: AppSpacing.xs,
                    runSpacing: 4,
                    children: app.techStack.map((tech) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: tokens.surface3,
                          borderRadius: AppRadius.borderSm,
                        ),
                        child: AppText(
                          tech,
                          variant: TextVariant.tiny,
                          colorType: TextColorType.secondary,
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: isLive ? 'View on Google Play' : 'Preview Roadmap',
                    size: ButtonSize.sm,
                    icon: Icon(
                      isLive ? LucideIcons.externalLink : LucideIcons.clock,
                      size: 14,
                      color: Colors.white,
                    ),
                    onPressed: () => _openUrl(app.playStoreUrl),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
