import React, { useState } from 'react';
import './SephirahDetail.css';
import './PathDetail.css';
import SimpleMarkdown from './SimpleMarkdown';
import {
  getSephirahBlockedMeaning,
  getAspectInterpretation,
  getAspectPretty,
  getPlanetMeaning,
  getRichSephirahData,
  getRichAspectInterpretation,
} from '../lib/kabbalisticInterpreter';
import { getAngelRemedeEntry, getSephirahAngelBlocage } from '../lib/angelRemedes';
import AngelRemedeBlock from './AngelRemedeBlock';

const SIGN_LABELS = {
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

const DIGNITY_LABELS = {
  rulership: 'Domicile',
  exaltation: 'Exaltation',
  detriment: 'Exil',
  fall: 'Chute',
  neutral: 'Neutre',
};

const ASPECT_GLYPHS = {
  square: '□',
  opposition: '☍',
  quincunx: '⚻',
};

const DIRECTION_BADGE = {
  descending: 'Aller',
  ascending: 'Retour',
};

const pickDirectional = (value, mode) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[mode] || value.descending || value.ascending || '';
  }
  return String(value);
};

const stripCitations = (text) => {
  if (!text) return '';
  return String(text).replace(/\[citation:[^\]]+\]/g, '').trim();
};

const SephirahDirectionSwitch = ({ direction, onChange, sephirahName }) => {
  const fromNode = 'Source';
  const toNode = sephirahName || 'Sephirah';
  return (
    <div className="direction-switch" role="group" aria-label="Lecture aller ou retour sur cette sphère">
      <button
        type="button"
        className={`direction-chip ${direction === 'descending' ? 'active' : ''}`}
        onClick={() => onChange?.('descending')}
        aria-pressed={direction === 'descending'}
      >
        <span className="direction-chip-label">Aller</span>
        <span className="direction-chip-route">
          {fromNode} → {toNode}
        </span>
      </button>
      <button
        type="button"
        className={`direction-chip ${direction === 'ascending' ? 'active' : ''}`}
        onClick={() => onChange?.('ascending')}
        aria-pressed={direction === 'ascending'}
      >
        <span className="direction-chip-label">Retour</span>
        <span className="direction-chip-route">
          {toNode} → {fromNode}
        </span>
      </button>
    </div>
  );
};

