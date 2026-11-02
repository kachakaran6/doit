import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Sheet, Chip } from '../../../components/ui';
import {
  Layers,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Move,
  Settings,
  Zap,
  HelpCircle,
  Shield,
  Eye,
  Activity,
  ArrowRight,
} from 'lucide-react-native';

export interface QuickCaptureGuideSheetProps {
  visible: boolean;
  onClose: () => void;
  hasOverlayPerm: boolean;
  onRequestPermission: () => void;
  onOpenMiuiPermissions?: () => void;
  onOpenAppSettings?: () => void;
  onTestBubble: () => void;
  onTestCapture: () => void;
  bubbleEnabled: boolean;
  isXiaomi?: boolean;
}

export const QuickCaptureGuideSheet: React.FC<QuickCaptureGuideSheetProps> = ({
  visible,
  onClose,
  hasOverlayPerm,
  onRequestPermission,
  onOpenMiuiPermissions,
  onOpenAppSettings,
  onTestBubble,
  onTestCapture,
  bubbleEnabled,
  isXiaomi,
}) => {
  const { colors, spacing, radius, elevation } = useTheme();
  const [activeTab, setActiveTab] = useState<'bubble' | 'shake' | 'troubleshoot'>('bubble');

  return (
    <Sheet visible={visible} onClose={onClose} title="Hardware & Capture Guide" detent={0.9}>
      <View style={styles.tabBar}>
        <Chip
          label="Floating Bubble"
          selected={activeTab === 'bubble'}
          leadingIcon={<Layers size={13} color={activeTab === 'bubble' ? colors.accentText : colors.textTertiary} />}
          onPress={() => setActiveTab('bubble')}
        />
        <Chip
          label="Shake to Report"
          selected={activeTab === 'shake'}
          leadingIcon={<Smartphone size={13} color={activeTab === 'shake' ? colors.accentText : colors.textTertiary} />}
          onPress={() => setActiveTab('shake')}
        />
        <Chip
          label="Troubleshooting"
          selected={activeTab === 'troubleshoot'}
          leadingIcon={<HelpCircle size={13} color={activeTab === 'troubleshoot' ? colors.accentText : colors.textTertiary} />}
          onPress={() => setActiveTab('troubleshoot')}
        />
      </View>

      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingBottom: 32 }]} showsVerticalScrollIndicator={false}>
        {activeTab === 'bubble' && (
          <View>
            {/* Status Header */}
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: hasOverlayPerm ? 'rgba(52, 211, 153, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: hasOverlayPerm ? colors.success : colors.warning,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={styles.statusRow}>
                {hasOverlayPerm ? (
                  <CheckCircle2 size={18} color={colors.success} />
                ) : (
                  <AlertTriangle size={18} color={colors.warning} />
                )}
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: '700' }}>
                    {hasOverlayPerm ? 'Permission Granted: Display Over Other Apps' : 'Permission Required: Display Over Other Apps'}
                  </Text>
                  <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    {hasOverlayPerm
                      ? bubbleEnabled
                        ? 'Bubble is active on your screen right now.'
                        : 'Ready to use. Toggle the switch to show the bubble.'
                      : 'Android requires one-time permission to allow DoIt to float above other applications.'}
                  </Text>
                </View>
              </View>

              {!hasOverlayPerm && (
                <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                  <Button
                    title="1. Open 'Display Over Other Apps'"
                    variant="primary"
                    size="sm"
                    icon={<Settings size={14} color={colors.accentOnPrimary} />}
                    onPress={onRequestPermission}
                  />
                  {isXiaomi && onOpenMiuiPermissions && (
                    <Button
                      title="2. Open MIUI Other Permissions"
                      variant="secondary"
                      size="sm"
                      icon={<Shield size={14} color={colors.accentText} />}
                      onPress={onOpenMiuiPermissions}
                    />
                  )}
                  {onOpenAppSettings && (
                    <Button
                      title="3. App Info (If Restricted Setting)"
                      variant="ghost"
                      size="sm"
                      icon={<Move size={14} color={colors.textSecondary} />}
                      onPress={onOpenAppSettings}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Step-by-Step Instructions */}
            <Text variant="h3" style={{ marginBottom: spacing.sm }}>
              How to Enable & Use the Floating Bubble
            </Text>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>1</Text>
                </View>
                <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.sm }}>
                  Enable "Display Over Other Apps"
                </Text>
              </View>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Tap button 1 above. Locate "DoIt" in Android's system list and turn ON "Allow display over other apps".
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>2</Text>
                </View>
                <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.sm }}>
                  Xiaomi / Poco / MIUI Extra Step
                </Text>
              </View>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                In Xiaomi MIUI / HyperOS, you MUST also enable "Display pop-up windows while running in the background" under Other permissions. Without this, Xiaomi blocks background overlays.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>3</Text>
                </View>
                <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.sm }}>
                  Android 13+ "Restricted Setting"?
                </Text>
              </View>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                If Android grays out the toggle: Tap "App Info", tap the 3 dots (⋮) in the top-right corner, select "Allow restricted settings", confirm with your fingerprint/PIN, then return and toggle the permission ON.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>4</Text>
                </View>
                <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.sm }}>
                  Turn On the Floating Switch
                </Text>
              </View>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                In DoIt Settings &gt; Quick Capture, toggle "Floating Overlay Bubble" to ON. A sleek circular icon will appear on your screen and dock to the side.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>5</Text>
                </View>
                <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.sm }}>
                  One-Tap Capture From Any App
                </Text>
              </View>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Whether you are browsing in Chrome, reading email, or testing an app, simply tap the floating bubble. The DoIt Quick Capture sheet pops up instantly to log a task, bug, or voice note without losing your place.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>6</Text>
                </View>
                <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.sm }}>
                  Drag to Move or Dismiss
                </Text>
              </View>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Touch and drag the bubble anywhere along the left or right edge of your screen. Drag it to the bottom center of the screen to dismiss, or toggle it off from the Android notification shade.
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={bubbleEnabled ? "Stop Bubble" : "Start Bubble"}
                  variant={bubbleEnabled ? "secondary" : "primary"}
                  size="md"
                  icon={<Layers size={14} color={bubbleEnabled ? colors.textPrimary : colors.accentOnPrimary} />}
                  onPress={onTestBubble}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Test Capture Sheet"
                  variant="secondary"
                  size="md"
                  icon={<Zap size={14} color={colors.accentText} />}
                  onPress={onTestCapture}
                />
              </View>
            </View>
          </View>
        )}

        {activeTab === 'shake' && (
          <View>
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: 'rgba(119, 117, 216, 0.1)',
                  borderColor: colors.accent,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={styles.statusRow}>
                <Smartphone size={20} color={colors.accentText} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text variant="label" style={{ fontWeight: '700' }}>
                    Accelerometer Shake Sensor: Active
                  </Text>
                  <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    DoIt continuously samples device motion with high-pass filtering to distinguish intentional shakes from normal walking or pockets.
                  </Text>
                </View>
              </View>
            </View>

            <Text variant="h3" style={{ marginBottom: spacing.sm }}>
              How Shake to Report Works
            </Text>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                1. Wrist Motion Pattern
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Firmly shake your phone back and forth 2-3 times. The sensor detects 3 consecutive direction reversals within 400 milliseconds to prevent accidental triggers.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                2. Instant UI Snapshot & Telemetry
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                On shake confirmation, DoIt automatically packages device diagnostics (OS version, device model, battery status, timestamp) and opens the bug triage modal with the screenshot attached.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                3. Sensitivity Settings
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                • <Text variant="body" style={{ fontWeight: '600' }}>Low</Text>: For active workouts or running; requires a very forceful shake.{'\n'}
                • <Text variant="body" style={{ fontWeight: '600' }}>Medium</Text> (Default): Balanced for everyday hand movement.{'\n'}
                • <Text variant="body" style={{ fontWeight: '600' }}>High</Text>: Highly sensitive for fast, effortless reporting on desks or testing benches.
              </Text>
            </View>

            <Button
              title="Test Shake Trigger Now"
              variant="primary"
              size="md"
              icon={<Zap size={14} color={colors.accentOnPrimary} />}
              onPress={onTestCapture}
            />
          </View>
        )}

        {activeTab === 'troubleshoot' && (
          <View>
            <Text variant="h3" style={{ marginBottom: spacing.sm }}>
              OEM & Background Troubleshooting
            </Text>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                Samsung / One UI
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Go to Settings &gt; Apps &gt; DoIt &gt; Battery &gt; Select "Unrestricted". Ensure "Appear on top" is enabled.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                Xiaomi / MIUI / HyperOS
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Open Security &gt; Manage Apps &gt; DoIt &gt; Other Permissions &gt; Enable "Display pop-up windows while running in the background".
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                OnePlus / Oppo / Realme (ColorOS / OxygenOS)
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Go to App Management &gt; DoIt &gt; Permissions &gt; Floating window: "Always Allow". Set Battery usage to "Allow background activity".
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }]}>
              <Text variant="label" style={{ fontWeight: '600' }}>
                Why is there a persistent notification?
              </Text>
              <Text variant="body" color="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                Android enforces foreground notifications for apps that maintain an active overlay or sensor listener. This guarantees that Android will not aggressively close the bubble while you are using other apps.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  statusCard: {
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepCard: {
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

