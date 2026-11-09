import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text } from '../../../components/ui';
import { DeviceTelemetry } from '../types';
import { Cpu, Smartphone, Calendar, Layers, ChevronDown, ChevronUp } from 'lucide-react-native';

export interface BugAutoContextCardProps {
  telemetry?: DeviceTelemetry;
}

export const BugAutoContextCard: React.FC<BugAutoContextCardProps> = ({ telemetry }) => {
  const { colors, spacing, radius } = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (!telemetry) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.headerRow}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Cpu size={14} color={colors.accentText} />
          <Text
            variant="caption"
            style={{ fontWeight: '700', marginLeft: 8, fontSize: 11, letterSpacing: 0.5 }}
          >
            DEVICE DIAGNOSTICS
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {!expanded && (
            <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
              {telemetry.deviceModel || 'Telemetry'}
            </Text>
          )}
          {expanded ? (
            <ChevronUp size={16} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.body, { borderTopColor: colors.hairline, gap: spacing.xs }]}>
          {telemetry.deviceModel ? (
            <View style={styles.item}>
              <Smartphone size={12} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={styles.itemLabel}>
                Device:
              </Text>
              <Text variant="caption" color="primary" style={styles.itemVal}>
                {telemetry.deviceModel}
              </Text>
            </View>
          ) : null}

          {telemetry.osVersion || telemetry.appVersion ? (
            <View style={styles.item}>
              <Layers size={12} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={styles.itemLabel}>
                OS / Build:
              </Text>
              <Text variant="caption" color="primary" style={styles.itemVal}>
                {telemetry.osVersion || 'Android'} {telemetry.appVersion ? `· v${telemetry.appVersion}` : ''} {telemetry.buildNumber ? `(${telemetry.buildNumber})` : ''}
              </Text>
            </View>
          ) : null}

          {telemetry.timestamp ? (
            <View style={styles.item}>
              <Calendar size={12} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={styles.itemLabel}>
                Recorded:
              </Text>
              <Text variant="caption" color="primary" style={styles.itemVal}>
                {new Date(telemetry.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    marginLeft: 6,
    marginRight: 4,
    fontSize: 12,
  },
  itemVal: {
    fontWeight: '600',
    fontSize: 12,
  },
});
