import React, { useState } from 'react';
import './App.css';
import pathsData from './data/pathsData.json';
import sephirothData from './data/sephirothData.json';
import TreeOfLife from './components/TreeOfLife';
import PathList from './components/PathList';
import PathDetail from './components/PathDetail';
import SephirahDetail from './components/SephirahDetail';

function App() {
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedSephirahId, setSelectedSephirahId] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState('descending');

  const paths = Array.isArray(pathsData?.paths) ? pathsData.paths : [];
  const sephiroth = Array.isArray(sephirothData?.sephiroth) ? sephirothData.sephiroth : [];

  const selectedPath = paths.find((p) => p.id === selectedPathId);
  const selectedSephirah = sephiroth.find((s) => s.id === selectedSephirahId);

  const selectPath = (pathId, direction = 'descending') => {
    setSelectedSephirahId(null);
    setSelectedPathId(pathId);
    setSelectedDirection(direction);
  };

  const selectSephirah = (sephirahId) => {
    setSelectedPathId(null);
    setSelectedSephirahId(sephirahId);
  };

  const clearSelection = () => {
    setSelectedPathId(null);
    setSelectedSephirahId(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Les 22 Chemins de l'Arbre de Vie</h1>
        <p>Explorez les 10 Sephiroth, les 22 sentiers et leurs deux sens de lecture.</p>
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
          />
        </section>

        <aside className="info-panel">
          <main className="main-content">
            {selectedPath ? (
              <PathDetail
                path={selectedPath}
                selectedDirection={selectedDirection}
                onDirectionChange={setSelectedDirection}
                onBack={clearSelection}
              />
            ) : selectedSephirah ? (
              <SephirahDetail
                sephirah={selectedSephirah}
                selectedDirection={selectedDirection}
                onDirectionChange={setSelectedDirection}
                onBack={clearSelection}
              />
            ) : (
              <PathList paths={paths} onSelectPath={selectPath} />
            )}
          </main>
        </aside>
      </div>
    </div>
  );
}

export default App;
