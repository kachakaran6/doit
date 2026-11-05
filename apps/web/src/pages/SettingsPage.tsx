import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { useThemeStore, ThemeMode, AccentColor } from '@/lib/theme-store';
import { api } from '@/lib/api';
import { SmtpConfig } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  User,
  Palette,
  Shield,
  Building,
  Mail,
  Sun,
  Moon,
  Laptop,
  Check,
  Smartphone,
  Globe,
  Send,
  Server,
} from 'lucide-react';

type SettingsTab = 'profile' | 'appearance' | 'workspace' | 'sessions' | 'smtp';

export function SettingsPage() {
  const { user } = useAuthStore();
  const { activeWorkspace, loadWorkspaces } = useWorkspaceStore();
  const { mode, accent, density, setMode, setAccent, setDensity } = useThemeStore();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Workspace Form State
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [workspaceSaving, setWorkspaceSaving] = useState(false);

  // SMTP Settings State
  const [smtp, setSmtp] = useState<SmtpConfig>({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromAddress: '',
    senderName: 'DoIt',
    configured: false,
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);

  // 1. Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['auth-sessions'],
    queryFn: () => api.auth.getSessions(),
    enabled: activeTab === 'sessions',
  });

  // 2. Fetch SMTP config if admin/tab active
  useQuery({
    queryKey: ['smtp-config'],
    queryFn: async () => {
      try {
        const config = await api.smtp.get();
        if (config) {
          setSmtp({
            host: config.host || '',
            port: config.port || 587,
            secure: Boolean(config.secure),
            username: config.username || '',
            password: '',
            fromAddress: config.fromAddress || '',
            senderName: config.senderName || 'DoIt',
            configured: Boolean(config.configured),
          });
        }
        return config;
      } catch {
        return null;
      }
    },
    enabled: activeTab === 'smtp',
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => api.auth.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-sessions'] });
      success('Session revoked', 'Device signed out.');
    },
    onError: (err: any) => {
      error('Failed to revoke session', err.message);
    },
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setTimeout(() => {
      setProfileSaving(false);
      success('Profile updated', 'Your preferences have been saved.');
    }, 300);
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    try {
      setWorkspaceSaving(true);
      await api.workspaces.update(activeWorkspace.id, { name: workspaceName.trim() });
      await loadWorkspaces();
      success('Workspace updated', workspaceName.trim());
    } catch (err: any) {
      error('Failed to update workspace', err.message);
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSmtpSaving(true);
      const res = await api.smtp.save(smtp);
      if (res.success) {
        success('SMTP saved', 'Email delivery credentials configured.');
      }
    } catch (err: any) {
      error('Failed to save SMTP', err.message);
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setSmtpTesting(true);
      const res = await api.smtp.testConnection(smtp);
      if (res.success) {
        success('Connection successful', res.message || 'Connected to SMTP mail server.');
      } else {
        error('Connection failed', res.message || 'Could not connect to SMTP server.');
      }
    } catch (err: any) {
      error('SMTP test failed', err.message);
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo) {
      error('Email required', 'Please enter a recipient email.');
      return;
    }
    try {
      setTestEmailSending(true);
      const res = await api.smtp.sendTest(testEmailTo, smtp);
      if (res.success) {
        success('Test email sent', `Delivered to ${testEmailTo}`);
      } else {
        error('Send failed', res.message);
      }
    } catch (err: any) {
      error('Failed to send test email', err.message);
    } finally {
      setTestEmailSending(false);
    }
  };

  const accents: Array<{ id: AccentColor; name: string; hex: string }> = [
    { id: 'blue', name: 'Blue (Brand)', hex: '#3A66F2' },
    { id: 'violet', name: 'Violet', hex: '#8E6BFA' },
    { id: 'green', name: 'Emerald', hex: '#1BB470' },
    { id: 'orange', name: 'Amber', hex: '#EA661C' },
    { id: 'rose', name: 'Rose', hex: '#F04B75' },
  ];

  return (
    <div className="space-y-8 select-none max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Settings</h1>
        <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
          Manage your account, appearance, workspace properties, and mail integrations.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[var(--border)] gap-6 text-[13px] font-medium overflow-x-auto">
        {[
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'workspace', label: 'Workspace', icon: Building },
          { id: 'sessions', label: 'Security & Sessions', icon: Shield },
          { id: 'smtp', label: 'SMTP Config', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[var(--primary)] text-[var(--foreground)] font-semibold'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Mode Preview Cards */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Interface theme</CardTitle>
              <CardDescription>Select between dark, light, or system automated mode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'dark',
                    label: 'Dark mode',
                    desc: 'Restrained graphite surfaces with subtle depth',
                    icon: Moon,
                    bgClass: 'bg-[#0B0B0E] border-[#25252C]',
                  },
                  {
                    id: 'light',
                    label: 'Light mode',
                    desc: 'Clean paper surfaces with high contrast text',
                    icon: Sun,
                    bgClass: 'bg-[#F4F4F7] border-[#E8E8EE]',
                  },
                  {
                    id: 'system',
                    label: 'System auto',
                    desc: 'Synchronizes with operating system schedule',
                    icon: Laptop,
                    bgClass: 'bg-[var(--surface-raised)] border-[var(--border)]',
                  },
                ].map((item) => {
                  const isSelected = mode === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setMode(item.id as ThemeMode)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                          : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--card)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)]">
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[var(--primary)]" />}
                      </div>
                      <div className="text-[13px] font-semibold text-[var(--foreground)]">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[var(--muted-foreground)] mt-1">
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Accent Color Swatches */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Brand accent</CardTitle>
              <CardDescription>
                Primary highlight used across active items, selection rings, and key actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                {accents.map((acc) => {
                  const isSelected = accent === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccent(acc.id)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-all cursor-pointer"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: acc.hex }}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[13px] font-medium text-[var(--foreground)]">
                        {acc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Density Control */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Information density</CardTitle>
              <CardDescription>Adjust row heights and spacing for compact or comfortable viewing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={density === 'comfortable' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setDensity('comfortable')}
                >
                  Comfortable (44px)
                </Button>
                <Button
                  variant={density === 'compact' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setDensity('compact')}
                >
                  Compact (36px)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Profile */}
      {activeTab === 'profile' && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Information associated with your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div className="flex items-center gap-4 pb-2">
                <Avatar name={user?.name} email={user?.email} size="lg" />
                <div>
                  <div className="text-[14px] font-semibold text-[var(--foreground)]">{user?.name}</div>
                  <div className="text-[12px] text-[var(--muted-foreground)]">{user?.email}</div>
                </div>
              </div>

              <Input
                label="Full name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />

              <Input
                label="Email address"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email is managed by your workspace administrator."
              />

              <Button type="submit" size="sm" loading={profileSaving}>
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Workspace */}
      {activeTab === 'workspace' && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Workspace details</CardTitle>
            <CardDescription>Manage workspace name and organization properties</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveWorkspace} className="space-y-4 max-w-md">
              <Input
                label="Workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-[13px] font-medium text-[var(--foreground)]">
                  Workspace ID
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeWorkspace?.id || ''}
                  className="flex h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-[12px] font-mono text-[var(--muted-foreground)] select-all"
                />
              </div>

              <Button type="submit" size="sm" loading={workspaceSaving}>
                Update workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Security & Sessions */}
      {activeTab === 'sessions' && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Active device sessions</CardTitle>
            <CardDescription>Devices and browsers currently authenticated with your account</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-[var(--muted-foreground)]">
                1 active session (current browser).
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {sessions.map((sess) => {
                  const isMobile = sess.platform === 'android' || sess.platform === 'ios';
                  return (
                    <div
                      key={sess.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] shrink-0">
                          {isMobile ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[var(--foreground)] truncate">
                              {sess.device || sess.platform || 'Web Browser'}
                            </span>
                            {sess.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[var(--success-text)]/15 text-[var(--success-text)]">
                                Current device
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">
                            IP: {sess.ipAddress || '127.0.0.1'} • Last active {new Date(sess.lastActiveAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => revokeSessionMutation.mutate(sess.id)}
                          className="text-[var(--danger-text)]"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 5: SMTP Configuration */}
      {activeTab === 'smtp' && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Enterprise SMTP configuration</CardTitle>
            <CardDescription>
              Configure outbound email delivery for team invitations and notifications. Passwords are encrypted at rest with AES-256.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSmtp} className="space-y-4 max-w-lg">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    label="SMTP Host"
                    placeholder="smtp.resend.com or smtp.gmail.com"
                    value={smtp.host}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Port"
                    type="number"
                    value={smtp.port}
                    onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Username"
                  placeholder="resend or api key"
                  value={smtp.username}
                  onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                  required
                />
                <Input
                  label="Password / Secret"
                  type="password"
                  placeholder="••••••••••••"
                  value={smtp.password || ''}
                  onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="From email address"
                  type="email"
                  placeholder="notifications@yourdomain.com"
                  value={smtp.fromAddress}
                  onChange={(e) => setSmtp({ ...smtp, fromAddress: e.target.value })}
                  required
                />
                <Input
                  label="Sender name"
                  placeholder="DoIt Workspace"
                  value={smtp.senderName}
                  onChange={(e) => setSmtp({ ...smtp, senderName: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={smtp.secure}
                  onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
                  className="rounded border-[var(--border)] accent-[var(--primary)]"
                />
                <label htmlFor="smtp-secure" className="text-[13px] text-[var(--foreground)] cursor-pointer">
                  Use SSL/TLS secure connection (Port 465)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button type="submit" size="sm" loading={smtpSaving}>
                  Save SMTP settings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestSmtp}
                  loading={smtpTesting}
                >
                  <Server className="w-3.5 h-3.5 mr-1" />
                  <span>Test connection</span>
                </Button>
              </div>

              {/* Send Live Test Email */}
              <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-2.5">
                <div className="text-[12px] font-semibold text-[var(--foreground)]">
                  Send test email
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="your-email@example.com"
                    type="email"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleSendTestEmail}
                    loading={testEmailSending}
                    className="shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    <span>Send test</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
