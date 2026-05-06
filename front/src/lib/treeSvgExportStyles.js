/**
 * Feuille de style injectée dans le SVG de l'Arbre de Vie avant export PNG.
 * Le rendu à l'écran s'appuie sur TreeOfLife.css ; sans ceci, l'image n'a ni traits,
 * ni flèches, ni texte lisible (cercles noirs seulement).
 * Ne pas modifier les sélecteurs sans vérifier TreeOfLife.jsx + TreeOfLife.css.
 */
export const TREE_SVG_EXPORT_INLINE_CSS = `
.tree-svg { font-family: system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Symbol", sans-serif; }
.path-hitbox { fill: none; stroke: transparent; stroke-width: 14; pointer-events: none; }
.path-edge { fill: none; stroke-linecap: round; stroke-width: 16; stroke-linejoin: round; pointer-events: none; stroke: #f8fafc; }
.path-edge-outline { fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: #cbd5e1; stroke-width: 18; pointer-events: none; opacity: 1; }
.tree-path-group .path-edge { opacity: 0.62; }
.path-edge.hovered-edge, .path-edge.selected-edge { stroke-width: 20; opacity: 1; }
.path-edge.selected-path { stroke: #fef3c7; opacity: 1; }
.path-edge.path-edge-aspect-square { stroke: #ef4444; opacity: 0.95; }
.path-edge.path-edge-aspect-opposition { stroke: #f97316; opacity: 0.95; }
.path-edge.path-edge-aspect-quincunx { stroke: #a855f7; opacity: 0.95; }
.astro-flow { fill: none; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; opacity: 0.9; pointer-events: none; }
.astro-flow-hitbox { fill: none; stroke: transparent; stroke-width: 18; pointer-events: none; }
.astro-flow-square { stroke: #ef4444; stroke-dasharray: 9 6; }
.astro-flow-opposition { stroke: #f97316; stroke-dasharray: 2 8; }
.astro-flow-quincunx { stroke: #a855f7; stroke-dasharray: 12 4 2 4; }
.astro-flow-badge { fill: #ffffff; stroke-width: 1.6; pointer-events: none; }
.astro-flow-badge-square { stroke: #ef4444; }
.astro-flow-badge-opposition { stroke: #f97316; }
.astro-flow-badge-quincunx { stroke: #a855f7; }
.astro-flow-symbol { font-size: 13px; font-weight: 800; pointer-events: none; }
.astro-flow-symbol-square { fill: #ef4444; }
.astro-flow-symbol-opposition { fill: #f97316; }
.astro-flow-symbol-quincunx { fill: #a855f7; }
.sephirah-node { cursor: default; }
.sephirah-node circle { fill: #ffffff; stroke: #d7e0ea; stroke-width: 2; }
.sephirah-node.is-hovered circle { stroke: #f59e0b; stroke-width: 3; fill: #fffbeb; }
.sephirah-node.is-selected circle { stroke: #f59e0b; stroke-width: 4; fill: #fef3c7; }
.sephirah-name { fill: #0f172a; font-size: 11px; font-weight: 700; }
.sephirah-number { fill: #64748b; font-size: 10px; font-weight: 600; }
.sephirah-node.is-selected .sephirah-name, .sephirah-node.is-selected .sephirah-number { fill: #78350f; }
.sephirah-node.astro-low circle { stroke: #16a34a; }
.sephirah-node.astro-medium circle { stroke: #f59e0b; fill: #fff7ed; }
.sephirah-node.astro-high circle { stroke: #dc2626; fill: #fff1f2; }
.sephirah-node.astro-blocked circle { stroke: #dc2626; stroke-width: 4; fill: #fee2e2; }
.astro-planet-badge { font-size: 18px; font-weight: 800; fill: #0f172a; paint-order: stroke fill; stroke: #ffffff; stroke-width: 2.8; }
.path-tag rect { fill: #ffffff; opacity: 0.96; stroke: #d1d5db; stroke-width: 1; }
.path-tag text { fill: #111827; font-size: 18px; font-weight: 800; }
.path-tag .path-tag-aspect-symbol { font-size: 11px; font-weight: 900; }
.path-tag.path-tag-aspect-square rect { stroke: #ef4444; }
.path-tag.path-tag-aspect-opposition rect { stroke: #f97316; }
.path-tag.path-tag-aspect-quincunx rect { stroke: #a855f7; }
.path-tag.path-tag-aspect-square .path-tag-aspect-symbol { fill: #ef4444; }
.path-tag.path-tag-aspect-opposition .path-tag-aspect-symbol { fill: #f97316; }
.path-tag.path-tag-aspect-quincunx .path-tag-aspect-symbol { fill: #a855f7; }
`;
