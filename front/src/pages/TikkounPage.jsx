
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import pathsData from '../data/pathsData.json';
import rawTikkounData from '../data/tikkounData.json';
import '../components/PathDetail.css';
import './TikkounPage.css';

const SPHERE_RADIUS = 28;

const SEPHIROTH_META = [
  { id: 1, key: 'Kether', aliases: ['Kether'], hebrew: 'כֶּתֶר', accent: '#0369a1' },
  { id: 2, key: 'Chokmah', aliases: ['Hokhma', 'Chokmah'], hebrew: 'חָכְמָה', accent: '#15803d' },
  { id: 3, key: 'Binah', aliases: ['Binah'], hebrew: 'בִּינָה', accent: '#7c3aed' },
  { id: 4, key: 'Chesed', aliases: ['Hessed', 'Chesed'], hebrew: 'חֶסֶד', accent: '#c2410c' },
  { id: 5, key: 'Geburah', aliases: ['Guevourah', 'Geburah'], hebrew: 'גְּבוּרָה', accent: '#be123c' },
  { id: 6, key: 'Tiferet', aliases: ['Tiferet', 'Tiphareth'], hebrew: 'תִּפְאֶרֶת', accent: '#a16207' },
  { id: 7, key: 'Netzach', aliases: ['Netsah', 'Netzach'], hebrew: 'נֶצַח', accent: '#9d174d' },
  { id: 8, key: 'Hod', aliases: ['Hod'], hebrew: 'הוֹד', accent: '#1d4ed8' },
  { id: 9, key: 'Yesod', aliases: ['Yesod'], hebrew: 'יְסוֹד', accent: '#5b21b6' },
  { id: 10, key: 'Malkuth', aliases: ['Malkhout', 'Malkuth'], hebrew: 'מַלְכוּת', accent: '#166534' },
];

const META_BY_ID = Object.fromEntries(SEPHIROTH_META.map((item) => [item.id, item]));

function getSephirahContent(meta) {
  const entries = rawTikkounData?.dix_sephiroth_tikkoun || {};
  for (const alias of meta.aliases) {
    if (entries[alias]) return entries[alias];
  }
  return null;
}

