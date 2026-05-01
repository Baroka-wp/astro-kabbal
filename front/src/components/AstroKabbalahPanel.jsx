import React from 'react';
import './AstroKabbalahPanel.css';

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
  Ascendant: 'Asc',
};

const SIGN_BASE = {
  Ari: 0,
  Tau: 30,
  Gem: 60,
  Can: 90,
  Leo: 120,
  Vir: 150,
  Lib: 180,
  Sco: 210,
  Sag: 240,
  Cap: 270,
  Aqu: 300,
  Pis: 330,
};

const SIGN_LABELS_FR = {
  Ari: 'Bélier',
  Tau: 'Taureau',
  Gem: 'Gémeaux',
  Can: 'Cancer',
  Leo: 'Lion',
  Vir: 'Vierge',
  Lib: 'Balance',
  Sco: 'Scorpion',
  Sag: 'Sagittaire',
  Cap: 'Capricorne',
  Aqu: 'Verseau',
  Pis: 'Poissons',
};

const ANGELS = [
  'Vehuiah', 'Yeliel', 'Sitael', 'Elemiah', 'Mahasiah', 'Lelahel', 'Achaiah', 'Cahethel', 'Haziel',
  'Aladiah', 'Lauviah', 'Hahaiah', 'Yezalel', 'Mebahel', 'Hariel', 'Hakamiah', 'Lauviah (2)', 'Caliel',
  'Leuviah', 'Pahaliah', 'Nelchael', 'Yeiayel', 'Melahel', 'Haheuiah', 'Nith-Haiah', 'Haaiah', 'Yerathel',
  'Seheiah', 'Reiyel', 'Omael', 'Lecabel', 'Vasariah', 'Yehuiah', 'Lehahiah', 'Chavakhiah', 'Menadel',
  'Aniel', 'Haamiah', 'Rehael', 'Ieiazel', 'Hahahel', 'Mikael', 'Veuliah', 'Yelahiah', 'Sealiah', 'Ariel',
  'Asaliah', 'Mihael', 'Vehuel', 'Daniel', 'Hahasiah', 'Imamiah', 'Nanael', 'Nithael', 'Mebahiah', 'Poyel',
  'Nemamiah', 'Yeialel', 'Harahel', 'Mitzrael', 'Umabel', 'Iah-Hel', 'Anauel', 'Mehiel', 'Damabiah',
  'Manakel', 'Eyael', 'Habuhiah', 'Rochel', 'Jabamiah', 'Haiyael', 'Mumiah',
];

const getAngelFromPlanet = (planet) => {
  const base = SIGN_BASE[planet?.sign];
  const inSignDegree = Number.isFinite(planet?.position) ? planet.position : null;
  const absoluteDegreeFromApi = Number.isFinite(planet?.absolute_degree) ? planet.absolute_degree : null;
  const absoluteDegree =
    absoluteDegreeFromApi !== null ? absoluteDegreeFromApi : (base !== undefined && inSignDegree !== null
      ? base + inSignDegree
      : null);

  if (absoluteDegree === null) {
    return null;
  }

  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const angelNumber = Math.floor(normalized / 5) + 1;
  const angelName = ANGELS[angelNumber - 1];

  if (!angelName) {
    return null;
  }

  return {
    angelNumber,
    angelName,
    absoluteDegree: normalized,
  };
};

const getDayAngelFromPlanet = (planet) => {
  const base = SIGN_BASE[planet?.sign];
  const inSignDegree = Number.isFinite(planet?.position) ? planet.position : null;
  const absoluteDegreeFromApi = Number.isFinite(planet?.absolute_degree) ? planet.absolute_degree : null;
  const absoluteDegree =
    absoluteDegreeFromApi !== null ? absoluteDegreeFromApi : (base !== undefined && inSignDegree !== null
      ? base + inSignDegree
      : null);

  if (absoluteDegree === null) {
    return null;
  }

  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const angelNumber = Math.floor(normalized % 72) + 1;
  const angelName = ANGELS[angelNumber - 1];

  if (!angelName) {
    return null;
  }

  return {
    angelNumber,
    angelName,
  };
};

const toFiniteNumber = (value) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
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

      <div className="astro-angels">
        <div className="astro-angel-head">
          <span>Planete</span>
          <span>Signe</span>
          <span>Degré</span>
          <span>Position absolue</span>
          <span>Ange des 5.</span>
          <span>Ange du jour (1°)</span>
        </div>
        {(analysis?.planets || []).map((planet) => {
          const signFr = SIGN_LABELS_FR[planet?.sign] || planet?.sign || '—';
          const degree = toFiniteNumber(planet?.position);
          const absDegree = toFiniteNumber(planet?.absolute_degree);
          const angelData = getAngelFromPlanet(planet);
          const dayAngelData = getDayAngelFromPlanet(planet);
          return (
            <div key={planet.name} className="astro-angel-row">
              <span>{SYMBOLS[planet.name] || '•'} {planet.name}</span>
              <span>{signFr}</span>
              <span>
                {degree !== null ? `${degree.toFixed(2)}°` : '—'}
              </span>
              <span>{absDegree !== null ? `${absDegree.toFixed(2)}°` : '—'}</span>
              <span className="score">
                {angelData
                  ? `${angelData.angelNumber} ${angelData.angelName}`
                  : 'Données de degré manquantes (relancer une analyse après redémarrage API)'}
              </span>
              <span className="score">
                {dayAngelData
                  ? `${dayAngelData.angelNumber} ${dayAngelData.angelName}`
                  : 'Données de degré manquantes'}
              </span>
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default AstroKabbalahPanel;
