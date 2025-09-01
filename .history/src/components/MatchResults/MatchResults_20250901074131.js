// src/components/MatchResults/MatchResults.js
import React from 'react';
import './MatchResults.css';

const MatchResults = ({ matches }) => {
  if (!matches.length) return null;

  return (
    <div className="match-results">
      <h3 className="results-title">Paint Matches</h3>
      
      <div className="matches-grid">
        {matches.map((match, index) => (
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
              {match.matches.map((paint, paintIndex) => (
                <div key={paintIndex} className="paint-item">
                  <div 
                    className="paint-swatch"
                    style={{ background: paint.hex }}
                  ></div>
                  <div className="paint-info">
                    <div className="paint-name">{paint.name}</div>
                    <div className="paint-details">
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