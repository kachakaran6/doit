import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  Trash2,
  Server,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

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

export function TeamPage() {
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState<string>('DoIt Workspace');
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTab, setInviteTab] = useState<'email' | 'link'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'TESTER' | 'VIEWER'>('TESTER');
  const [inviteMaxUses, setInviteMaxUses] = useState(1);
  const [inviteExpiresDays, setInviteExpiresDays] = useState(7);
  const [generatedInvite, setGeneratedInvite] = useState<{
    url: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // SMTP Settings state
  const [showSmtpSection, setShowSmtpSection] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'DoIt',
    secure: false,
    enabled: true,
    hasPassword: false,
    configured: false,
  });
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const wsList = await api.workspaces.list().catch(() => null);
      let activeWsId = '';
      if (wsList && wsList.length > 0) {
        activeWsId = wsList[0].id;
        setWorkspaceId(activeWsId);
        setWorkspaceName(wsList[0].name);
      }

      if (activeWsId) {
        await Promise.all([
          loadMembers(activeWsId),
          loadInvitations(activeWsId),
          loadSmtpConfig(),
        ]);
      } else {
        await loadSmtpConfig();
      }
    } catch (err: any) {
      console.error('Failed to load team data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (wsId: string) => {
    try {
      const data = await api.workspaces.members(wsId);
      setMembers(data);
    } catch (err) {
      console.warn('Could not load members', err);
    }
  };

  const loadInvitations = async (wsId: string) => {
    try {
      const data = await api.workspaces.invitations(wsId);
      setInvitations(data);
    } catch (err) {
      console.warn('Could not load invitations', err);
    }
  };

  const loadSmtpConfig = async () => {
    try {
      const config = await api.smtp.get();
      if (config) {
        setSmtpConfig((prev) => ({
          ...prev,
          host: config.host || '',
          port: config.port || 587,
          username: config.username || '',
          fromEmail: config.fromEmail || '',
          fromName: config.fromName || 'DoIt',
          secure: config.secure || false,
          enabled: config.enabled ?? true,
          hasPassword: config.hasPassword || false,
          configured: config.configured || false,
        }));
      }
    } catch (err) {
      console.warn('Could not load SMTP config', err);
    }
  };

  const handleCreateInvitation = async () => {
    if (!workspaceId) return;
    try {
      setActionLoading(true);
      setStatusMsg(null);

      const payload = {
        email: inviteTab === 'email' ? inviteEmail.trim() : null,
        role: inviteRole,
        maxUses: inviteTab === 'link' ? inviteMaxUses : 1,
        expiresInDays: inviteExpiresDays,
      };

      const result = await api.workspaces.invite(workspaceId, payload);
      setGeneratedInvite({
        url: result.inviteUrl,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });

      await loadInvitations(workspaceId);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create invitation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!workspaceId) return;
    try {
      setActionLoading(true);
      await api.workspaces.revokeInvitation(workspaceId, invitationId);
      setStatusMsg({ type: 'success', text: 'Invitation revoked successfully' });
      await loadInvitations(workspaceId);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to revoke invitation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    if (!workspaceId) return;
    try {
      setActionLoading(true);
      const res = await api.workspaces.resendInvitation(workspaceId, invitationId);
      if (res.emailSent) {
        setStatusMsg({ type: 'success', text: 'Invitation email resent successfully' });
      } else {
        setStatusMsg({
          type: 'error',
          text: res.emailError || 'Email could not be delivered. Please copy and share the link manually.',
        });
      }
      await loadInvitations(workspaceId);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to resend invitation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return;
    if (!workspaceId) return;
    try {
      setActionLoading(true);
      await api.workspaces.removeMember(workspaceId, memberId);
      setStatusMsg({ type: 'success', text: `${name} has been removed` });
      await loadMembers(workspaceId);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to remove member' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSmtp = async () => {
    try {
      setActionLoading(true);
      setTestResult(null);
      await api.smtp.save(smtpConfig);
      await loadSmtpConfig();
      setStatusMsg({ type: 'success', text: 'SMTP settings saved successfully' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save SMTP settings' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    try {
      setTestingSmtp(true);
      setTestResult(null);
      const res = await api.smtp.testConnection(smtpConfig);
      setTestResult({ success: res.success, msg: res.message });
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || 'Connection test failed' });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo) {
      alert('Please enter a test recipient email');
      return;
    }
    try {
      setTestingSmtp(true);
      setTestResult(null);
      const res = await api.smtp.sendTest(testEmailTo, smtpConfig);
      setTestResult({ success: res.success, msg: res.message });
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || 'Test email failed' });
    } finally {
      setTestingSmtp(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Top Banner / Notification */}
      {statusMsg && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Team & Teammates
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage teammates, roles, shareable invitation links, and SMTP delivery for{' '}
            <strong>{workspaceName}</strong>
          </p>
        </div>
        <Button
          onClick={() => {
            setGeneratedInvite(null);
            setInviteEmail('');
            setShowInviteModal(true);
          }}
          className="gap-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Teammate</span>
        </Button>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] flex items-center justify-center text-[var(--accent)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-[var(--text-secondary)]">Active Members</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{members.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-[var(--text-secondary)]">Pending Invites</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {invitations.filter((i) => i.status === 'PENDING').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-[var(--text-secondary)]">SMTP Delivery</div>
              <div className="text-sm font-semibold flex items-center gap-1.5 mt-1">
                {smtpConfig.configured && smtpConfig.enabled ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Configured & Active
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" />
                    Shareable Links Only
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
          <CardDescription>All collaborators with access to this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[var(--border)]">
            {members.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                No members found in this workspace.
              </div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--text-primary)]">
                      {m.user?.name ? m.user.name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {m.user?.name || 'Teammate'}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">{m.user?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        m.role === 'OWNER'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                          : m.role === 'ADMIN'
                          ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                          : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/40'
                      }
                    >
                      {m.role}
                    </Badge>

                    {m.role !== 'OWNER' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(m.id, m.user.name)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 p-2"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending & Historical Invitations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Workspace Invitations</CardTitle>
            <CardDescription>Pending and past email invitations & shareable links</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[var(--border)]">
            {invitations.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                No active invitations. Click &quot;Invite Teammate&quot; above to add members.
              </div>
            ) : (
              invitations.map((inv) => (
                <div key={inv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      {inv.email ? (
                        <Mail className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <LinkIcon className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                        {inv.email || 'Open Shareable Link'}
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            inv.status === 'PENDING'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                              : inv.status === 'ACCEPTED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Role: <strong>{inv.role}</strong> &bull; Uses: {inv.usesCount}/{inv.maxUses} &bull; Expires:{' '}
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {inv.status === 'PENDING' && (
                      <>
                        {inv.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleResend(inv.id)}
                            className="text-xs gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Resend</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleRevoke(inv.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* SMTP Email Configuration Card */}
      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setShowSmtpSection(!showSmtpSection)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-[var(--accent)]" />
              <div>
                <CardTitle className="text-base">SMTP Email Server Settings</CardTitle>
                <CardDescription>
                  Configure SMTP credentials for automated email invitations (Optional)
                </CardDescription>
              </div>
            </div>
            <button className="text-[var(--text-muted)] p-1">
              {showSmtpSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </CardHeader>

        {showSmtpSection && (
          <CardContent className="space-y-4 pt-2 border-t border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                placeholder="smtp.example.com"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
              />
              <Input
                label="Port"
                type="number"
                placeholder="587"
                value={smtpConfig.port.toString()}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value, 10) || 587 })}
              />
              <Input
                label="Username / Login"
                placeholder="apikey or user@example.com"
                value={smtpConfig.username}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
              />
              <Input
                label={smtpConfig.hasPassword ? 'Password (Saved — leave blank to keep)' : 'Password'}
                type="password"
                placeholder="••••••••••••"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
              />
              <Input
                label="From Email Address"
                placeholder="no-reply@doit.kachakaran.tech"
                value={smtpConfig.fromEmail}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
              />
              <Input
                label="From Display Name"
                placeholder="DoIt Workspace"
                value={smtpConfig.fromName}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={smtpConfig.secure}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                  className="rounded border-[var(--border)] accent-[var(--accent)]"
                />
                <span>Use SSL / TLS (Port 465)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={smtpConfig.enabled}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, enabled: e.target.checked })}
                  className="rounded border-[var(--border)] accent-[var(--accent)]"
                />
                <span>Enable Automated Email Sending</span>
              </label>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-md text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-800 text-rose-300'
                }`}
              >
                {testResult.msg}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="test@example.com"
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                  className="w-48 text-xs py-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={testingSmtp}
                  onClick={handleSendTestEmail}
                  className="text-xs"
                >
                  Send Test Email
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={testingSmtp}
                  onClick={handleTestSmtpConnection}
                  className="text-xs"
                >
                  Test Ping
                </Button>
              </div>

              <Button
                size="sm"
                disabled={actionLoading}
                onClick={handleSaveSmtp}
                className="bg-[var(--accent)] text-white text-xs"
              >
                Save SMTP Settings
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Invite Teammate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Invite Teammate</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
              >
                ✕
              </button>
            </div>

            {!generatedInvite ? (
              <>
                {/* Method selector tabs */}
                <div className="grid grid-cols-2 p-1 bg-[var(--surface-raised)] rounded-lg">
                  <button
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      inviteTab === 'email'
                        ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => setInviteTab('email')}
                  >
                    Email Invitation
                  </button>
                  <button
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      inviteTab === 'link'
                        ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => setInviteTab('link')}
                  >
                    Shareable Link
                  </button>
                </div>

                <div className="space-y-4">
                  {inviteTab === 'email' && (
                    <Input
                      label="Teammate's Email Address"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                      Assigned Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full text-sm bg-[var(--surface-raised)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="TESTER">Tester (Create bugs, test sessions, tasks)</option>
                      <option value="ADMIN">Admin (Invite teammates, manage workspace)</option>
                      <option value="VIEWER">Viewer (Read-only access)</option>
                    </select>
                  </div>

                  {inviteTab === 'link' && (
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                        Max Allowed Uses
                      </label>
                      <select
                        value={inviteMaxUses}
                        onChange={(e) => setInviteMaxUses(parseInt(e.target.value, 10))}
                        className="w-full text-sm bg-[var(--surface-raised)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      >
                        <option value="1">Single Use (1 member)</option>
                        <option value="5">5 Members</option>
                        <option value="10">10 Members</option>
                        <option value="50">50 Members</option>
                        <option value="100">100 Members</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                      Expiration
                    </label>
                    <select
                      value={inviteExpiresDays}
                      onChange={(e) => setInviteExpiresDays(parseInt(e.target.value, 10))}
                      className="w-full text-sm bg-[var(--surface-raised)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={actionLoading || (inviteTab === 'email' && !inviteEmail.includes('@'))}
                    onClick={handleCreateInvitation}
                    className="bg-[var(--accent)] text-white"
                  >
                    {actionLoading
                      ? 'Generating...'
                      : inviteTab === 'email'
                      ? 'Send Email Invitation'
                      : 'Generate Link'}
                  </Button>
                </div>
              </>
            ) : (
              /* Success display with shareable link */
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs">
                  {generatedInvite.emailSent ? (
                    <span>Email invitation sent successfully! Teammate can also join using the link below:</span>
                  ) : (
                    <span>
                      {generatedInvite.emailError
                        ? `Email delivery was unconfigured (${generatedInvite.emailError}). `
                        : ''}
                      Shareable invitation link ready:
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Invitation URL</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={generatedInvite.url}
                      className="w-full text-xs font-mono bg-[var(--surface-raised)] border border-[var(--border)] rounded px-2.5 py-2 text-[var(--text-primary)] select-all"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedInvite.url)}
                      className="shrink-0 gap-1.5 bg-[var(--accent)] text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                {/* Instant Share Buttons */}
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Join our workspace "${workspaceName}" on DoIt: ${generatedInvite.url}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      generatedInvite.url,
                    )}&text=${encodeURIComponent(`Join ${workspaceName} on DoIt`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 text-center bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    Telegram
                  </a>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                  <Button onClick={() => setShowInviteModal(false)} size="sm">
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
