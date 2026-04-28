import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const SEPHIROTH = [
  { id: 1, x: 220, y: 60, name: 'Keter', meaning: 'Couronne' },
  { id: 2, x: 330, y: 150, name: 'Chokmah', meaning: 'Sagesse' },
  { id: 3, x: 110, y: 150, name: 'Binah', meaning: 'Intelligence' },
  { id: 4, x: 330, y: 280, name: 'Chesed', meaning: 'Misericorde' },
  { id: 5, x: 110, y: 280, name: 'Geburah', meaning: 'Rigueur' },
  { id: 6, x: 220, y: 370, name: 'Tiferet', meaning: 'Beaute' },
  { id: 7, x: 330, y: 500, name: 'Netzach', meaning: 'Victoire' },
  { id: 8, x: 110, y: 500, name: 'Hod', meaning: 'Splendeur' },
  { id: 9, x: 220, y: 600, name: 'Yesod', meaning: 'Fondation' },
  { id: 10, x: 220, y: 720, name: 'Malkuth', meaning: 'Royaume' },
];

const PATHS = [
  [1, 2], [1, 3], [1, 6],
  [2, 3], [2, 4], [2, 6],
  [3, 5], [3, 6],
  [4, 5], [4, 6], [4, 7],
  [5, 6], [5, 8],
  [6, 7], [6, 8], [6, 9],
  [7, 8], [7, 9], [7, 10],
  [8, 9], [8, 10],
  [9, 10],
];

const STAR_COUNT = 80;

function generateStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2.4 + 0.6,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 5,
  }));
}

const STARS = generateStars();

function MiniTree() {
  const sephById = Object.fromEntries(SEPHIROTH.map((s) => [s.id, s]));
  return (
    <svg viewBox="0 0 440 800" className="mini-tree" role="img" aria-label="Arbre de Vie kabbalistique">
      <defs>
        <radialGradient id="sephGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="1" />
          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.85" />
        </radialGradient>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="pathGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <g className="mini-paths">
        {PATHS.map(([fromId, toId], idx) => {
          const a = sephById[fromId];
          const b = sephById[toId];
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#pathGold)"
              strokeWidth={1.4}
              strokeOpacity={0.55}
              style={{ animationDelay: `${idx * 0.08}s` }}
              className="mini-path-line"
            />
          );
        })}
      </g>

      <g className="mini-spheres">
        {SEPHIROTH.map((s, idx) => (
          <g key={s.id} className="mini-sphere" style={{ animationDelay: `${idx * 0.12}s` }}>
            <circle cx={s.x} cy={s.y} r={32} fill="url(#sephGlow)" filter="url(#goldGlow)" opacity={0.9} />
            <circle cx={s.x} cy={s.y} r={26} fill="#1a0f2e" stroke="#fbbf24" strokeWidth={1.2} />
            <text x={s.x} y={s.y - 2} textAnchor="middle" className="mini-sphere-name">
              {s.name}
            </text>
            <text x={s.x} y={s.y + 11} textAnchor="middle" className="mini-sphere-meaning">
              {s.meaning}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function LandingPage() {
  useEffect(() => {
    document.body.classList.add('landing-body');
    return () => document.body.classList.remove('landing-body');
  }, []);

  return (
    <div className="landing">
      <div className="landing-stars" aria-hidden="true">
        {STARS.map((star) => (
          <span
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <header className="landing-nav">
        <span className="brand">22 Sentiers</span>
        <div className="landing-nav-links">
          <Link to="/explorer" className="nav-link">
            Astro-Kabbale →
          </Link>
          <Link to="/tikkoun" className="nav-link nav-link-secondary">
            Tikkoun juif →
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-text">
          <span className="eyebrow">Kabbale · Astrologie · Méditation</span>
          <h1>
            L'Arbre de Vie,<br />
            <em>vivant et lisible.</em>
          </h1>
          <p className="lead">
            Explorez les <strong>10 Sephiroth</strong> et les <strong>22 sentiers</strong> de la
            tradition kabbalistique, projetez votre <strong>thème natal</strong> sur l'Arbre, et
            recevez une lecture qui marie astrologie, anges, qliphoth et travail intérieur.
          </p>

          <div className="hero-cta-group">
            <Link to="/explorer" className="cta-primary">
              Explorer l'Arbre
              <span className="cta-arrow">→</span>
            </Link>
            <Link to="/tikkoun" className="cta-secondary">
              Ouvrir le module Tikkoun
            </Link>
            <a href="#how" className="cta-secondary">
              Comment ça marche
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="tree-frame">
            <MiniTree />
          </div>
        </div>
      </section>

      <section id="how" className="landing-how">
        <div className="how-header">
          <span className="eyebrow">Comment ça marche</span>
          <h2>Trois pas pour entrer dans l'Arbre</h2>
        </div>

        <ol className="how-steps">
          <li className="how-step">
            <span className="step-number">01</span>
            <h3>Visualisez l'Arbre</h3>
            <p>
              Le schéma sephirotique s'ouvre devant vous. Cliquez sur une <strong>sphère</strong>
              {' '}pour découvrir son ange, sa méditation et sa face d'ombre, ou suivez un{' '}
              <strong>sentier</strong> dans les deux directions, descente créatrice ou retour.
            </p>
          </li>
          <li className="how-step">
            <span className="step-number">02</span>
            <h3>Renseignez votre ciel natal</h3>
            <p>
              Date, heure, ville. En quelques secondes, vos planètes sont placées sur les sphères
              correspondantes et les <strong>aspects difficiles</strong> (carrés, oppositions,
              quinconces) apparaissent en flux d'énergie sur l'Arbre.
            </p>
          </li>
          <li className="how-step">
            <span className="step-number">03</span>
            <h3>Recevez votre lecture</h3>
            <p>
              Chaque sphère bloquée révèle son symptôme et sa pathologie kabbalistique. Vous
              accédez aux <strong>messages angéliques</strong>, aux meditations correctives et aux
              rituels de libération propres à votre configuration.
            </p>
          </li>
        </ol>
      </section>

      <section className="landing-cta-final">
        <div className="cta-final-card">
          <h2>Votre Arbre vous attend.</h2>
          <p>
            Aucune inscription. Aucun envoi de données. Tout se calcule pour vous, en silence.
          </p>
          <Link to="/explorer" className="cta-primary cta-primary-large">
            Commencer ma lecture astro-kabbalistique
            <span className="cta-arrow">→</span>
          </Link>
          <Link to="/tikkoun" className="cta-secondary">
            Explorer le Tikkoun (tradition juive)
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-row">
          <span className="footer-brand">22 Sentiers</span>
          <span className="footer-tagline">L'Arbre de Vie comme miroir intérieur</span>
        </div>
        <div className="footer-row footer-meta">
          <span>v1.0 · 2026</span>
          <span>·</span>
          <span>Sources : Sefer Yetzirah, Kircher, Crowley, Godwin, Kerykeion</span>
          <span>·</span>
          <Link to="/explorer" className="footer-link">
            Entrer
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
