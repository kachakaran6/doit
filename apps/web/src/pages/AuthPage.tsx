import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useThemeStore } from '@/lib/theme-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initAuth } = useAuthStore();
  const { mode } = useThemeStore();
  const { success, error } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Missing fields', 'Please enter both email and password.');
      return;
    }
    if (isRegister && !name) {
      error('Name required', 'Please enter your name.');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        await api.auth.register({ email, password, name });
        success('Account created', 'Welcome to DoIt!');
      } else {
        await api.auth.login({ email, password });
        success('Signed in', 'Welcome back!');
      }
      await initAuth();
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Authentication failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
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
            Precision project management & issue tracking
          </p>
        </div>

        {/* Auth Card */}
        <Card variant="bordered" className="p-6">
          {/* Tabs */}
          <div className="flex rounded-lg bg-[var(--muted)] p-1 mb-5">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer ${
                isRegister
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full name"
                placeholder="Alice Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="alice@samyukt.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />

            <Button type="submit" className="w-full mt-2" loading={loading}>
              <span>{isRegister ? 'Create account' : 'Sign in to workspace'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Demo Accounts Quick-Fill */}
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="text-[11px] font-medium text-[var(--muted-foreground)] mb-2.5">
              Quick demo accounts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleQuickLogin('alice@samyukt.com')}
                className="justify-start gap-1.5 text-[11px]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary-text)]" />
                <span>Alice (Owner)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleQuickLogin('bob@samyukt.com')}
                className="justify-start gap-1.5 text-[11px]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[var(--warning-text)]" />
                <span>Bob (Tester)</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[12px] text-[var(--muted-foreground)]">
          Protected by AES-256 enterprise encryption
        </p>
      </div>
    </div>
  );
}
