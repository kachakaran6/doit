import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTheme, ThemeMode, Accent } from '../../theme/useTheme';
import {
  Text,
  Button,
  Chip,
  Input,
  Sheet,
  EmptyState,
  Skeleton,
  Stack,
  LayoutRow,
  Spacer,
  Divider,
} from '../../components/ui';

export const ComponentGallery: React.FC = () => {
  const { mode, resolvedTheme, accent, colors, spacing, setMode, setAccent } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>({
    all: true,
  });

  const toggleChip = (key: string) => {
    setSelectedChips((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const accentsList: Accent[] = ['blue', 'violet', 'green', 'orange', 'rose'];
  const modesList: ThemeMode[] = ['system', 'light', 'dark'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
        {/* Header Controls */}
        <Stack gap="sm">
          <Text variant="display">Component Gallery</Text>
          <Text variant="body" color="secondary">
            Testing all theme tokens and UI components across themes and accents.
          </Text>

          <Spacer size="xs" />

          {/* Theme Mode Selector */}
          <Text variant="label" color="tertiary">
            THEME MODE ({mode.toUpperCase()})
          </Text>
          <LayoutRow gap="xs">
            {modesList.map((m) => (
              <Chip
                key={m}
                label={m.toUpperCase()}
                selected={mode === m}
                onPress={() => setMode(m)}
              />
            ))}
          </LayoutRow>

          <Spacer size="xs" />

          {/* Accent Color Selector */}
          <Text variant="label" color="tertiary">
            ACCENT PALETTE ({accent.toUpperCase()})
          </Text>
          <LayoutRow gap="xs">
            {accentsList.map((a) => (
              <Chip
                key={a}
                label={a.toUpperCase()}
                selected={accent === a}
                onPress={() => setAccent(a)}
              />
            ))}
          </LayoutRow>
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 1. Typography */}
        <Stack gap="md">
          <Text variant="h2">1. Typography Scale</Text>
          <Text variant="display">Display 32pt</Text>
          <Text variant="h1">Heading 1 (24pt)</Text>
          <Text variant="h2">Heading 2 (20pt)</Text>
          <Text variant="h3">Heading 3 (17pt)</Text>
          <Text variant="bodyStrong">Body Strong (15pt / 500)</Text>
          <Text variant="body">Body standard plain text (15pt / 400)</Text>
          <Text variant="label" color="accent">
            Label chip / eyebrow text (13pt / 500)
          </Text>
          <Text variant="caption" color="secondary">
            CAPTION METADATA (11pt / 500 / 0.4 letter-spacing)
          </Text>
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 2. Buttons */}
        <Stack gap="md">
          <Text variant="h2">2. Buttons</Text>
          <LayoutRow gap="sm">
            <Button variant="primary" title="Primary" size="md" />
            <Button variant="secondary" title="Secondary" size="md" />
            <Button variant="ghost" title="Ghost" size="md" />
          </LayoutRow>
          <LayoutRow gap="sm">
            <Button variant="danger" title="Danger Action" size="md" />
            <Button variant="primary" title="Loading" loading size="md" />
            <Button variant="primary" title="Disabled" disabled size="md" />
          </LayoutRow>
          <LayoutRow gap="sm">
            <Button variant="primary" title="Small" size="sm" />
            <Button variant="primary" title="Medium" size="md" />
            <Button variant="primary" title="Large" size="lg" />
          </LayoutRow>
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 3. Chips */}
        <Stack gap="md">
          <Text variant="h2">3. Filter & Label Chips</Text>
          <LayoutRow gap="sm">
            <Chip
              label="All Tasks"
              selected={!!selectedChips['all']}
              count={42}
              onPress={() => toggleChip('all')}
            />
            <Chip
              label="Bugs"
              selected={!!selectedChips['bugs']}
              count={7}
              onPress={() => toggleChip('bugs')}
            />
            <Chip
              label="Frontend"
              selected={!!selectedChips['frontend']}
              onPress={() => toggleChip('frontend')}
            />
          </LayoutRow>
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 4. Inputs */}
        <Stack gap="md">
          <Text variant="h2">4. Inputs</Text>
          <Input
            label="Task Title"
            placeholder="e.g. Login button unresponsive"
            value={inputValue}
            onChangeText={setInputValue}
            onClear={() => setInputValue('')}
          />
          <Input
            label="Input with Error"
            placeholder="Invalid state preview"
            value="invalid@"
            error="Please enter a valid email address."
          />
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 5. Skeletons */}
        <Stack gap="md">
          <Text variant="h2">5. Loading Skeletons</Text>
          <Skeleton height={28} width="60%" />
          <Skeleton height={18} width="90%" />
          <Skeleton height={18} width="75%" />
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 6. Bottom Sheet */}
        <Stack gap="md">
          <Text variant="h2">6. Modal Bottom Sheet</Text>
          <Button
            variant="secondary"
            title="Open Bottom Sheet"
            onPress={() => setSheetVisible(true)}
          />
        </Stack>

        <Divider style={{ marginVertical: spacing.xl }} />

        {/* 7. Empty State */}
        <Stack gap="md">
          <Text variant="h2">7. Empty State</Text>
          <EmptyState
            illustration="no-tasks"
            title="No tasks in this view"
            body="You have crushed all your items or no filters matched."
            actionTitle="Create Task"
            onAction={() => setSheetVisible(true)}
          />
        </Stack>
      </ScrollView>

      {/* Bottom Sheet Component */}
      <Sheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Quick Task Details"
      >
        <Stack gap="md">
          <Text variant="body">
            This bottom sheet slides up smoothly with custom detent heights, dimming backdrop, and
            drag-to-dismiss behavior.
          </Text>
          <Button
            variant="primary"
            title="Done"
            onPress={() => setSheetVisible(false)}
          />
        </Stack>
      </Sheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
