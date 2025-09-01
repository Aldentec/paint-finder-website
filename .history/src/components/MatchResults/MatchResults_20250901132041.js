// src/components/MatchResults/MatchResults.js
import React from 'react';
import './MatchResults.css';

const MatchResults = ({ matches }) => {
  if (!matches.length) return null;

  return (
    <div className="match-results">
      <h3 className="results-title">Paint Matches</h3>
      
      <div className="matches-grid">
        {matches.map((match, index) => {
          // Remove duplicates from matches based on paint name and hex
          const uniqueMatches = match.matches.filter((paint, idx, arr) => 
            arr.findIndex(p => p.name === paint.name && p.hex === paint.hex) === idx
          );
          
          return (
            <div key={index} className="match-card">
              <div className="match-header">
                <div className="match-target">
                  <div 
                    className="target-color"
                    style={{ background: match.target }}
                  ></div>
                  <div className="target-info">
                    <span className="target-label">Target Color</span>
                    <span className="target-hex">{match.target}</span>
                  </div>
                </div>
              </div>
              
              <div className="match-paints">
                {uniqueMatches.map((paint, paintIndex) => (
                  <div key={paintIndex} className="paint-item">
                    <div 
                      className="paint-swatch"
                      style={{ background: paint.hex }}
                    ></div>
                    <div className="paint-info">
                      <div className="paint-name">{paint.name}</div>
                      <div className="paint-details">
                        {/* Show brand first, then range */}
                        <span className="paint-brand">{paint.brand}</span>
                        <span className="paint-range">{paint.range}</span>
                        <span className="paint-finish">({paint.finish})</span>
                      </div>
                      <div className="paint-meta">
                        <span className="paint-hex">{paint.hex}</span>
                        <span className="paint-delta">ΔE {paint.deltaE.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="paint-accuracy">
                      <div className="accuracy-bar">
                        <div 
                          className="accuracy-fill"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, 100 - paint.deltaE * 2))}%`,
                            background: paint.deltaE < 5 ? 'var(--success)' : 
                                       paint.deltaE < 10 ? 'var(--warning)' : 
                                       'var(--error)'
                          }}
                        ></div>
                      </div>
                      <span className="accuracy-label">
                        {paint.deltaE < 5 ? 'Excellent' : 
                         paint.deltaE < 10 ? 'Good' : 
                         'Fair'} Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchResults;