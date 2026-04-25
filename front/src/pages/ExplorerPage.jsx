import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import pathsData from '../data/pathsData.json';
import sephirothData from '../data/sephirothData.json';
import TreeOfLife from '../components/TreeOfLife';
import PathDetail from '../components/PathDetail';
import SephirahDetail from '../components/SephirahDetail';
import AstroInputForm from '../components/AstroInputForm';
import AstroKabbalahPanel from '../components/AstroKabbalahPanel';
import AstroChartView from '../components/AstroChartView';
import AspectFlowModal from '../components/AspectFlowModal';
import { analyzeNatalChart } from '../lib/apiClient';
import {
  loadAstroSession,
  saveAstroSession,
  patchAstroSession,
  clearAstroSession,
  formatSavedAt,
} from '../lib/persistentStore';

const PdfExportButton = lazy(() => import('../components/PdfExportButton'));

function ExplorerPage() {
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedSephirahId, setSelectedSephirahId] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState('descending');
  const [selectedAspectFlow, setSelectedAspectFlow] = useState(null);
  const [astroLoading, setAstroLoading] = useState(false);
  const [astroError, setAstroError] = useState('');
  const [astroAnalysis, setAstroAnalysis] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState(null);
  const [sessionSavedAt, setSessionSavedAt] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    const session = loadAstroSession();
    if (session) {
      if (session.form) setInitialFormValues(session.form);
      if (session.analysis) setAstroAnalysis(session.analysis);
      if (session.savedAt) setSessionSavedAt(session.savedAt);
    }
    setSessionLoaded(true);
  }, []);

  const paths = Array.isArray(pathsData?.paths) ? pathsData.paths : [];
  const sephiroth = Array.isArray(sephirothData?.sephiroth) ? sephirothData.sephiroth : [];

  const selectedPath = paths.find((p) => p.id === selectedPathId);
  const selectedSephirah = sephiroth.find((s) => s.id === selectedSephirahId);

  const selectPath = (pathId, direction = 'descending') => {
    setSelectedSephirahId(null);
    setSelectedAspectFlow(null);
    setSelectedPathId(pathId);
    setSelectedDirection(direction);
  };

  const selectSephirah = (sephirahId) => {
    setSelectedPathId(null);
    setSelectedAspectFlow(null);
    setSelectedSephirahId(sephirahId);
  };

  const selectAspectFlow = (flow) => {
    setSelectedPathId(null);
    setSelectedSephirahId(null);
    setSelectedAspectFlow(flow);
  };

  const clearSelection = () => {
    setSelectedPathId(null);
    setSelectedSephirahId(null);
    setSelectedAspectFlow(null);
  };

  const handleAnalyzeChart = async (formData) => {
    setAstroLoading(true);
    setAstroError('');
    try {
      const result = await analyzeNatalChart(formData);
      setAstroAnalysis(result);
      setInitialFormValues(formData);
      saveAstroSession({ form: formData, analysis: result });
      setSessionSavedAt(new Date().toISOString());
      clearSelection();
    } catch (error) {
      setAstroError(error.message);
      patchAstroSession({ form: formData });
    } finally {
      setAstroLoading(false);
    }
  };

  const handleClearSession = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        'Effacer toutes vos donnees natales et la lecture sauvegardee ? Cette action est irreversible.'
      );
      if (!ok) return;
    }
    clearAstroSession();
    setAstroAnalysis(null);
    setInitialFormValues(null);
    setSessionSavedAt(null);
    setAstroError('');
    clearSelection();
    setFormResetKey((k) => k + 1);
  };

  const astroSephirahData = selectedSephirah
    ? (astroAnalysis?.sephiroth_scores || []).find((score) => score.sephirah_id === selectedSephirah.id)
    : null;

  const astroPlanetData = astroSephirahData
    ? (astroAnalysis?.planets || []).find((planet) => planet.name === astroSephirahData.primary_planet)
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-title">
          <Link to="/" className="app-header-home" aria-label="Retour à l'accueil">
            ← Accueil
          </Link>
          <h1>Les 22 Chemins de l'Arbre de Vie</h1>
        </div>
        <p>Explorez les 10 Sephiroth, les 22 sentiers et votre lecture Astro-Kabbale.</p>
      </header>

      <div className="app-content">
        <section className="tree-panel">
          <div className="tree-panel-header">
            <h2>Schema sephirotique interactif</h2>
            <p>Cliquez sur une sphere ou un sentier pour afficher son explication a droite.</p>
          </div>
          <TreeOfLife
            paths={paths}
            selectedPathId={selectedPathId}
            selectedDirection={selectedDirection}
            onSelectPath={selectPath}
            selectedSephirahId={selectedSephirahId}
            onSelectSephirah={selectSephirah}
            astroEnabled
            astroSephirothScores={astroAnalysis?.sephiroth_scores || []}
            astroPlanets={astroAnalysis?.planets || []}
            onSelectAspectFlow={selectAspectFlow}
          />
        </section>

        <aside className="info-panel">
          <div className="info-panel-header">
            <h2>Astro-Kabbale</h2>
            <p>Renseignez vos donnees natales pour generer votre carte du ciel et activer la lecture sur l'Arbre de Vie.</p>
            {sessionSavedAt && (
              <div className="session-status">
                <span className="session-status-dot" aria-hidden />
                <span className="session-status-text">
                  Lecture sauvegardée le {formatSavedAt(sessionSavedAt)}
                </span>
                <button
                  type="button"
                  className="session-clear-btn"
                  onClick={handleClearSession}
                  title="Effacer toutes les donnees stockees localement"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          <AstroInputForm
            key={formResetKey}
            onSubmit={handleAnalyzeChart}
            loading={astroLoading}
            error={astroError}
            initialValues={sessionLoaded ? initialFormValues : null}
          />
          <AstroKabbalahPanel analysis={astroAnalysis} />
          {astroAnalysis && (
            <Suspense fallback={<div className="pdf-export-loading">Chargement de l'export PDF…</div>}>
              <PdfExportButton analysis={astroAnalysis} />
            </Suspense>
          )}

          <main className="main-content">
            <AstroChartView chartSvg={astroAnalysis?.chart_svg} />
          </main>
        </aside>
      </div>

      {selectedPath && (
        <div className="modal-overlay" role="presentation" onClick={clearSelection}>
          <div className="modal-content" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <PathDetail
              path={selectedPath}
              selectedDirection={selectedDirection}
              onDirectionChange={setSelectedDirection}
              onBack={clearSelection}
            />
          </div>
        </div>
      )}

      {selectedSephirah && (
        <div className="modal-overlay" role="presentation" onClick={clearSelection}>
          <div className="modal-content" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <SephirahDetail
              sephirah={selectedSephirah}
              selectedDirection={selectedDirection}
              onDirectionChange={setSelectedDirection}
              onBack={clearSelection}
              astroSephirahData={astroSephirahData}
              astroPlanetData={astroPlanetData}
            />
          </div>
        </div>
      )}

      {selectedAspectFlow && (
        <AspectFlowModal flow={selectedAspectFlow} onClose={clearSelection} />
      )}
    </div>
  );
}

export default ExplorerPage;
