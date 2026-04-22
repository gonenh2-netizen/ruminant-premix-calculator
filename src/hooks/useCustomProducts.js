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

export function useSavedFormulations() {
  const [saved, setSaved] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORMULATION_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(FORMULATION_KEY, JSON.stringify(saved)); } catch {}
  }, [saved, loaded]);

  const saveFormulation = (name, state) => {
    const id = `form_${Date.now()}`;
    setSaved((prev) => [...prev.filter((f) => f.name !== name), { id, name, savedAt: new Date().toISOString(), state }]);
    return id;
  };
  const removeFormulation = (id) => setSaved((prev) => prev.filter((f) => f.id !== id));

  return { saved, saveFormulation, removeFormulation };
}
