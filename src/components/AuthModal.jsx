import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DISCLAIMER_VERSION, DISCLAIMER_EFFECTIVE_DATE } from '../disclaimer.js';

/**
 * Login / Signup / Reset-password modal.
 *
 * Shown full-screen when CLOUD_ENABLED=true and no user is signed in.
 * The user cannot reach the calculator until they authenticate.
 *
 * UX modes: 'login' (default) · 'signup' · 'reset'.
 *
 * Signup flow includes a required Terms-of-Use / Liability disclaimer
 * checkbox. The acceptance (version + timestamp + language) is recorded
 * to Firestore by the signUp function in useAuth.
 */
export function AuthModal({ signUp, signIn, resetPassword, t = (k) => k }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const { i18n } = useTranslation();
  const lang = i18n?.resolvedLanguage || i18n?.language || 'en';

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'signup') {
        if (password.length < 6) throw new Error(t('auth.errPasswordShort'));
        if (!displayName.trim()) throw new MissingFieldError(t('auth.fullName'));
        if (!country.trim())     throw new MissingFieldError(t('auth.country'));
        if (!accepted) throw new DisclaimerRequiredError();
        await signUp(email, password, displayName, {
          version: DISCLAIMER_VERSION,
          lang,
          acceptedAt: new Date().toISOString(),
        }, {
          company: company.trim(),
          phone: phone.trim(),
          country: country.trim(),
        });
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
      <div className={`bg-white rounded-xl shadow-xl ${mode === 'signup' ? 'max-w-lg' : 'max-w-md'} w-full overflow-hidden max-h-[95vh] flex flex-col`}>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6">
          <h1 className="text-2xl font-bold">
            <i className="fas fa-flask-vial mr-2"></i>
            {t('app.title')}
          </h1>
          <p className="text-sm text-emerald-100 mt-1">{t('auth.tagline')}</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
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
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    {t('auth.fullName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" required value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('auth.company')}</label>
                    <input
                      type="text" value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t('auth.companyPlaceholder')}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('auth.phone')}</label>
                    <input
                      type="tel" value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84 …"
                      autoComplete="tel"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    {t('auth.country')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" required value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t('auth.countryPlaceholder')}
                    list="country-suggestions"
                    autoComplete="country-name"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <datalist id="country-suggestions">
                    {COUNTRIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </>
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
            {mode === 'signup' && (
              <div className="space-y-2">
                <div className="border border-slate-300 rounded-lg bg-slate-50 p-3 max-h-56 overflow-y-auto text-[11px] leading-relaxed text-slate-700">
                  <div className="font-bold text-slate-800 mb-1">{t('auth.disclaimer.title')}</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wide mb-2">
                    {t('auth.disclaimer.version', { version: DISCLAIMER_VERSION, date: DISCLAIMER_EFFECTIVE_DATE })}
                  </div>
                  <p className="mb-2">{t('auth.disclaimer.intro')}</p>
                  <p className="font-semibold mb-1">{t('auth.disclaimer.agreement')}</p>
                  <ol className="list-decimal list-inside space-y-1 mb-2">
                    <li>{t('auth.disclaimer.p1')}</li>
                    <li>{t('auth.disclaimer.p2')}</li>
                    <li>{t('auth.disclaimer.p3')}</li>
                    <li>{t('auth.disclaimer.p4')}</li>
                    <li>{t('auth.disclaimer.p5')}</li>
                    <li>{t('auth.disclaimer.p6')}</li>
                  </ol>
                  <p className="italic text-slate-600">{t('auth.disclaimer.footer')}</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox" checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    {t('auth.disclaimer.accept')}
                  </span>
                </label>
              </div>
            )}
            {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded">{error}</div>}
            {info && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">{info}</div>}
            <button
              type="submit"
              disabled={busy || (mode === 'signup' && !accepted)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold disabled:bg-emerald-300 disabled:cursor-not-allowed"
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

class DisclaimerRequiredError extends Error {
  constructor() {
    super('Disclaimer not accepted');
    this.code = 'app/disclaimer-required';
  }
}
class MissingFieldError extends Error {
  constructor(fieldLabel) {
    super(`Missing required field: ${fieldLabel}`);
    this.code = 'app/missing-field';
    this.fieldLabel = fieldLabel;
  }
}

function friendlyError(err, t) {
  const code = err?.code || '';
  if (code === 'app/disclaimer-required') return t('auth.errDisclaimerRequired');
  if (code === 'app/missing-field') return t('auth.errMissingField', { field: err.fieldLabel });
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return t('auth.errInvalidCredential');
  if (code.includes('email-already-in-use')) return t('auth.errEmailInUse');
  if (code.includes('invalid-email')) return t('auth.errInvalidEmail');
  if (code.includes('weak-password')) return t('auth.errPasswordShort');
  if (code.includes('too-many-requests')) return t('auth.errTooManyRequests');
  if (code.includes('network')) return t('auth.errNetwork');
  return err?.message || String(err);
}

// Country suggestion list — autocomplete only, the user can type anything.
// Roughly ordered by where ruminant-nutrition users of this app cluster.
const COUNTRIES = [
  'Vietnam', 'Thailand', 'China', 'Indonesia', 'Malaysia', 'Philippines',
  'Cambodia', 'Laos', 'Myanmar', 'Singapore',
  'Israel', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkey', 'Iran', 'Saudi Arabia', 'United Arab Emirates',
  'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal',
  'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru',
  'Australia', 'New Zealand',
  'United Kingdom', 'Ireland', 'France', 'Germany', 'Netherlands', 'Spain', 'Italy', 'Poland', 'Romania', 'Ukraine',
  'South Africa', 'Kenya', 'Ethiopia', 'Egypt', 'Morocco', 'Nigeria',
  'Russia', 'Belarus',
  'Japan', 'South Korea', 'Taiwan',
  'Other',
];
