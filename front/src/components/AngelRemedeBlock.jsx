import React from 'react';
import './AngelRemedeBlock.css';

/**
 * Bloc pédagogique : Ange du Shem ha-Mephorash (5°) + psaume + sentier, depuis angelRemedes.json.
 * `entry` = objet { position_degre_associe?, aspect, avec, ange_remede: { ... } } ou null.
 */
const AngelRemedeBlock = ({ entry, className = '' }) => {
  const ar = entry?.ange_remede;
  if (!ar) return null;
  return (
    <div className={`angel-remede-block ${className}`.trim()}>
      <h5 className="angel-remede-heading">Ange remède (72 noms / Shem ha-Mephorash)</h5>
      {entry?.position_degre_associe && (
        <p className="angel-remede-repere">
          <em>Repère de degré (exemple) : {entry.position_degre_associe}</em>
        </p>
      )}
      <dl className="angel-remede-dl">
        <div className="angel-remede-row">
          <dt>Nom de l’Ange</dt>
          <dd>{ar.nom}</dd>
        </div>
        <div className="angel-remede-row">
          <dt>Tranche de degrés</dt>
          <dd>{ar.degres}</dd>
        </div>
        <div className="angel-remede-row">
          <dt>Sentier / porte</dt>
          <dd>{ar.sentier}</dd>
        </div>
        <div className="angel-remede-row">
          <dt>Psaume</dt>
          <dd>{ar.psaume}</dd>
        </div>
        <div className="angel-remede-row">
          <dt>Rituel proposé</dt>
          <dd>{ar.rituel}</dd>
        </div>
      </dl>
    </div>
  );
};

export default AngelRemedeBlock;
