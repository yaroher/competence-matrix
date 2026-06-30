import { useState, type FormEvent } from 'react';
import { Boxes, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginScreen({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось войти');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-dvh place-items-center bg-[var(--background-2)] p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-primary)]">
            <Boxes className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground">Матрица компетенций</p>
            <h1 className="text-lg font-semibold tracking-tight">Вход</h1>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@comatrix.dev" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login-password">Пароль</Label>
            <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={busy} className="mt-1">
            <LogIn /> Войти
          </Button>
        </div>
      </form>
    </div>
  );
}