function TreeSVG({ selectedSephirahId, onSelectSephirah, paths = [] }) {
  const [hoveredSephirah, setHoveredSephirah] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const sephirothPositions = {
    1: { x: 220, y: 34, name: 'Kether' },
    2: { x: 330, y: 128, name: 'Chokmah' },
    3: { x: 110, y: 128, name: 'Binah' },
    4: { x: 330, y: 260, name: 'Chesed' },
    5: { x: 110, y: 260, name: 'Geburah' },
    6: { x: 220, y: 350, name: 'Tiferet' },
    7: { x: 330, y: 480, name: 'Netzach' },
    8: { x: 110, y: 480, name: 'Hod' },
    9: { x: 220, y: 590, name: 'Yesod' },
    10: { x: 220, y: 705, name: 'Malkuth' },
  };

  const defaultPaths = [
    { id: 11, from: 1, to: 2 }, { id: 12, from: 1, to: 3 }, { id: 13, from: 1, to: 6 },
    { id: 14, from: 2, to: 3 }, { id: 15, from: 2, to: 6 }, { id: 16, from: 2, to: 4 },
    { id: 17, from: 3, to: 6 }, { id: 18, from: 3, to: 5 }, { id: 19, from: 4, to: 5 },
    { id: 20, from: 4, to: 6 }, { id: 21, from: 4, to: 7 }, { id: 22, from: 5, to: 6 },
    { id: 23, from: 5, to: 8 }, { id: 24, from: 6, to: 7 }, { id: 25, from: 6, to: 9 },
    { id: 26, from: 6, to: 8 }, { id: 27, from: 7, to: 8 }, { id: 28, from: 7, to: 9 },
    { id: 29, from: 8, to: 10 }, { id: 30, from: 8, to: 9 }, { id: 31, from: 9, to: 10 },
    { id: 32, from: 7, to: 10 },
  ];

  const activePaths = paths.length
    ? paths.map((p) => ({ id: p.id, from: p.connections?.from_number, to: p.connections?.to_number })).filter((p) => p.from && p.to)
    : defaultPaths;

  return (
    <svg viewBox="0 0 440 750" className="tikkoun-tree-svg">
      {activePaths.map((p) => {
        const from = sephirothPositions[p.from];
        const to = sephirothPositions[p.to];
        if (!from || !to) return null;
        const isHov = hoveredEdge === p.id;
        return (
          <g key={p.id}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={22} onMouseEnter={() => setHoveredEdge(p.id)} onMouseLeave={() => setHoveredEdge(null)} />
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#cbd5e1" strokeWidth={isHov ? 5 : 4} strokeLinecap="round" opacity={isHov ? 1 : 0.5} style={{ pointerEvents: 'none' }} />
          </g>
        );
      })}

      {Object.entries(sephirothPositions).map(([num, pos]) => {
        const id = Number(num);
        const meta = META_BY_ID[id];
        const nodeAccent = meta?.accent || '#64748b';
        const isSelected = selectedSephirahId === id;
        const isHov = hoveredSephirah === id;
        return (
          <g
            key={num}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectSephirah(id)}
            onMouseEnter={() => setHoveredSephirah(id)}
            onMouseLeave={() => setHoveredSephirah(null)}
          >
            <circle cx={pos.x} cy={pos.y} r={SPHERE_RADIUS + (isSelected || isHov ? 4 : 0)} fill={isSelected ? nodeAccent : '#ffffff'} stroke={isSelected ? nodeAccent : isHov ? nodeAccent : '#d7e0ea'} strokeWidth={isSelected ? 3 : 2} />
            <text x={pos.x} y={pos.y - 6} textAnchor="middle" className="tikkoun-tree-hebrew" fill={isSelected ? '#fff' : nodeAccent}>
              {meta?.hebrew || ''}
            </text>
            <text x={pos.x} y={pos.y + 10} textAnchor="middle" className="tikkoun-tree-name" fill={isSelected ? 'rgba(255,255,255,0.82)' : '#64748b'}>
              {pos.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TikkounDetail({ id, onClose }) {
  const meta = META_BY_ID[id];
  const data = meta ? getSephirahContent(meta) : null;
  const practices = data?.tikkoun?.pratiques || [];
  const qliphah = data?.qliphah_associee || {};
  const symptoms = data?.symptomes_du_blocage || [];

  if (!data || !meta) return null;

  const handlePrint = () => {
    document.body.classList.add('print-path-detail');
    window.print();
    setTimeout(() => document.body.classList.remove('print-path-detail'), 250);
  };

  return (
    <article className="path-detail tikkoun-detail">
      <div className="path-detail-toolbar path-detail-print-hide">
        <button type="button" className="back-btn back-btn-close" onClick={onClose} aria-label="Fermer la fiche">×</button>
        <button type="button" className="path-print-btn" onClick={handlePrint}>Telecharger cette fiche (PDF)</button>
      </div>

      <header className="path-detail-header">
        <div className="path-main-symbol">
          <div className="big-hebrew">{meta.hebrew}</div>
          <div className="big-name">{meta.key}</div>
          <div className="big-meaning">Tikkoun & Qliphah - Tradition juive primaire</div>
        </div>
        <p className="path-intro-paragraph"><strong>Essence :</strong> {data.essence}</p>
      </header>

      <div className="path-detail-content">
        <section className="section">
          <h2>Apercu du blocage</h2>
          <p><strong>Qliphah associee :</strong> {qliphah.nom} - {qliphah.traduction}</p>
          <p>{qliphah.nature_juive}</p>
          {qliphah.note_textuelle ? <p><strong>Note :</strong> {qliphah.note_textuelle}</p> : null}
          {data.mecanisme_du_blocage ? <p><strong>Mecanisme du blocage :</strong> {data.mecanisme_du_blocage}</p> : null}
          {qliphah.source ? <p className="tikkoun-source">Source : {qliphah.source}</p> : null}
          <h3>Symptomes observes</h3>
          {symptoms.map((s) => <p key={s}>- {s}</p>)}
        </section>

        <section className="section">
          <h2>Tikkoun</h2>
          <p><strong>Principe :</strong> {data.tikkoun?.principe}</p>
          <p><strong>Acte concret :</strong> {data.tikkoun?.acte_concret}</p>
          <p><strong>Duree recommandee :</strong> {data.tikkoun?.duree_recommandee}</p>
          {data.tikkoun?.duree_explication ? <p>{data.tikkoun.duree_explication}</p> : null}
          {data.tikkoun?.duree_type_label ? <p><em>{data.tikkoun.duree_type_label}</em></p> : null}
        </section>

        <section className="section">
          <h2>Pratiques recommandees</h2>
          {practices.map((p, idx) => (
            <div key={`${p.nom}-${idx}`} className="tikkoun-practice-block">
              <h3>{idx + 1}. {p.nom}</h3>
              <p>{p.description}</p>
              {p.verset_cle ? <p><strong>Verset cle :</strong> {p.verset_cle}</p> : null}
              {p.kavanah ? <p><strong>Kavanah :</strong> {p.kavanah}</p> : null}
              {p.psaume ? <p><strong>Psaume :</strong> {p.psaume}</p> : null}
              <p className="tikkoun-source">Source : {p.source}</p>
            </div>
          ))}
        </section>
      </div>
    </article>
  );
}

export default function TikkounPage() {
  const [selectedSephirahId, setSelectedSephirahId] = useState(null);
  const availablePaths = useMemo(() => (Array.isArray(pathsData?.paths) ? pathsData.paths : []), []);
  const globalOrder = rawTikkounData?.processus_tikkoun_global?.ordre_du_travail || [];

  return (
    <div className="app tikkoun-page">
      <header className="app-header">
        <div className="app-header-title">
          <nav className="app-top-menu" aria-label="Navigation principale">
            <Link to="/" className="app-header-home" aria-label="Retour a l'accueil">← Accueil</Link>
            <Link to="/?edit=1" className="app-header-home" aria-label="Modifier mes informations natales">Mes infos</Link>
          </nav>
          <h1>{rawTikkounData?.titre || 'Tikkoun des Qliphoth'}</h1>
        </div>
        <p>{rawTikkounData?.description}</p>
      </header>

      <div className="app-content">
        <section className="tree-panel tikkoun-tree-panel">
          <div className="tree-panel-header tikkoun-tree-header">
            <h2>Schema sephirotique interactif</h2>
            <p>Cliquez sur une sphere pour ouvrir la fiche Tikkoun detaillee.</p>
          </div>
          <TreeSVG selectedSephirahId={selectedSephirahId} onSelectSephirah={setSelectedSephirahId} paths={availablePaths} />
        </section>

        <aside className="info-panel tikkoun-info-panel">
          <div className="info-panel-header">
            <h2>Module Tikkoun</h2>
            <p>{rawTikkounData?.avertissement}</p>
          </div>
          <div className="tikkoun-page-links">
            <Link to="/explorer" className="tikkoun-link">Aller vers Astro-Kabbale</Link>
          </div>
          <div className="tikkoun-help-tags">
            {SEPHIROTH_META.map((m) => (
              <button key={m.id} type="button" onClick={() => setSelectedSephirahId(m.id)} aria-label={`Ouvrir ${m.key}`}>
                {m.hebrew} {m.key}
              </button>
            ))}
          </div>
          <div className="tikkoun-selection-hint">
            <h3>Ordre recommande</h3>
            {globalOrder.slice(0, 5).map((item) => <p key={item}>- {item}</p>)}
            <p><em>La suite est detaillee dans la fiche globale du JSON.</em></p>
          </div>
        </aside>
      </div>

      {selectedSephirahId ? (
        <div className="modal-overlay" role="presentation">
          <div className="modal-content" role="dialog" aria-modal="true" aria-label="Fiche Tikkoun">
            <TikkounDetail id={selectedSephirahId} onClose={() => setSelectedSephirahId(null)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

