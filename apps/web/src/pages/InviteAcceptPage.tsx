import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, getAuthToken, setAuthToken } from '@/lib/api';

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

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
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

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

      // Check current user if token exists
      const currentToken = getAuthToken();
      if (currentToken) {
        try {
          const me = await api.auth.me();
          setCurrentUser(me);
        } catch {
          setAuthToken(null);
          setCurrentUser(null);
        }
      }

      // Validate invitation token
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
      // Successfully accepted! Navigate to home
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

      const receivedToken: string = authRes?.accessToken || authRes?.token || '';
      if (receivedToken) {
        setAuthToken(receivedToken);
        setCurrentUser(authRes.user || { id: '', email, name });

        // Immediately accept invitation with token
        await api.invitations.accept(token);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-secondary)]">Validating invitation link...</p>
        </div>
      </div>
    );
  }

  // Invalid, Expired, or Revoked State
  if (!valid) {
    const reasonText =
      inviteData?.reason === 'EXPIRED'
        ? 'This invitation link has expired. Please contact the administrator for a new invite.'
        : inviteData?.reason === 'REVOKED'
        ? 'This invitation link has been revoked by a workspace administrator.'
        : inviteData?.reason === 'MAX_USES_REACHED'
        ? 'This invitation link has already reached its maximum allowed uses.'
        : 'The invitation link you followed is invalid or does not exist.';

    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-[var(--border)]">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Invitation Unavailable</CardTitle>
            <CardDescription className="text-xs mt-2 text-rose-300">
              {reasonText}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-center">
            <Link to="/">
              <Button className="w-full bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)]">
                Go to DoIt Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid Invitation
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-[var(--border)] overflow-hidden">
        {/* Brand Banner */}
        <div className="p-6 text-center border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface)]">
          <div className="w-12 h-12 rounded-xl bg-black border border-[var(--border)] flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-xl font-black text-indigo-400">D</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Join {inviteData?.workspace?.name}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            <strong>{inviteData?.invitedBy}</strong> has invited you to collaborate on DoIt
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge className="bg-indigo-950/60 text-indigo-300 border-indigo-800/40 text-xs">
              Role: {inviteData?.role}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {currentUser ? (
            /* Logged In User Acceptance */
            <div className="space-y-4">
              <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg text-xs space-y-1">
                <div className="text-[var(--text-secondary)]">Accepting invitation as:</div>
                <div className="font-semibold text-[var(--text-primary)]">{currentUser.name}</div>
                <div className="text-[var(--text-muted)] font-mono">{currentUser.email}</div>
              </div>

              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-semibold text-sm gap-2"
              >
                {accepting ? (
                  <span>Joining Workspace...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Invitation & Join</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Unauthenticated User: Quick Login or Register */
            <div className="space-y-4">
              <div className="grid grid-cols-2 p-1 bg-[var(--surface-raised)] rounded-lg">
                <button
                  type="button"
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    authTab === 'register'
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                  onClick={() => setAuthTab('register')}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    authTab === 'login'
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                  onClick={() => setAuthTab('login')}
                >
                  Sign In
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authTab === 'register' && (
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={Boolean(inviteData?.allowedEmail)}
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

                <Button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full mt-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs py-2.5"
                >
                  {authSubmitting
                    ? 'Processing...'
                    : authTab === 'register'
                    ? 'Create Account & Join'
                    : 'Sign In & Join'}
                </Button>
              </form>
            </div>
          )}

          <div className="text-[11px] text-center text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            Protected by DoIt Workspace Security &bull; Instant Workspace Access
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
