import React, { useState, useMemo, useEffect } from 'react';
import './TreeOfLife.css';

const SPHERE_RADIUS = 28;

const TreeOfLife = ({
  paths,
  selectedPathId,
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
  const [pathsMenuOpen, setPathsMenuOpen] = useState(false);

  const sortedPaths = useMemo(() => {
    return [...(paths || [])].filter(Boolean).sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [paths]);

  useEffect(() => {
    if (!pathsMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPathsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [pathsMenuOpen]);

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

  const getEdgeClass = (pathId) => {
    const isSelected = selectedPathId === pathId;
    const isHovered = hoveredEdge?.pathId === pathId;
    return [
      isSelected ? 'selected-edge' : '',
      isSelected ? 'selected-path' : '',
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

  const pathByPair = useMemo(() => {
    const map = new Map();
    (paths || []).forEach((path) => {
      const fromId = path?.connections?.from_number;
      const toId = path?.connections?.to_number;
      if (!fromId || !toId) return;
      const pairKey = [fromId, toId].sort((a, b) => a - b).join('-');
      map.set(pairKey, path);
    });
    return map;
  }, [paths]);

  const ASPECT_PRIORITY = {
    square: 3,
    opposition: 2,
    quincunx: 1,
  };

  const pathAspectById = useMemo(() => {
    const map = new Map();
    hardAspectFlows.forEach((flow) => {
      const pairKey = [flow.fromId, flow.toId].sort((a, b) => a - b).join('-');
      const matchedPath = pathByPair.get(pairKey);
      if (!matchedPath?.id) return;
      const current = map.get(matchedPath.id);
      if (!current || (ASPECT_PRIORITY[flow.aspect] || 0) > (ASPECT_PRIORITY[current.aspect] || 0)) {
        map.set(matchedPath.id, flow);
      }
    });
    return map;
  }, [hardAspectFlows, pathByPair]);

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

  const handlePickPathFromMenu = (pathId) => {
    onSelectPath(pathId);
    setPathsMenuOpen(false);
  };

  return (
    <div className="tree-of-life-container">
      <div className="tree-copy">
        <div className="tree-copy-head">
          <h3>Arbre de Vie</h3>
          <button
            type="button"
            className="tree-paths-menu-trigger"
            aria-expanded={pathsMenuOpen}
            aria-controls="tree-paths-menu-panel"
            onClick={() => setPathsMenuOpen((open) => !open)}
            title="Ouvrir la liste des 22 sentiers (pratique sur mobile)"
          >
            <span className="tree-paths-menu-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="tree-paths-menu-label">Sentiers</span>
          </button>
        </div>
        <p>
          Cliquez sur un sentier ou utilisez le bouton Sentiers pour choisir parmi les 22 chemins. Le sens
          aller/retour se choisit ensuite dans la fiche detail.
        </p>
      </div>

      {pathsMenuOpen && (
        <>
          <button
            type="button"
            className="tree-paths-menu-backdrop"
            aria-label="Fermer le menu des sentiers"
            onClick={() => setPathsMenuOpen(false)}
          />
          <div
            id="tree-paths-menu-panel"
            className="tree-paths-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tree-paths-menu-title"
          >
            <div className="tree-paths-menu-panel-inner">
              <div className="tree-paths-menu-header">
                <h4 id="tree-paths-menu-title">Les 22 sentiers</h4>
                <button
                  type="button"
                  className="tree-paths-menu-close"
                  onClick={() => setPathsMenuOpen(false)}
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>
              <p className="tree-paths-menu-hint">
                Choisissez un chemin. Le sens aller/retour se regle dans la fiche detail.
              </p>
              <ul className="tree-paths-menu-list">
                {sortedPaths.map((path) => {
                  const from = path?.connections?.from || '';
                  const to = path?.connections?.to || '';
                  const letter = path?.letter?.transliteration || '—';
                  const hebrew = path?.letter?.hebrew || '';
                  return (
                    <li key={path.id}>
                      <div
                        className="tree-paths-menu-row"
                        role="button"
                        tabIndex={0}
                        onClick={() => handlePickPathFromMenu(path.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handlePickPathFromMenu(path.id);
                          }
                        }}
                      >
                        <span className="tree-paths-menu-letter-big">{hebrew || letter}</span>
                        <div className="tree-paths-menu-row-main">
                          <span className="tree-paths-menu-route">
                            {from} → {to}
                          </span>
                          <span className="tree-paths-menu-letter-name">{letter}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>
      )}

      <svg viewBox="0 0 440 750" className="tree-svg" role="img" aria-label="Arbre de Vie interactif">
        {paths.map((path) => {
          const from = sephirothPositions[path?.connections?.from_number];
          const to = sephirothPositions[path?.connections?.to_number];
          if (!from || !to) return null;

          const edge = getEdgeLine(from, to, 0, false);
          const edgeClass = getEdgeClass(path.id);
          const matchedAspectFlow = pathAspectById.get(path.id);
          const aspectClass = matchedAspectFlow ? `path-edge-aspect-${matchedAspectFlow.aspect}` : '';
          const pathGroupClass = matchedAspectFlow ? 'tree-path-group has-aspect' : 'tree-path-group';

          return (
            <g key={path.id} className={pathGroupClass}>
              <line
                {...edge}
                className="path-hitbox"
                onClick={() => onSelectPath(path.id)}
                onMouseEnter={() => setHoveredEdge({ pathId: path.id })}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              <line {...edge} className="path-edge-outline" pointerEvents="none" />
              <line {...edge} className={`path-edge ${edgeClass} ${aspectClass}`} pointerEvents="none" />
            </g>
          );
        })}

        {hardAspectFlows
          .filter((flow) => {
            const pairKey = [flow.fromId, flow.toId].sort((a, b) => a - b).join('-');
            return !pathByPair.has(pairKey);
          })
          .map((flow) => {
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

        {paths.map((path) => {
          const from = sephirothPositions[path?.connections?.from_number];
          const to = sephirothPositions[path?.connections?.to_number];
          if (!from || !to) return null;

          const pathLetter = path?.letter?.hebrew || path?.letter?.transliteration || '—';
          const isTiferetYesodPath =
            (path?.connections?.from_number === 6 && path?.connections?.to_number === 9) ||
            (path?.connections?.from_number === 9 && path?.connections?.to_number === 6);
          const tagCenterX = (from.x + to.x) / 2;
          const tagCenterY = (from.y + to.y) / 2 + (isTiferetYesodPath ? -24 : 0);
          const matchedAspectFlow = pathAspectById.get(path.id);
          const aspectGlyph = matchedAspectFlow ? ASPECT_GLYPHS[matchedAspectFlow.aspect] || '·' : null;
          const aspectClass = matchedAspectFlow ? `path-tag-aspect-${matchedAspectFlow.aspect}` : '';

          return (
            <g key={`${path.id}-tag`} className={`path-tag ${aspectClass}`}>
              <rect
                x={tagCenterX - 34}
                y={tagCenterY - 12}
                width="68"
                height="24"
                rx="12"
              />
              <text x={tagCenterX} y={tagCenterY + 4} textAnchor="middle">
                {pathLetter}
              </text>
              {aspectGlyph ? (
                <text x={tagCenterX + 23} y={tagCenterY - 5} textAnchor="middle" className="path-tag-aspect-symbol">
                  {aspectGlyph}
                </text>
              ) : null}
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
          <span className="legend-line path" />
          Sentier
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
