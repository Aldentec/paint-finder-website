// src/components/PaintMatcher/PaintMatcher.js
import React, { useState, useEffect } from 'react';
import './PaintMatcher.css';
import ImageUploader from '../ImageUploader/ImageUploader';
import PaletteDisplay from '../PaletteDisplay/PaletteDisplay';
import MatchResults from '../MatchResults/MatchResults';
import ShoppingList from '../ShoppingList/ShoppingList';
import usePalette from '../../utils/usePalette';
import PresetSelector from '../PresetSelector/PresetSelector';
import { PRESET_OPTIONS } from '../../utils/presets';

const API_BASE = (process.env.REACT_APP_API_BASE || "https://k6aslecb84.execute-api.us-west-2.amazonaws.com/prod").replace(/\/$/, "");

const PaintMatcher = () => {
  const [k, setK] = useState(9);
  const [presetKey, setPresetKey] = useState(() => localStorage.getItem("presetKey") || "auto");
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { extract, previewUrl, palette, loading } = usePalette();

  useEffect(() => {
    localStorage.setItem("presetKey", presetKey);
  }, [presetKey]);

  // Auto-select preset based on image
  async function choosePresetForImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const el = new Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = url;
      });

      const w = 160;
      const h = Math.max(1, Math.round((img.height / img.width) * w));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      let whites = 0, blacks = 0, pixels = 0, blueish = 0;
      
      for (let i = 0; i < data.length; i += 4 * 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 10) continue;
        pixels++;
        if (r >= 252 && g >= 252 && b >= 252) whites++;
        if (r <= 5 && g <= 5 && b <= 5) blacks++;
        if (b > 80 && b > r + 10 && b > g + 10) blueish++;
      }

      const fracWhite = whites / Math.max(1, pixels);
      const fracBlack = blacks / Math.max(1, pixels);
      const fracBlue = blueish / Math.max(1, pixels);

      if (fracWhite > 0.35) return "whiteBackdrop";
      if (fracBlue > 0.02 || (fracBlack > 0.2 && fracBlue > 0.005)) return "darkNavies";
      return "general";
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function onFileSelect(file) {
    setMatches([]);
    setError("");
    
    const pKey = presetKey === "auto" ? await choosePresetForImage(file) : presetKey;
    const preset = PRESET_OPTIONS[pKey] || PRESET_OPTIONS.general;
    
    await extract(file, k, preset);
  }

  async function fetchMatches() {
    if (!palette.length) return;
    
    setError("");
    setBusy(true);
    
    try {
      const res = await fetch(`${API_BASE}/match-hex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Reduced from topN: 5 to topN: 3 to reduce duplicates
        body: JSON.stringify({ hexes: palette, topN: 3 }),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      setMatches(data.results || []);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError("Failed to fetch paint matches. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Build deduped shopping list
  const shoppingSet = new Map();
  for (const r of matches) {
    const best = r.matches?.[0];
    if (best) shoppingSet.set(best.slug || best.name, best);
  }
  const shoppingList = Array.from(shoppingSet.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section id="paint-matcher" className="paint-matcher">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Paint Matcher</h2>
          <p className="section-subtitle">
            Upload your image and find the perfect paint matches
          </p>
        </div>

        <div className="matcher-grid">
          <div className="upload-section">
            <ImageUploader onFileSelect={onFileSelect} previewUrl={previewUrl} />
            
            <div className="controls">
              <div className="control-group">
                <label htmlFor="k-value" className="control-label">
                  Number of Colors (k)
                </label>
                <input
                  id="k-value"
                  type="range"
                  min="3"
                  max="12"
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value, 10))}
                  className="range-input"
                />
                <span className="range-value">{k}</span>
              </div>

              <div className="control-group">
                <label className="control-label">Preset</label>
                <PresetSelector value={presetKey} onChange={setPresetKey} />
              </div>

              <button
                onClick={fetchMatches}
                disabled={!palette.length || loading || busy}
                className="match-button"
              >
                {busy ? (
                  <>
                    <span className="spinner"></span>
                    Matching...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    Match Paints
                  </>
                )}
              </button>

              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="results-section">
            <PaletteDisplay palette={palette} loading={loading} />
            
            {matches.length > 0 && (
              <>
                <MatchResults matches={matches} />
                <ShoppingList shoppingList={shoppingList} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaintMatcher;