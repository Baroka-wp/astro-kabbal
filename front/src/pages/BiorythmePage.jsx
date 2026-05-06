import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AstroInputForm from '../components/AstroInputForm';
import BiorythmeTable from '../components/BiorythmeTable';
import { analyzeNatalChart } from '../lib/apiClient';
import { loadAstroSession, saveAstroSession, patchAstroSession } from '../lib/persistentStore';
import './BiorythmePage.css';

const PdfExportButton = lazy(() => import('../components/PdfExportButton'));

const SIGNS = [
  { glyph: '♈', name: 'Bélier' },
  { glyph: '♉', name: 'Taureau' },
  { glyph: '♊', name: 'Gémeaux' },
  { glyph: '♋', name: 'Cancer' },
  { glyph: '♌', name: 'Lion' },
  { glyph: '♍', name: 'Vierge' },
  { glyph: '♎', name: 'Balance' },
  { glyph: '♏', name: 'Scorpion' },
  { glyph: '♐', name: 'Sagittaire' },
  { glyph: '♑', name: 'Capricorne' },
  { glyph: '♒', name: 'Verseau' },
  { glyph: '♓', name: 'Poissons' },
];

class BiorythmeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Erreur inconnue' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="bio-setup">
          <h2>Le module Biorythme a rencontré une erreur</h2>
          <p>Message: {this.state.message}</p>
          <p>
            Merci de recharger la page. Si le problème persiste, allez dans
            "Mes infos" et relancez un calcul natal.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}

