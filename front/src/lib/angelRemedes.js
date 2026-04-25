import data from '../data/angelRemedes.json';
import { normalizeSephirahName, normalizeAspectName } from './kabbalisticInterpreter';

const SEPHIROTH = data.sephiroth || {};

/**
 * Côté thème, les noms peuvent varier (anglais, accents). On ramène chaque corps
 * à la clé utilisée dans angelRemedes.json (`avec`).
 */
const PLANET_ALIASES = {
  sun: 'Soleil',
  soleil: 'Soleil',
  moon: 'Lune',
  lune: 'Lune',
  mercury: 'Mercure',
  mercure: 'Mercure',
  venus: 'Venus',
  vénus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturne',
  saturne: 'Saturne',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluton',
  pluton: 'Pluton',
  lilith: 'Lilith_True',
  lilith_true: 'Lilith_True',
  mean_lilith: 'Lilith_True',
  'true_north_lunar_node': 'True_North_Lunar_Node',
  'true_south_lunar_node': 'True_South_Lunar_Node',
  north_node: 'True_North_Lunar_Node',
  south_node: 'True_South_Lunar_Node',
  asc: 'Ascendant',
  ascendant: 'Ascendant',
  mc: 'Medium_Coeli',
  medium_coeli: 'Medium_Coeli',
  ic: 'Imum_Coeli',
  imum_coeli: 'Imum_Coeli',
  descendant: 'Descendant',
};

const normalizeKey = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const normalizePlanetForAngelData = (name) => {
  if (name == null || name === '') return '';
  const raw = String(name).trim();
  const k = normalizeKey(raw);
  if (PLANET_ALIASES[k]) return PLANET_ALIASES[k];
  if (/^Lilith/i.test(raw) && /true/i.test(raw)) return 'Lilith_True';
  if (raw === 'Lilith_True' || raw === 'Mean_Lilith') return 'Lilith_True';
  if (raw === 'True_North_Lunar_Node' || raw === 'North_Node') return 'True_North_Lunar_Node';
  if (raw === 'True_South_Lunar_Node' || raw === 'South_Node') return 'True_South_Lunar_Node';
  if (raw === 'Part_of_Fortune' || raw === 'Part_Fortune') return 'Part_Fortune';
  return raw;
};

const aspectMatch = (a, b) => {
  const x = normalizeAspectName(a);
  const y = normalizeAspectName(b);
  return x && y && x === y;
};

const planetMatch = (p1, p2) => {
  const a = normalizePlanetForAngelData(p1);
  const b = normalizePlanetForAngelData(p2);
  if (a && b && a === b) return true;
  const a2 = normalizePlanetForAngelData(p1) || String(p1);
  const b2 = normalizePlanetForAngelData(p2) || String(p2);
  return a2 === b2;
};

/**
 * Entrée complète (aspect + remède) ou null.
 */
export const getAngelRemedeEntry = ({ sephirahName, aspect, otherPlanet }) => {
  const sKey = normalizeSephirahName(sephirahName);
  if (!sKey || !otherPlanet) return null;
  const block = SEPHIROTH[sKey];
  if (!block?.aspects || !Array.isArray(block.aspects)) return null;
  return (
    block.aspects.find(
      (row) => aspectMatch(row.aspect, aspect) && planetMatch(row.avec, otherPlanet)
    ) || null
  );
};

export const getAngelRemede = ({ sephirahName, aspect, otherPlanet }) => {
  const row = getAngelRemedeEntry({ sephirahName, aspect, otherPlanet });
  return row?.ange_remede || null;
};

export const getSephirahAngelBlocage = (sephirahName) => {
  const sKey = normalizeSephirahName(sephirahName);
  return SEPHIROTH[sKey]?.blocage_general || '';
};

export const getRegleGeneraleAngeRemede = () => data.regle_generale_ange_remede || '';

export const ANGEL_DATA_VERSION = data.version;