const SephirahDetail = ({
  sephirah,
  selectedDirection = 'descending',
  onDirectionChange,
  onBack,
  astroSephirahData,
  astroPlanetData,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  if (!sephirah) return null;

  const qliphothMeaning = sephirah?.qliphoth?.meaning || sephirah?.qliphoth?.meaing;

  const showDirectionBar = ['direction', 'message', 'integration', 'qliphoth'].includes(activeTab);

  const meditationText = stripCitations(pickDirectional(sephirah?.meditation, selectedDirection));
  const messageText = stripCitations(pickDirectional(sephirah?.angel_message, selectedDirection));
  const integrationText = stripCitations(pickDirectional(sephirah?.integration, selectedDirection));
  const qliphCorrectiveText = stripCitations(
    pickDirectional(sephirah?.qliphoth_work?.corrective_meditation, selectedDirection)
  );
  const qliphRitualText = stripCitations(
    pickDirectional(sephirah?.qliphoth_work?.ritual_action, selectedDirection)
  );

  return (
    <div className="sephirah-detail">
      <button className="back-btn" onClick={onBack}>
        ← Retour
      </button>

      <header className="sephirah-detail-header">
        <div className="sephirah-main-symbol">
          <div className="big-hebrew">{sephirah.hebrew}</div>
          <div>
            <div className="big-name">
              {sephirah.id}. {sephirah.name}
            </div>
            <div className="big-meaning">{sephirah.meaning}</div>
          </div>
        </div>

        <div className="sephirah-main-info">
          <div className="info-card">
            <span className="info-label">Pilier</span>
            <span className="info-value">{sephirah.pillar}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Position</span>
            <span className="info-value">Sephirah {sephirah.id} / 10</span>
          </div>
          <div className="info-card">
            <span className="info-label">Ange</span>
            <span className="info-value">{sephirah?.angel?.name}</span>
            {sephirah?.angel?.alternate_names?.length > 0 && (
              <span className="info-sub">{sephirah.angel.alternate_names.join(', ')}</span>
            )}
          </div>
        </div>
      </header>

      <div className="path-detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Aperçu
        </button>
        <button
          className={`tab-btn ${activeTab === 'direction' ? 'active' : ''}`}
          onClick={() => setActiveTab('direction')}
        >
          Direction
        </button>
        <button
          className={`tab-btn ${activeTab === 'message' ? 'active' : ''}`}
          onClick={() => setActiveTab('message')}
        >
          Message
        </button>
        <button
          className={`tab-btn ${activeTab === 'integration' ? 'active' : ''}`}
          onClick={() => setActiveTab('integration')}
        >
          Intégration
        </button>
        <button
          className={`tab-btn ${activeTab === 'qliphoth' ? 'active' : ''}`}
          onClick={() => setActiveTab('qliphoth')}
        >
          Qliphoth
        </button>
        <button
          className={`tab-btn ${activeTab === 'astro' ? 'active' : ''}`}
          onClick={() => setActiveTab('astro')}
        >
          Astro-Kabbale
        </button>
      </div>

      {showDirectionBar && (
        <SephirahDirectionSwitch
          direction={selectedDirection}
          onChange={onDirectionChange}
          sephirahName={sephirah.name}
        />
      )}

      {activeTab === 'overview' && (
        <>
          <section className="section">
            <h3>Titres</h3>
            <div className="attributes-grid">
              <div>
                <strong>Sefer Yetzirah</strong>
                {sephirah?.titles?.sefer_yetzirah}
              </div>
              <div>
                <strong>Godwin</strong>
                {sephirah?.titles?.godwin}
              </div>
            </div>
          </section>
          <section className="section">
            <h3>Mots-clés</h3>
            <div className="keywords-list">
              {(sephirah?.keywords || []).map((keyword) => (
                <span key={keyword} className="keyword-badge">
                  {keyword}
                </span>
              ))}
            </div>
          </section>
          <section className="section">
            <h3>Ange tutélaire</h3>
            <div className="angel-card">
              <div className="angel-name">{sephirah?.angel?.name}</div>
              {sephirah?.angel?.alternate_names?.length > 0 && (
                <div className="angel-alternates">Aussi appelé : {sephirah.angel.alternate_names.join(', ')}</div>
              )}
              <div className="angel-function">{sephirah?.angel?.function}</div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'direction' && (
        <section className="section">
          <h3>Direction de lecture</h3>
          <div className="direction-card sephirah-direction-card">
            <div className="direction-label">
              {selectedDirection === 'descending' ? 'Expérience descendante' : 'Expérience ascendante'}
            </div>
            <p>{sephirah?.direction_experience?.[selectedDirection]}</p>
          </div>
          <div className="meditation-text-sephirah">
            <h4>
              Méditation
              <span className="direction-badge">{DIRECTION_BADGE[selectedDirection]}</span>
            </h4>
            <div className="meditation-frame">
              <p>{meditationText || 'Méditation non renseignée pour cette direction.'}</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'message' && (
        <section className="section sephirah-tab-panel">
          <h3>
            Message angélique
            <span className="direction-badge">{DIRECTION_BADGE[selectedDirection]}</span>
          </h3>
          <div className="message-quote">
            <span className="quote-mark">“</span>
            {messageText || 'Message non renseigné pour cette direction.'}
            <span className="quote-mark">”</span>
            <div className="angel-signature">— {sephirah?.angel?.name}</div>
          </div>
        </section>
      )}

      {activeTab === 'integration' && (
        <section className="section sephirah-tab-panel">
          <h3>
            Intégration quotidienne
            <span className="direction-badge">{DIRECTION_BADGE[selectedDirection]}</span>
          </h3>
          <div className="integration-card">
            <p>{integrationText || 'Intégration non renseignée pour cette direction.'}</p>
          </div>
        </section>
      )}

      {activeTab === 'qliphoth' && (
        <section className="section sephirah-tab-panel">
          <h3>Travail d&apos;ombre (Qliphoth)</h3>
          <div className="warning qliphoth-card">
            <p>
              <strong>Démon : </strong>
              {sephirah?.qliphoth?.demon}
            </p>
            <p>
              <strong>Signification : </strong>
              {qliphothMeaning}
            </p>
            <p>
              <strong>Fonction : </strong>
              {sephirah?.qliphoth?.function}
            </p>
            <p>
              <strong>Ombre : </strong>
              {stripCitations(sephirah?.qliphoth?.shadow || '')}
            </p>
          </div>
          <div className="corrective-card">
            <h4>
              <span className="direction-label">Méditation corrective</span>
              <span className="direction-badge direction-badge-qliph">{DIRECTION_BADGE[selectedDirection]}</span>
            </h4>
            <p>{qliphCorrectiveText || '—'}</p>
          </div>
          <div className="ritual-card">
            <h4>
              <span className="direction-label">Action rituelle</span>
              <span className="direction-badge direction-badge-qliph">{DIRECTION_BADGE[selectedDirection]}</span>
            </h4>
            <p>{qliphRitualText || '—'}</p>
          </div>
        </section>
      )}

      {activeTab === 'astro' && (
        <section className="section">
          <h3>Lecture Astro-Kabbale</h3>
          {(() => {
            const richSephirah = getRichSephirahData(sephirah.name);
            if (!richSephirah?.signification) return null;
            return (
              <div className="kabbalistic-signification">
                <span className="kabbalistic-tag">Signification kabbalistique</span>
                <SimpleMarkdown source={richSephirah.signification} className="kabbalistic-markdown" />
              </div>
            );
          })()}
          {astroSephirahData ? (
            <>
              {(() => {
                const blockedMeaning = getSephirahBlockedMeaning(sephirah.name);
                const isBlocked =
                  astroSephirahData.has_hard_aspects ||
                  astroSephirahData.weak_dignity ||
                  ['modere', 'eleve'].includes(astroSephirahData.level);
                if (!blockedMeaning || !isBlocked) return null;
                const angelBlocage = getSephirahAngelBlocage(sephirah.name);
                return (
                  <div className="kabbalistic-blocked-card">
                    <span className="kabbalistic-tag">Symptome actuel ({sephirah.name} bloquee)</span>
                    <p>{blockedMeaning}</p>
                    {angelBlocage && (
                      <p className="kabbalistic-angel-blocage">
                        <span className="kabbalistic-tag kabbalistic-tag-inline">Lecture 72 anges (sphère)</span>
                        {angelBlocage}
                      </p>
                    )}
                  </div>
                );
              })()}
              <div className="astro-sephirah-summary">
                <div className="astro-sephirah-cell">
                  <span className="astro-cell-label">Planète principale</span>
                  <span className="astro-cell-value">
                    {astroSephirahData.planet_symbol || '·'} {astroSephirahData.primary_planet}
                  </span>
                </div>
                {astroSephirahData.secondary_planet && (
                  <div className="astro-sephirah-cell">
                    <span className="astro-cell-label">Attribution secondaire</span>
                    <span className="astro-cell-value">{astroSephirahData.secondary_planet}</span>
                  </div>
                )}
                <div className={`astro-sephirah-cell level-${astroSephirahData.level}`}>
                  <span className="astro-cell-label">Score de blocage</span>
                  <span className="astro-cell-value">
                    {astroSephirahData.score} / 100 — {astroSephirahData.level}
                  </span>
                </div>
              </div>

              {astroPlanetData ? (
                <div className="planet-state-card">
                  <h4>État de la planète {astroPlanetData.name}</h4>
                  <div className="planet-state-grid">
                    <div>
                      <span className="astro-cell-label">Signe</span>
                      <span className="astro-cell-value">
                        {SIGN_LABELS[astroPlanetData.sign] || astroPlanetData.sign || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="astro-cell-label">Maison</span>
                      <span className="astro-cell-value">{astroPlanetData.house || '—'}</span>
                    </div>
                    <div>
                      <span className="astro-cell-label">Dignité</span>
                      <span className="astro-cell-value">
                        {DIGNITY_LABELS[astroPlanetData.dignity_status] ||
                          astroPlanetData.dignity_status ||
                          'Neutre'}
                      </span>
                    </div>
                  </div>

                  <div className="planet-factor-list">
                    <div className={`planet-factor ${astroPlanetData?.factors?.aspect_hard?.active ? 'active' : ''}`}>
                      <span className="planet-factor-label">A · Aspects difficiles</span>
                      <span className="planet-factor-detail">{astroPlanetData?.factors?.aspect_hard?.detail}</span>
                    </div>
                    <div className={`planet-factor ${astroPlanetData?.factors?.weak_dignity?.active ? 'active' : ''}`}>
                      <span className="planet-factor-label">B · Dignité faible</span>
                      <span className="planet-factor-detail">{astroPlanetData?.factors?.weak_dignity?.detail}</span>
                    </div>
                    <div className={`planet-factor ${astroPlanetData?.factors?.difficult_house?.active ? 'active' : ''}`}>
                      <span className="planet-factor-label">C · Maison difficile</span>
                      <span className="planet-factor-detail">{astroPlanetData?.factors?.difficult_house?.detail}</span>
                    </div>
                  </div>

                  {(astroPlanetData?.hard_aspect_links || []).length > 0 && (
                    <div className="planet-aspects-list">
                      <h5>Aspects difficiles actifs</h5>
                      <ul>
                        {astroPlanetData.hard_aspect_links.map((link, idx) => {
                          const rich = getRichAspectInterpretation({
                            sephirahName: sephirah.name,
                            aspect: link.aspect,
                            otherPlanet: link.target_planet,
                          });
                          const fallback = getAspectInterpretation({
                            sephirahName: sephirah.name,
                            aspect: link.aspect,
                            otherPlanet: link.target_planet,
                          });
                          const planetMeaning = getPlanetMeaning(link.target_planet);
                          const angelEntry = getAngelRemedeEntry({
                            sephirahName: sephirah.name,
                            aspect: link.aspect,
                            otherPlanet: link.target_planet,
                          });
                          return (
                            <li key={`${link.aspect}-${link.target_planet}-${idx}`} className="aspect-row">
                              <div className="aspect-row-head">
                                <span className={`aspect-pill aspect-${link.aspect}`}>
                                  {ASPECT_GLYPHS[link.aspect] || '·'} {getAspectPretty(link.aspect)}
                                </span>
                                avec <strong>{link.target_planet}</strong>
                                {planetMeaning && <em className="planet-keyword"> · {planetMeaning}</em>}
                              </div>
                              {rich ? (
                                <div className="aspect-rich-block">
                                  <div className="aspect-rich-titre">{rich.titre}</div>
                                  <div className="aspect-rich-row">
                                    <span className="aspect-rich-label">Probleme</span>
                                    <SimpleMarkdown source={rich.probleme} />
                                  </div>
                                  <div className="aspect-rich-row">
                                    <span className="aspect-rich-label">Resultat</span>
                                    <SimpleMarkdown source={rich.resultat_kabalistique} />
                                  </div>
                                  <div className="aspect-rich-row">
                                    <span className="aspect-rich-label">Symptomes</span>
                                    <SimpleMarkdown source={rich.symptomes} />
                                  </div>
                                  <div className="aspect-rich-row aspect-rich-pathology">
                                    <span className="aspect-rich-label">Pathologie</span>
                                    <SimpleMarkdown source={rich.pathologie} />
                                  </div>
                                </div>
                              ) : (
                                <div className={`aspect-interpretation ${fallback.source}`}>
                                  {fallback.text}
                                </div>
                              )}
                              <AngelRemedeBlock entry={angelEntry} />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="integration-card">
                  <p>Aucune donnée natale détaillée pour cette planète.</p>
                </div>
              )}
            </>
          ) : (
            <div className="integration-card">
              <p>Generez d'abord votre carte natale pour afficher les correspondances astro.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SephirahDetail;
