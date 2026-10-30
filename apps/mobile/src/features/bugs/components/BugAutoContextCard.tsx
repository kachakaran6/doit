import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text } from '../../../components/ui';
import { DeviceTelemetry } from '../types';
import { Cpu, Smartphone, Calendar, Layers } from 'lucide-react-native';

export interface BugAutoContextCardProps {
  telemetry?: DeviceTelemetry;
}

export const BugAutoContextCard: React.FC<BugAutoContextCardProps> = ({ telemetry }) => {
  const { colors, spacing, radius, elevation } = useTheme();

  const data = telemetry || {
    deviceModel: 'Google Pixel 8',
    osVersion: 'Android 14 (API 34)',
    appVersion: '0.1.0',
    buildNumber: '104',
    timestamp: new Date().toISOString(),
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.borderStrong,
          borderRadius: radius.md,
          padding: spacing.md,
          ...elevation.e1,
        },
      ]}
    >
      <View style={[styles.headerRow, { marginBottom: spacing.sm }]}>
        <Cpu size={16} color={colors.accentText} />
        <Text variant="caption" color="accent" style={{ fontWeight: '700', marginLeft: spacing.xs }}>
          Captured Automatically (Read-Only)
        </Text>
      </View>

      <View style={[styles.grid, { gap: spacing.sm }]}>
        <View style={styles.item}>
          <Smartphone size={13} color={colors.textTertiary} />
          <Text variant="caption" color="secondary" style={styles.itemLabel}>
            Device:
          </Text>
          <Text variant="caption" color="primary" style={styles.itemVal}>
            {data.deviceModel}
          </Text>
        </View>

        <View style={styles.item}>
          <Layers size={13} color={colors.textTertiary} />
          <Text variant="caption" color="secondary" style={styles.itemLabel}>
            OS & Build:
          </Text>
          <Text variant="caption" color="primary" style={styles.itemVal}>
            {data.osVersion} · v{data.appVersion} ({data.buildNumber})
          </Text>
        </View>

        <View style={styles.item}>
          <Calendar size={13} color={colors.textTertiary} />
          <Text variant="caption" color="secondary" style={styles.itemLabel}>
            Timestamp:
          </Text>
          <Text variant="caption" color="primary" style={styles.itemVal}>
            {data.timestamp}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    marginLeft: 6,
    marginRight: 4,
  },
  itemVal: {
    fontWeight: '600',
  },
});
