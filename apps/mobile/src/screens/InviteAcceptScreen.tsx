import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { Text, Button, Input } from '../components/ui';
import { useAuthStore } from '../features/auth/store';
import { useWorkspaceStore } from '../features/workspace/store';
import { useLoginMutation, useRegisterMutation } from '../features/auth/api/mutations';
import { http } from '../lib/http';
import { RootStackParamList } from '../navigation/types';
import {
  markInviteTokenConsumed,
  isInviteTokenConsumed,
  setPendingInviteToken,
  clearPendingInviteToken,
} from '../navigation/invite-link';
import { CheckCircle2, AlertTriangle, Users, ArrowRight } from 'lucide-react-native';

type InviteAcceptRouteProp = RouteProp<RootStackParamList, 'InviteAccept'>;

export const InviteAcceptScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const route = useRoute<InviteAcceptRouteProp>();
  const navigation = useNavigation<any>();
  const token = route.params?.token;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(Boolean(token));
  const [valid, setValid] = useState<boolean | null>(null);
  const [inviteData, setInviteData] = useState<{
    workspace?: { id: string; name: string; slug: string };
    role?: string;
    invitedBy?: string;
    allowedEmail?: string | null;
    expiresAt?: string;
    reason?: string;
  } | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Unauthenticated inline onboarding state
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  useEffect(() => {
    if (!token || isInviteTokenConsumed(token)) {
      navigation.reset({
        index: 0,
        routes: [{ name: isAuthenticated ? 'MainTabs' : 'Auth' }],
      });
      return;
    }
    setPendingInviteToken(token);
    validateToken();
  }, [token, isAuthenticated]);

  const validateToken = async () => {
    if (!token || isInviteTokenConsumed(token)) {
      setValid(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res: any = await http.get(`/invitations/validate/${token}`);
      if (res && res.valid) {
        setValid(true);
        setInviteData(res);
        if (res.allowedEmail) {
          setAuthEmail(res.allowedEmail);
        }
      } else {
        markInviteTokenConsumed(token);
        clearPendingInviteToken();
        setValid(false);
        setInviteData(res);
      }
    } catch {
      markInviteTokenConsumed(token);
      clearPendingInviteToken();
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    try {
      setAccepting(true);
      const res: any = await http.post('/invitations/accept', { token });
      if (res && res.success) {
        markInviteTokenConsumed(token);
        clearPendingInviteToken();
        // Refresh workspaces list
        await useWorkspaceStore.getState().fetchAndInitializeWorkspaces();
        Alert.alert(
          'Welcome to ' + (res.workspace?.name || 'Workspace'),
          `You have joined as ${res.role}!`,
          [
            {
              text: 'Open Workspace',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              },
            },
          ],
        );
      }
    } catch (err: any) {
      Alert.alert('Error Joining', err.message || 'Could not accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleAuthAndAccept = async () => {
    setAuthError(null);
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    try {
      setAccepting(true);
      if (authMode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          setAccepting(false);
          return;
        }
        await registerMutation.mutateAsync({
          fullName: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
        });
      } else {
        await loginMutation.mutateAsync({
          email: authEmail.trim(),
          password: authPassword,
        });
      }

      // Automatically accept after auth
      const res: any = await http.post('/invitations/accept', { token });
      markInviteTokenConsumed(token);
      clearPendingInviteToken();
      await useWorkspaceStore.getState().fetchAndInitializeWorkspaces();

      Alert.alert(
        'Welcome to ' + (res?.workspace?.name || 'Workspace'),
        `You have joined as ${res?.role || 'member'}!`,
        [
          {
            text: 'Open Workspace',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication or invitation acceptance failed.');
    } finally {
      setAccepting(false);
    }
  };

  const handleGoToAuth = () => {
    navigation.navigate('Auth');
  };

  if (!token) {
    return <View style={[styles.container, { backgroundColor: colors.bg }]} />;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.subText, { color: colors.textSecondary, marginTop: 16 }]}>
          Validating invitation...
        </Text>
      </View>
    );
  }

  if (!valid) {
    const reasonMsg =
      inviteData?.reason === 'EXPIRED'
        ? 'This invitation link has expired.'
        : inviteData?.reason === 'REVOKED'
        ? 'This invitation link was revoked by an administrator.'
        : inviteData?.reason === 'MAX_USES_REACHED'
        ? 'This invitation link has reached its maximum uses.'
        : 'The invitation link is invalid or could not be found.';

    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.bg, padding: 24 }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#450A0A' }]}>
          <AlertTriangle size={32} color="#F87171" />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary, marginTop: 16 }]}>
          Invitation Unavailable
        </Text>
        <Text style={[styles.subText, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
          {reasonMsg}
        </Text>

        <Button
          variant="secondary"
          title="Go Back"
          onPress={() => {
            markInviteTokenConsumed(token);
            clearPendingInviteToken();
            navigation.reset({
              index: 0,
              routes: [{ name: isAuthenticated ? 'MainTabs' : 'Auth' }],
            });
          }}
          style={{ marginTop: 24, minWidth: 160 }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/icon.png')}
          style={{ width: 64, height: 64, borderRadius: radius.xl, marginBottom: 16, alignSelf: 'center' }}
          resizeMode="contain"
        />

        <View style={[styles.brandCard, { backgroundColor: colors.surface1, borderRadius: radius.xl }]}>
          <View style={styles.brandIcon}>
            <Users size={32} color={colors.accent} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary, textAlign: 'center' }]}>
            Join {inviteData?.workspace?.name || 'Workspace'}
          </Text>

          <Text style={[styles.subText, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{inviteData?.invitedBy || 'A teammate'}</Text> has invited you to collaborate on DoIt with the role of{' '}
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{inviteData?.role || 'member'}</Text>.
          </Text>

          {isAuthenticated && currentUser ? (
            /* Authenticated user: One-tap join */
            <View style={{ marginTop: 20 }}>
              <View style={[styles.userBox, { backgroundColor: colors.surface2, borderRadius: radius.md, marginBottom: 20 }]}>
                <Text style={[styles.userLabel, { color: colors.textMuted }]}>Joining as:</Text>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{currentUser.fullName || currentUser.email}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{currentUser.email}</Text>
              </View>

              <Button
                variant="primary"
                icon={<CheckCircle2 size={18} color="#FFFFFF" />}
                title={accepting ? 'Joining Workspace...' : 'Accept & Join Workspace'}
                disabled={accepting}
                onPress={handleAccept}
              />
            </View>
          ) : (
            /* Unauthenticated user: Inline signup/signin so they never lose invite */
            <View style={{ marginTop: 20 }}>
              <View style={[styles.tabBar, { backgroundColor: colors.surface2, borderRadius: radius.md }]}>
                <TouchableOpacity
                  onPress={() => setAuthMode('signup')}
                  style={[
                    styles.tabButton,
                    authMode === 'signup' && [styles.activeTab, { backgroundColor: colors.surface1 }],
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: authMode === 'signup' ? colors.textPrimary : colors.textMuted, fontWeight: authMode === 'signup' ? '700' : '500' },
                    ]}
                  >
                    Create Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAuthMode('signin')}
                  style={[
                    styles.tabButton,
                    authMode === 'signin' && [styles.activeTab, { backgroundColor: colors.surface1 }],
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: authMode === 'signin' ? colors.textPrimary : colors.textMuted, fontWeight: authMode === 'signin' ? '700' : '500' },
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              {authError ? (
                <View style={[styles.errorBox, { backgroundColor: '#450A0A', borderRadius: radius.sm }]}>
                  <Text style={{ color: '#FCA5A5', fontSize: 12 }}>{authError}</Text>
                </View>
              ) : null}

              <View style={{ gap: 12, marginTop: 12 }}>
                {authMode === 'signup' && (
                  <Input
                    label="Full Name"
                    placeholder="Alice Sharma"
                    value={authName}
                    onChangeText={setAuthName}
                  />
                )}

                <Input
                  label={inviteData?.allowedEmail ? 'Email (Locked to invitation)' : 'Email'}
                  placeholder="you@example.com"
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={Boolean(inviteData?.allowedEmail)}
                />

                <Input
                  label="Password"
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChangeText={setAuthPassword}
                  secureTextEntry
                />

                <Button
                  variant="primary"
                  icon={<ArrowRight size={18} color="#FFFFFF" />}
                  title={
                    accepting
                      ? 'Joining Workspace...'
                      : authMode === 'signup'
                      ? 'Create Account & Join'
                      : 'Sign In & Join'
                  }
                  disabled={accepting}
                  onPress={handleAuthAndAccept}
                  style={{ marginTop: 8 }}
                />

                <TouchableOpacity
                  onPress={handleGoToAuth}
                  style={{ alignSelf: 'center', paddingVertical: 8 }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 12, textDecorationLine: 'underline' }}>
                    Or use standard sign-in screen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  brandIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userBox: {
    padding: 12,
  },
  userLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
  },
  errorBox: {
    marginTop: 10,
    padding: 8,
  },
});
