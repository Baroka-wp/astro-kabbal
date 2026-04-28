import React from 'react';
import './SephirahDetail.css';
import './PathDetail.css';
import SimpleMarkdown from './SimpleMarkdown';
import {
  getSephirahBlockedMeaning,
  getAspectInterpretation,
  getAspectPretty,
  getPlanetMeaning,
  getRichSephirahData,
  getRichAspectInterpretation,
} from '../lib/kabbalisticInterpreter';
import { getAngelRemedeEntry, getSephirahAngelBlocage } from '../lib/angelRemedes';
import AngelRemedeBlock from './AngelRemedeBlock';

const SIGN_LABELS = {
  Ari: 'Bélier',
  Tau: 'Taureau',
  Gem: 'Gémeaux',
  Can: 'Cancer',
  Leo: 'Lion',
  Vir: 'Vierge',
  Lib: 'Balance',
  Sco: 'Scorpion',
  Sag: 'Sagittaire',
  Cap: 'Capricorne',
  Aqu: 'Verseau',
  Pis: 'Poissons',
};

const DIGNITY_LABELS = {
  rulership: 'Domicile',
  exaltation: 'Exaltation',
  detriment: 'Exil',
  fall: 'Chute',
  neutral: 'Neutre',
};

const ASPECT_GLYPHS = {
  square: '□',
  opposition: '☍',
  quincunx: '⚻',
};

const pickDirectional = (value, mode) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[mode] || value.descending || value.ascending || '';
  }
  return String(value);
};

const stripCitations = (text) => {
  if (!text) return '';
  return String(text).replace(/\[citation:[^\]]+\]/g, '').trim();
};

