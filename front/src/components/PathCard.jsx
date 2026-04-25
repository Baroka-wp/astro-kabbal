import React from 'react';

const PathCard = ({ path, onSelectPath }) => {
  return (
    <div className="path-card" onClick={() => onSelectPath(path.id)}>
      <div className="path-card-header">
        <span className="path-id">#{path.id}</span>
        <span className="path-letter">{path?.letter?.hebrew}</span>
        <span className="path-name">{path?.letter?.transliteration}</span>
      </div>
    </div>
  );
};

export default PathCard;
