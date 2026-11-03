import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme, ThemeMode, Accent } from '../../theme/useTheme';
import { Text, Surface, Divider } from '../../components/ui';

export const FoundationGallery: React.FC = () => {
  const { mode, resolvedTheme, accent, colors, spacing, radius, setMode, setAccent } = useTheme();

  const accentsList: Accent[] = ['indigo', 'teal', 'amber', 'rose', 'violet'];
  const modesList: ThemeMode[] = ['dark', 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {/* Header Anatomy (03-TYPE-SYSTEM.md §3.4) */}
        <View style={styles.header}>
          <Text variant="eyebrow" color="muted">
            DESIGN SYSTEM • P-00
          </Text>
          <Text variant="h1" style={{ marginTop: spacing.xs }}>
            Foundation Gallery
          </Text>
          <Text variant="bodySmall" color="secondary" style={{ marginTop: spacing.xs }}>
            Four-step surface ladder, optical type scale, size-dependent tracking, tabular numbers.
          </Text>
        </View>

        {/* Theme & Accent Controls */}
        <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
          <View style={{ padding: spacing.lg }}>
            <View style={styles.rowBetween}>
              <Text variant="eyebrow" color="muted">
                THEME MODE
              </Text>
              <Text variant="label" color="secondary">
                {resolvedTheme.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
              {modesList.map((m) => {
                const isActive = resolvedTheme === m;
                return (
                  <TouchableOpacity
                    key={m}
                    activeOpacity={0.8}
                    onPress={() => setMode(m)}
                    style={[
                      styles.toggleChip,
                      {
                        backgroundColor: isActive ? colors.surfaceOverlay : colors.surfaceRaised,
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      color={isActive ? 'primary' : 'secondary'}
                      style={{ fontWeight: isActive ? '600' : '400' }}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            <View style={styles.rowBetween}>
              <Text variant="eyebrow" color="muted">
                ACCENT COLOR
              </Text>
              <Text variant="label" color="accent">
                {accent.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
              {accentsList.map((a) => {
                const isSelected = accent === a;
                return (
                  <TouchableOpacity
                    key={a}
                    activeOpacity={0.8}
                    onPress={() => setAccent(a)}
                    style={[
                      styles.accentChip,
                      {
                        backgroundColor: isSelected ? colors.surfaceOverlay : colors.surfaceRaised,
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor:
                            a === 'indigo'
                              ? '#5B5FC7'
                              : a === 'teal'
                              ? '#0D9488'
                              : a === 'amber'
                              ? '#D97706'
                              : a === 'rose'
                              ? '#E11D48'
                              : '#7C3AED',
                        },
                      ]}
                    />
                    <Text
                      variant="label"
                      color={isSelected ? 'accent' : 'secondary'}
                      style={{ marginLeft: 6, fontWeight: isSelected ? '600' : '400' }}
                    >
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Surface>

        {/* SECTION 1: THE FOUR-STEP SURFACE LADDER (02-SURFACE-SYSTEM.md) */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="eyebrow" color="muted">
            01 • FOUR-STEP SURFACE LADDER
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }]}>
            <Text variant="numeric" color="secondary" style={{ fontSize: 11 }}>
              4
            </Text>
          </View>
        </View>

        <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
          <View style={{ padding: spacing.lg }}>
            <View style={styles.surfaceHeader}>
              <Text variant="h3">L1 • Surface Card</Text>
              <Text variant="label" color="secondary">
                {resolvedTheme === 'dark' ? '#0F1012' : '#FFFFFF'}
              </Text>
            </View>
            <Text variant="bodySmall" color="secondary" style={{ marginTop: 4 }}>
              Main card layer. No border in dark mode; 1px top highlight gives edge definition.
            </Text>

            {/* Embedded L2 Tile */}
            <Surface level="L2" radiusRole="md" style={{ marginTop: spacing.md }}>
              <View style={{ padding: spacing.md }}>
                <View style={styles.surfaceHeader}>
                  <Text variant="bodyStrong">L2 • SurfaceRaised</Text>
                  <Text variant="label" color="secondary">
                    {resolvedTheme === 'dark' ? '#16181B' : '#F6F7F9'}
                  </Text>
                </View>
                <Text variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
                  Inputs, stat tiles, chips, popovers.
                </Text>

                {/* Embedded L3 Chip */}
                <View style={{ flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm }}>
                  <Surface level="L3" radiusRole="sm" style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text variant="label" color="primary">
                      L3 Pressed State
                    </Text>
                  </Surface>
                  <Surface level="L3" radiusRole="sm" style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text variant="numeric" color="accent">
                      98.4%
                    </Text>
                  </Surface>
                </View>
              </View>
            </Surface>
          </View>
        </Surface>

        {/* SECTION 2: OPTICAL TYPE SCALE (03-TYPE-SYSTEM.md) */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="eyebrow" color="muted">
            02 • OPTICAL TYPE SCALE
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }]}>
            <Text variant="numeric" color="secondary" style={{ fontSize: 11 }}>
              10
            </Text>
          </View>
        </View>

        <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
          <View style={{ padding: spacing.lg }}>
            {/* Display */}
            <View style={styles.typeItem}>
              <View style={styles.rowBetween}>
                <Text variant="label" color="tertiary">
                  display • 40/46 • 600 • tracking -1.0
                </Text>
              </View>
              <Text variant="display">42 Tasks</Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* H1 */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                h1 • 30/36 • 600 • tracking -0.6
              </Text>
              <Text variant="h1">General Overview</Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* H2 */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                h2 • 24/30 • 600 • tracking -0.4
              </Text>
              <Text variant="h2">Project Settings</Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* H3 */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                h3 • 18/24 • 600 • tracking -0.2
              </Text>
              <Text variant="h3">Hardware Integration</Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* Body */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                body • 15/22 • 400 • tracking 0
              </Text>
              <Text variant="body">
                Shake your phone intentionally outside DoIt to quickly log a bug or create a task.
              </Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* BodyStrong */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                bodyStrong • 15/22 • 500 • tracking 0
              </Text>
              <Text variant="bodyStrong">
                Title 600, content 400 or 500. One weight jump per screen.
              </Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* BodySmall */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                bodySmall • 13/19 • 400 • tracking +0.2
              </Text>
              <Text variant="bodySmall">
                Helper text for form fields, timestamps, and secondary explanations.
              </Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* Label */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                label • 12/16 • 500 • tracking +0.2
              </Text>
              <Text variant="label" color="secondary">
                Updated 2 minutes ago • Android 14
              </Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* Eyebrow */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                eyebrow • 11/14 • 600 • tracking +0.8 • uppercase
              </Text>
              <Text variant="eyebrow" color="muted">
                ACTIVE WORKSPACE
              </Text>
            </View>

            <Divider inset={0} style={{ marginVertical: spacing.md }} />

            {/* Numeric Tabular */}
            <View style={styles.typeItem}>
              <Text variant="label" color="tertiary">
                numeric • 15/20 • 600 • tabular-nums
              </Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                <Text variant="numeric" color="primary">
                  09:41:22
                </Text>
                <Text variant="numeric" color="accent">
                  10:41:22
                </Text>
                <Text variant="numeric" color="success">
                  +12.4%
                </Text>
                <Text variant="numeric" color="danger">
                  -03.1%
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* SECTION 3: COLOUR AS INFORMATION (04-COLOUR-AS-INFORMATION.md) */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="eyebrow" color="muted">
            03 • COLOUR AS INFORMATION
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceRaised, borderRadius: radius.pill }]}>
            <Text variant="numeric" color="secondary" style={{ fontSize: 11 }}>
              &lt;10%
            </Text>
          </View>
        </View>

        <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
          <View style={{ padding: spacing.lg }}>
            <Text variant="bodySmall" color="secondary" style={{ marginBottom: spacing.md }}>
              Every colored pixel carries semantic information: state, severity, or priority.
            </Text>

            {/* Semantics */}
            <View style={styles.badgeGrid}>
              <Surface level="L2" radiusRole="sm" style={styles.semanticTile}>
                <View style={[styles.semanticDot, { backgroundColor: colors.success }]} />
                <Text variant="label" color="success">
                  SUCCESS
                </Text>
              </Surface>

              <Surface level="L2" radiusRole="sm" style={styles.semanticTile}>
                <View style={[styles.semanticDot, { backgroundColor: colors.warning }]} />
                <Text variant="label" color="warning">
                  WARNING
                </Text>
              </Surface>

              <Surface level="L2" radiusRole="sm" style={styles.semanticTile}>
                <View style={[styles.semanticDot, { backgroundColor: colors.danger }]} />
                <Text variant="label" color="danger">
                  CRITICAL
                </Text>
              </Surface>

              <Surface level="L2" radiusRole="sm" style={styles.semanticTile}>
                <View style={[styles.semanticDot, { backgroundColor: colors.info }]} />
                <Text variant="label" color="accent">
                  INFO / ACCENT
                </Text>
              </Surface>
            </View>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCard: {
    marginBottom: 4,
  },
  surfaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeItem: {
    gap: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  semanticTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  semanticDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});

