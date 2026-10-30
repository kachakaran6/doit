import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text } from '../../../components/ui';
import { useSessionStore } from '../store';
import { Activity, StopCircle } from 'lucide-react-native';

export const LiveSessionBar: React.FC<{ onEndPress?: () => void }> = ({ onEndPress }) => {
  const { colors, spacing } = useTheme();
  const { isActive, appUnderTest, bugIds, startTime, endSession } = useSessionStore();
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) return;
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  if (!isActive) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={[styles.bar, { backgroundColor: colors.accent, paddingHorizontal: spacing.md }]}>
      <View style={styles.left}>
        <Activity size={14} color={colors.accentOnPrimary} />
        <Text variant="caption" style={{ color: colors.accentOnPrimary, fontWeight: '700', marginLeft: 6 }}>
          TESTING: {appUnderTest}
        </Text>
        <Text variant="caption" style={{ color: colors.accentOnPrimary, marginLeft: 8, opacity: 0.85 }}>
          {formatTimer(elapsedSec)} · {bugIds.length} bugs
        </Text>
      </View>

      <Pressable
        onPress={() => {
          if (onEndPress) onEndPress();
          else endSession();
        }}
        accessibilityRole="button"
        accessibilityLabel="End active testing session"
        style={styles.endBtn}
      >
        <StopCircle size={14} color={colors.accentOnPrimary} />
        <Text variant="caption" style={{ color: colors.accentOnPrimary, fontWeight: '700', marginLeft: 4 }}>
          End
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 9999,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
});
