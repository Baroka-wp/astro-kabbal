import React from 'react';
import './PathList.css';

const PathList = ({ paths, onSelectPath }) => {
  if (paths.length === 0) {
    return (
      <div className="path-list-empty">
        <p>Aucun chemin ne correspond a vos criteres.</p>
        <p>Essayez d'autres mots-cles ou reinitialisez les filtres.</p>
      </div>
    );
  }

  return (
    <div className="path-list">
      <div className="path-list-header">
        <h2>Les 22 Chemins</h2>
        <span className="result-count">{paths.length} sentier(s) trouve(s)</span>
      </div>

      <div className="path-cards">
        {paths.map((path) => (
          <div key={path.id} className="path-card" onClick={() => onSelectPath(path.id)}>
            <div className="path-card-header">
              <span className="path-id">#{path.id}</span>
              <span className="path-letter">{path?.letter?.hebrew}</span>
              <span className="path-name">{path?.letter?.transliteration}</span>
            </div>
            <div className="path-card-body">
              <div className="path-tarot">
                <span className="label">Tarot</span>
                <span className="value">{path?.tarot?.major_arcana}</span>
              </div>
              <div className="path-angel">
                <span className="label">Ange</span>
                <span className="value">{path?.angel?.name}</span>
              </div>
              <div className="path-connection">
                {path?.connections?.from} -&gt; {path?.connections?.to}
              </div>
            </div>
            <div className="path-card-footer">
              {(path?.keywords || []).slice(0, 3).map((kw) => (
                <span key={kw} className="keyword">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathList;
