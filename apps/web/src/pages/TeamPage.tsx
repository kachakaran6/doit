import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { api } from '@/lib/api';
import { WorkspaceMember } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { RoleBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  UserPlus,
  Mail,
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  Trash2,
} from 'lucide-react';

export function TeamPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<'email' | 'link'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER'>('MEMBER');
  const [inviteExpiresDays, setInviteExpiresDays] = useState(7);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Member delete dialog
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);

  // 1. Fetch workspace members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['workspace-members', wsId],
    queryFn: () => (wsId ? api.workspaces.members(wsId) : []),
    enabled: Boolean(wsId),
  });

  // 2. Fetch pending invitations
  const { data: invitations = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['workspace-invitations', wsId],
    queryFn: () => (wsId ? api.workspaces.invitations(wsId) : []),
    enabled: Boolean(wsId),
  });

  // 3. Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      api.workspaces.updateRole(wsId!, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', wsId] });
      success('Role updated', 'Member permission level changed.');
    },
    onError: (err: any) => {
      error('Failed to update role', err.message);
    },
  });

  // 4. Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.workspaces.removeMember(wsId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', wsId] });
      setMemberToRemove(null);
      success('Member removed', 'Access revoked.');
    },
    onError: (err: any) => {
      error('Failed to remove member', err.message);
    },
  });

  // 5. Revoke invitation mutation
  const revokeInviteMutation = useMutation({
    mutationFn: (inviteId: string) => api.workspaces.revokeInvitation(wsId!, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations', wsId] });
      success('Invitation revoked', 'Link is no longer valid.');
    },
    onError: (err: any) => {
      error('Failed to revoke invitation', err.message);
    },
  });

  // 6. Resend email invitation mutation
  const resendInviteMutation = useMutation({
    mutationFn: (inviteId: string) => api.workspaces.resendInvitation(wsId!, inviteId),
    onSuccess: () => {
      success('Invitation resent', 'Email sent to teammate.');
    },
    onError: (err: any) => {
      error('Failed to resend email', err.message);
    },
  });

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsId) return;

    try {
      setInviteLoading(true);
      const isEmail = inviteTab === 'email';
      const res = await api.workspaces.invite(wsId, {
        email: isEmail ? inviteEmail.trim() : null,
        role: inviteRole,
        expiresInDays: inviteExpiresDays,
      });

      const inviteUrl = (res as any).inviteUrl || `https://doit.kachakaran.tech/invite/${res.tokenHash || res.id}`;

      if (isEmail) {
        if ((res as any).emailSent) {
          success('Invitation sent', `Email delivered to ${inviteEmail}`);
        } else {
          info('Invitation created', 'Email service not configured, but shareable link is ready below.');
        }
      } else {
        success('Link generated', 'Share this link with your teammate.');
      }

      setGeneratedLink(inviteUrl);
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations', wsId] });
    } catch (err: any) {
      error('Failed to create invitation', err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Copied to clipboard', text);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <PageContainer width="data" className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Team & Members</h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
            Manage teammates, roles, and invitation links for {activeWorkspace?.name || 'this workspace'}.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setGeneratedLink(null);
          setInviteEmail('');
          setInviteModalOpen(true);
        }}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Invite teammate</span>
        </Button>
      </div>

      {/* Members Table */}
      <Card variant="bordered">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active members</CardTitle>
            <CardDescription>{members.length} people with workspace access</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {membersLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[var(--muted-foreground)]">
              No members found.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--accent)] px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={member.user.name} email={member.user.email} size="md" />
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[var(--foreground)] truncate">
                        {member.user.name}
                      </div>
                      <div className="text-[12px] text-[var(--muted-foreground)] truncate">
                        {member.user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Role changer for non-owners */}
                    {member.role !== 'OWNER' ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            memberId: member.id,
                            role: e.target.value,
                          })
                        }
                        className="rounded-lg bg-[var(--muted)] border border-[var(--border)] px-2 py-1 text-[12px] font-medium text-[var(--foreground)] focus:outline-none"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                        <option value="TESTER">Tester</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    ) : (
                      <RoleBadge role="OWNER" />
                    )}

                    {member.role !== 'OWNER' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setMemberToRemove(member)}
                        className="text-[var(--danger-text)] hover:bg-[rgba(201,60,53,0.1)]"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations Table */}
      <Card variant="bordered">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>Invites waiting for teammate acceptance</CardDescription>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--muted)] text-[var(--muted-foreground)] tabular">
            {invitations.length}
          </span>
        </CardHeader>

        <CardContent>
          {invitesLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-[var(--muted-foreground)]">
              No pending invitations. Click "Invite teammate" to invite members via email or shareable link.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--accent)] px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
                        {inv.email || 'Shareable link invitation'}
                      </span>
                      <RoleBadge role={inv.role} />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--muted-foreground)]">
                      <span>Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {inv.email && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => resendInviteMutation.mutate(inv.id)}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        <span>Resend</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => revokeInviteMutation.mutate(inv.id)}
                      className="text-[var(--danger-text)] hover:bg-[rgba(201,60,53,0.1)]"
                      title="Revoke invitation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Teammate Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite teammate"
        description="Invite coworkers to collaborate on tasks, report bugs, and view sprint progress."
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Method Tabs: Email vs Shareable Link */}
          <div className="flex rounded-lg bg-[var(--muted)] p-1">
            <button
              type="button"
              onClick={() => {
                setInviteTab('email');
                setGeneratedLink(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                inviteTab === 'email'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email invitation</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInviteTab('link');
                setGeneratedLink(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                inviteTab === 'link'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Shareable link</span>
            </button>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-4">
            {inviteTab === 'email' && (
              <Input
                label="Teammate's email address"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
                required
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[13px] font-medium text-[var(--foreground)]">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus:outline-none"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="TESTER">Tester</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[13px] font-medium text-[var(--foreground)]">
                  Expires in
                </label>
                <select
                  value={inviteExpiresDays}
                  onChange={(e) => setInviteExpiresDays(Number(e.target.value))}
                  className="flex h-9 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus:outline-none"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            </div>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[12px] font-medium text-[var(--foreground)]">
                  <span>Invitation link ready</span>
                  <span className="text-[11px] text-[var(--success-text)] font-semibold">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-[var(--card)] border border-[var(--input)] rounded-lg px-2.5 py-1 text-[12px] font-mono text-[var(--foreground)] truncate select-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleCopy(generatedLink)}
                  >
                    {copied ? <Check className="w-3 h-3 text-[var(--success-text)]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInviteModalOpen(false)}
              >
                Done
              </Button>
              <Button type="submit" size="sm" loading={inviteLoading}>
                {inviteTab === 'email' ? 'Send invitation' : 'Generate link'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Remove Member Confirmation */}
      {memberToRemove && (
        <ConfirmDialog
          open={Boolean(memberToRemove)}
          onClose={() => setMemberToRemove(null)}
          onConfirm={() => removeMemberMutation.mutate(memberToRemove.id)}
          title="Remove member?"
          description={`Are you sure you want to remove ${memberToRemove.user.name} (${memberToRemove.user.email}) from this workspace? They will lose access immediately.`}
          confirmLabel="Remove member"
          danger
          loading={removeMemberMutation.isPending}
        />
      )}
    </PageContainer>
  );
}
