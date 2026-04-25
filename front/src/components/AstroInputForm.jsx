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

const AstroInputForm = ({ onSubmit, loading, error, initialValues }) => {
  const [formData, setFormData] = useState(() => buildInitialForm(initialValues));
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
      return buildInitialForm(initialValues);
    });
    if (initialValues.city) {
      setSearchText((prev) => prev || initialValues.city);
    }
  }, [initialValues]);

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
    if (!selectedGeoReady) return;
    onSubmit?.(formData);
  };

  return (
    <form className="astro-form" onSubmit={handleSubmit}>
      <h3>Astro-Kabbale</h3>
      <p>Entrez vos details de naissance pour generer votre carte et voir les correspondances.</p>

      <label>
        Date de naissance
        <input type="date" name="birth_date" value={formData.birth_date} onChange={onChange} required />
      </label>

      <label>
        Heure de naissance
        <input type="time" name="birth_time" value={formData.birth_time} onChange={onChange} required />
      </label>

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

      <button type="submit" disabled={loading || !selectedGeoReady}>
        {loading ? 'Calcul en cours...' : 'Generer ma carte'}
      </button>

      {error && <div className="astro-form-error">{error}</div>}
    </form>
  );
};

export default AstroInputForm;
