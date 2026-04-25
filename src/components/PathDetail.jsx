import React, { useState } from 'react';
import './PathDetail.css';

const PathDetail = ({ path, selectedDirection = 'descending', onDirectionChange, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const directionMode = selectedDirection;
  const fromNode = path?.connections?.from || 'Depart';
  const toNode = path?.connections?.to || 'Arrivee';

  const tabs = [
    { id: 'overview', label: 'Apercu' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'integration', label: 'Integration' },
    { id: 'qliphoth', label: 'Kliphoth' },
  ];

  return (
    <div className="path-detail">
      <button className="back-btn" onClick={onBack}>
        &larr; Retour a la liste
      </button>

      <div className="path-detail-header">
        <div className="path-main-symbol">
          <span className="big-hebrew">{path?.letter?.hebrew}</span>
          <span className="big-name">{path?.letter?.transliteration}</span>
          <span className="big-meaning">({path?.letter?.meaning})</span>
        </div>

        <div className="path-main-info">
          <div className="info-card">
            <span className="info-label">Connexion</span>
            <span className="info-value">
              {path?.connections?.from} -&gt; {path?.connections?.to}
            </span>
            <span className="info-sub">
              {path?.pillar} · Valeur {path?.letter?.value}
            </span>
          </div>
          <div className="info-card">
            <span className="info-label">Tarot</span>
            <span className="info-value">{path?.tarot?.major_arcana}</span>
            <span className="info-sub">Cle {path?.tarot?.key}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Ange regent</span>
            <span className="info-value">{path?.angel?.name}</span>
            <span className="info-sub">{path?.angel?.function}</span>
          </div>
        </div>
      </div>

      <div className="path-detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="path-detail-content">
        {activeTab === 'overview' && (
          <div className="tab-overview">
            <div className="section">
              <h3>Intelligence Yetzirathique</h3>
              <p>{path?.kabbalistic_title}</p>
            </div>

            <div className="section">
              <h3>Attributions</h3>
              <div className="attributes-grid">
                <div>
                  <strong>Pilier</strong> {path?.pillar}
                </div>
                <div>
                  <strong>Valeur</strong> {path?.letter?.value}
                </div>
                {path?.astrology?.element && (
                  <div>
                    <strong>Element</strong> {path.astrology.element}
                  </div>
                )}
                {path?.astrology?.planet && (
                  <div>
                    <strong>Planete</strong> {path.astrology.planet}
                  </div>
                )}
                {path?.astrology?.sign && (
                  <div>
                    <strong>Signe</strong> {path.astrology.sign}
                  </div>
                )}
              </div>
            </div>

            <div className="section">
              <h3>Chemin aller / retour</h3>
              <div className="direction-arrows" aria-label="Schema du trajet aller-retour">
                <div
                  className={`direction-arrow-row ${directionMode === 'descending' ? 'active' : ''}`}
                >
                  <span className="direction-arrow-label">Aller</span>
                  <span className="direction-arrow-line">{fromNode}</span>
                  <span className="direction-arrow-icon">→</span>
                  <span className="direction-arrow-line">{toNode}</span>
                </div>
                <div
                  className={`direction-arrow-row ${directionMode === 'ascending' ? 'active' : ''}`}
                >
                  <span className="direction-arrow-label">Retour</span>
                  <span className="direction-arrow-line">{toNode}</span>
                  <span className="direction-arrow-icon">→</span>
                  <span className="direction-arrow-line">{fromNode}</span>
                </div>
              </div>

              <div className="direction-toggle">
                <button
                  className={`direction-btn ${directionMode === 'descending' ? 'active' : ''}`}
                  onClick={() => onDirectionChange('descending')}
                >
                  Aller (descendant)
                </button>
                <button
                  className={`direction-btn ${directionMode === 'ascending' ? 'active' : ''}`}
                  onClick={() => onDirectionChange('ascending')}
                >
                  Retour (ascendant)
                </button>
              </div>

              <div className="direction-card">
                <div className="direction-label">
                  {directionMode === 'descending'
                    ? 'Descendant - Emanation'
                    : 'Ascendant - Retour'}
                </div>
                <p className="direction-line">
                  {path?.directions?.[directionMode]?.perspective || 'Perspective non renseignee.'}
                </p>
                {path?.directions?.[directionMode]?.experience && (
                  <p className="direction-line direction-experience">
                    {path.directions[directionMode].experience}
                  </p>
                )}
              </div>
            </div>

            <div className="section">
              <h3>Couleurs</h3>
              <div className="colors-demo">
                <div className="color-swatch" style={{ background: path?.colors?.golden_dawn }} />
                <span>Golden Dawn : {path?.colors?.golden_dawn}</span>
                <div className="color-swatch" style={{ background: path?.colors?.queen_scale }} />
                <span>Queen Scale : {path?.colors?.queen_scale}</span>
              </div>
            </div>

            <div className="section">
              <h3>Mots-cles</h3>
              <div className="keywords-list">
                {(path?.keywords || []).map((kw) => (
                  <span key={kw} className="keyword-badge">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="section">
              <h3>Invocation</h3>
              <blockquote className="invocation">{path?.pathworking?.angel_invocation}</blockquote>
            </div>
          </div>
        )}

        {activeTab === 'meditation' && (
          <div className="tab-meditation">
            <div className="section">
              <h3>Paysage archetypal</h3>
              <p className="landscape">{path?.pathworking?.visualization}</p>
            </div>

            <div className="section meditation-text">
              <h3>Meditation guidee</h3>
              <div className="meditation-frame">
                <p>{path?.meditation}</p>
              </div>
            </div>

            <div className="section angel-message">
              <h3>Message de l'Ange</h3>
              <div className="message-quote">
                <span className="quote-mark">"</span>
                {path?.angel_message}
                <span className="quote-mark">"</span>
              </div>
              <div className="angel-signature">- {path?.angel?.name}</div>
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="tab-integration">
            <div className="section">
              <h3>Integration pratique</h3>
              <div className="integration-card">
                <p>{path?.integration}</p>
              </div>
            </div>

            <div className="section">
              <h3>Experience attendue</h3>
              <div className="experience-card">
                <p>{path?.pathworking?.expected_experience}</p>
              </div>
            </div>

            <div className="section">
              <h3>Preparation rituelle</h3>
              <ul className="preparation-list">
                <li>
                  <strong>Activation</strong> : {path?.pathworking?.activation}
                </li>
                <li>
                  <strong>Visualisation</strong> : {path?.pathworking?.visualization}
                </li>
                <li>
                  <strong>Preparation</strong> : {path?.pathworking?.preparation}
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'qliphoth' && (
          <div className="tab-qliphoth">
            <div className="section warning">
              <h3>Attention</h3>
              <p>
                Le travail kliphothique est avance. Pratiquez d'abord l'invocation angelique
                avant de vous confronter aux ombres.
              </p>
            </div>

            <div className="section">
              <h3>Demon associe</h3>
              <div className="demon-card">
                <strong>{path?.qliphoth_work?.demon}</strong>
                <p>{path?.qliphoth?.demon}</p>
              </div>
            </div>

            <div className="section">
              <h3>Ombre a explorer</h3>
              <div className="shadow-card">
                <p>{path?.qliphoth_work?.shadow}</p>
              </div>
            </div>

            <div className="section">
              <h3>Meditation corrective</h3>
              <div className="corrective-card">
                <p>{path?.qliphoth_work?.corrective_meditation}</p>
              </div>
            </div>

            <div className="section">
              <h3>Acte rituel</h3>
              <div className="ritual-card">
                <p>{path?.qliphoth_work?.ritual_action}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PathDetail;
