import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PingSchema } from '@samyukt/contracts';
import { neutrals, spacing, radius, typography, accents } from '@samyukt/tokens';

export default function App() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const themeNeutrals = isDark ? neutrals.dark : neutrals.light;
  const activeAccent = accents.indigo;

  const pingResult = useMemo(() => {
    return PingSchema.safeParse({
      status: 'ok',
      version: '0.1.0',
      uptime: 42,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeNeutrals.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeNeutrals.surface,
            borderColor: themeNeutrals.border,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: isDark ? activeAccent.accentTextDark : activeAccent.primary,
            },
          ]}
        >
          Samyukt
        </Text>
        <Text style={[styles.subtitle, { color: themeNeutrals.textSecondary }]}>
          com.samyukt.doit
        </Text>

        <View style={[styles.divider, { backgroundColor: themeNeutrals.border }]} />

        <View style={styles.statusRow}>
          <Text style={[styles.label, { color: themeNeutrals.textSecondary }]}>
            Contract Ping:
          </Text>
          <Text
            style={[
              styles.value,
              { color: pingResult.success ? activeAccent.primary : themeNeutrals.textTertiary },
            ]}
          >
            {pingResult.success ? `SUCCESS (${pingResult.data.status})` : 'FAILED'}
          </Text>
        </View>

        <Text style={[styles.meta, { color: themeNeutrals.textTertiary }]}>
          {pingResult.success ? `v${pingResult.data.version} • ${pingResult.data.timestamp}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  title: {
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '500',
  },
  value: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  meta: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
});

