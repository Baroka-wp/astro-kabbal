/**
 * Converts an SVG (DOM element OR raw string) into a PNG data URL.
 * Designed to feed @react-pdf/renderer Image components.
 */

import { TREE_SVG_EXPORT_INLINE_CSS } from './treeSvgExportStyles';

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_MAX_WIDTH = 1400;

function escapeUnicode(str) {
  return unescape(encodeURIComponent(str));
}

function getSvgString(input) {
  if (!input) return null;
  if (typeof input === 'string') {
    return input.trim();
  }
  if (input instanceof SVGElement || (input && input.nodeType === 1 && input.tagName?.toLowerCase() === 'svg')) {
    const clone = input.cloneNode(true);
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    return new XMLSerializer().serializeToString(clone);
  }
  return null;
}

/**
 * Prépare le SVG de l'Arbre de Vie : fond dégradé + feuille de style (le CSS
 * de l'interface ne s'applique pas au canvas ; sans cela : cercles noirs, traits invisibles).
 * @param {SVGSVGElement} svg
 * @returns {string|null}
 */
export function prepareTreeSvgString(svg) {
  if (!svg) return null;
  const clone = svg.cloneNode(true);
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', SVG_NS);
  }
  const defs = clone.querySelector('defs') || (() => {
    const d = document.createElementNS(SVG_NS, 'defs');
    clone.insertBefore(d, clone.firstChild);
    return d;
  })();

  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', 'tree-export-bg');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');
  [
    { offset: '0%', color: '#fff7ed' },
    { offset: '50%', color: '#fed7aa' },
    { offset: '100%', color: '#fdba74' },
  ].forEach(({ offset, color }) => {
    const stop = document.createElementNS(SVG_NS, 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', color);
    grad.appendChild(stop);
  });
  defs.appendChild(grad);

  const styleEl = document.createElementNS(SVG_NS, 'style');
  styleEl.setAttribute('type', 'text/css');
  styleEl.appendChild(document.createTextNode(TREE_SVG_EXPORT_INLINE_CSS));
  defs.appendChild(styleEl);

  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', '440');
  rect.setAttribute('height', '750');
  rect.setAttribute('fill', 'url(#tree-export-bg)');
  clone.insertBefore(rect, defs.nextSibling);

  return new XMLSerializer().serializeToString(clone);
}

function getDimensions(svgString, maxWidth) {
  const widthMatch = svgString.match(/<svg[^>]*\swidth="([\d.]+)(?:px)?"/i);
  const heightMatch = svgString.match(/<svg[^>]*\sheight="([\d.]+)(?:px)?"/i);
  const viewBoxMatch = svgString.match(/<svg[^>]*\sviewBox="([\d.\s-]+)"/i);

  let width = widthMatch ? parseFloat(widthMatch[1]) : null;
  let height = heightMatch ? parseFloat(heightMatch[1]) : null;

  if ((!width || !height) && viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/).map(parseFloat);
    if (parts.length === 4) {
      width = width || parts[2];
      height = height || parts[3];
    }
  }

  if (!width || !height) {
    width = 800;
    height = 600;
  }

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = height * ratio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Converts the given SVG to a PNG data URL.
 * @param {SVGElement|string} input
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1400]
 * @param {number} [options.scale=2] - Pixel density factor (2 = retina)
 * @param {string} [options.background] - Optional CSS background color
 */
export async function svgToPngDataUrl(input, options = {}) {
  const svgString = getSvgString(input);
  if (!svgString) return null;

  const maxWidth = options.maxWidth || DEFAULT_MAX_WIDTH;
  const scale = options.scale || 2;
  const { width, height } = getDimensions(svgString, maxWidth);

  const svg64 = `data:image/svg+xml;base64,${btoa(escapeUnicode(svgString))}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (options.background) {
          ctx.fillStyle = options.background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = svg64;
  });
}

export async function captureTreeOfLifePng(options = {}) {
  const svg = document.querySelector('.tree-svg');
  if (!svg) return null;
  const prepared = prepareTreeSvgString(svg);
  if (!prepared) return null;
  return svgToPngDataUrl(prepared, { maxWidth: 1200, ...options });
}

export async function captureNatalChartPng(svgString, options = {}) {
  if (!svgString) return null;
  return svgToPngDataUrl(svgString, { background: '#ffffff', maxWidth: 1400, ...options });
}
