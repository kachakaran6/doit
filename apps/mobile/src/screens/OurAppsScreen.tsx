import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Text, Button } from '../components/ui';
import { useTheme } from '../theme/useTheme';
import { fetchSamyuktAppsRegistry, SamyuktApp } from '../services/samyuktRegistry';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Layers,
  Search,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Globe,
} from 'lucide-react-native';

export const OurAppsScreen: React.FC = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation<any>();

  const [apps, setApps] = useState<SamyuktApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'production' | 'coming_soon'>('all');

  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchSamyuktAppsRegistry(forceRefresh);
      setApps(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to load application catalog. Please check your internet connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApps = apps.filter((app) => {
    const matchesFilter =
      selectedFilter === 'all'
        ? true
        : selectedFilter === 'production'
        ? app.status === 'production' || app.status === 'published'
        : app.status === 'coming_soon';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.appName.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.tagline.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const handleOpenPlayStore = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((e) => {
      console.warn('Failed to open Play Store link:', e);
    });
  };

  const handleOpenSamyuktWebsite = () => {
    Linking.openURL('https://samyukt.pro').catch((e) => {
      console.warn('Failed to open Samyukt website:', e);
    });
  };

  return (
    <Screen
      scrollable
      refreshing={refreshing}
      onRefresh={() => loadData(true)}
      style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs }}
      includeBottomNavPadding
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={[styles.backBtn, { backgroundColor: colors.surface2, borderRadius: radius.md }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="h1" style={{ fontSize: 22, fontWeight: '700' }}>Our Apps</Text>
            <View
              style={{
                backgroundColor: 'rgba(58, 102, 242, 0.15)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: radius.pill,
              }}
            >
              <Text variant="caption" style={{ color: colors.accent, fontWeight: '700', fontSize: 11 }}>
                Samyukt
              </Text>
            </View>
          </View>
          <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
            Precision Android utilities & craft software
          </Text>
        </View>
      </View>

      {/* Samyukt Ecosystem Hero Banner */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginTop: spacing.sm,
            marginBottom: spacing.md,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sparkles size={16} color={colors.accent} />
          <Text variant="label" style={{ color: colors.textPrimary, fontWeight: '700' }}>
            Built by Samyukt
          </Text>
        </View>
        <Text variant="bodySmall" color="secondary" style={{ lineHeight: 18 }}>
          Every application in the Samyukt catalog is crafted with strict standards: 100% privacy, zero bloat, native speed, and offline resilience.
        </Text>
      </View>

      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.surface2,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
            marginBottom: spacing.sm,
          },
        ]}
      >
        <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search applications, tags, or features..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'production', 'coming_soon'] as const).map((tab) => {
          const isSelected = selectedFilter === tab;
          const label = tab === 'all' ? 'All Apps' : tab === 'production' ? 'Production' : 'Coming Soon';
          return (
            <Pressable
              key={tab}
              onPress={() => setSelectedFilter(tab)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isSelected ? colors.accent : colors.surface2,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text variant="bodySmall" color="secondary" style={{ marginTop: 12 }}>
            Loading Samyukt application registry...
          </Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.lg },
          ]}
        >
          <Text variant="h3" style={{ color: colors.textPrimary, marginBottom: 6 }}>
            Unable to Connect
          </Text>
          <Text variant="bodySmall" color="secondary" style={{ textAlign: 'center', marginBottom: 16 }}>
            {error}
          </Text>
          <Button variant="secondary" title="Try Again" onPress={() => loadData(true)} />
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && filteredApps.length === 0 && (
        <View style={styles.centerBox}>
          <Layers size={36} color={colors.textMuted} />
          <Text variant="h3" style={{ color: colors.textPrimary, marginTop: 12 }}>
            No Applications Found
          </Text>
          <Text variant="bodySmall" color="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
            No apps match your search or filter. Try a different keyword or reset filters.
          </Text>
        </View>
      )}

      {/* Product Cards List */}
      {!loading && !error && filteredApps.length > 0 && (
        <View style={{ gap: spacing.md, marginTop: spacing.xs, marginBottom: spacing.xl }}>
          {filteredApps.map((app) => {
            const isProduction = app.status === 'production' || app.status === 'published';
            return (
              <View
                key={app.id}
                style={[
                  styles.appCard,
                  {
                    backgroundColor: colors.surface1,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                    padding: spacing.md,
                  },
                ]}
              >
                {/* Header Row: Icon + Name + Status */}
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: app.iconUrl }}
                    style={[styles.appIcon, { borderRadius: radius.md, backgroundColor: colors.surface2 }]}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text variant="h3" style={{ fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                        {app.appName}
                      </Text>
                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isProduction ? 'rgba(14, 133, 80, 0.15)' : 'rgba(123, 84, 232, 0.15)',
                            borderRadius: radius.pill,
                          },
                        ]}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: isProduction ? '#0E8550' : '#7B54E8',
                            fontWeight: '700',
                            fontSize: 10,
                            textTransform: 'uppercase',
                          }}
                        >
                          {isProduction ? 'Live' : 'Coming Soon'}
                        </Text>
                      </View>
                    </View>
                    <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
                      {app.category}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text
                  variant="bodySmall"
                  style={{ color: colors.textPrimary, marginTop: 10, lineHeight: 18 }}
                  numberOfLines={3}
                >
                  {app.tagline || app.description}
                </Text>

                {/* Tech Stack Chips */}
                {app.stack && app.stack.length > 0 && (
                  <View style={styles.stackRow}>
                    {app.stack.slice(0, 3).map((st) => (
                      <View
                        key={st}
                        style={[styles.stackChip, { backgroundColor: colors.surface2, borderRadius: radius.sm }]}
                      >
                        <Text variant="caption" style={{ color: colors.textSecondary, fontSize: 10 }}>
                          {st}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Row */}
                <View style={styles.actionRow}>
                  {isProduction && app.playStoreUrl ? (
                    <Pressable
                      onPress={() => handleOpenPlayStore(app.playStoreUrl)}
                      style={[styles.viewBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
                    >
                      <Text variant="label" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                        View on Google Play
                      </Text>
                      <ExternalLink size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        styles.disabledBtn,
                        { backgroundColor: colors.surface2, borderRadius: radius.md },
                      ]}
                    >
                      <Smartphone size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
                      <Text variant="caption" style={{ color: colors.textMuted, fontWeight: '600' }}>
                        In Development • Available Soon
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Standardized Samyukt Attribution Footer */}
      <View style={[styles.footerContainer, { borderTopColor: colors.border }]}>
        <Pressable onPress={handleOpenSamyuktWebsite} style={styles.attributionLink}>
          <Text variant="caption" color="secondary" style={{ textAlign: 'center' }}>
            Made with care by <Text style={{ color: colors.accent, fontWeight: '700' }}>Samyukt</Text>
          </Text>
          <ChevronRight size={14} color={colors.accent} style={{ marginLeft: 2 }} />
        </Pressable>
        <Text variant="caption" color="muted" style={{ marginTop: 4, textAlign: 'center', fontSize: 11 }}>
          https://samyukt.pro • All rights reserved
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  errorBox: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 24,
  },
  appCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  stackChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  actionRow: {
    marginTop: 14,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  disabledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  footerContainer: {
    borderTopWidth: 1,
    paddingVertical: 24,
    alignItems: 'center',
  },
  attributionLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
