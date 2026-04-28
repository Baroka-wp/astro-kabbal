import React from 'react';
import './PathDetail.css';

const pickDirectional = (value, mode) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[mode] || value.descending || value.ascending || '';
  }
  return String(value);
};

const PathDetail = ({ path, onBack }) => {
  const fromNode = path?.connections?.from || 'Depart';
  const toNode = path?.connections?.to || 'Arrivee';

  const handlePrintCurrentPage = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    document.body.classList.add('print-path-detail');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-path-detail');
    }, 200);
  };

  return (
    <div className="path-detail">
      <div className="path-detail-toolbar path-detail-print-hide">
        <button className="back-btn back-btn-close" onClick={onBack} aria-label="Fermer la fiche">
          ×
        </button>
        <button type="button" className="path-print-btn" onClick={handlePrintCurrentPage}>
          Telecharger cette fiche (PDF)
        </button>
      </div>

      <div className="path-detail-header">
        <div className="path-main-symbol">
          <span className="big-hebrew">{path?.letter?.hebrew}</span>
          <span className="big-name">{path?.letter?.transliteration}</span>
          <span className="big-meaning">({path?.letter?.meaning})</span>
        </div>

        <p className="path-intro-paragraph">
          Le sentier <strong>{path?.letter?.transliteration}</strong> relie{' '}
          <strong>
            {path?.connections?.from} -&gt; {path?.connections?.to}
          </strong>
          , sur le pilier <strong>{path?.pillar}</strong> (valeur <strong>{path?.letter?.value}</strong>). Il
          correspond au tarot <strong>{path?.tarot?.major_arcana}</strong> (cle {path?.tarot?.key}) et est place
          sous l'influence de l'ange regent <strong>{path?.angel?.name}</strong>,{' '}
          {path?.angel?.function || 'dont la fonction est spirituelle.'}
        </p>
      </div>

      <div className="path-detail-content">
        <article className="section" id="path-overview">
          <h2>Apercu du sentier</h2>
          <h3>Intelligence Yetzirathique</h3>
          <p>{path?.kabbalistic_title}</p>

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

          <h3>Couleurs</h3>
          <div className="colors-demo">
            <div className="color-swatch" style={{ background: path?.colors?.golden_dawn }} />
            <span>Golden Dawn : {path?.colors?.golden_dawn}</span>
            <div className="color-swatch" style={{ background: path?.colors?.queen_scale }} />
            <span>Queen Scale : {path?.colors?.queen_scale}</span>
          </div>

          <h3>Mots-cles</h3>
          <div className="keywords-list">
            {(path?.keywords || []).map((kw) => (
              <span key={kw} className="keyword-badge">
                #{kw}
              </span>
            ))}
          </div>

          <h3>Invocation</h3>
          <blockquote className="invocation">{path?.pathworking?.angel_invocation}</blockquote>
        </article>

        <article className="section">
          <h2>I - Aller, de {fromNode} vers {toNode}</h2>
          <p className="direction-reading-subtitle">Descendant - Emanation</p>
          <h3>Perspective aller</h3>
          <p>{path?.directions?.descending?.perspective || 'Perspective non renseignee.'}</p>
          <h3>Meditation aller</h3>
          <p>{pickDirectional(path?.meditation, 'descending') || 'Meditation non renseignee pour cette direction.'}</p>
          <h3>Integration aller</h3>
          <p>{pickDirectional(path?.integration, 'descending') || 'Integration non renseignee pour cette direction.'}</p>
          <h3>Experience aller</h3>
          <p>
            {pickDirectional(path?.pathworking?.expected_experience, 'descending') ||
              "Experience non renseignee pour cette direction."}
          </p>
          <h3>Preparation rituelle aller</h3>
          <p>
            Activation: {path?.pathworking?.activation}. Visualisation: {path?.pathworking?.visualization}.
            Preparation: {path?.pathworking?.preparation}.
          </p>
          <h3>Acte rituel aller</h3>
          <p>
            {pickDirectional(path?.qliphoth_work?.ritual_action, 'descending') ||
              'Acte rituel non renseigne pour cette direction.'}
          </p>
          <h3>Message de l'Ange aller</h3>
          <p>{pickDirectional(path?.angel_message, 'descending') || "Message non renseigne pour cette direction."}</p>
        </article>

        <article className="section">
          <h2>II - Retour, de {toNode} vers {fromNode}</h2>
          <p className="direction-reading-subtitle">Ascendant - Retour</p>
          <h3>Perspective retour</h3>
          <p>{path?.directions?.ascending?.perspective || 'Perspective non renseignee.'}</p>
          <h3>Meditation retour</h3>
          <p>{pickDirectional(path?.meditation, 'ascending') || 'Meditation non renseignee pour cette direction.'}</p>
          <h3>Integration retour</h3>
          <p>{pickDirectional(path?.integration, 'ascending') || 'Integration non renseignee pour cette direction.'}</p>
          <h3>Experience retour</h3>
          <p>
            {pickDirectional(path?.pathworking?.expected_experience, 'ascending') ||
              "Experience non renseignee pour cette direction."}
          </p>
          <h3>Preparation rituelle retour</h3>
          <p>
            Activation: {path?.pathworking?.activation}. Visualisation: {path?.pathworking?.visualization}.
            Preparation: {path?.pathworking?.preparation}.
          </p>
          <h3>Acte rituel retour</h3>
          <p>
            {pickDirectional(path?.qliphoth_work?.ritual_action, 'ascending') ||
              'Acte rituel non renseigne pour cette direction.'}
          </p>
          <h3>Message de l'Ange retour</h3>
          <p>{pickDirectional(path?.angel_message, 'ascending') || "Message non renseigne pour cette direction."}</p>
        </article>
      </div>
    </div>
  );
};

export default PathDetail;
