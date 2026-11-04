import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Plus,
  Trash2,
  Settings,
  Search,
  CheckCircle2,
  Calendar,
  Tag,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme, ThemeMode, Accent } from '../../theme/useTheme';
import {
  Text,
  Surface,
  Divider,
  Button,
  IconButton,
  Field,
  Chip,
  AccentChip,
  Checkbox,
  PriorityDot,
  DueText,
  SeverityBadge,
  LabelPill,
  Avatar,
  WorkspaceTile,
  Row,
  SectionHeader,
  EmptyState,
  Skeleton,
  RowSkeleton,
} from '../../components/ui';

export const FoundationGallery: React.FC = () => {
  const { mode, resolvedTheme, accent, colors, spacing, radius, setMode, setAccent } = useTheme();
  const [activeTab, setActiveTab] = useState<'primitives' | 'foundation'>('primitives');

  // Interactive sample states
  const [selectedChip, setSelectedChip] = useState<'all' | 'tasks' | 'bugs'>('all');
  const [checkboxState, setCheckboxState] = useState(false);
  const [rowDoneState, setRowDoneState] = useState(false);
  const [fieldVal, setFieldVal] = useState('Verify screenshot attachment');

  const accentsList: Accent[] = ['indigo', 'teal', 'amber', 'rose', 'violet'];
  const modesList: ThemeMode[] = ['dark', 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {/* Header Anatomy */}
        <View style={styles.header}>
          <Text variant="eyebrow" color="muted">
            DOIT DESIGN SYSTEM • {activeTab === 'primitives' ? 'P-01 PRIMITIVES' : 'P-00 FOUNDATION'}
          </Text>
          <Text variant="h1" style={{ marginTop: spacing.xs }}>
            {activeTab === 'primitives' ? 'Primitives Gallery' : 'Foundation Gallery'}
          </Text>
          <Text variant="bodySmall" color="secondary" style={{ marginTop: spacing.xs }}>
            {activeTab === 'primitives'
              ? 'Buttons, Fields, Chips, Rows, Badges, Avatars, EmptyState, and Skeletons.'
              : 'Four-step surface ladder, optical type scale, size-dependent tracking, tabular numbers.'}
          </Text>
        </View>

        {/* Tab Switcher (Segmented Control) */}
        <Surface level="L2" radiusRole="pill" style={{ marginBottom: spacing.lg }}>
          <View style={styles.tabBar}>
            <Pressable
              onPress={() => setActiveTab('primitives')}
              style={[
                styles.tabItem,
                activeTab === 'primitives' && {
                  backgroundColor: colors.surfaceOverlay,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                variant="label"
                color={activeTab === 'primitives' ? 'accent' : 'secondary'}
                style={{ fontWeight: activeTab === 'primitives' ? '600' : '400' }}
              >
                P-01 Primitives
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('foundation')}
              style={[
                styles.tabItem,
                activeTab === 'foundation' && {
                  backgroundColor: colors.surfaceOverlay,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                variant="label"
                color={activeTab === 'foundation' ? 'accent' : 'secondary'}
                style={{ fontWeight: activeTab === 'foundation' ? '600' : '400' }}
              >
                P-00 Foundation
              </Text>
            </Pressable>
          </View>
        </Surface>

        {/* Global Controls: Theme Mode & Accent */}
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
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      color={isActive ? 'accent' : 'secondary'}
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
                ACCENT PALETTE (WCAG AA/AAA)
              </Text>
              <Text variant="label" color="accent">
                {accent.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
              {accentsList.map((a) => {
                const isSelected = accent === a;
                return (
                  <AccentChip
                    key={a}
                    label={a.charAt(0).toUpperCase() + a.slice(1)}
                    color={
                      a === 'indigo'
                        ? '#5B5FC7'
                        : a === 'teal'
                        ? '#0D9488'
                        : a === 'amber'
                        ? '#D97706'
                        : a === 'rose'
                        ? '#E11D48'
                        : '#7C3AED'
                    }
                    selected={isSelected}
                    onPress={() => setAccent(a)}
                  />
                );
              })}
            </View>
          </View>
        </Surface>

        {/* ======================================================== */}
        {/* P-01 PRIMITIVES VIEW */}
        {/* ======================================================== */}
        {activeTab === 'primitives' && (
          <>
            {/* 1. BUTTONS */}
            <SectionHeader title="01 • Button Variants & Sizes" count={4} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.md }}>
                <Text variant="bodySmall" color="secondary">
                  Radius 16 (measured). 4 variants: Primary, Secondary, Ghost, Danger.
                </Text>

                <View style={styles.wrapRow}>
                  <Button variant="primary" title="Primary (Action)" size="md" icon={<Plus size={16} color="#FFFFFF" />} />
                  <Button variant="secondary" title="Secondary" size="md" />
                  <Button variant="ghost" title="Ghost" size="md" />
                  <Button variant="danger" title="Danger" size="md" icon={<Trash2 size={16} color="#FFFFFF" />} />
                </View>

                <Divider inset={0} style={{ marginVertical: spacing.xs }} />

                <Text variant="eyebrow" color="muted">
                  BUTTON SIZES: SM (36), MD (44), LG (52)
                </Text>
                <View style={styles.wrapRow}>
                  <Button variant="primary" title="Small (36)" size="sm" />
                  <Button variant="primary" title="Medium (44)" size="md" />
                  <Button variant="primary" title="Large (52)" size="lg" />
                </View>

                <Divider inset={0} style={{ marginVertical: spacing.xs }} />

                <Text variant="eyebrow" color="muted">
                  5 STATES: REST, PRESSED, FOCUSED, DISABLED, LOADING
                </Text>
                <View style={styles.wrapRow}>
                  <Button variant="primary" title="Normal Rest" size="sm" />
                  <Button variant="primary" title="Loading" size="sm" loading />
                  <Button variant="primary" title="Disabled" size="sm" disabled />
                  <Button variant="secondary" title="Secondary Disabled" size="sm" disabled />
                </View>
              </View>
            </Surface>

            {/* 2. ICON BUTTONS */}
            <SectionHeader title="02 • Icon Buttons (40×40, Radius 12)" count={3} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.md }}>
                <View style={styles.wrapRow}>
                  <IconButton
                    variant="ghost"
                    accessibilityLabel="Settings"
                    icon={<Settings size={20} color={colors.textPrimary} />}
                  />
                  <IconButton
                    variant="secondary"
                    accessibilityLabel="Search"
                    icon={<Search size={20} color={colors.textPrimary} />}
                  />
                  <IconButton
                    variant="primary"
                    accessibilityLabel="Add"
                    icon={<Plus size={20} color="#FFFFFF" />}
                  />
                  <IconButton
                    variant="secondary"
                    accessibilityLabel="Disabled icon"
                    disabled
                    icon={<Settings size={20} color={colors.textPrimary} />}
                  />
                  <IconButton
                    variant="primary"
                    accessibilityLabel="Loading icon"
                    loading
                    icon={<Plus size={20} color="#FFFFFF" />}
                  />
                </View>
              </View>
            </Surface>

            {/* 3. FIELD / INPUTS */}
            <SectionHeader title="03 • Field / Input (48 Tall, Radius 12)" count={5} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.lg }}>
                <Field
                  label="Task Title"
                  placeholder="e.g. Design app icon"
                  value={fieldVal}
                  onChangeText={setFieldVal}
                  onClear={() => setFieldVal('')}
                />

                <Field
                  label="With Prefix Icon"
                  placeholder="Search tasks, bugs, stickies..."
                  prefix={<Search size={18} color={colors.textTertiary} />}
                />

                <Field
                  label="Error State (Validation Failure)"
                  value="Project not found"
                  error="The project with key 'GEN' does not exist in this workspace."
                />

                <Field
                  label="Disabled / Read-only Field"
                  value="GEN-42 • Immutable ID"
                  disabled
                />
              </View>
            </Surface>

            {/* 4. CHIPS & ACCENT CHIPS */}
            <SectionHeader title="04 • Filter Chips (32 Tall Pill, L3 Filled)" count={4} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.md }}>
                <Text variant="bodySmall" color="secondary">
                  Selected = filled L3 + accent text. NO borders.
                </Text>

                <View style={styles.wrapRow}>
                  <Chip
                    label="All Work"
                    count={42}
                    selected={selectedChip === 'all'}
                    onPress={() => setSelectedChip('all')}
                  />
                  <Chip
                    label="Tasks Only"
                    count={18}
                    selected={selectedChip === 'tasks'}
                    onPress={() => setSelectedChip('tasks')}
                  />
                  <Chip
                    label="Bug Queue"
                    count={5}
                    selected={selectedChip === 'bugs'}
                    onPress={() => setSelectedChip('bugs')}
                  />
                  <Chip label="Disabled Chip" disabled />
                </View>
              </View>
            </Surface>

            {/* 5. CHECKBOX */}
            <SectionHeader title="05 • Checkbox (28 Visual, 44 Hit Area)" count={3} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.md }}>
                <View style={styles.wrapRow}>
                  <View style={styles.checkboxSample}>
                    <Checkbox
                      checked={checkboxState}
                      onPress={() => setCheckboxState(!checkboxState)}
                    />
                    <Text variant="body" color="primary">
                      {checkboxState ? 'Checked (Accent fill)' : 'Unchecked (SurfaceRaised L2)'}
                    </Text>
                  </View>

                  <View style={styles.checkboxSample}>
                    <Checkbox checked={true} disabled />
                    <Text variant="body" color="secondary">
                      Disabled Checked
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>

            {/* 6. SEMANTIC MARKERS */}
            <SectionHeader title="06 • Semantic Markers (Meaning > Decoration)" count={4} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.md }}>
                <Text variant="eyebrow" color="muted">
                  PRIORITY DOTS (6PX DOT + 12PX LABEL)
                </Text>
                <View style={styles.wrapRow}>
                  <PriorityDot level="LOW" withLabel />
                  <PriorityDot level="MEDIUM" withLabel />
                  <PriorityDot level="HIGH" withLabel />
                  <PriorityDot level="URGENT" withLabel />
                </View>

                <Divider inset={0} style={{ marginVertical: spacing.xs }} />

                <Text variant="eyebrow" color="muted">
                  DUE TEXT (DUE DATE STATES)
                </Text>
                <View style={styles.wrapRow}>
                  <DueText date={new Date(Date.now() - 86400000)} />
                  <DueText date={new Date()} />
                  <DueText date={new Date(Date.now() + 86400000)} />
                  <DueText date={new Date(Date.now() + 86400000 * 5)} />
                </View>

                <Divider inset={0} style={{ marginVertical: spacing.xs }} />

                <Text variant="eyebrow" color="muted">
                  SEVERITY BADGES (20 TALL, 12% TINT, BLOCKER SOLID)
                </Text>
                <View style={styles.wrapRow}>
                  <SeverityBadge level="BLOCKER" />
                  <SeverityBadge level="CRITICAL" />
                  <SeverityBadge level="MAJOR" />
                  <SeverityBadge level="MINOR" />
                  <SeverityBadge level="COSMETIC" />
                </View>

                <Divider inset={0} style={{ marginVertical: spacing.xs }} />

                <Text variant="eyebrow" color="muted">
                  LABEL PILLS (ACCENTFOR DETERMINISTIC 20PX PILLS)
                </Text>
                <View style={styles.wrapRow}>
                  <LabelPill id="frontend" name="Frontend" />
                  <LabelPill id="backend" name="Backend" />
                  <LabelPill id="overlay" name="Overlay" />
                  <LabelPill id="mobile" name="Mobile" />
                  <LabelPill id="release" name="Release" />
                </View>
              </View>
            </Surface>

            {/* 7. AVATAR & WORKSPACE TILE */}
            <SectionHeader title="07 • Avatar & WorkspaceTile (accentFor)" count={5} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg, gap: spacing.md }}>
                <Text variant="eyebrow" color="muted">
                  AVATARS (24, 28, 36, 44 • WHITE INITIALS)
                </Text>
                <View style={styles.wrapRow}>
                  <Avatar id="karan" name="Karan Kacha" size="sm" />
                  <Avatar id="sarah" name="Sarah Connor" size="md" />
                  <Avatar id="alex" name="Alex Vance" size="lg" />
                  <Avatar id="gordon" name="Gordon Freeman" size="xl" />
                </View>

                <Divider inset={0} style={{ marginVertical: spacing.xs }} />

                <Text variant="eyebrow" color="muted">
                  WORKSPACE TILES (36, 44 • RADIUS 12)
                </Text>
                <View style={styles.wrapRow}>
                  <WorkspaceTile id="samyukt" name="Samyukt HQ" size={36} />
                  <WorkspaceTile id="mobile-team" name="Mobile Team" size={36} />
                  <WorkspaceTile id="doit-prod" name="DoIt Production" size={44} />
                </View>
              </View>
            </Surface>

            {/* 8. ROW (THE DENSITY FIX §6.3) */}
            <SectionHeader title="08 • Row Anatomy (§6.3 Density Fix)" count={2} />
            <View style={{ gap: spacing.md }}>
              <Row
                id="task-1"
                humanId="GEN-1"
                title="Verify task screenshot attachment on physical device"
                done={rowDoneState}
                priority="HIGH"
                dueAt={new Date()}
                labels={[
                  { id: 'overlay', name: 'overlay' },
                  { id: 'android', name: 'android' },
                ]}
                assignee={{ id: 'karan', name: 'Karan Kacha' }}
                onToggleDone={() => setRowDoneState(!rowDoneState)}
              />

              <Row
                id="task-2"
                humanId="GEN-2"
                title="Design bottom sheet interactive gestures"
                done={true}
                priority="MEDIUM"
                dueAt={new Date(Date.now() + 86400000)}
                labels={[{ id: 'design', name: 'design' }]}
                assignee={{ id: 'sarah', name: 'Sarah' }}
              />
            </View>

            {/* 9. EMPTY STATE */}
            <SectionHeader title="09 • EmptyState (Bare 64 Icon, No Rounded Box)" count={1} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <EmptyState
                illustration="no-tasks"
                title="No tasks in queue"
                body="You're all caught up for today! Capture a new task or take a break."
                actionTitle="Create Task"
                onAction={() => {}}
              />
            </Surface>

            {/* 10. SKELETONS */}
            <SectionHeader title="10 • Skeletons (Matches Real Row Anatomy)" count={1} />
            <View style={{ gap: spacing.md }}>
              <RowSkeleton withLabels={true} />
              <RowSkeleton withLabels={false} />
            </View>
          </>
        )}

        {/* ======================================================== */}
        {/* P-00 FOUNDATION VIEW */}
        {/* ======================================================== */}
        {activeTab === 'foundation' && (
          <>
            {/* L0 Canvas */}
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg }}>
                <View style={styles.surfaceHeader}>
                  <Text variant="h3">L0 • Canvas Background</Text>
                  <Text variant="label" color="secondary">
                    {resolvedTheme === 'dark' ? '#08090A' : '#FFFFFF'}
                  </Text>
                </View>
                <Text variant="bodySmall" color="secondary" style={{ marginTop: 4 }}>
                  True canvas tone. Deep OLED near-black in dark mode; crisp clean white in light mode.
                </Text>
              </View>
            </Surface>

            {/* L1 Surface Card */}
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

            {/* Typography Scale */}
            <SectionHeader title="02 • Optical Type Scale" count={10} />
            <Surface level="L1" radiusRole="lg" style={styles.sectionCard}>
              <View style={{ padding: spacing.lg }}>
                <View style={styles.typeItem}>
                  <Text variant="label" color="tertiary">display • 40/46 • 600 • tracking -1.0</Text>
                  <Text variant="display">42 Tasks</Text>
                </View>
                <Divider inset={0} style={{ marginVertical: spacing.md }} />
                <View style={styles.typeItem}>
                  <Text variant="label" color="tertiary">h1 • 30/36 • 600 • tracking -0.6</Text>
                  <Text variant="h1">General Overview</Text>
                </View>
                <Divider inset={0} style={{ marginVertical: spacing.md }} />
                <View style={styles.typeItem}>
                  <Text variant="label" color="tertiary">h2 • 24/30 • 600 • tracking -0.4</Text>
                  <Text variant="h2">Project Settings</Text>
                </View>
                <Divider inset={0} style={{ marginVertical: spacing.md }} />
                <View style={styles.typeItem}>
                  <Text variant="label" color="tertiary">h3 • 18/24 • 600 • tracking -0.2</Text>
                  <Text variant="h3">Hardware Integration</Text>
                </View>
                <Divider inset={0} style={{ marginVertical: spacing.md }} />
                <View style={styles.typeItem}>
                  <Text variant="label" color="tertiary">body • 15/22 • 400</Text>
                  <Text variant="body">
                    Every task screenshot captured via quick-action floating bubble is instantly synced with the NestJS API.
                  </Text>
                </View>
                <Divider inset={0} style={{ marginVertical: spacing.md }} />
                <View style={styles.typeItem}>
                  <Text variant="label" color="tertiary">numeric (tabular) • 18/24 • 600</Text>
                  <Text variant="numeric">GEN-102 • $1,429.50 • 98.4%</Text>
                </View>
              </View>
            </Surface>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  toggleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  surfaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  typeItem: {
    gap: 4,
  },
  checkboxSample: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
