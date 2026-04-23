/**
 * Firebase client initialisation.
 *
 * Configuration comes from Vite env vars (VITE_FB_*). In local dev place
 * the values in `.env.local`; in CI/Pages deployment they are injected as
 * repo secrets (see `.github/workflows/deploy.yml`).
 *
 * If the env vars are missing the app runs in OFFLINE mode: no login gate,
 * saved formulations stay in localStorage. This keeps the static build
 * working even if Firebase isn't wired up yet.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const cfg = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

export const CLOUD_ENABLED = Object.values(cfg).every((v) => !!v);

let app = null;
export let auth = null;
export let db = null;

if (CLOUD_ENABLED) {
  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
}
