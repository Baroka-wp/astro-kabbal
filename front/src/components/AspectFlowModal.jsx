import React from 'react';
import './AspectFlowModal.css';
import SimpleMarkdown from './SimpleMarkdown';
import {
  getAspectInterpretation,
  getAspectPretty,
  getAspectSeverity,
  getAspectNature,
  getPlanetMeaning,
  getSephirahBlockedMeaning,
  getRichAspectInterpretation,
} from '../lib/kabbalisticInterpreter';
import { getAngelRemedeEntry } from '../lib/angelRemedes';
import AngelRemedeBlock from './AngelRemedeBlock';

const ASPECT_VISUAL = {
  square: { symbol: '□', color: '#ef4444' },
  opposition: { symbol: '☍', color: '#f97316' },
  quincunx: { symbol: '⚻', color: '#a855f7' },
  inconjunct: { symbol: '⚻', color: '#a855f7' },
};

const ASPECT_WORK = {
  square:
    "Identifier le pattern de blocage repete, accueillir la friction comme une invitation a transformer une habitude. Le carre exige un acte concret et un cadre neuf.",
  opposition:
    "Reconnaitre les deux besoins comme legitimes, creer un troisieme espace ou la polarite devient complementarite. C'est l'apprentissage de l'equilibre relationnel.",
  quincunx:
    "Pas de solution frontale : un travail patient d'ajustement, d'acceptation et de petites corrections successives. C'est l'aspect du discernement et du tatonnement conscient.",
  inconjunct:
    "Pas de solution frontale : un travail patient d'ajustement, d'acceptation et de petites corrections successives. C'est l'aspect du discernement et du tatonnement conscient.",
};

const RichInterpretationCard = ({ rich, fallback, sephirahName, otherPlanet }) => {
  if (rich) {
    return (
      <div className="rich-interpretation-card">
        <h4 className="rich-titre">{rich.titre}</h4>
        <div className="rich-block">
          <span className="rich-label">Probleme</span>
          <SimpleMarkdown source={rich.probleme} className="rich-content" />
        </div>
        <div className="rich-block">
          <span className="rich-label">Resultat kabbalistique</span>
          <SimpleMarkdown source={rich.resultat_kabalistique} className="rich-content" />
        </div>
        <div className="rich-block">
          <span className="rich-label">Symptomes</span>
          <SimpleMarkdown source={rich.symptomes} className="rich-content" />
        </div>
        <div className="rich-block rich-block-pathology">
          <span className="rich-label">Pathologie</span>
          <SimpleMarkdown source={rich.pathologie} className="rich-content" />
        </div>
      </div>
    );
  }
  return (
    <div className={`interpretation-card ${fallback.source}`}>
      <span className="interpretation-tag">
        {sephirahName} bloquee par {otherPlanet}
        {fallback.source === 'generic' && <em> · formule generique</em>}
      </span>
      <p>{fallback.text}</p>
    </div>
  );
};

