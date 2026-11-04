import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Chip } from '../../../components/ui';
import { useWorkspaceStore } from '../store';
import { useAuthStore } from '../../auth/store';
import { http } from '../../../lib/http';
import {
  ArrowLeft,
  UserPlus,
  Users,
  Mail,
  Link2,
  Share2,
  Copy,
  Check,
  Trash2,
  Send,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';

interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'TESTER' | 'VIEWER';
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

interface Invitation {
  id: string;
  email?: string | null;
  role: 'ADMIN' | 'TESTER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    name: string;
    email: string;
  };
}

export const TeamMembersScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Invite Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteType, setInviteType] = useState<'email' | 'link'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'TESTER' | 'ADMIN' | 'VIEWER'>('TESTER');
  const [inviteMaxUses, setInviteMaxUses] = useState(1);
  const [inviteDays, setInviteDays] = useState(7);
  const [generatedResult, setGeneratedResult] = useState<{
    url: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const workspaceId = activeWorkspace?.id;

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const [membersData, invitesData] = await Promise.all([
        http.get<Member[]>(`/workspaces/${workspaceId}/members`).catch(() => []),
        http.get<Invitation[]>(`/workspaces/${workspaceId}/invitations`).catch(() => []),
      ]);
      setMembers(membersData || []);
      setInvitations(invitesData || []);
    } catch (err) {
      console.warn('Failed to load team data', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateInvitation = async () => {
    if (!workspaceId) return;
    try {
      setActionLoading(true);
      const payload = {
        email: inviteType === 'email' ? inviteEmail.trim().toLowerCase() : null,
        role: inviteRole,
        maxUses: inviteType === 'link' ? inviteMaxUses : 1,
        expiresInDays: inviteDays,
      };

      const res: any = await http.post(`/workspaces/${workspaceId}/invitations`, payload);
      setGeneratedResult({
        url: res.inviteUrl,
        emailSent: res.emailSent,
        emailError: res.emailError,
      });

      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async (url: string) => {
    try {
      await Share.share({
        message: `Join our "${activeWorkspace?.name || 'DoIt'}" workspace on DoIt: ${url}`,
        title: `Join ${activeWorkspace?.name || 'DoIt'} Workspace`,
      });
    } catch (err) {
      console.warn('Share error', err);
    }
  };

  const handleRevoke = (invitationId: string) => {
    Alert.alert(
      'Revoke Invitation',
      'Are you sure you want to revoke this invitation? Anyone with this link will no longer be able to join.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            if (!workspaceId) return;
            try {
              setActionLoading(true);
              await http.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
              await loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to revoke');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleResend = async (invitationId: string) => {
    if (!workspaceId) return;
    try {
      setActionLoading(true);
      const res: any = await http.post(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {});
      if (res.emailSent) {
        Alert.alert('Success', 'Invitation email resent successfully!');
      } else {
        Alert.alert(
          'Email Notice',
          res.emailError || 'Email could not be delivered. Please share the link manually.',
        );
      }
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = (member: Member) => {
    Alert.alert(
      'Remove Teammate',
      `Are you sure you want to remove ${member.user.name} from this workspace?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!workspaceId) return;
            try {
              setActionLoading(true);
              await http.delete(`/workspaces/${workspaceId}/members/${member.id}`);
              await loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove member');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderRoleBadge = (role: string) => {
    let bg = colors.surfaceRaised;
    let textColor = colors.textSecondary;
    if (role === 'OWNER') {
      bg = '#3B1F63';
      textColor = '#D8B4FE';
    } else if (role === 'ADMIN') {
      bg = '#1E1B4B';
      textColor = '#A5B4FC';
    } else if (role === 'TESTER') {
      bg = '#064E3B';
      textColor = '#6EE7B7';
    }

    return (
      <View style={[styles.roleBadge, { backgroundColor: bg }]}>
        <Text style={[styles.roleText, { color: textColor }]}>{role}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Team & Members
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {activeWorkspace?.name || 'Workspace'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.inviteHeaderBtn, { backgroundColor: colors.accent }]}
          onPress={() => {
            setGeneratedResult(null);
            setInviteEmail('');
            setModalVisible(true);
          }}
        >
          <UserPlus size={16} color="#FFFFFF" />
          <Text style={styles.inviteHeaderBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface1 }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'members' && { backgroundColor: colors.surface2 },
          ]}
          onPress={() => setActiveTab('members')}
        >
          <Users size={16} color={activeTab === 'members' ? colors.accent : colors.textMuted} />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'members' ? colors.textPrimary : colors.textMuted },
            ]}
          >
            Members ({members.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'invitations' && { backgroundColor: colors.surface2 },
          ]}
          onPress={() => setActiveTab('invitations')}
        >
          <Clock size={16} color={activeTab === 'invitations' ? colors.accent : colors.textMuted} />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'invitations' ? colors.textPrimary : colors.textMuted },
            ]}
          >
            Invitations ({invitations.filter((i) => i.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      ) : activeTab === 'members' ? (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>No members found.</Text>
            </View>
          ) : (
            members.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface1, borderRadius: radius.lg },
                ]}
              >
                <View style={styles.memberLeft}>
                  <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}>
                    <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
                      {m.user?.name ? m.user.name.substring(0, 2).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.memberMeta}>
                    <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                      {m.user?.name || 'Teammate'}
                      {m.user?.id === currentUser?.id ? ' (You)' : ''}
                    </Text>
                    <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>
                      {m.user?.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.memberRight}>
                  {renderRoleBadge(m.role)}
                  {m.role !== 'OWNER' && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(m)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.trashBtn}
                    >
                      <Trash2 size={16} color="#F87171" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {invitations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                No invitations found. Tap &quot;Invite&quot; above to create one.
              </Text>
            </View>
          ) : (
            invitations.map((inv) => (
              <View
                key={inv.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface1, borderRadius: radius.lg },
                ]}
              >
                <View style={styles.inviteTop}>
                  <View style={styles.inviteIconWrap}>
                    {inv.email ? (
                      <Mail size={16} color="#818CF8" />
                    ) : (
                      <Link2 size={16} color="#34D399" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inviteTitle, { color: colors.textPrimary }]}>
                      {inv.email || 'Open Shareable Link'}
                    </Text>
                    <Text style={[styles.inviteSub, { color: colors.textMuted }]}>
                      Role: {inv.role} &bull; Uses: {inv.usesCount}/{inv.maxUses} &bull; Expires:{' '}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      inv.status === 'PENDING'
                        ? { backgroundColor: '#451A03' }
                        : inv.status === 'ACCEPTED'
                        ? { backgroundColor: '#064E3B' }
                        : { backgroundColor: '#27272A' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        inv.status === 'PENDING'
                          ? { color: '#FCD34D' }
                          : inv.status === 'ACCEPTED'
                          ? { color: '#6EE7B7' }
                          : { color: '#A1A1AA' },
                      ]}
                    >
                      {inv.status}
                    </Text>
                  </View>
                </View>

                {inv.status === 'PENDING' && (
                  <View style={styles.inviteActionsRow}>
                    {inv.email && (
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: colors.surface2 }]}
                        onPress={() => handleResend(inv.id)}
                      >
                        <Send size={13} color={colors.textSecondary} />
                        <Text style={[styles.smallActionText, { color: colors.textSecondary }]}>
                          Resend
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.smallActionBtn, { backgroundColor: '#450A0A' }]}
                      onPress={() => handleRevoke(inv.id)}
                    >
                      <Trash2 size={13} color="#FCA5A5" />
                      <Text style={[styles.smallActionText, { color: '#FCA5A5' }]}>Revoke</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Invite Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface1, borderRadius: radius.xl }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Invite Teammate
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!generatedResult ? (
              <View style={styles.modalBody}>
                {/* Type toggle */}
                <View style={[styles.toggleWrap, { backgroundColor: colors.surface2 }]}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      inviteType === 'email' && { backgroundColor: colors.surfaceRaised },
                    ]}
                    onPress={() => setInviteType('email')}
                  >
                    <Mail size={14} color={inviteType === 'email' ? colors.accent : colors.textMuted} />
                    <Text
                      style={[
                        styles.toggleText,
                        { color: inviteType === 'email' ? colors.textPrimary : colors.textMuted },
                      ]}
                    >
                      Email Invite
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      inviteType === 'link' && { backgroundColor: colors.surfaceRaised },
                    ]}
                    onPress={() => setInviteType('link')}
                  >
                    <Link2 size={14} color={inviteType === 'link' ? colors.accent : colors.textMuted} />
                    <Text
                      style={[
                        styles.toggleText,
                        { color: inviteType === 'link' ? colors.textPrimary : colors.textMuted },
                      ]}
                    >
                      Shareable Link
                    </Text>
                  </TouchableOpacity>
                </View>

                {inviteType === 'email' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Email Address
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surface2,
                          color: colors.textPrimary,
                          borderRadius: radius.md,
                        },
                      ]}
                      placeholder="colleague@company.com"
                      placeholderTextColor={colors.textMuted}
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {/* Role selection */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Assigned Role
                  </Text>
                  <View style={styles.chipRow}>
                    {(['TESTER', 'ADMIN', 'VIEWER'] as const).map((r) => (
                      <Chip
                        key={r}
                        label={r}
                        selected={inviteRole === r}
                        onPress={() => setInviteRole(r)}
                      />
                    ))}
                  </View>
                </View>

                {/* Usage limit for links */}
                {inviteType === 'link' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Maximum Uses
                    </Text>
                    <View style={styles.chipRow}>
                      {[1, 5, 10, 50].map((num) => (
                        <Chip
                          key={num}
                          label={`${num} ${num === 1 ? 'use' : 'uses'}`}
                          selected={inviteMaxUses === num}
                          onPress={() => setInviteMaxUses(num)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Expiration */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Expires In
                  </Text>
                  <View style={styles.chipRow}>
                    {[7, 14, 30].map((d) => (
                      <Chip
                        key={d}
                        label={`${d} days`}
                        selected={inviteDays === d}
                        onPress={() => setInviteDays(d)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <Button
                    variant="ghost"
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="primary"
                    title={
                      actionLoading
                        ? 'Creating...'
                        : inviteType === 'email'
                        ? 'Send Invite'
                        : 'Generate Link'
                    }
                    disabled={actionLoading || (inviteType === 'email' && !inviteEmail.includes('@'))}
                    onPress={handleCreateInvitation}
                    style={{ flex: 1.5 }}
                  />
                </View>
              </View>
            ) : (
              /* Success / Result Screen */
              <View style={styles.modalBody}>
                <View style={[styles.resultBanner, { backgroundColor: '#064E3B' }]}>
                  <CheckCircle2 size={16} color="#6EE7B7" />
                  <Text style={styles.resultBannerText}>
                    {generatedResult.emailSent
                      ? 'Email invitation delivered!'
                      : 'Shareable invitation link created!'}
                  </Text>
                </View>

                <View style={[styles.urlBox, { backgroundColor: colors.surface2, borderRadius: radius.md }]}>
                  <Text style={[styles.urlText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {generatedResult.url}
                  </Text>
                </View>

                <View style={styles.resultBtnRow}>
                  <Button
                    variant="secondary"
                    icon={<Copy size={16} color={colors.textPrimary} />}
                    title={copied ? 'Copied!' : 'Copy Link'}
                    onPress={() => handleCopyLink(generatedResult.url)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="primary"
                    icon={<Share2 size={16} color="#FFFFFF" />}
                    title="Share"
                    onPress={() => handleShareLink(generatedResult.url)}
                    style={{ flex: 1 }}
                  />
                </View>

                <Button
                  variant="ghost"
                  title="Done"
                  onPress={() => setModalVisible(false)}
                  style={{ marginTop: 8 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  inviteHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  inviteHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  card: {
    padding: 14,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberMeta: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  memberRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trashBtn: {
    padding: 6,
  },
  inviteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inviteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E1E26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  inviteSub: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inviteActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#26262E',
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalBody: {
    gap: 14,
  },
  toggleWrap: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  resultBannerText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
  },
  urlBox: {
    padding: 12,
  },
  urlText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  resultBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
