import React, { useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';
import { useShakeCapture } from '../../../core/providers/ShakeCaptureProvider';
import { Smartphone, CheckCircle2, Activity, X, Zap } from 'lucide-react-native';

interface ShakeTestModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShakeTestModal: React.FC<ShakeTestModalProps> = ({ visible, onClose }) => {
  const { colors, spacing, radius } = useTheme();
  const { diagnostics, sensitivity, testMode, setTestMode, testShakeSuccess } = useShakeCapture();

  useEffect(() => {
    if (visible) {
      setTestMode(true);
    } else {
      setTestMode(false);
    }
  }, [visible, setTestMode]);

  const magnitude = diagnostics.currentMagnitude;
  const threshold = diagnostics.threshold;
  const progressRatio = Math.min(1, Math.max(0, magnitude / (threshold || 1)));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: testShakeSuccess ? colors.success : colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: testShakeSuccess ? colors.success + '20' : colors.surfaceRaised },
                ]}
              >
                {testShakeSuccess ? (
                  <CheckCircle2 size={20} color={colors.success} />
                ) : (
                  <Smartphone size={20} color={colors.accentText} />
                )}
              </View>
              <View>
                <Text variant="h3" style={{ fontSize: 17, fontWeight: '700' }}>
                  Shake Gesture Diagnostic
                </Text>
                <Text variant="caption" color="secondary">
                  Sensitivity: <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase' }}>{sensitivity}</Text> (Threshold: {threshold} m/s²)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Test Status Banner */}
          {testShakeSuccess ? (
            <View
              style={[
                styles.successBanner,
                { backgroundColor: colors.success + '15', borderColor: colors.success + '40' },
              ]}
            >
              <CheckCircle2 size={22} color={colors.success} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ color: colors.success, fontWeight: '700', fontSize: 14 }}>
                  SHAKE DETECTED!
                </Text>
                <Text variant="caption" style={{ color: colors.success }}>
                  Gesture confirmed. Haptic feedback triggered.
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.promptBanner,
                { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
              ]}
            >
              <Zap size={18} color={colors.accentText} />
              <Text variant="body" color="primary" style={{ marginLeft: 8, fontSize: 13, flex: 1 }}>
                Flick your wrist 2 times back-and-forth to verify detection.
              </Text>
            </View>
          )}

          {/* Live Sensor Gauge */}
          <View style={[styles.gaugeContainer, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Activity size={14} color={colors.accentText} />
                <Text variant="label" style={{ fontSize: 12, fontWeight: '600' }}>
                  Live Motion Delta
                </Text>
              </View>
              <Text variant="label" style={{ fontSize: 13, fontWeight: '700' }}>
                {magnitude.toFixed(1)} / {threshold.toFixed(1)} m/s²
              </Text>
            </View>

            {/* Visual Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.round(progressRatio * 100)}%`,
                    backgroundColor: progressRatio >= 1 ? colors.success : colors.accent,
                  },
                ]}
              />
            </View>

            {/* Reversals & Status */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text variant="caption" color="secondary">
                Direction reversals: <Text variant="caption" style={{ fontWeight: '700' }}>{diagnostics.reversalsCount} / 2</Text>
              </Text>
              <Text variant="caption" color="secondary">
                Raw G: X:{diagnostics.rawX} Y:{diagnostics.rawY} Z:{diagnostics.rawZ}
              </Text>
            </View>
          </View>

          {/* Close button */}
          <View style={{ marginTop: spacing.md }}>
            <Button title="Done Testing" variant="primary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  gaugeContainer: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
});
