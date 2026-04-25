import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import './PdfExportButton.css';
import PdfReport from '../pdf/PdfReport';
import sephirothData from '../data/sephirothData.json';
import pathsData from '../data/pathsData.json';
import { captureTreeOfLifePng, captureNatalChartPng } from '../lib/svgToImage';

function buildAspectFlows(analysis) {
  if (!analysis) return [];
  const planets = analysis?.planets || [];
  const sephirothScores = analysis?.sephiroth_scores || [];
  const sephirahByPlanet = Object.fromEntries(
    sephirothScores.map((s) => [s.primary_planet, s.sephirah_id])
  );
  const sephirahNameById = Object.fromEntries(
    sephirothScores.map((s) => [s.sephirah_id, s.sephirah_name])
  );

  const seen = new Set();
  const flows = [];
  planets.forEach((planet) => {
    const fromSephirahId = sephirahByPlanet[planet.name];
    if (!fromSephirahId) return;
    (planet.hard_aspect_links || []).forEach((link) => {
      const toSephirahId = sephirahByPlanet[link.target_planet];
      if (!toSephirahId || toSephirahId === fromSephirahId) return;
      const idPair = [fromSephirahId, toSephirahId].sort((a, b) => a - b).join('-');
      const key = `${idPair}-${link.aspect}`;
      if (seen.has(key)) return;
      seen.add(key);
      flows.push({
        key,
        fromId: fromSephirahId,
        toId: toSephirahId,
        aspect: link.aspect,
        fromPlanet: planet.name,
        toPlanet: link.target_planet,
        fromSephirahName: sephirahNameById[fromSephirahId] || '',
        toSephirahName: sephirahNameById[toSephirahId] || '',
      });
    });
  });
  return flows;
}

function buildFilename(profile) {
  const date = profile?.birth_date || 'lecture';
  const city = (profile?.city || 'astro').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `lecture-astro-kabbale-${city}-${date}.pdf`;
}

const PdfExportButton = ({ analysis }) => {
  const [status, setStatus] = useState('idle'); // idle | capturing | generating | done | error
  const [error, setError] = useState('');

  const disabled = !analysis || status === 'capturing' || status === 'generating';

  const handleExport = async () => {
    if (!analysis) return;
    setError('');
    try {
      setStatus('capturing');
      const [treeImage, chartImage] = await Promise.all([
        captureTreeOfLifePng().catch(() => null),
        captureNatalChartPng(analysis?.chart_svg).catch(() => null),
      ]);

      const aspectFlows = buildAspectFlows(analysis);

      setStatus('generating');
      const blob = await pdf(
        <PdfReport
          analysis={analysis}
          sephirothData={sephirothData}
          pathsData={pathsData}
          chartImage={chartImage}
          treeImage={treeImage}
          aspectFlows={aspectFlows}
          generatedAt={new Date()}
        />
      ).toBlob();

      saveAs(blob, buildFilename(analysis?.profile));
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('PDF export failed', err);
      setError(err?.message || 'Impossible de générer le PDF.');
      setStatus('error');
    }
  };

  const labelByStatus = {
    idle: 'Télécharger ma lecture (PDF)',
    capturing: 'Capture des visuels…',
    generating: 'Génération du PDF…',
    done: 'PDF téléchargé ✓',
    error: 'Réessayer le téléchargement',
  };

  return (
    <div className="pdf-export">
      <button
        type="button"
        className={`pdf-export-btn ${status}`}
        onClick={handleExport}
        disabled={disabled}
      >
        <span className="pdf-export-icon" aria-hidden>
          ⤓
        </span>
        <span>{labelByStatus[status]}</span>
      </button>
      {!analysis && (
        <p className="pdf-export-hint">
          Générez d'abord votre carte natale pour activer le téléchargement.
        </p>
      )}
      {error && <p className="pdf-export-error">{error}</p>}
    </div>
  );
};

export default PdfExportButton;
