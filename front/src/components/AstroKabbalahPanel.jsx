import React from 'react';
import './AstroKabbalahPanel.css';
import { getRegleGeneraleAngeRemede } from '../lib/angelRemedes';

const SYMBOLS = {
  Soleil: '☉',
  Lune: '☽',
  Mercure: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturne: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluton: '♇',
  Terre: '⊕',
};

const AstroKabbalahPanel = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="astro-panel-empty">
        <p>Remplissez le formulaire pour afficher votre carte astro-kabbalistique.</p>
      </div>
    );
  }

  const topBlocked = [...(analysis?.planets || [])]
    .sort((a, b) => (b?.blocked_score || 0) - (a?.blocked_score || 0))
    .slice(0, 3);

  return (
    <section className="astro-panel">
      <div className="astro-panel-header">
        <h3>Synthese Astro-Kabbale</h3>
        <span>{analysis?.profile?.city || '-'}, {analysis?.profile?.country || '-'}</span>
      </div>
      <div className="astro-run-meta">
        <span>Mode: {analysis?.analysis_mode || 'inconnu'}</span>
        <span>Analyse: {analysis?.analysis_id || '-'}</span>
      </div>

      <div className="astro-panel-cards">
        <div className="astro-card">
          <strong>Date</strong>
          <span>{analysis?.profile?.birth_date}</span>
        </div>
        <div className="astro-card">
          <strong>Heure</strong>
          <span>{analysis?.profile?.birth_time}</span>
        </div>
        <div className="astro-card">
          <strong>Top blocages</strong>
          <span>{topBlocked.map((planet) => planet.name).join(', ') || 'Aucun'}</span>
        </div>
      </div>

      <div className="astro-table">
        <div className="astro-row astro-head">
          <span>Planete</span>
          <span>Maison</span>
          <span>Dignite</span>
          <span>Score</span>
        </div>
        {(analysis?.planets || []).map((planet) => (
          <div key={planet.name} className="astro-row">
            <span>{SYMBOLS[planet.name] || '•'} {planet.name}</span>
            <span>{planet.house || '-'}</span>
            <span>{planet.dignity_status || 'neutre'}</span>
            <span className="score">{planet.blocked_score}</span>
          </div>
        ))}
      </div>

      <details className="astro-angel-rule">
        <summary>Règle des 72 anges (Shem ha-Mephorash) et rituels</summary>
        <p className="astro-angel-rule-text">{getRegleGeneraleAngeRemede()}</p>
        <p className="astro-angel-rule-hint">
          Les correspondances détaillées (nom d&apos;Ange, psaume, sentier) apparaissent sous chaque aspect
          difficile dans le détail d&apos;une Sephirah (onglet Astro-Kabbale) ou dans le flux sur l&apos;Arbre.
        </p>
      </details>

    </section>
  );
};

export default AstroKabbalahPanel;
