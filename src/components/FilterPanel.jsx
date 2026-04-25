import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, setFilters, options }) => {
  const pillars = options?.pillars || [];
  const elements = options?.elements || [];
  const planets = options?.planets || [];
  const signs = options?.signs || [];

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ pillar: '', element: '', planet: '', sign: '' });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h4>Filtrer les chemins</h4>
        <button className="reset-btn" onClick={resetFilters}>
          Reinitialiser
        </button>
      </div>

      <div className="filter-group">
        <label>Pilier</label>
        <select value={filters.pillar} onChange={(e) => updateFilter('pillar', e.target.value)}>
          <option value="">Tous</option>
          {pillars.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Element</label>
        <select value={filters.element} onChange={(e) => updateFilter('element', e.target.value)}>
          <option value="">Tous</option>
          {elements.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Planete</label>
        <select value={filters.planet} onChange={(e) => updateFilter('planet', e.target.value)}>
          <option value="">Toutes</option>
          {planets.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Signe</label>
        <select value={filters.sign} onChange={(e) => updateFilter('sign', e.target.value)}>
          <option value="">Tous</option>
          {signs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
