import React from 'react';
import './AstroChartView.css';

const AstroChartView = ({ chartSvg }) => {
  if (!chartSvg) {
    return null;
  }

  return (
    <section className="astro-chart-view">
      <h2>Theme astral natal</h2>
      <div
        className="astro-chart-svg"
        dangerouslySetInnerHTML={{ __html: chartSvg }}
      />
    </section>
  );
};

export default AstroChartView;
