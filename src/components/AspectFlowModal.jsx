import React from 'react';
import './AspectFlowModal.css';

const ASPECT_INFO = {
  square: {
    label: 'Carré 90°',
    symbol: '□',
    color: '#ef4444',
    nature: 'Tension dynamique',
    effect:
      "Friction structurelle entre les deux énergies. L'expérience est inconfortable mais formatrice : c'est l'aspect qui force le passage à l'action et la maturation par la contrainte.",
    work:
      "Identifier le pattern de blocage répété, accueillir la friction comme une invitation à transformer une habitude. Le carré exige un acte concret et un cadre neuf.",
  },
  opposition: {
    label: 'Opposition 180°',
    symbol: '☍',
    color: '#f97316',
    nature: 'Polarité à intégrer',
    effect:
      "Les deux pôles se font face et exigent une médiation. Tant que la conscience reste polarisée d'un côté, l'autre revient comme miroir extérieur (relation, conflit, projection).",
    work:
      "Reconnaître les deux besoins comme légitimes, créer un troisième espace où la polarité devient complémentarité. C'est l'apprentissage de l'équilibre relationnel.",
  },
  quincunx: {
    label: 'Quinconce 150°',
    symbol: '⚻',
    color: '#a855f7',
    nature: 'Ajustement subtil',
    effect:
      "Les deux énergies n'ont rien en commun (ni signe, ni élément, ni mode) et coexistent dans un inconfort diffus. Souvent vécu comme un grain de sable récurrent ou un déséquilibre somatique.",
    work:
      "Pas de solution frontale : un travail patient d'ajustement, d'acceptation et de petites corrections successives. C'est l'aspect du discernement et du tâtonnement conscient.",
  },
};

const AspectFlowModal = ({ flow, onClose }) => {
  if (!flow) return null;
  const info = ASPECT_INFO[flow.aspect] || {
    label: flow.aspect,
    symbol: '·',
    color: '#475569',
    nature: '',
    effect: '',
    work: '',
  };

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

        <header className="aspect-flow-header" style={{ borderColor: info.color }}>
          <div className="aspect-flow-symbol-large" style={{ color: info.color }}>
            {info.symbol}
          </div>
          <div>
            <h2 style={{ color: info.color }}>{info.label}</h2>
            <p className="aspect-flow-nature">{info.nature}</p>
          </div>
        </header>

        <section className="aspect-flow-section">
          <h3>Énergies en jeu</h3>
          <div className="aspect-flow-pair">
            <div className="aspect-flow-pole">
              <div className="aspect-flow-planet">{flow.fromPlanet || '—'}</div>
              <div className="aspect-flow-sephirah">
                {flow.fromSephirahName} (Sephirah {flow.fromId})
              </div>
            </div>
            <div className="aspect-flow-divider" style={{ background: info.color }}>
              <span>{info.symbol}</span>
            </div>
            <div className="aspect-flow-pole">
              <div className="aspect-flow-planet">{flow.toPlanet || '—'}</div>
              <div className="aspect-flow-sephirah">
                {flow.toSephirahName} (Sephirah {flow.toId})
              </div>
            </div>
          </div>
        </section>

        <section className="aspect-flow-section">
          <h3>Effet ressenti</h3>
          <p>{info.effect}</p>
        </section>

        <section className="aspect-flow-section">
          <h3>Travail conseillé</h3>
          <p>{info.work}</p>
        </section>
      </div>
    </div>
  );
};

export default AspectFlowModal;