const AspectFlowModal = ({ flow, onClose }) => {
  if (!flow) return null;
  const visual = ASPECT_VISUAL[flow.aspect] || { symbol: '·', color: '#475569' };
  const prettyName = getAspectPretty(flow.aspect);
  const nature = getAspectNature(flow.aspect);
  const severity = getAspectSeverity(flow.aspect);

  const richFrom = getRichAspectInterpretation({
    sephirahName: flow.fromSephirahName,
    aspect: flow.aspect,
    otherPlanet: flow.toPlanet,
  });
  const richTo = getRichAspectInterpretation({
    sephirahName: flow.toSephirahName,
    aspect: flow.aspect,
    otherPlanet: flow.fromPlanet,
  });
  const fallbackFrom = getAspectInterpretation({
    sephirahName: flow.fromSephirahName,
    aspect: flow.aspect,
    otherPlanet: flow.toPlanet,
  });
  const fallbackTo = getAspectInterpretation({
    sephirahName: flow.toSephirahName,
    aspect: flow.aspect,
    otherPlanet: flow.fromPlanet,
  });

  const fromBlockedMeaning = getSephirahBlockedMeaning(flow.fromSephirahName);
  const toBlockedMeaning = getSephirahBlockedMeaning(flow.toSephirahName);
  const fromPlanetMeaning = getPlanetMeaning(flow.fromPlanet);
  const toPlanetMeaning = getPlanetMeaning(flow.toPlanet);
  const work = ASPECT_WORK[flow.aspect] || '';

  const angelFrom = getAngelRemedeEntry({
    sephirahName: flow.fromSephirahName,
    aspect: flow.aspect,
    otherPlanet: flow.toPlanet,
  });
  const angelTo = getAngelRemedeEntry({
    sephirahName: flow.toSephirahName,
    aspect: flow.aspect,
    otherPlanet: flow.fromPlanet,
  });

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content aspect-flow-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="back-btn" onClick={onClose}>
          ← Fermer
        </button>

        <header className="aspect-flow-header" style={{ borderColor: visual.color }}>
          <div className="aspect-flow-symbol-large" style={{ color: visual.color }}>
            {visual.symbol}
          </div>
          <div>
            <h2 style={{ color: visual.color }}>{prettyName}</h2>
            <p className="aspect-flow-nature">
              {nature || '—'}
              {severity ? <span className="aspect-flow-severity"> · severite {severity}/3</span> : null}
            </p>
          </div>
        </header>

        <section className="aspect-flow-section">
          <h3>Energies en jeu</h3>
          <div className="aspect-flow-pair">
            <div className="aspect-flow-pole">
              <div className="aspect-flow-planet">{flow.fromPlanet || '—'}</div>
              <div className="aspect-flow-sephirah">
                {flow.fromSephirahName} (Sephirah {flow.fromId})
              </div>
              {fromPlanetMeaning && <div className="aspect-flow-meaning">{fromPlanetMeaning}</div>}
            </div>
            <div className="aspect-flow-divider" style={{ background: visual.color }}>
              <span style={{ color: visual.color }}>{visual.symbol}</span>
            </div>
            <div className="aspect-flow-pole">
              <div className="aspect-flow-planet">{flow.toPlanet || '—'}</div>
              <div className="aspect-flow-sephirah">
                {flow.toSephirahName} (Sephirah {flow.toId})
              </div>
              {toPlanetMeaning && <div className="aspect-flow-meaning">{toPlanetMeaning}</div>}
            </div>
          </div>
        </section>

        <section className="aspect-flow-section">
          <h3>Lecture kabbalistique</h3>
          <div className="aspect-flow-interpretation">
            <RichInterpretationCard
              rich={richFrom}
              fallback={fallbackFrom}
              sephirahName={flow.fromSephirahName}
              otherPlanet={flow.toPlanet}
            />
            {flow.fromSephirahName !== flow.toSephirahName && (
              <RichInterpretationCard
                rich={richTo}
                fallback={fallbackTo}
                sephirahName={flow.toSephirahName}
                otherPlanet={flow.fromPlanet}
              />
            )}
          </div>
        </section>

        {!richFrom && !richTo && (fromBlockedMeaning || toBlockedMeaning) && (
          <section className="aspect-flow-section">
            <h3>Symptomes generaux</h3>
            <div className="aspect-flow-symptoms">
              {fromBlockedMeaning && (
                <div className="symptom-card">
                  <strong>{flow.fromSephirahName} : </strong>
                  {fromBlockedMeaning}
                </div>
              )}
              {toBlockedMeaning && flow.fromSephirahName !== flow.toSephirahName && (
                <div className="symptom-card">
                  <strong>{flow.toSephirahName} : </strong>
                  {toBlockedMeaning}
                </div>
              )}
            </div>
          </section>
        )}

        {(angelFrom || angelTo) && (
          <section className="aspect-flow-section">
            <h3>Travail avec l&apos;Ange remède (72 Shem ha-Mephorash)</h3>
            <p className="aspect-flow-angel-lead">
              Selon le degré zodiacal du point en tension, on relie l&apos;aspect à l&apos;un des 72 anges
              (tranche de 5°) et à son psaume / sentier. Correspondance indicative ci-dessous lorsque
              la lecture est disponible pour cette paire Sephirah / corps céleste.
            </p>
            {angelFrom && (
              <div className="aspect-flow-angel-sub">
                <h4 className="aspect-flow-angel-h4">
                  Côté {flow.fromSephirahName} — aspect {prettyName} avec {flow.toPlanet}
                </h4>
                <AngelRemedeBlock entry={angelFrom} />
              </div>
            )}
            {angelTo && flow.fromSephirahName !== flow.toSephirahName && (
              <div className="aspect-flow-angel-sub">
                <h4 className="aspect-flow-angel-h4">
                  Côté {flow.toSephirahName} — aspect {prettyName} avec {flow.fromPlanet}
                </h4>
                <AngelRemedeBlock entry={angelTo} />
              </div>
            )}
          </section>
        )}

        {work && (
          <section className="aspect-flow-section">
            <h3>Travail conseille</h3>
            <p>{work}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default AspectFlowModal;
