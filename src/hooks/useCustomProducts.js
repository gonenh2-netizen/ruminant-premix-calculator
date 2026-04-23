import { useState, useEffect } from 'react';

const CUSTOM_STORAGE_KEY = 'premix_calculator_custom_products_v1';

/**
 * Custom product shape:
 *   { id, name, brand, kind: 'single' | 'blend', chemistry, note, price, bioavail,
 *     // single: mineral (string), purity (0-1)
 *     // blend:  minerals { Zn: 0.05, Cu: 0.02, ... } fractions
 *   }
 */
export function useCustomProducts() {
  const [customProducts, setCustomProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
      if (raw) setCustomProducts(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customProducts)); } catch {}
  }, [customProducts, loaded]);

  const addCustom = (p) => {
    const id = p.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setCustomProducts((prev) => [...prev, { ...p, id, custom: true }]);
    return id;
  };
  const removeCustom = (id) => setCustomProducts((prev) => prev.filter((p) => p.id !== id));

  return { customProducts, addCustom, removeCustom, STORAGE_KEY: CUSTOM_STORAGE_KEY };
}

const FORMULATION_KEY = 'premix_calculator_saved_formulations_v1';

/**
 * Saved formulations. Dual-mode:
 *  - If a Firebase user is passed, formulations live at
 *    users/{uid}/formulations/{id} in Firestore and sync in real time.
 *    On first sign-in we migrate any locally-stored formulations into the
 *    user's account, then wipe the localStorage cache.
 *  - With no user (offline / cloud disabled) we fall back to localStorage
 *    with the original schema.
 *
 * The hook signature stays the same so callers don't have to branch.
 */
export function useSavedFormulations(user = null) {
  const [saved, setSaved] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ---- local (offline) mode: use localStorage --------------------------
  useEffect(() => {
    if (user) return; // cloud path takes over below
    try {
      const raw = localStorage.getItem(FORMULATION_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    if (user || !loaded) return;
    try { localStorage.setItem(FORMULATION_KEY, JSON.stringify(saved)); } catch {}
  }, [saved, loaded, user]);

  // ---- cloud mode: sync with Firestore ---------------------------------
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let unsub = null;

    (async () => {
      const [{ collection, onSnapshot, doc, setDoc, getDocs }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../firebase.js'),
      ]);
      if (cancelled) return;
      const col = collection(db, 'users', user.uid, 'formulations');

      // One-time migration: move localStorage saves → Firestore on first login.
      try {
        const raw = localStorage.getItem(FORMULATION_KEY);
        if (raw) {
          const locals = JSON.parse(raw);
          const existing = await getDocs(col);
          const existingNames = new Set(existing.docs.map((d) => d.data()?.name));
          for (const f of locals) {
            if (!f?.name || existingNames.has(f.name)) continue;
            const id = f.id || `form_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            await setDoc(doc(col, id), {
              id, name: f.name,
              savedAt: f.savedAt || new Date().toISOString(),
              state: f.state || {},
            });
          }
          localStorage.removeItem(FORMULATION_KEY);
        }
      } catch {}

      unsub = onSnapshot(col, (snap) => {
        const rows = snap.docs.map((d) => d.data()).sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
        setSaved(rows);
        setLoaded(true);
      });
    })();

    return () => { cancelled = true; if (unsub) unsub(); };
  }, [user]);

  const saveFormulation = async (name, state) => {
    const id = `form_${Date.now()}`;
    const entry = { id, name, savedAt: new Date().toISOString(), state };

    if (user) {
      const [{ doc, setDoc, collection, query, where, getDocs, deleteDoc }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../firebase.js'),
      ]);
      const col = collection(db, 'users', user.uid, 'formulations');
      // overwrite by name — delete any existing with same name
      const q = query(col, where('name', '==', name));
      const existing = await getDocs(q);
      await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
      await setDoc(doc(col, id), entry);
      return id;
    }
    setSaved((prev) => [...prev.filter((f) => f.name !== name), entry]);
    return id;
  };

  const removeFormulation = async (id) => {
    if (user) {
      const [{ doc, deleteDoc }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../firebase.js'),
      ]);
      await deleteDoc(doc(db, 'users', user.uid, 'formulations', id));
      return;
    }
    setSaved((prev) => prev.filter((f) => f.id !== id));
  };

  return { saved, saveFormulation, removeFormulation };
}
