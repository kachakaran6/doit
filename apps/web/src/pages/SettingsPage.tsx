import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your account profile, workspace preferences, and brand styles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Your personal account details across all workspaces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" defaultValue="Alice Sharma" />
          <Input label="Email Address" defaultValue="alice@samyukt.com" disabled />
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Customization</CardTitle>
          <CardDescription>Theme styling and neutral graphite palette options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Brand Accent
            </label>
            <div className="flex gap-2">
              {['indigo', 'teal', 'amber', 'rose', 'violet'].map((acc) => (
                <button
                  key={acc}
                  className="px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-medium bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] cursor-pointer capitalize"
                  onClick={() => {
                    document.documentElement.setAttribute('data-accent', acc);
                    localStorage.setItem('doit-accent', acc);
                  }}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
