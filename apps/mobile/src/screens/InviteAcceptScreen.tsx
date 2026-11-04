import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { Text, Button } from '../components/ui';
import { useAuthStore } from '../features/auth/store';
import { useWorkspaceStore } from '../features/workspace/store';
import { http } from '../lib/http';
import { RootStackParamList } from '../navigation/types';
import { CheckCircle2, AlertTriangle, Users, ArrowRight } from 'lucide-react-native';

type InviteAcceptRouteProp = RouteProp<RootStackParamList, 'InviteAccept'>;

export const InviteAcceptScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const route = useRoute<InviteAcceptRouteProp>();
  const navigation = useNavigation<any>();
  const token = route.params?.token;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
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
      } else {
        setValid(false);
        setInviteData(res);
      }
    } catch {
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

  const handleGoToAuth = () => {
    // Navigate to Auth screen
    navigation.navigate('Auth');
  };

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
          onPress={() => navigation.navigate(isAuthenticated ? 'MainTabs' : 'Auth')}
          style={{ marginTop: 24, minWidth: 160 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.center, { backgroundColor: colors.bg, padding: 24 }]}>
      <View style={[styles.brandCard, { backgroundColor: colors.surface1, borderRadius: radius.xl }]}>
        <View style={styles.brandIcon}>
          <Users size={32} color={colors.accent} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary, textAlign: 'center' }]}>
          Join {inviteData?.workspace?.name}
        </Text>

        <Text style={[styles.subText, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
          <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{inviteData?.invitedBy}</Text> has invited you to collaborate on DoIt with the role of{' '}
          <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{inviteData?.role}</Text>.
        </Text>

        {isAuthenticated && currentUser ? (
          <View style={[styles.userBox, { backgroundColor: colors.surface2, borderRadius: radius.md }]}>
            <Text style={[styles.userLabel, { color: colors.textMuted }]}>Joining as:</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{currentUser.fullName || currentUser.email}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{currentUser.email}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 20 }}>
          {isAuthenticated ? (
            <Button
              variant="primary"
              icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              title={accepting ? 'Joining Workspace...' : 'Accept & Join'}
              disabled={accepting}
              onPress={handleAccept}
            />
          ) : (
            <Button
              variant="primary"
              icon={<ArrowRight size={18} color="#FFFFFF" />}
              title="Sign In to Join"
              onPress={handleGoToAuth}
            />
          )}
        </View>
      </View>
    </View>
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
  brandCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    marginTop: 16,
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
});
