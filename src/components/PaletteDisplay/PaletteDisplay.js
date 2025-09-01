// src/components/PaletteDisplay/PaletteDisplay.js
import React from 'react';
import './PaletteDisplay.css';

const PaletteDisplay = ({ palette, loading }) => {
  if (!palette.length && !loading) {
    return null;
  }

  return (
    <div className="palette-display">
      <div className="palette-header">
        <h3 className="palette-title">Extracted Palette</h3>
        <span className="palette-count">
          {loading ? 'Extracting...' : `${palette.length} colors`}
        </span>
      </div>
      
      {loading ? (
        <div className="palette-loading">
          <div className="loading-spinner"></div>
          <span>Analyzing colors...</span>
        </div>
      ) : (
        <div className="palette-grid">
          {palette.map((hex, index) => (
            <div key={index} className="palette-item">
              <div 
                className="palette-color"
                style={{ background: hex }}
              >
                <span className="palette-hex">{hex}</span>
              </div>
              <span className="palette-index">Color {index + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaletteDisplay;