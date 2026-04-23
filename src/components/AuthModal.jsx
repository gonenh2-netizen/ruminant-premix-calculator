import { useState } from 'react';

/**
 * Login / Signup / Reset-password modal.
 *
 * Shown full-screen when CLOUD_ENABLED=true and no user is signed in.
 * The user cannot reach the calculator until they authenticate.
 *
 * UX modes: 'login' (default) · 'signup' · 'reset'.
 */
export function AuthModal({ signUp, signIn, resetPassword, t = (k) => k }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'signup') {
        if (password.length < 6) throw new Error(t('auth.errPasswordShort'));
        await signUp(email, password, displayName);
      } else if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setInfo(t('auth.resetEmailSent'));
      }
    } catch (err) {
      setError(friendlyError(err, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6">
          <h1 className="text-2xl font-bold">
            <i className="fas fa-flask-vial mr-2"></i>
            {t('app.title')}
          </h1>
          <p className="text-sm text-emerald-100 mt-1">{t('auth.tagline')}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className={`flex-1 px-3 py-2 rounded text-sm font-semibold ${mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
            >
              {t('auth.login')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
              className={`flex-1 px-3 py-2 rounded text-sm font-semibold ${mode === 'signup' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
            >
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('auth.displayName')}</label>
                <input
                  type="text" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.displayNamePlaceholder')}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('auth.email')}</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('auth.password')}</label>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? t('auth.passwordHint') : '••••••••'}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  minLength={6}
                />
              </div>
            )}
            {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded">{error}</div>}
            {info && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">{info}</div>}
            <button
              type="submit" disabled={busy}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold disabled:bg-emerald-400"
            >
              {busy ? t('auth.pleaseWait') : (mode === 'login' ? t('auth.login') : mode === 'signup' ? t('auth.createAccount') : t('auth.sendResetEmail'))}
            </button>
          </form>

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(''); setInfo(''); }}
              className="w-full text-xs text-slate-500 hover:text-emerald-700 underline"
            >
              {t('auth.forgotPassword')}
            </button>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className="w-full text-xs text-slate-500 hover:text-emerald-700 underline"
            >
              ← {t('auth.backToLogin')}
            </button>
          )}

          <p className="text-[10px] text-slate-400 text-center pt-3 border-t">
            {t('auth.privacyNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(err, t) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return t('auth.errInvalidCredential');
  if (code.includes('email-already-in-use')) return t('auth.errEmailInUse');
  if (code.includes('invalid-email')) return t('auth.errInvalidEmail');
  if (code.includes('weak-password')) return t('auth.errPasswordShort');
  if (code.includes('too-many-requests')) return t('auth.errTooManyRequests');
  if (code.includes('network')) return t('auth.errNetwork');
  return err?.message || String(err);
}