const SephirahDetail = ({
  sephirah,
  selectedDirection = 'descending',
  onDirectionChange,
  onBack,
  astroSephirahData,
  astroPlanetData,
}) => {
  if (!sephirah) return null;

  const qliphothMeaning = sephirah?.qliphoth?.meaning || sephirah?.qliphoth?.meaing;
  const fromNode = 'Source';
  const toNode = sephirah.name;

  const handlePrintCurrentPage = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    document.body.classList.add('print-path-detail');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-path-detail');
    }, 200);
  };

  return (
    <div className="path-detail sephirah-detail">
      <div className="path-detail-toolbar path-detail-print-hide">
        <button className="back-btn back-btn-close" onClick={onBack} aria-label="Fermer la fiche">
          ×
        </button>
        <button type="button" className="path-print-btn" onClick={handlePrintCurrentPage}>
          Telecharger cette fiche (PDF)
        </button>
      </div>

      <header className="path-detail-header">
        <div className="path-main-symbol">
          <div className="big-hebrew">{sephirah.hebrew}</div>
          <div>
            <div className="big-name">
              {sephirah.id}. {sephirah.name}
            </div>
            <div className="big-meaning">{sephirah.meaning}</div>
          </div>
        </div>
        <p className="path-intro-paragraph">
          La sephirah <strong>{sephirah.name}</strong> ({sephirah.hebrew}) se situe sur le pilier{' '}
          <strong>{sephirah.pillar}</strong>, a la position <strong>{sephirah.id} / 10</strong>. Elle est associee
          a l'ange <strong>{sephirah?.angel?.name}</strong>
          {sephirah?.angel?.function ? `, ${sephirah.angel.function}` : '.'}
        </p>
      </header>

      <div className="path-detail-content">
        <section className="section">
          <h2>Apercu de la sephirah</h2>
          <h3>Titres</h3>
          <div className="attributes-grid">
            <div>
              <strong>Sefer Yetzirah</strong>
              {sephirah?.titles?.sefer_yetzirah}
            </div>
            <div>
              <strong>Godwin</strong>
              {sephirah?.titles?.godwin}
            </div>
          </div>
          <h3>Mots-cles</h3>
          <div className="keywords-list">
            {(sephirah?.keywords || []).map((keyword) => (
              <span key={keyword} className="keyword-badge">
                {keyword}
              </span>
            ))}
          </div>
          <h3>Ange tutelaire</h3>
          <p>
            <strong>{sephirah?.angel?.name}</strong>
            {sephirah?.angel?.alternate_names?.length > 0
              ? ` (aussi appele ${sephirah.angel.alternate_names.join(', ')})`
              : ''}
            . {sephirah?.angel?.function}
          </p>
        </section>

        <section className="section">
          <h2>I - Aller, de {fromNode} vers {toNode}</h2>
          <p className="direction-reading-subtitle">Expérience descendante</p>
          <h3>Direction</h3>
          <p>{stripCitations(sephirah?.direction_experience?.descending || '') || 'Direction non renseignee.'}</p>
          <h3>Meditation aller</h3>
          <p>{stripCitations(pickDirectional(sephirah?.meditation, 'descending')) || 'Meditation non renseignee.'}</p>
          <h3>Message aller</h3>
          <p>{stripCitations(pickDirectional(sephirah?.angel_message, 'descending')) || 'Message non renseigne.'}</p>
          <h3>Integration aller</h3>
          <p>{stripCitations(pickDirectional(sephirah?.integration, 'descending')) || 'Integration non renseignee.'}</p>
          <h3>Mediation corrective aller</h3>
          <p>
            {stripCitations(pickDirectional(sephirah?.qliphoth_work?.corrective_meditation, 'descending')) || '—'}
          </p>
          <h3>Action rituelle aller</h3>
          <p>{stripCitations(pickDirectional(sephirah?.qliphoth_work?.ritual_action, 'descending')) || '—'}</p>
        </section>

        <section className="section">
          <h2>II - Retour, de {toNode} vers {fromNode}</h2>
          <p className="direction-reading-subtitle">Expérience ascendante</p>
          <h3>Direction</h3>
          <p>{stripCitations(sephirah?.direction_experience?.ascending || '') || 'Direction non renseignee.'}</p>
          <h3>Meditation retour</h3>
          <p>{stripCitations(pickDirectional(sephirah?.meditation, 'ascending')) || 'Meditation non renseignee.'}</p>
          <h3>Message retour</h3>
          <p>{stripCitations(pickDirectional(sephirah?.angel_message, 'ascending')) || 'Message non renseigne.'}</p>
          <h3>Integration retour</h3>
          <p>{stripCitations(pickDirectional(sephirah?.integration, 'ascending')) || 'Integration non renseignee.'}</p>
          <h3>Mediation corrective retour</h3>
          <p>
            {stripCitations(pickDirectional(sephirah?.qliphoth_work?.corrective_meditation, 'ascending')) || '—'}
          </p>
          <h3>Action rituelle retour</h3>
          <p>{stripCitations(pickDirectional(sephirah?.qliphoth_work?.ritual_action, 'ascending')) || '—'}</p>
        </section>

        <section className="section">
          <h2>Qliphoth</h2>
          <p>
            <strong>Demon :</strong> {sephirah?.qliphoth?.demon}
          </p>
          <p>
            <strong>Signification :</strong> {qliphothMeaning}
          </p>
          <p>
            <strong>Fonction :</strong> {sephirah?.qliphoth?.function}
          </p>
          <p>
            <strong>Ombre :</strong> {stripCitations(sephirah?.qliphoth?.shadow || '')}
          </p>
        </section>

        <section className="section">
          <h2>Astro-Kabbale</h2>
          {(() => {
            const richSephirah = getRichSephirahData(sephirah.name);
            if (!richSephirah?.signification) return null;
            return (
              <>
                <h3>Signification kabbalistique</h3>
                <SimpleMarkdown source={richSephirah.signification} className="kabbalistic-markdown" />
              </>
            );
          })()}
          {astroSephirahData ? (
            <>
              {(() => {
                const blockedMeaning = getSephirahBlockedMeaning(sephirah.name);
                const isBlocked =
                  astroSephirahData.has_hard_aspects ||
                  astroSephirahData.weak_dignity ||
                  ['modere', 'eleve'].includes(astroSephirahData.level);
                if (!blockedMeaning || !isBlocked) return null;
                const angelBlocage = getSephirahAngelBlocage(sephirah.name);
                return (
                  <>
                    <h3>Symptome actuel ({sephirah.name} bloquee)</h3>
                    <p>{blockedMeaning}</p>
                    {angelBlocage && <p>Lecture 72 anges (sphere): {angelBlocage}</p>}
                  </>
                );
              })()}
              <h3>Synthese planetaire</h3>
              <p>
                Planete principale: {astroSephirahData.planet_symbol || '·'} {astroSephirahData.primary_planet}
                {astroSephirahData.secondary_planet
                  ? ` · Attribution secondaire: ${astroSephirahData.secondary_planet}`
                  : ''}
                {` · Score de blocage: ${astroSephirahData.score} / 100 (${astroSephirahData.level})`}
              </p>

              {astroPlanetData ? (
                <>
                  <h3>Etat de la planete {astroPlanetData.name}</h3>
                  <p>
                    Signe: {SIGN_LABELS[astroPlanetData.sign] || astroPlanetData.sign || '—'} · Maison:{' '}
                    {astroPlanetData.house || '—'} · Dignite:{' '}
                    {DIGNITY_LABELS[astroPlanetData.dignity_status] || astroPlanetData.dignity_status || 'Neutre'}
                  </p>
                  <p>A · Aspects difficiles: {astroPlanetData?.factors?.aspect_hard?.detail}</p>
                  <p>B · Dignite faible: {astroPlanetData?.factors?.weak_dignity?.detail}</p>
                  <p>C · Maison difficile: {astroPlanetData?.factors?.difficult_house?.detail}</p>

                  {(astroPlanetData?.hard_aspect_links || []).length > 0 && (
                    <>
                      <h3>Aspects difficiles actifs</h3>
                      {(astroPlanetData.hard_aspect_links || []).map((link, idx) => {
                        const rich = getRichAspectInterpretation({
                          sephirahName: sephirah.name,
                          aspect: link.aspect,
                          otherPlanet: link.target_planet,
                        });
                        const fallback = getAspectInterpretation({
                          sephirahName: sephirah.name,
                          aspect: link.aspect,
                          otherPlanet: link.target_planet,
                        });
                        const planetMeaning = getPlanetMeaning(link.target_planet);
                        const angelEntry = getAngelRemedeEntry({
                          sephirahName: sephirah.name,
                          aspect: link.aspect,
                          otherPlanet: link.target_planet,
                        });
                        return (
                          <div key={`${link.aspect}-${link.target_planet}-${idx}`}>
                            <p>
                              {ASPECT_GLYPHS[link.aspect] || '·'} {getAspectPretty(link.aspect)} avec{' '}
                              <strong>{link.target_planet}</strong>
                              {planetMeaning ? ` · ${planetMeaning}` : ''}
                            </p>
                            {rich ? (
                              <>
                                <p>
                                  <strong>{rich.titre}</strong>
                                </p>
                                <SimpleMarkdown source={rich.probleme} />
                                <SimpleMarkdown source={rich.resultat_kabalistique} />
                                <SimpleMarkdown source={rich.symptomes} />
                                <SimpleMarkdown source={rich.pathologie} />
                              </>
                            ) : (
                              <p>{fallback.text}</p>
                            )}
                            <AngelRemedeBlock entry={angelEntry} />
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <p>Aucune donnee natale detaillee pour cette planete.</p>
              )}
            </>
          ) : (
            <p>Generez d'abord votre carte natale pour afficher les correspondances astro.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default SephirahDetail;
