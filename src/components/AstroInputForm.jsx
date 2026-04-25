import React, { useEffect, useMemo, useState } from 'react';
import './AstroInputForm.css';

const AstroInputForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    birth_date: '',
    birth_time: '',
    city: '',
    country: '',
    latitude: null,
    longitude: null,
    timezone: '',
  });
  const [searchText, setSearchText] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

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
    const query = searchText.trim();
    if (query.length < 3) {
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
        )}&count=6&language=fr&format=json`;
        const response = await fetch(url, { signal: controller.signal });
        const payload = await response.json();
        const suggestions = Array.isArray(payload?.results) ? payload.results : [];
        setCitySuggestions(suggestions);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setGeoError("Impossible de recuperer les coordonnees de ville pour l'instant.");
        }
      } finally {
        setGeoLoading(false);
      }
    }, 260);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchText]);

  const selectedGeoReady = useMemo(
    () =>
      Boolean(
        formData.city && formData.country && formData.latitude !== null && formData.longitude !== null
      ),
    [formData]
  );

  const applySuggestion = (suggestion) => {
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

      <label>
        Ville
        <input
          type="text"
          name="city"
          placeholder="Paris"
          value={searchText}
          onChange={onChange}
          required
          autoComplete="off"
        />
      </label>
      {geoLoading && <div className="geo-hint">Recherche des coordonnees...</div>}
      {geoError && <div className="astro-form-error">{geoError}</div>}
      {citySuggestions.length > 0 && (
        <div className="city-suggestions">
          {citySuggestions.map((suggestion) => (
            <button
              key={`${suggestion.id}-${suggestion.latitude}-${suggestion.longitude}`}
              type="button"
              className="city-suggestion"
              onClick={() => applySuggestion(suggestion)}
            >
              <span>{suggestion.name}</span>
              <span>
                {suggestion.country}
                {suggestion.admin1 ? `, ${suggestion.admin1}` : ''}
              </span>
            </button>
          ))}
        </div>
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