export default function BiorythmePage() {
  const [astroAnalysis, setAstroAnalysis] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [astroLoading, setAstroLoading] = useState(false);
  const [astroError, setAstroError] = useState('');
  const [transitAbsIdx, setTransitAbsIdx] = useState(0);
  const [transitDate, setTransitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState('');

  useEffect(() => {
    const session = loadAstroSession();
    if (session?.analysis) {
      setAstroAnalysis(session.analysis);
    }
    if (session?.form) {
      setInitialFormValues(session.form);
    }
    setSessionLoaded(true);
  }, []);

  const normalizeSignIdx = (sign) => {
    const code = String(sign || '').trim().toLowerCase();
    const aliases = {
      ari: 0, belier: 0, 'bélier': 0,
      tau: 1, taureau: 1,
      gem: 2, gemeaux: 2, 'gémeaux': 2,
      can: 3, cancer: 3,
      leo: 4, lion: 4,
      vir: 5, vierge: 5,
      lib: 6, balance: 6,
      sco: 7, scorpion: 7,
      sag: 8, sagittaire: 8,
      cap: 9, capricorne: 9,
      aqu: 10, verseau: 10,
      pis: 11, poissons: 11,
    };
    return aliases[code] ?? 0;
  };

  const sunNatal = useMemo(() => {
    const planets = Array.isArray(astroAnalysis?.planets) ? astroAnalysis.planets : [];
    const sun = planets.find((p) => p?.name === 'Soleil');
    if (!sun) return null;
    const signIdx = normalizeSignIdx(sun.sign);
    const degreeRaw = Number.isFinite(sun.position) ? sun.position : Number(sun.position);
    const degree = Number.isFinite(degreeRaw)
      ? Math.min(30, Math.max(1, Math.floor(degreeRaw) + 1))
      : 1;
    const abs = Number.isFinite(sun.absolute_degree) ? sun.absolute_degree : Number(sun.absolute_degree);
    return {
      signIdx,
      degree,
      abs: Number.isFinite(abs) ? abs : null,
    };
  }, [astroAnalysis]);

  useEffect(() => {
    if (Number.isFinite(sunNatal?.abs)) {
      setTransitAbsIdx(Math.round(sunNatal.abs));
    }
  }, [sunNatal?.abs]);

  useEffect(() => {
    const form = initialFormValues;
    if (!form?.city || !form?.country) return;

    let cancelled = false;

    const computeTodayTransit = async () => {
      setTransitLoading(true);
      setTransitError('');
      try {
        const transitTime = form.birth_time || '12:00';

        const payload = {
          birth_date: transitDate,
          birth_time: transitTime,
          city: form.city,
          country: form.country,
          latitude: form.latitude ?? null,
          longitude: form.longitude ?? null,
          timezone: form.timezone || '',
        };

        const result = await analyzeNatalChart(payload);
        const planets = Array.isArray(result?.planets) ? result.planets : [];
        const sunToday = planets.find((p) => p?.name === 'Soleil');
        const abs = Number.isFinite(sunToday?.absolute_degree)
          ? sunToday.absolute_degree
          : Number(sunToday?.absolute_degree);

        if (!cancelled && Number.isFinite(abs)) {
          setTransitAbsIdx(Math.round(abs));
        } else if (!cancelled) {
          setTransitError("Impossible de déterminer le Soleil d'aujourd'hui.");
        }
      } catch (err) {
        if (!cancelled) {
          setTransitError("Transit du jour indisponible (fallback sur la position natale).");
        }
      } finally {
        if (!cancelled) {
          setTransitLoading(false);
        }
      }
    };

    computeTodayTransit();

    return () => {
      cancelled = true;
    };
  }, [initialFormValues, transitDate]);

  const handleAnalyzeChart = async (formData) => {
    setAstroLoading(true);
    setAstroError('');
    try {
      const result = await analyzeNatalChart(formData);
      setAstroAnalysis(result);
      setInitialFormValues(formData);
      saveAstroSession({ form: formData, analysis: result });
    } catch (error) {
      setAstroError(error.message);
      patchAstroSession({ form: formData });
    } finally {
      setAstroLoading(false);
    }
  };

  const info = useMemo(() => {
    if (!sunNatal) return '—';
    const sign = SIGNS[sunNatal.signIdx] || SIGNS[0];
    return `${sign.glyph} ${sign.name} ${sunNatal.degree}°`;
  }, [sunNatal]);
  const birthDate = initialFormValues?.birth_date || astroAnalysis?.profile?.birth_date || '';

  return (
    <div className="app bio-page">
      <header className="app-header">
        <div className="app-header-title">
          <nav className="app-top-menu" aria-label="Navigation principale">
            <Link to="/" className="app-header-home" aria-label="Retour à l'accueil">
              ← Accueil
            </Link>
            <Link to="/?edit=1" className="app-header-home" aria-label="Modifier mes informations natales">
              Mes infos
            </Link>
          </nav>
          <h1>Biorythme Kabalistique</h1>
        </div>
        {astroAnalysis && (
          <div className="app-header-actions">
            <Suspense fallback={<div className="pdf-export-loading">Chargement de l'export PDF…</div>}>
              <div className="pdf-export-top-nav">
                <PdfExportButton analysis={astroAnalysis} />
              </div>
            </Suspense>
          </div>
        )}
      </header>

      <BiorythmeErrorBoundary>
        {!sunNatal ? (
          <section className="bio-setup">
            <h2>Données natales requises</h2>
            <p>
              Entrez vos données une seule fois. Elles seront réutilisées dans Astro-Kabbale et Biorythme.
              Ici, le module utilisera principalement le degré natal du Soleil.
            </p>
            {sessionLoaded && astroAnalysis && !Array.isArray(astroAnalysis?.planets) && (
              <div className="bio-setup-warning">
                Les données sauvegardées semblent incomplètes. Merci de relancer le calcul natal.
              </div>
            )}
            <AstroInputForm
              onSubmit={handleAnalyzeChart}
              loading={astroLoading}
              error={astroError}
              initialValues={sessionLoaded ? initialFormValues : null}
            />
          </section>
        ) : (
          <>
            <section className="bio-controls">
              <div className="bio-natal-preview">
                <span>Soleil natal (carte du ciel)</span>
                <strong>{info}</strong>
              </div>
            </section>

            <BiorythmeTable
              natalSignIdx={sunNatal.signIdx}
              natalDegree={sunNatal.degree}
              birthDate={birthDate}
              transitAbsIdx={transitAbsIdx}
              transitDate={transitDate}
              onTransitDateChange={(value) => {
                if (!value) return;
                setTransitDate(value);
              }}
            />
          </>
        )}
      </BiorythmeErrorBoundary>
    </div>
  );
}
