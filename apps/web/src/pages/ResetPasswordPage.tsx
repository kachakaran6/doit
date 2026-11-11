import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useThemeStore } from '@/lib/theme-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { KeyRound, Eye, EyeOff, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode } = useThemeStore();
  const { success, error } = useToast();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your account email.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (cleanPassword !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.resetPassword(cleanEmail, cleanPassword, tokenParam || undefined);
      setIsSuccess(true);
      success('Password reset successful', res?.message || 'You can now sign in with your new password.');
    } catch (err: any) {
      const msg = err.message || 'Unable to reset password. The link may have expired or is invalid.';
      setErrorMsg(msg);
      error('Reset failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-[var(--background)] selection:bg-[var(--primary-soft)] selection:text-[var(--primary-text)]">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src={isDarkMode ? '/logo-horizontal-dark.svg' : '/logo-horizontal-light.svg'}
            alt="DoIt"
            className="h-10 w-auto object-contain mb-1"
          />
          <p className="text-[13px] text-[var(--muted-foreground)]">
            Enterprise Issue Tracking & Project Management
          </p>
        </div>

        <Card variant="bordered" className="p-6">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--success-soft)] text-[var(--success-text)] mb-1">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[var(--foreground)]">Password reset complete</h3>
                <p className="text-[13px] text-[var(--muted-foreground)]">
                  Your credentials have been updated securely. You can now sign in to your workspace.
                </p>
              </div>
              <Button
                type="button"
                className="w-full mt-2"
                onClick={() => navigate('/login', { replace: true })}
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary-text)] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--foreground)]">Set new password</h2>
                  <p className="text-[12px] text-[var(--muted-foreground)]">
                    Choose a strong password with at least 8 characters.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 text-[12px] rounded-lg bg-[var(--danger-soft)] text-[var(--danger-text)] border border-[var(--danger-border)] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                disabled={Boolean(emailParam)}
              />

              <div className="relative">
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[32px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm new password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2" loading={loading}>
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Save New Password</span>
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
