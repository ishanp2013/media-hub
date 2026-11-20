import { useState } from 'react';
import { actions } from '@/store';
import { GiisLogo } from '@/components/GiisLogo';
import { NineGemsShowcase, NineGemsStrip, NineGemsTitle } from '@/components/NineGems';
import { Lock, LogIn, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = actions.login(username, password);
    if (!user) setError('Invalid email or password. Please try again.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Nine Gems panel */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[52%] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-950 relative overflow-hidden flex-col justify-between gap-4 px-10 py-8 xl:px-12 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1.5 giis-accent-bar" />

        <div className="relative flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/20 ring-1 ring-white/40">
            <GiisLogo size={34} animated />
          </div>
          <div>
            <p className="font-display font-extrabold text-xl tracking-tight">GIIS Abu Dhabi</p>
            <p className="text-brand-100 text-sm">Voices of GSG · Campus Media Hub</p>
          </div>
        </div>

        <div className="relative w-full max-w-xl">
          <div className="flex items-end justify-between gap-6 mb-2 animate-fade-in">
            <NineGemsTitle className="text-5xl xl:text-6xl" />
            <p className="max-w-[15rem] text-sm text-brand-100 leading-relaxed text-right">
              The GIIS holistic framework — every story shared here celebrates one of our nine gems.
            </p>
          </div>
          <NineGemsShowcase />
        </div>

        <p className="relative text-brand-200 text-xs">
          © 2026 Global Indian International School, Abu Dhabi · Voices of GSG
        </p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-fade-in">
          <div className="h-1.5 giis-accent-bar rounded-full mb-8 lg:hidden" />
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <GiisLogo size={44} animated />
            <div>
              <p className="font-display font-extrabold text-lg text-slate-900">GIIS Abu Dhabi</p>
              <p className="text-slate-500 text-xs">Voices of GSG · Campus Media Hub</p>
            </div>
          </div>
          <div className="lg:hidden mb-8">
            <NineGemsStrip />
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your Voices of GSG console.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-giisRed-50 border border-giisRed-100 text-giisRed-700 text-sm rounded-lg px-3 py-2 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0"
            >
              <LogIn size={18} /> Sign In
            </button>
          </form>

          <p className="mt-8 text-xs text-slate-400 text-center">
            Parents, coordinators and the marketing team each sign in with their own account.
          </p>
        </div>
      </div>
    </div>
  );
}
