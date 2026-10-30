import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';
import { useLoginMutation, useRegisterMutation } from '../api/mutations';

export const LoginScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
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
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text variant="h1" style={{ textAlign: 'center' }}>
            Samyukt DoIt
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing.xs, textAlign: 'center' }}>
            {mode === 'signin' ? 'Sign in to access your workspaces' : 'Create an account to get started'}
          </Text>
        </View>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginTop: spacing.md }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              { borderRadius: radius.sm },
              mode === 'signin' && { backgroundColor: colors.surfaceRaised },
            ]}
            onPress={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
          >
            <Text variant="body" color={mode === 'signin' ? 'primary' : 'secondary'} style={{ fontWeight: mode === 'signin' ? '600' : '400' }}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              { borderRadius: radius.sm },
              mode === 'signup' && { backgroundColor: colors.surfaceRaised },
            ]}
            onPress={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
          >
            <Text variant="body" color={mode === 'signup' ? 'primary' : 'secondary'} style={{ fontWeight: mode === 'signup' ? '600' : '400' }}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.danger, padding: spacing.md, marginTop: spacing.md }]}>
            <Text variant="caption" color="danger">
              {errorMessage}
            </Text>
          </View>
        )}

        <View style={[styles.form, { gap: spacing.md, marginTop: spacing.lg }]}>
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
          />

          <Input
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={mode === 'signin' ? 'Sign In' : 'Create Account'}
            variant="primary"
            loading={isLoading}
            style={{ marginTop: spacing.sm }}
            onPress={handleSubmit}
          />
        </View>

        {/* Demo Accounts Bar */}
        {mode === 'signin' && (
          <View style={[styles.demoBox, { borderTopColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.md }]}>
            <Text variant="caption" color="secondary" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
              Quick Demo Login
            </Text>
            <View style={styles.demoButtonsRow}>
              <Button
                title="Alice (Owner)"
                variant="secondary"
                size="sm"
                onPress={() => setDemoAccount('alice@samyukt.com')}
              />
              <Button
                title="Bob (Tester)"
                variant="secondary"
                size="sm"
                onPress={() => setDemoAccount('bob@samyukt.com')}
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
    paddingBottom: 48,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 8,
  },
  demoBox: {
    borderTopWidth: 1,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
});
