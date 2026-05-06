import React, { useEffect, useMemo, useRef, useState } from 'react';
import './AstroInputForm.css';

const EMPTY_FORM = {
  birth_date: '',
  birth_time: '',
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  timezone: '',
};

const buildInitialForm = (initialValues) => ({
  ...EMPTY_FORM,
  ...(initialValues || {}),
});

/** ISO YYYY-MM-DD → affichage JJ/MM/AAAA */
function isoToDateDisplay(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Chaîne 8 chiffres jjmmaaaa → ISO ou null si date invalide */
function digitsToIso(digits) {
  if (digits.length !== 8) return null;
  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);
  if (year < 1800 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(year, month - 1, day);
  if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateDigits(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Interprète la saisie : ISO collé, ou JJ/MM/AAAA (chiffres + séparateurs) */
function parseDateInputToIso(raw) {
  const t = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, mo, d] = t.split('-').map((x) => parseInt(x, 10));
    if (y < 1800 || y > 2200) return null;
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return t;
  }
  const digits = t.replace(/\D/g, '');
  return digitsToIso(digits);
}

/** Affiche HH:MM à partir de 1 à 4 chiffres */
function formatTimeDigits(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** HH:MM valide 00:00–23:59 ou null */
function parseTimeInputToHm(raw) {
  const t = raw.trim();
  if (/^\d{1,2}:\d{1,2}$/.test(t)) {
    const [a, b] = t.split(':');
    const h = parseInt(a, 10);
    const m = parseInt(b, 10);
    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const digits = t.replace(/\D/g, '');
  if (digits.length !== 4) return null;
  const h = parseInt(digits.slice(0, 2), 10);
  const m = parseInt(digits.slice(2, 4), 10);
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const AstroInputForm = ({ onSubmit, loading, error, initialValues }) => {
  const [formData, setFormData] = useState(() => buildInitialForm(initialValues));
  const [dateDisplay, setDateDisplay] = useState(() =>
    initialValues?.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(initialValues.birth_date)
      ? isoToDateDisplay(initialValues.birth_date)
      : ''
  );
  const [timeDisplay, setTimeDisplay] = useState(() => initialValues?.birth_time || '');
  const [dateTimeError, setDateTimeError] = useState('');
  const [searchText, setSearchText] = useState(initialValues?.city || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const skipNextGeocode = useRef(false);

  useEffect(() => {
    if (!initialValues) return;
    setFormData((prev) => {
      const isEmpty =
        !prev.birth_date && !prev.birth_time && !prev.city && !prev.latitude && !prev.longitude;
      if (!isEmpty) return prev;
      const next = buildInitialForm(initialValues);
      Promise.resolve().then(() => {
        if (next.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(next.birth_date)) {
          setDateDisplay(isoToDateDisplay(next.birth_date));
        } else {
          setDateDisplay('');
        }
        setTimeDisplay(next.birth_time || '');
      });
      return next;
    });
    if (initialValues.city) {
      setSearchText((prev) => prev || initialValues.city);
    }
  }, [initialValues]);

  const applyDateInput = (raw) => {
    setDateTimeError('');
    const t = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      const iso = parseDateInputToIso(t);
      setDateDisplay(iso ? isoToDateDisplay(iso) : raw);
      setFormData((prev) => ({ ...prev, birth_date: iso || '' }));
      return;
    }
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    setDateDisplay(formatDateDigits(digits));
    const iso = digits.length === 8 ? digitsToIso(digits) : null;
    setFormData((prev) => ({ ...prev, birth_date: iso || '' }));
  };

  const applyTimeInput = (raw) => {
    setDateTimeError('');
    const t = raw.trim();
    if (/^\d{1,2}:\d{1,2}$/.test(t)) {
      const hm = parseTimeInputToHm(t);
      setTimeDisplay(hm || raw);
      setFormData((prev) => ({ ...prev, birth_time: hm || '' }));
      return;
    }
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setTimeDisplay(formatTimeDigits(digits));
    const hm = digits.length === 4 ? parseTimeInputToHm(formatTimeDigits(digits)) : null;
    setFormData((prev) => ({ ...prev, birth_time: hm || '' }));
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'city') {
      setSearchText(value);
      setFormData((prev) => ({
        ...prev,
        city: value,
        country: '',
        latitude: null,
        longitude: null,
        timezone: '',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (skipNextGeocode.current) {
      skipNextGeocode.current = false;
      return;
    }
    const query = searchText.trim();
    if (query.length < 3) {
      setCitySuggestions([]);
      setGeoError('');
      return;
    }

    // Si le champ correspond exactement à la ville résolue (ex: rechargée depuis le storage),
    // on ne propose pas de suggestions tant que l'utilisateur ne modifie pas le champ.
    if (
      formData.city &&
      formData.latitude !== null &&
      formData.longitude !== null &&
      query.toLowerCase() === formData.city.toLowerCase()
    ) {
      setCitySuggestions([]);
      setGeoError('');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setGeoLoading(true);
      setGeoError('');
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=8&language=fr&format=json`;
        const response = await fetch(url, { signal: controller.signal });
        const payload = await response.json();
        const raw = Array.isArray(payload?.results) ? payload.results : [];
        const seen = new Set();
        const suggestions = [];
        for (const r of raw) {
          const k = [r.id, r.name, r.country, r.latitude, r.longitude].filter(Boolean).join('|');
          if (seen.has(k)) continue;
          seen.add(k);
          suggestions.push(r);
        }
        setCitySuggestions(suggestions);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setGeoError("Impossible de recuperer les coordonnees de ville pour l'instant.");
        }
      } finally {
        setGeoLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchText, formData.city, formData.latitude, formData.longitude]);

  const selectedGeoReady = useMemo(
    () =>
      Boolean(
        formData.city && formData.country && formData.latitude !== null && formData.longitude !== null
      ),
    [formData]
  );

  const applySuggestion = (suggestion) => {
    skipNextGeocode.current = true;
    setFormData((prev) => ({
      ...prev,
      city: suggestion?.name || prev.city,
      country: suggestion?.country || '',
      latitude: suggestion?.latitude ?? null,
      longitude: suggestion?.longitude ?? null,
      timezone: suggestion?.timezone || '',
    }));
    setSearchText(suggestion?.name || '');
    setCitySuggestions([]);
    setGeoError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const isoDate = parseDateInputToIso(dateDisplay);
    const hmTime = parseTimeInputToHm(timeDisplay);
    if (!isoDate || !hmTime) {
      setDateTimeError(
        'Verifiez la date (JJ/MM/AAAA ou AAAA-MM-JJ) et l\'heure (HH:MM, 24 h).'
      );
      return;
    }
    setDateTimeError('');
    const payload = { ...formData, birth_date: isoDate, birth_time: hmTime };
    setFormData(payload);
    if (!selectedGeoReady) return;
    onSubmit?.(payload);
  };

  return (
    <form className="astro-form" onSubmit={handleSubmit}>
      <h3>Astro-Kabbale</h3>
      <p>Entrez vos details de naissance pour generer votre carte et voir les correspondances.</p>

      <label htmlFor="astro-birth-date">
        Date de naissance
        <input
          id="astro-birth-date"
          name="birth_date"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="JJ/MM/AAAA"
          aria-describedby="astro-birth-date-hint"
          value={dateDisplay}
          onChange={(e) => applyDateInput(e.target.value)}
          onBlur={() => {
            const iso = parseDateInputToIso(dateDisplay);
            if (iso) setDateDisplay(isoToDateDisplay(iso));
          }}
        />
        <span id="astro-birth-date-hint" className="astro-form-hint">
          Saisie au clavier : chiffres puis barres (ex. 15041992 → 15/04/1992), ou collez AAAA-MM-JJ.
        </span>
      </label>

      <label htmlFor="astro-birth-time">
        Heure de naissance
        <input
          id="astro-birth-time"
          name="birth_time"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="HH:MM"
          aria-describedby="astro-birth-time-hint"
          value={timeDisplay}
          onChange={(e) => applyTimeInput(e.target.value)}
          onBlur={() => {
            const hm = parseTimeInputToHm(timeDisplay);
            if (hm) setTimeDisplay(hm);
          }}
        />
        <span id="astro-birth-time-hint" className="astro-form-hint">
          24 h : 4 chiffres (0535 → 05:35) ou saisie avec deux-points (5:35).
        </span>
      </label>

      {dateTimeError && <div className="astro-form-error">{dateTimeError}</div>}

      <label className="city-field-label">
        Ville
        <input
          type="text"
          name="city"
          placeholder="Paris"
          value={searchText}
          onChange={onChange}
          required
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={citySuggestions.length > 0}
          aria-controls="city-suggestion-list"
        />
      </label>
      {geoLoading && <div className="geo-hint">Recherche des coordonnees...</div>}
      {geoError && <div className="astro-form-error">{geoError}</div>}
      {citySuggestions.length > 0 && (
        <ul className="city-suggestions" id="city-suggestion-list" role="listbox" aria-label="Villes proposées">
          {citySuggestions.map((suggestion, idx) => (
            <li key={`sug-${suggestion.id ?? 'x'}-${idx}`} className="city-suggestion-li" role="option">
              <button
                type="button"
                className="city-suggestion"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(suggestion);
                }}
              >
                <span className="city-suggestion-name">{suggestion.name}</span>
                <span className="city-suggestion-meta">
                  {suggestion.country}
                  {suggestion.admin1 ? `, ${suggestion.admin1}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <label>
        Pays
        <input
          type="text"
          name="country"
          placeholder="France"
          value={formData.country}
          readOnly
        />
      </label>
      <div className="geo-coords">
        <span>Lat: {formData.latitude ?? '-'}</span>
        <span>Lon: {formData.longitude ?? '-'}</span>
      </div>

      <button
        type="submit"
        disabled={loading || !selectedGeoReady || !formData.birth_date || !formData.birth_time}
      >
        {loading ? 'Calcul en cours...' : 'Generer ma carte'}
      </button>

      {error && <div className="astro-form-error">{error}</div>}
    </form>
  );
};

export default AstroInputForm;
