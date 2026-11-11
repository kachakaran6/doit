import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';
import { useLoginMutation, useRegisterMutation } from '../api/mutations';
import { CheckCircle2, ShieldCheck, Server, RefreshCw, Eye, EyeOff } from 'lucide-react-native';
import { http } from '../../../lib/http';
import {
  getPendingInviteToken,
  markInviteTokenConsumed,
  clearPendingInviteToken,
} from '../../../navigation/invite-link';
import { useWorkspaceStore } from '../../workspace/store';

export const LoginScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showForgotSheet, setShowForgotSheet] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [activeUrl, setActiveUrl] = useState(http.getBaseUrl());
  const [serverPing, setServerPing] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const handlePingServer = async (urlToTest?: string) => {
    const targetUrl = urlToTest || activeUrl;
    setPinging(true);
    setServerPing(null);
    try {
      const res: any = await fetch(`${targetUrl}/health`).then((r) => r.json());
      setServerPing(`Online (${res?.status || 'ok'}) • DB: ${res?.database || 'connected'}`);
    } catch (e: any) {
      setServerPing(`Cannot reach server at ${targetUrl}`);
    } finally {
      setPinging(false);
    }
  };

  const handleSwitchServer = (newUrl: string) => {
    http.setBaseUrl(newUrl);
    setActiveUrl(newUrl);
    handlePingServer(newUrl);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      if (mode === 'signin') {
        await loginMutation.mutateAsync({ email: cleanEmail, password: cleanPassword });
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        await registerMutation.mutateAsync({
          fullName: fullName.trim(),
          email: cleanEmail,
          password: cleanPassword,
        });
      }

      // Automatically accept pending invite token if one was queued
      const pendingToken = getPendingInviteToken();
      if (pendingToken) {
        try {
          await http.post('/invitations/accept', { token: pendingToken });
          markInviteTokenConsumed(pendingToken);
          clearPendingInviteToken();
          await useWorkspaceStore.getState().fetchAndInitializeWorkspaces();
        } catch {
          // If already accepted or invalid, ignore
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleForgotSubmit = async () => {
    setForgotError(null);
    const cleanEmail = forgotEmail.trim().toLowerCase();
    const cleanPassword = forgotNewPassword.trim();

    if (!cleanEmail) {
      setForgotError('Please enter your account email.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    try {
      setForgotLoading(true);
      await http.post('/auth/password/reset', {
        email: cleanEmail,
        newPassword: cleanPassword,
      });
      setForgotSuccess(true);
      setEmail(cleanEmail);
      setPassword(cleanPassword);
      setErrorMessage(null);
    } catch (err: any) {
      setForgotError(err?.message || 'Unable to reset password. Please verify connection.');
    } finally {
      setForgotLoading(false);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: spacing.lg,
              paddingTop: keyboardHeight > 0 ? spacing.xs : spacing.lg,
              paddingBottom: keyboardHeight > 0 ? keyboardHeight + 160 : spacing.lg,
              justifyContent: keyboardHeight > 0 ? 'flex-start' : 'center',
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={[styles.header, { marginBottom: keyboardHeight > 0 ? spacing.xs : spacing.lg }]}>
            {keyboardHeight === 0 && (
              <View
                style={[
                  styles.logoTile,
                  {
                    marginBottom: spacing.sm,
                    borderRadius: radius.xl,
                    overflow: 'hidden',
                    ...elevation.e2,
                  },
                ]}
              >
                <Image
                  source={require('../../../../assets/icon.png')}
                  style={{ width: 64, height: 64, borderRadius: radius.xl }}
                  resizeMode="contain"
                />
              </View>
            )}
            <Text
              variant={keyboardHeight > 0 ? 'title1' : 'display'}
              style={{ textAlign: 'center', letterSpacing: -0.5 }}
            >
              Doit
            </Text>
            {keyboardHeight === 0 && (
              <Text
                variant="body"
                color="secondary"
                style={{ marginTop: spacing.xs, textAlign: 'center' }}
              >
                {mode === 'signin'
                  ? 'Precision project management & issue tracking'
                  : 'Create your workspace and start building'}
              </Text>
            )}
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
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 40, animated: true });
                }, 150);
              }}
            />

            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.xs,
                }}
              >
                <Text variant="label" color={errorMessage ? 'danger' : 'secondary'}>
                  Password
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={colors.accent} />
                  ) : (
                    <Eye size={16} color={colors.accent} />
                  )}
                  <Text
                    variant="caption"
                    style={{
                      color: colors.accent,
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    {showPassword ? 'Hide password' : 'Show password'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                isPassword
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 240, animated: true });
                  }, 120);
                }}
                suffix={
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                    style={{ padding: 6, justifyContent: 'center', alignItems: 'center' }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.accent} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                }
              />
            </View>

            {mode === 'signin' && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -spacing.xs }}>
                <TouchableOpacity
                  onPress={() => {
                    setForgotEmail(email);
                    setForgotSuccess(false);
                    setForgotError(null);
                    setShowForgotSheet(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Text variant="caption" color="secondary" style={{ fontSize: 12 }}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ marginTop: spacing.xs }}>
              <Button
                title={mode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}
                variant="primary"
                fullWidth
                loading={isLoading}
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>

        {/* Demo Fast Login Pills */}
        {mode === 'signin' && (
          <View
            style={[
              styles.demoContainer,
              {
                borderColor: colors.border,
                marginTop: spacing['xl'],
                paddingTop: spacing.md,
              },
            ]}
          >
            <Text
              variant="caption"
              color="secondary"
              style={{ textAlign: 'center', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Demo Accounts
            </Text>
            <View style={[styles.demoRow, { gap: spacing.md }]}>
              <View style={styles.demoBtn}>
                <Button
                  title="Alice (Owner)"
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onPress={() => setDemoAccount('alice@samyukt.com')}
                />
              </View>
              <View style={styles.demoBtn}>
                <Button
                  title="Bob (Tester)"
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onPress={() => setDemoAccount('bob@samyukt.com')}
                />
              </View>
            </View>
          </View>
        )}

        {/* Server Endpoint Configuration (Debug/Development Only) */}
        {__DEV__ && (
          <View
            style={[
              styles.serverCard,
              {
                backgroundColor: colors.surfaceRaised,
                borderColor: colors.border,
                borderRadius: radius.md,
                marginTop: spacing.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Server size={13} color={colors.textTertiary} />
                <Text variant="caption" color="secondary" style={{ marginLeft: 5, fontWeight: '600', textTransform: 'uppercase' }}>
                  Backend Server (Dev)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handlePingServer()}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <RefreshCw size={11} color={colors.accentText} />
                <Text variant="caption" color="accent" style={{ marginLeft: 4, fontSize: 11 }}>
                  {pinging ? 'Testing...' : 'Test Connection'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text variant="caption" color="secondary" style={{ fontSize: 11, fontFamily: 'monospace', marginBottom: spacing.xs }}>
              {activeUrl}
            </Text>

            {serverPing && (
              <Text
                variant="caption"
                style={{
                  color: serverPing.includes('Online') ? colors.success : colors.danger,
                  fontSize: 11,
                  fontWeight: '600',
                  marginBottom: spacing.xs,
                }}
              >
                {serverPing}
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={[
                  styles.endpointBtn,
                  {
                    borderRadius: radius.xs,
                    borderColor: activeUrl.includes('doit.samyukt.pro') ? colors.accent : colors.border,
                    backgroundColor: activeUrl.includes('doit.samyukt.pro') ? colors.surface : 'transparent',
                  },
                ]}
                onPress={() => handleSwitchServer('https://doit.samyukt.pro/api/v1')}
              >
                <Text
                  variant="caption"
                  style={{
                    fontSize: 10,
                    fontWeight: activeUrl.includes('doit.samyukt.pro') ? '600' : '400',
                    color: activeUrl.includes('doit.samyukt.pro') ? colors.accentText : colors.textSecondary,
                  }}
                >
                  Production
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.endpointBtn,
                  {
                    borderRadius: radius.xs,
                    borderColor: activeUrl.includes('192.168.1.67') ? colors.accent : colors.border,
                    backgroundColor: activeUrl.includes('192.168.1.67') ? colors.surface : 'transparent',
                  },
                ]}
                onPress={() => handleSwitchServer('http://192.168.1.67:3000/api/v1')}
              >
                <Text
                  variant="caption"
                  style={{
                    fontSize: 10,
                    fontWeight: activeUrl.includes('192.168.1.67') ? '600' : '400',
                    color: activeUrl.includes('192.168.1.67') ? colors.accentText : colors.textSecondary,
                  }}
                >
                  Wi-Fi (192.168.1.67)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.endpointBtn,
                  {
                    borderRadius: radius.xs,
                    borderColor: activeUrl.includes('localhost') ? colors.accent : colors.border,
                    backgroundColor: activeUrl.includes('localhost') ? colors.surface : 'transparent',
                  },
                ]}
                onPress={() => handleSwitchServer('http://localhost:3000/api/v1')}
              >
                <Text
                  variant="caption"
                  style={{
                    fontSize: 10,
                    fontWeight: activeUrl.includes('localhost') ? '600' : '400',
                    color: activeUrl.includes('localhost') ? colors.accentText : colors.textSecondary,
                  }}
                >
                  USB (localhost)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Bottom Sheet Modal */}
      <Modal
        visible={showForgotSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotSheet(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowForgotSheet(false)}
          />
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              maxHeight: '85%',
              overflow: 'hidden',
            }}
          >
            <ScrollView
              contentContainerStyle={{
                padding: spacing.xl,
                gap: spacing.md,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="title" style={{ fontWeight: '600' }}>
                  Reset Password
                </Text>
                <TouchableOpacity
                  onPress={() => setShowForgotSheet(false)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text variant="label" color="tertiary" style={{ fontSize: 16 }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text variant="body" color="secondary" style={{ fontSize: 13, lineHeight: 18 }}>
                Enter your account email and a new password to reset your credentials and sign in immediately.
              </Text>

              {forgotSuccess ? (
                <View
                  style={{
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.success,
                    borderWidth: 1,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    gap: spacing.xs,
                  }}
                >
                  <Text variant="label" style={{ color: colors.success, fontWeight: '600' }}>
                    ✓ Password Reset Successfully
                  </Text>
                  <Text variant="caption" color="secondary" style={{ lineHeight: 18 }}>
                    Your password has been updated. Credentials have been prefilled in the sign-in form.
                  </Text>
                  <View style={{ marginTop: spacing.sm }}>
                    <Button
                      title="Sign In with New Password"
                      variant="primary"
                      size="sm"
                      fullWidth
                      onPress={() => setShowForgotSheet(false)}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ gap: spacing.md }}>
                  {forgotError && (
                    <View
                      style={{
                        backgroundColor: colors.surfaceRaised,
                        borderColor: colors.danger,
                        borderWidth: 1,
                        borderRadius: radius.sm,
                        padding: spacing.sm,
                      }}
                    >
                      <Text variant="caption" color="danger">
                        {forgotError}
                      </Text>
                    </View>
                  )}

                  <Input
                    label="Email Address"
                    placeholder="Enter your account email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing.xs,
                      }}
                    >
                      <Text variant="label" color="secondary">
                        New Password (min 8 chars)
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowForgotNewPassword((prev) => !prev)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 }}
                      >
                        {showForgotNewPassword ? (
                          <EyeOff size={14} color={colors.accent} />
                        ) : (
                          <Eye size={14} color={colors.accent} />
                        )}
                        <Text
                          variant="caption"
                          style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}
                        >
                          {showForgotNewPassword ? 'Hide' : 'Show'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Input
                      placeholder="Enter new password"
                      value={forgotNewPassword}
                      onChangeText={setForgotNewPassword}
                      secureTextEntry={!showForgotNewPassword}
                      isPassword
                      suffix={
                        <TouchableOpacity
                          onPress={() => setShowForgotNewPassword((prev) => !prev)}
                          accessibilityRole="button"
                          accessibilityLabel={showForgotNewPassword ? 'Hide password' : 'Show password'}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          style={{ padding: 4, justifyContent: 'center', alignItems: 'center' }}
                        >
                          {showForgotNewPassword ? (
                            <EyeOff size={18} color={colors.accent} />
                          ) : (
                            <Eye size={18} color={colors.textSecondary} />
                          )}
                        </TouchableOpacity>
                      }
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Cancel"
                        variant="secondary"
                        fullWidth
                        onPress={() => setShowForgotSheet(false)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Reset Password"
                        variant="primary"
                        fullWidth
                        loading={forgotLoading}
                        onPress={handleForgotSubmit}
                      />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
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
  serverCard: {
    borderWidth: 1,
    width: '100%',
  },
  endpointBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
});
