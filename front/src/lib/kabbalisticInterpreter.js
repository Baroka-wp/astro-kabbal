import data from '../data/kabbalisticInterpretations.json';

const SEPHIRAH_NAME_ALIASES = {
  Tiferet: 'Tiphareth',
  Tiphereth: 'Tiphareth',
  Tipheret: 'Tiphareth',
  Keter: 'Kether',
  Geburah: 'Geburah',
  Hod: 'Hod',
  Yesod: 'Yesod',
  Netzach: 'Netzach',
  Chesed: 'Chesed',
  Binah: 'Binah',
  Chokmah: 'Chokmah',
  Malkuth: 'Malkuth',
};

const ASPECT_NAME_ALIASES = {
  square: 'square',
  opposition: 'opposition',
  quincunx: 'inconjunct',
  inconjunct: 'inconjunct',
};

const ASPECT_PRETTY = {
  square: 'Carre 90°',
  opposition: 'Opposition 180°',
  inconjunct: 'Quinconce 150°',
  quincunx: 'Quinconce 150°',
};

export const ASPECT_DATA = data.aspects;
export const SEPHIRAH_BLOCKED = data.sephirah_blocked_interpretation;
export const PLANET_MEANINGS = data.planets_meanings;
export const DYNAMIC_PLANET_TO_SEPHIRAH = data.dynamic_mapping_logic;
export const RICH_SEPHIROTH = data.sephiroth || {};

export const normalizeSephirahName = (name) => {
  if (!name) return '';
  return SEPHIRAH_NAME_ALIASES[name] || name;
};

export const normalizeAspectName = (aspect) => {
  if (!aspect) return '';
  const key = String(aspect).toLowerCase();
  return ASPECT_NAME_ALIASES[key] || key;
};

export const getSephirahBlockedMeaning = (sephirahName) => {
  const normalized = normalizeSephirahName(sephirahName);
  return SEPHIRAH_BLOCKED[normalized] || '';
};

export const getPlanetMeaning = (planetName) => {
  if (!planetName) return '';
  const meaning = PLANET_MEANINGS[planetName];
  if (!meaning) return '';
  return meaning.replace(/_/g, ' ');
};

export const getRelatedSephirahForPlanet = (planetName) => {
  if (!planetName) return '';
  return DYNAMIC_PLANET_TO_SEPHIRAH[planetName] || '';
};

export const getRichSephirahData = (sephirahName) => {
  const sNorm = normalizeSephirahName(sephirahName);
  return RICH_SEPHIROTH[sNorm] || null;
};

export const getRichAspectInterpretation = ({ sephirahName, aspect, otherPlanet }) => {
  const sNorm = normalizeSephirahName(sephirahName);
  const aNorm = normalizeAspectName(aspect);
  if (!sNorm || !aNorm || !otherPlanet) return null;
  const sephirahData = RICH_SEPHIROTH[sNorm];
  if (!sephirahData?.aspects) return null;
  const aspectGroup = sephirahData.aspects[aNorm];
  if (!aspectGroup) return null;
  return aspectGroup[otherPlanet] || null;
};

export const getSpecificAspectInterpretation = ({ sephirahName, aspect, otherPlanet }) => {
  const rich = getRichAspectInterpretation({ sephirahName, aspect, otherPlanet });
  if (rich?.resultat_kabalistique) return rich.resultat_kabalistique;
  const sNorm = normalizeSephirahName(sephirahName);
  const aNorm = normalizeAspectName(aspect);
  if (!sNorm || !aNorm || !otherPlanet) return null;
  const match = (data.aspect_path_interpretations || []).find(
    (entry) =>
      normalizeSephirahName(entry.sephirah) === sNorm &&
      normalizeAspectName(entry.aspect) === aNorm &&
      entry.with === otherPlanet
  );
  return match?.interpretation || null;
};

export const buildGenericInterpretation = ({ sephirahName, aspect, otherPlanet }) => {
  const sNorm = normalizeSephirahName(sephirahName);
  const aNorm = normalizeAspectName(aspect);
  if (!sNorm || !aNorm) return '';
  const aspectInfo = ASPECT_DATA[aNorm] || {};
  const aspectNature = (aspectInfo.nature || aNorm).replace(/_/g, ' ');
  const blockedMeaning = SEPHIRAH_BLOCKED[sNorm] || '';
  const relatedSephirah = getRelatedSephirahForPlanet(otherPlanet);
  const planetMeaning = getPlanetMeaning(otherPlanet);
  const customText = planetMeaning
    ? `dimension ${planetMeaning} a integrer consciemment`
    : 'a explorer en meditation';
  return `La Sephirah ${sNorm} est bloquee par un aspect ${aspectNature} avec ${otherPlanet || 'ce point natal'}. Cela genere ${blockedMeaning || 'un noeud energetique'} et une difficulte specifique sur le sentier reliant ${sNorm}${relatedSephirah ? ` a ${relatedSephirah}` : ''}: ${customText}.`;
};

export const getAspectInterpretation = ({ sephirahName, aspect, otherPlanet }) => {
  const specific = getSpecificAspectInterpretation({ sephirahName, aspect, otherPlanet });
  if (specific) {
    return { text: specific, source: 'specific' };
  }
  const generic = buildGenericInterpretation({ sephirahName, aspect, otherPlanet });
  return { text: generic, source: 'generic' };
};

export const getAspectPretty = (aspect) => ASPECT_PRETTY[normalizeAspectName(aspect)] || aspect;

export const getAspectSeverity = (aspect) => {
  const a = ASPECT_DATA[normalizeAspectName(aspect)];
  return a ? a.severity : null;
};

export const getAspectNature = (aspect) => {
  const a = ASPECT_DATA[normalizeAspectName(aspect)];
  return a ? (a.nature || '').replace(/_/g, ' ') : '';
};
