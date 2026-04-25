import React, { useState } from 'react';
import './TreeOfLife.css';

const SPHERE_RADIUS = 28;
const PARALLEL_OFFSET = 11;

const TreeOfLife = ({
  paths,
  selectedPathId,
  selectedDirection,
  onSelectPath,
  selectedSephirahId,
  onSelectSephirah,
}) => {
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [hoveredSephirah, setHoveredSephirah] = useState(null);

  const sephirothPositions = {
    1: { x: 220, y: 34, name: 'Keter' },
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

  const getEdgeLine = (from, to, offset, reverse = false, yShift = 0, xShift = 0) => {
    const start = reverse ? to : from;
    const end = reverse ? from : to;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;

    return {
      x1: start.x + ux * SPHERE_RADIUS + px * offset + xShift,
      y1: start.y + uy * SPHERE_RADIUS + py * offset + yShift,
      x2: end.x - ux * SPHERE_RADIUS + px * offset + xShift,
      y2: end.y - uy * SPHERE_RADIUS + py * offset + yShift,
    };
  };

  const getEdgeClass = (pathId, direction) => {
    const isSelected = selectedPathId === pathId && selectedDirection === direction;
    const isPathSelected = selectedPathId === pathId;
    const isHovered = hoveredEdge?.pathId === pathId && hoveredEdge?.direction === direction;
    return [
      isSelected ? 'selected-edge' : '',
      isPathSelected ? 'selected-path' : '',
      isHovered ? 'hovered-edge' : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className="tree-of-life-container">
      <div className="tree-copy">
        <h3>Arbre de Vie</h3>
        <p>Cliquez directement sur un sentier. Chaque connexion montre l'aller et le retour.</p>
      </div>

      <svg viewBox="0 0 440 750" className="tree-svg" role="img" aria-label="Arbre de Vie interactif">
        <defs>
          <marker id="arrow-desc" markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L9,4.5 L0,9 Z" fill="#2563eb" />
          </marker>
          <marker id="arrow-asc" markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L9,4.5 L0,9 Z" fill="#0f766e" />
          </marker>
          <marker id="arrow-desc-selected" markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L9,4.5 L0,9 Z" fill="#f59e0b" />
          </marker>
          <marker id="arrow-asc-selected" markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L9,4.5 L0,9 Z" fill="#dc2626" />
          </marker>
        </defs>

        {paths.map((path) => {
          const from = sephirothPositions[path?.connections?.from_number];
          const to = sephirothPositions[path?.connections?.to_number];
          if (!from || !to) return null;

          const isVertical = from.x === to.x;
          const forwardXShift = isVertical ? 10 : 0;
          const forward = getEdgeLine(from, to, PARALLEL_OFFSET, false, -5, forwardXShift);
          const backward = getEdgeLine(from, to, -PARALLEL_OFFSET, true, 5);
          const forwardClass = getEdgeClass(path.id, 'descending');
          const backwardClass = getEdgeClass(path.id, 'ascending');
          const isForwardSelected = selectedPathId === path.id && selectedDirection === 'descending';
          const isBackwardSelected = selectedPathId === path.id && selectedDirection === 'ascending';
          const showTag = selectedPathId === path.id || hoveredEdge?.pathId === path.id;

          return (
            <g key={path.id} className="tree-path-group">
              <line
                {...forward}
                className="path-hitbox"
                onClick={() => onSelectPath(path.id, 'descending')}
                onMouseEnter={() => setHoveredEdge({ pathId: path.id, direction: 'descending' })}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              <line
                {...backward}
                className="path-hitbox"
                onClick={() => onSelectPath(path.id, 'ascending')}
                onMouseEnter={() => setHoveredEdge({ pathId: path.id, direction: 'ascending' })}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              <line
                {...forward}
                className={`path-edge path-edge-desc ${forwardClass}`}
                markerEnd={isForwardSelected ? 'url(#arrow-desc-selected)' : 'url(#arrow-desc)'}
                pointerEvents="none"
              />
              <line
                {...backward}
                className={`path-edge path-edge-asc ${backwardClass}`}
                markerEnd={isBackwardSelected ? 'url(#arrow-asc-selected)' : 'url(#arrow-asc)'}
                pointerEvents="none"
              />
              {showTag && (
                <g className="path-tag">
                  <rect
                    x={(from.x + to.x) / 2 - 34}
                    y={(from.y + to.y) / 2 - 12}
                    width="68"
                    height="24"
                    rx="12"
                  />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 4} textAnchor="middle">
                    {path?.letter?.transliteration}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {Object.entries(sephirothPositions).map(([num, pos]) => {
          const id = Number(num);
          const isSelected = selectedSephirahId === id;
          const isHovered = hoveredSephirah === id;
          const nodeClass = ['sephirah-node', isSelected ? 'is-selected' : '', isHovered ? 'is-hovered' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <g
              key={num}
              className={nodeClass}
              onClick={() => onSelectSephirah?.(id)}
              onMouseEnter={() => setHoveredSephirah(id)}
              onMouseLeave={() => setHoveredSephirah(null)}
            >
              <circle cx={pos.x} cy={pos.y} r={SPHERE_RADIUS} />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" className="sephirah-name">
                {pos.name}
              </text>
              <text x={pos.x} y={pos.y + 13} textAnchor="middle" className="sephirah-number">
                {num}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-line desc" />
          Aller
        </span>
        <span className="legend-item">
          <span className="legend-line asc" />
          Retour
        </span>
        <span className="legend-item">
          <span className="legend-dot" />
          Sentier selectionne
        </span>
      </div>
    </div>
  );
};

export default TreeOfLife;
