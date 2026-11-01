import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';
import { useLoginMutation, useRegisterMutation } from '../api/mutations';
import { CheckCircle2, ShieldCheck } from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('alice@samyukt.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      if (mode === 'signin') {
        await loginMutation.mutateAsync({ email: email.trim(), password });
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        await registerMutation.mutateAsync({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing['2xl'],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <View
            style={[
              styles.logoTile,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                marginBottom: spacing.md,
                ...elevation.e1,
              },
            ]}
          >
            <ShieldCheck size={28} color={colors.accentText} strokeWidth={2} />
          </View>
          <Text variant="display" style={{ textAlign: 'center', letterSpacing: -0.5 }}>
            DoIt
          </Text>
          <Text
            variant="body"
            color="secondary"
            style={{ marginTop: spacing.xs, textAlign: 'center' }}
          >
            {mode === 'signin'
              ? 'Precision project management & issue tracking'
              : 'Create your workspace and start building'}
          </Text>
        </View>

        {/* Card Container */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              ...elevation.e2,
            },
          ]}
        >
          {/* Segmented Mode Switcher */}
          <View
            style={[
              styles.segmentedRow,
              {
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.md,
                padding: 3,
                marginBottom: spacing.lg,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentItem,
                { borderRadius: radius.sm },
                mode === 'signin' && {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                variant="label"
                style={{
                  color: mode === 'signin' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: mode === 'signin' ? '600' : '400',
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentItem,
                { borderRadius: radius.sm },
                mode === 'signup' && {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                variant="label"
                style={{
                  color: mode === 'signup' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: mode === 'signup' ? '600' : '400',
                }}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.danger,
                  borderRadius: radius.sm,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Text variant="caption" color="danger" style={{ lineHeight: 18 }}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={{ gap: spacing.md }}>
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Alice Sharma"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            )}

            <Input
              label="Email Address"
              placeholder="alice@samyukt.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title={mode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}
              variant="primary"
              loading={isLoading}
              style={{ marginTop: spacing.xs }}
              onPress={handleSubmit}
            />
          </View>
        </View>

        {/* Demo Fast Login Pills */}
        {mode === 'signin' && (
          <View
            style={[
              styles.demoContainer,
              {
                borderColor: colors.border,
                marginTop: spacing['2xl'],
                paddingTop: spacing.lg,
              },
            ]}
          >
            <Text
              variant="caption"
              color="secondary"
              style={{ textAlign: 'center', marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Demo Accounts
            </Text>
            <View style={[styles.demoRow, { gap: spacing.md }]}>
              <Button
                title="Alice (Owner)"
                variant="secondary"
                size="sm"
                onPress={() => setDemoAccount('alice@samyukt.com')}
                style={styles.demoBtn}
              />
              <Button
                title="Bob (Tester)"
                variant="secondary"
                size="sm"
                onPress={() => setDemoAccount('bob@doit.local')}
                style={styles.demoBtn}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    justifyContent: 'center',
    flexGrow: 1,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logoTile: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: {
    width: '100%',
    borderWidth: 1,
  },
  segmentedRow: {
    flexDirection: 'row',
  },
  segmentItem: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    borderWidth: 1,
  },
  demoContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  demoBtn: {
    flex: 1,
  },
});
