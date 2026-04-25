import React, { useState } from 'react';
import './SephirahDetail.css';

const SephirahDetail = ({ sephirah, selectedDirection = 'descending', onDirectionChange, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  if (!sephirah) return null;

  const qliphothMeaning = sephirah?.qliphoth?.meaning || sephirah?.qliphoth?.meaing;

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
      </div>

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
          <div className="direction-toggle">
            <button
              className={`direction-btn ${selectedDirection === 'descending' ? 'active' : ''}`}
              onClick={() => onDirectionChange?.('descending')}
            >
              Descente (création)
            </button>
            <button
              className={`direction-btn ${selectedDirection === 'ascending' ? 'active' : ''}`}
              onClick={() => onDirectionChange?.('ascending')}
            >
              Montée (retour)
            </button>
          </div>
          <div className="direction-card">
            <div className="direction-label">
              {selectedDirection === 'descending' ? 'Expérience descendante' : 'Expérience ascendante'}
            </div>
            <p>{sephirah?.direction_experience?.[selectedDirection]}</p>
          </div>
          <div className="meditation-frame">
            <span className="direction-label">Méditation</span>
            <p>{sephirah?.meditation}</p>
          </div>
        </section>
      )}

      {activeTab === 'message' && (
        <section className="section">
          <h3>Message angélique</h3>
          <div className="message-quote">
            <span className="quote-mark">“</span>
            {sephirah?.angel_message}
            <span className="quote-mark">”</span>
            <div className="angel-signature">— {sephirah?.angel?.name}</div>
          </div>
        </section>
      )}

      {activeTab === 'integration' && (
        <section className="section">
          <h3>Intégration quotidienne</h3>
          <div className="integration-card">
            <p>{sephirah?.integration}</p>
          </div>
        </section>
      )}

      {activeTab === 'qliphoth' && (
        <section className="section">
          <h3>Travail d'ombre (Qliphoth)</h3>
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
              {sephirah?.qliphoth?.shadow}
            </p>
          </div>
          <div className="corrective-card">
            <span className="direction-label">Méditation corrective</span>
            <p>{sephirah?.qliphoth_work?.corrective_meditation}</p>
          </div>
          <div className="ritual-card">
            <span className="direction-label">Action rituelle</span>
            <p>{sephirah?.qliphoth_work?.ritual_action}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default SephirahDetail;
