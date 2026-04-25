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
  astroEnabled = false,
  astroSephirothScores = [],
  astroPlanets = [],
  onSelectAspectFlow,
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

  const astroScoreBySephirah = Object.fromEntries(
    (astroSephirothScores || []).map((score) => [score.sephirah_id, score])
  );
  const sephirahByPlanet = Object.fromEntries(
    (astroSephirothScores || []).map((score) => [score.primary_planet, score.sephirah_id])
  );

  const PLANET_GLYPHS = {
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
  };

  const ASPECT_GLYPHS = {
    square: '□',
    opposition: '☍',
    quincunx: '⚻',
  };

  const ASPECT_LABELS = {
    square: 'Carre 90°',
    opposition: 'Opposition 180°',
    quincunx: 'Quinconce 150°',
  };

  const getAstroNodeClass = (scoreObj) => {
    if (!astroEnabled || !scoreObj) return '';
    if (scoreObj.has_hard_aspects || scoreObj.weak_dignity) return 'astro-blocked';
    if (scoreObj.level === 'eleve') return 'astro-high';
    if (scoreObj.level === 'modere') return 'astro-medium';
    return 'astro-low';
  };

  const hardAspectFlows = (() => {
    if (!astroEnabled) return [];
    const seen = new Set();
    const byPair = {};
    const flows = [];
    (astroPlanets || []).forEach((planet) => {
      const fromSephirahId = sephirahByPlanet[planet.name];
      if (!fromSephirahId) return;
      (planet.hard_aspect_links || []).forEach((link) => {
        const toSephirahId = sephirahByPlanet[link.target_planet];
        if (!toSephirahId || toSephirahId === fromSephirahId) return;
        const idPair = [fromSephirahId, toSephirahId].sort((a, b) => a - b).join('-');
        const key = `${idPair}-${link.aspect}`;
        if (seen.has(key)) return;
        seen.add(key);
        const indexInPair = byPair[idPair] || 0;
        byPair[idPair] = indexInPair + 1;
        const fromScore = astroScoreBySephirah[fromSephirahId];
        const toScore = astroScoreBySephirah[toSephirahId];
        flows.push({
          key,
          fromId: fromSephirahId,
          toId: toSephirahId,
          aspect: link.aspect,
          indexInPair,
          fromPlanet: planet.name,
          toPlanet: link.target_planet,
          fromSephirahName: fromScore?.sephirah_name || '',
          toSephirahName: toScore?.sephirah_name || '',
        });
      });
    });
    return flows;
  })();

  const buildFlowGeometry = (flow) => {
    const from = sephirothPositions[flow.fromId];
    const to = sephirothPositions[flow.toId];
    if (!from || !to) return null;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const px = -dy / length;
    const py = dx / length;
    const order = flow.indexInPair;
    const sign = order % 2 === 0 ? 1 : -1;
    const magnitude = 18 + Math.floor(order / 2) * 14;
    const baseCurve = magnitude * sign;
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const ctrlX = midX + px * baseCurve;
    const ctrlY = midY + py * baseCurve;
    const labelX = midX + px * (baseCurve / 2);
    const labelY = midY + py * (baseCurve / 2);
    return {
      d: `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`,
      labelX,
      labelY,
    };
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

        {hardAspectFlows.map((flow) => {
          const geo = buildFlowGeometry(flow);
          if (!geo) return null;
          const handleClick = () => onSelectAspectFlow?.(flow);
          return (
            <g
              key={flow.key}
              className={`astro-flow-group astro-flow-group-${flow.aspect} clickable`}
              onClick={handleClick}
            >
              <title>{`${ASPECT_LABELS[flow.aspect] || flow.aspect} · ${flow.fromPlanet} ↔ ${flow.toPlanet}`}</title>
              <path
                d={geo.d}
                className="astro-flow-hitbox"
                fill="none"
                pointerEvents="stroke"
              />
              <path d={geo.d} className={`astro-flow astro-flow-${flow.aspect}`} fill="none" pointerEvents="none" />
              <circle
                cx={geo.labelX}
                cy={geo.labelY}
                r={11}
                className={`astro-flow-badge astro-flow-badge-${flow.aspect}`}
              />
              <text
                x={geo.labelX}
                y={geo.labelY + 4}
                textAnchor="middle"
                className={`astro-flow-symbol astro-flow-symbol-${flow.aspect}`}
              >
                {ASPECT_GLYPHS[flow.aspect] || '·'}
              </text>
            </g>
          );
        })}

        {Object.entries(sephirothPositions).map(([num, pos]) => {
          const id = Number(num);
          const isSelected = selectedSephirahId === id;
          const isHovered = hoveredSephirah === id;
          const astroScore = astroScoreBySephirah[id];
          const nodeClass = [
            'sephirah-node',
            isSelected ? 'is-selected' : '',
            isHovered ? 'is-hovered' : '',
            getAstroNodeClass(astroScore),
          ]
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
              {astroEnabled && astroScore && (
                <title>
                  {`${astroScore.sephirah_name} · ${astroScore.primary_planet} · score ${astroScore.score} (${astroScore.level})`}
                </title>
              )}
              <circle cx={pos.x} cy={pos.y} r={SPHERE_RADIUS} />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" className="sephirah-name">
                {pos.name}
              </text>
              <text x={pos.x} y={pos.y + 13} textAnchor="middle" className="sephirah-number">
                {num}
              </text>
              {astroEnabled && astroScore?.primary_planet && (
                <text
                  x={pos.x < 220 ? pos.x - 24 : pos.x + 24}
                  y={pos.y - 18}
                  textAnchor="middle"
                  className="astro-planet-badge"
                >
                  {astroScore.planet_symbol ||
                    PLANET_GLYPHS[astroScore.primary_planet] ||
                    astroScore.primary_planet.slice(0, 2)}
                </text>
              )}
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
        {astroEnabled && (
          <>
            <span className="legend-item">
              <span className="legend-level low" />
              Blocage faible
            </span>
            <span className="legend-item">
              <span className="legend-level medium" />
              Blocage modere
            </span>
            <span className="legend-item">
              <span className="legend-level high" />
              Blocage eleve
            </span>
            <span className="legend-item">
              <span className="legend-flow square" />
              <span className="legend-symbol legend-symbol-square">□</span>
              Carre 90°
            </span>
            <span className="legend-item">
              <span className="legend-flow opposition" />
              <span className="legend-symbol legend-symbol-opposition">☍</span>
              Opposition 180°
            </span>
            <span className="legend-item">
              <span className="legend-flow quincunx" />
              <span className="legend-symbol legend-symbol-quincunx">⚻</span>
              Quinconce 150°
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TreeOfLife;
