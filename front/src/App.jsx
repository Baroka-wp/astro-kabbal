import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import ExplorerPage from './pages/ExplorerPage';
import TikkounPage from './pages/TikkounPage';
import BiorythmePage from './pages/BiorythmePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/tikkoun" element={<TikkounPage />} />
        <Route path="/biorythme" element={<BiorythmePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
