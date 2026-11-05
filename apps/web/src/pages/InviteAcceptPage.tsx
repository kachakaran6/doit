import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/badge';
import { api, getAuthToken, setTokens } from '@/lib/api';
import { useThemeStore } from '@/lib/theme-store';
import { useAuthStore } from '@/lib/auth-store';

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const { initAuth } = useAuthStore();

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

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unauthenticated auth form state
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    checkTokenAndAuth();
  }, [token]);

  const checkTokenAndAuth = async () => {
    if (!token) {
      setValid(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const currentToken = getAuthToken();
      if (currentToken) {
        try {
          const me = await api.auth.me();
          setCurrentUser(me);
        } catch {
          setTokens(null, null);
          setCurrentUser(null);
        }
      }

      // Validate token
      const res = await api.invitations.validate(token);
      if (res && res.valid) {
        setValid(true);
        setInviteData(res);
        if (res.allowedEmail) {
          setEmail(res.allowedEmail);
        }
      } else {
        setValid(false);
        setInviteData(res);
      }
    } catch (err: any) {
      setValid(false);
      setErrorMsg(err.message || 'Failed to validate invitation token');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    try {
      setAccepting(true);
      setErrorMsg(null);
      await api.invitations.accept(token);
      await initAuth();
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setAuthSubmitting(true);
      setErrorMsg(null);

      let authRes: any;
      if (authTab === 'login') {
        authRes = await api.auth.login({ email: email.trim(), password });
      } else {
        authRes = await api.auth.register({
          name: name.trim() || email.split('@')[0] || 'User',
          email: email.trim(),
          password,
        });
      }

      if (authRes?.accessToken) {
        setTokens(authRes.accessToken, authRes.refreshToken);
        setCurrentUser(authRes.user || { id: '', email, name });
        await handleAccept();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src={isDarkMode ? '/logo-horizontal-dark.svg' : '/logo-horizontal-light.svg'}
            alt="DoIt"
            className="h-9 w-auto object-contain mb-1"
          />
        </div>

        {loading ? (
          <Card variant="bordered" className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-[14px] font-medium text-[var(--foreground)]">
              Verifying invitation…
            </div>
          </Card>
        ) : valid === false ? (
          <Card variant="bordered" className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(201,60,53,0.12)] text-[var(--danger-text)] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[var(--foreground)]">
                Invitation unavailable
              </h2>
              <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                {errorMsg || inviteData?.reason || 'This invitation link has expired, was revoked, or does not exist.'}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/login')}>
              Go to sign in
            </Button>
          </Card>
        ) : (
          <Card variant="bordered" className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary-text)] text-[12px] font-semibold mb-2">
                <Building className="w-3.5 h-3.5" />
                <span>Workspace Invitation</span>
              </div>
              <h2 className="text-[20px] font-bold text-[var(--foreground)] tracking-tight">
                Join {inviteData?.workspace?.name || 'DoIt Workspace'}
              </h2>
              <p className="text-[13px] text-[var(--muted-foreground)]">
                You've been invited as a <RoleBadge role={inviteData?.role || 'MEMBER'} className="inline-flex ml-1" />
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-[rgba(201,60,53,0.12)] text-[var(--danger-text)] text-[12px]">
                {errorMsg}
              </div>
            )}

            {currentUser ? (
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[13px]">
                  <div className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Signed in as</div>
                  <div className="font-semibold text-[var(--foreground)]">{currentUser.name}</div>
                  <div className="text-[12px] text-[var(--muted-foreground)]">{currentUser.email}</div>
                </div>

                <Button className="w-full" size="md" onClick={handleAccept} loading={accepting}>
                  <span>Accept and enter workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Tabs */}
                <div className="flex rounded-lg bg-[var(--muted)] p-1">
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                      authTab === 'register'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Sign in
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authTab === 'register' && (
                    <Input
                      label="Full name"
                      placeholder="Alice Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  )}

                  <Input
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={Boolean(inviteData?.allowedEmail)}
                    helperText={inviteData?.allowedEmail ? 'This invitation is locked to this email address.' : undefined}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <Button type="submit" className="w-full mt-2" loading={authSubmitting}>
                    <span>{authTab === 'register' ? 'Create account & join' : 'Sign in & join'}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
