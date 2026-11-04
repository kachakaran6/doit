import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';

export type SeverityLevel = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'COSMETIC' | 'TRIVIAL' | 'blocker' | 'critical' | 'major' | 'minor' | 'cosmetic' | 'trivial';

export interface SeverityBadgeProps {
  level: SeverityLevel;
}

const fallbackSeverity = { bg: 'rgba(96,165,250,0.12)', text: '#60A5FA', label: 'Minor' };

const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
  blocker: { bg: '#DC2626', text: '#FFFFFF', label: 'Blocker' },
  critical: { bg: 'rgba(248,113,113,0.12)', text: '#F87171', label: 'Critical' },
  major: { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24', label: 'Major' },
  minor: fallbackSeverity,
  cosmetic: { bg: 'rgba(139,145,158,0.12)', text: '#8B919E', label: 'Cosmetic' },
  trivial: { bg: 'rgba(139,145,158,0.12)', text: '#8B919E', label: 'Trivial' },
};

/**
 * P-01 SeverityBadge:
 * 04-COLOUR-AS-INFORMATION.md §4.3
 * 20 tall, radius 10.
 * Blocker: solid #DC2626, white text (only filled badge)
 * Critical/Major/Minor/Cosmetic: colored text on 12% tint background
 */
export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level }) => {
  const normalized = (level || 'minor').toLowerCase();
  const config = severityConfig[normalized] || fallbackSeverity;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text variant="caption" style={{ color: config.text, fontSize: 11, fontWeight: '600' }}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
