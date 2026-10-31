import React from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpCircle, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui';
import { CURRENT_APP_VERSION } from './useVersionPolicy';

interface ForceUpdateScreenProps {
  minVersion: string;
  downloadUrl: string;
}

export const ForceUpdateScreen: React.FC<ForceUpdateScreenProps> = ({
  minVersion,
  downloadUrl,
}) => {
  const { colors, spacing, radius } = useTheme();

  const handleUpdate = () => {
    Linking.openURL(downloadUrl).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.pill,
            },
          ]}
        >
          <ArrowUpCircle size={48} color={colors.accentText} />
        </View>

        <Text variant="h1" style={[styles.title, { color: colors.textPrimary }]}>
          Update Required
        </Text>

        <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
          A required security and feature update for DoIt is available. Please update your
          application to version {minVersion} or newer to continue.
        </Text>

        <View
          style={[
            styles.versionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.versionRow}>
            <Text variant="caption" color="secondary">
              Your Version:
            </Text>
            <Text variant="caption" style={{ color: colors.danger, fontWeight: '700' }}>
              v{CURRENT_APP_VERSION}
            </Text>
          </View>
          <View style={[styles.versionRow, { marginTop: spacing.xs }]}>
            <Text variant="caption" color="secondary">
              Minimum Required:
            </Text>
            <Text variant="caption" style={{ color: colors.success, fontWeight: '700' }}>
              v{minVersion}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.md,
              marginTop: spacing.xl,
            },
          ]}
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <Text variant="bodyStrong" style={{ color: colors.bg, fontWeight: '700' }}>
            Update Application
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  versionCard: {
    width: '100%',
    borderWidth: 1,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

