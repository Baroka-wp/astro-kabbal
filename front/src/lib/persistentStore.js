/**
 * Persistance locale de la session Astro-Kabbale.
 *
 * On stocke deux choses sous la clé `STORAGE_KEY` :
 *   - form : les valeurs du formulaire (date, heure, ville, lat, lon...)
 *   - analysis : la dernière réponse complète du backend (incluant chart_svg, planets, etc.)
 *   - savedAt : timestamp ISO
 *
 * Toute lecture passe un check de version pour pouvoir invalider proprement
 * en cas de breaking change dans la structure de données.
 */

const STORAGE_KEY = '22sentiers.astroSession';
const STORAGE_VERSION = 1;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90; // 90 jours

const isBrowser = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadAstroSession() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== STORAGE_VERSION) return null;
    if (parsed?.savedAt) {
      const savedTime = new Date(parsed.savedAt).getTime();
      if (Number.isFinite(savedTime) && Date.now() - savedTime > MAX_AGE_MS) {
        clearAstroSession();
        return null;
      }
    }
    return {
      form: parsed?.form || null,
      analysis: parsed?.analysis || null,
      savedAt: parsed?.savedAt || null,
    };
  } catch (err) {
    console.warn('[persistentStore] load failed', err);
    return null;
  }
}

export function saveAstroSession({ form, analysis }) {
  if (!isBrowser()) return;
  try {
    const payload = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      form: form || null,
      analysis: analysis || null,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    // QuotaExceededError peut survenir si le chart_svg est très gros.
    // On retente sans le SVG si jamais ça pose souci.
    if (err?.name === 'QuotaExceededError' && analysis?.chart_svg) {
      try {
        const slim = { ...analysis, chart_svg: null };
        const payload = {
          version: STORAGE_VERSION,
          savedAt: new Date().toISOString(),
          form: form || null,
          analysis: slim,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return;
      } catch (retryErr) {
        console.warn('[persistentStore] save retry failed', retryErr);
      }
    }
    console.warn('[persistentStore] save failed', err);
  }
}

export function patchAstroSession(patch) {
  if (!isBrowser()) return;
  const current = loadAstroSession() || {};
  saveAstroSession({
    form: patch?.form ?? current.form,
    analysis: patch?.analysis ?? current.analysis,
  });
}

export function clearAstroSession() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[persistentStore] clear failed', err);
  }
}

export function formatSavedAt(savedAt) {
  if (!savedAt) return '';
  try {
    const date = new Date(savedAt);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    return '';
  }
}
