import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, CLOUD_ENABLED } from '../firebase.js';

/**
 * Auth state + actions. Safe to call even when CLOUD_ENABLED is false —
 * the hook just reports { user: null, loading: false, cloudEnabled: false }
 * and every action is a no-op that resolves.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(CLOUD_ENABLED);

  useEffect(() => {
    if (!CLOUD_ENABLED) { setLoading(false); return; }
    return onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
  }, []);

  const signUp = async (email, password, displayName, disclaimer = null, contact = {}) => {
    if (!CLOUD_ENABLED) throw new Error('Cloud is not configured');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName) {
      try { await updateProfile(cred.user, { displayName: displayName.trim() }); } catch {}
    }
    // Persist the user profile (contact details + disclaimer acceptance)
    // to Firestore. Visible to admin in Firebase Console → Firestore → users.
    try {
      const [{ doc, setDoc }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../firebase.js'),
      ]);
      const profile = {
        email: cred.user.email,
        displayName: (displayName || '').trim() || null,
        company: (contact.company || '').trim() || null,
        phone:   (contact.phone   || '').trim() || null,
        country: (contact.country || '').trim() || null,
        createdAt: new Date().toISOString(),
      };
      if (disclaimer) {
        profile.disclaimerVersion    = disclaimer.version;
        profile.disclaimerAcceptedAt = disclaimer.acceptedAt;
        profile.disclaimerLang       = disclaimer.lang;
        profile.disclaimerEmail      = cred.user.email;
      }
      await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
    } catch (err) {
      // Don't block signup on profile-write failure — just log.
      console.warn('Failed to record user profile:', err);
    }
    return cred.user;
  };

  const signIn = async (email, password) => {
    if (!CLOUD_ENABLED) throw new Error('Cloud is not configured');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  };

  const resetPassword = async (email) => {
    if (!CLOUD_ENABLED) throw new Error('Cloud is not configured');
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    if (!CLOUD_ENABLED) return;
    await signOut(auth);
  };

  return { user, loading, cloudEnabled: CLOUD_ENABLED, signUp, signIn, resetPassword, logout };
}
